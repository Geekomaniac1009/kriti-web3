require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Web3 = require("web3");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const User = require("./models/User");
const Order = require("./models/Order");
const Transaction = require("./models/Transaction");


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Function to generate a random Ethereum-like address
const generateWalletAddress = () => {
    return "0x" + Math.random().toString(36).substr(2, 40);
};

// Signup Route - Assigns Wallet Address in Backend
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const walletAddress = generateWalletAddress(); // Backend assigns wallet address

    const newUser = new User({ email, password: hashedPassword, walletAddress });
    await newUser.save();

    res.json({ success: true, message: "Signup successful!", walletAddress });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Signup failed. Try again." });
  }
});

// Login Route - Returns User Wallet Address
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password" });

    res.json({ success: true, walletAddress: user.walletAddress });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed. Try again." });
  }
});


// // Helper Function to Authenticate JWT
// const authenticateToken = (req, res, next) => {
//     const token = req.header("Authorization");
//     if (!token) return res.status(401).json({ error: "Access Denied" });

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ error: "Invalid Token" });
//         req.user = user;
//         next();
//     });
// };


app.post("/placeOrder", async (req, res) => {
    try {
        const { userAddress, credits, price, type } = req.body;
        console.log(req.body);
        let user = await User.findOne({ walletAddress: userAddress });
        console.log(user);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Check if user has an active order (cannot buy & sell simultaneously)
        // Find all active orders of the user
        let activeOrders = await Order.find({ userId: user._id, status: { $ne: "Completed" } });

        // Check if user already has an active order of the opposite type
        let hasActiveOppositeOrder = activeOrders.some(order => order.type !== type);

        if (hasActiveOppositeOrder) {
            return res.status(400).json({ error: `You already have an active ${activeOrders[0].type} order. Please complete or cancel it before placing a ${type} order.` });
        }

        // // Ensure user has enough balance
        // if (type === "buy" && user.ether < credits * price) {
        //     return res.status(400).json({ error: "Insufficient ETH balance." });
        // }
        // if (type === "sell" && user.carbonCredits < credits) {
        //     return res.status(400).json({ error: "Insufficient Carbon Credits." });
        // }

        let oppositeType = type === "buy" ? "sell" : "buy";
        let priceQuery = type === "buy" ? { $lte: price } : { $gte: price };
        let matchingOrders = await Order.find({ type: oppositeType, price: priceQuery, status: { $ne: "Completed" } })
            .sort(type === "buy" ? { price: 1 } : { price: -1 });

        let remainingCredits = credits;
        console.log(oppositeType);
        console.log(remainingCredits);
        let executedOrders = [];
        console.log(matchingOrders.length);
        
        if(matchingOrders.length !== 0) {
          for (let order of matchingOrders) {
              
              let tradeAmount = Math.min(remainingCredits, order.credits);
              let seller = await User.findById(order.userId);
              let buyer = user;
              console.log(seller, buyer);
              // Ensure seller has enough credits and buyer has enough ETH
              if (seller.credits < tradeAmount || buyer.ether < tradeAmount * price) {
                  continue;
              }

                // Update balances
              seller.ether += tradeAmount * price;
              buyer.ether -= tradeAmount * price;
              seller.credits -= tradeAmount;
              buyer.credits += tradeAmount;
              console.log(seller, buyer);                 
              await seller.save();
              await buyer.save();
              console.log("Hifi");
              // Log transaction
              const transaction = new Transaction({
                  sellerAddress: seller._id,
                  buyerAddress: buyer._id,
                  amount: tradeAmount,
                  price: price,
                  date: new Date()
              });
              console.log(transaction); 
              await transaction.save();
                           
              // Update order amounts
              order.credits -= tradeAmount;
              remainingCredits -= tradeAmount;
              console.log(order.credits, remainingCredits, order._id);
              if (order.credits === 0) {
                  await Order.findByIdAndDelete(order._id); // Remove fully executed order
                } else {
                  await order.save(); // Save partially executed order
              }

              executedOrders.push(transaction);
              if (remainingCredits === 0) break;
          }
        }
        console.log(remainingCredits);
        if (remainingCredits > 0) {
            // Add remaining buy/sell order to queue
            const newOrder = new Order({ userId: user._id, credits: remainingCredits, price, type });
            await newOrder.save();
        }

        res.json({ success: true, executedOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
});


app.get("/orders", async (req, res) => {
    try {
        const buyOrders = await Order.find({ type: "buy" }).lean();
        const sellOrders = await Order.find({ type: "sell" }).lean();
        res.json({ buyOrders, sellOrders });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});


// Fetch User Balance
app.get("/balance/:userAddress", async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.userAddress });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ eth: user.ether, carbonCredits: user.carbonCredits });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// Fetch Last 5 Transactions for Account Page
app.get("/transactions/:userAddress", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ sellerAddress: req.params.userAddress }, { buyerAddress: req.params.userAddress }]
    }).sort({ date: -1 }).limit(5).lean();

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Fetch All Transactions Dynamically (Infinite Scroll)
app.get("/transactions", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});


// Upload Document and Increase Carbon Credits
// app.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ error: "User not found" });

//         user.carbonCredits += 10;
//         await user.save();

//         res.json({ message: "File uploaded successfully. Carbon credits awarded!" });
//     } catch (error) {
//         console.error("Upload Error:", error);
//         res.status(500).json({ error: "File upload failed" });
//     }
// });

// // Fetch User Balance
// app.get("/balance", authenticateToken, async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ error: "User not found" });

//         res.json({ ether: user.ether, carbonCredits: user.carbonCredits });
//     } catch (error) {
//         console.error("Fetch Balance Error:", error);
//         res.status(500).json({ error: "Failed to fetch balance" });
//     }
// });

app.listen(5000, () => console.log("Server running on port 5000"));
