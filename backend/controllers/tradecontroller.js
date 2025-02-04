const Web3 = require("web3");
const User = require("../models/User");
const Trade = require("../models/Trade");
const web3 = new Web3("http://127.0.0.1:8545");

const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = require("../CarbonTradingPlatform.json");

const contract = new web3.eth.Contract(contractABI, contractAddress);

exports.buyCredits = async (req, res) => {
  const { userId, credits } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const totalPrice = credits * 20; // 20 Ether per credit

  if (user.etherBalance < totalPrice)
    return res.status(400).json({ message: "Insufficient balance" });

  await contract.methods.buyCredits(credits).send({
    from: user.address,
    value: web3.utils.toWei(totalPrice.toString(), "ether"),
  });

  user.etherBalance -= totalPrice;
  user.creditBalance += credits;
  await user.save();

  await new Trade({ type: "buy", amount: credits, userId: user._id, status: "completed" }).save();

  res.json({ message: "Buy order successful" });
};

exports.sellCredits = async (req, res) => {
  const { userId, credits } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.creditBalance < credits)
    return res.status(400).json({ message: "Insufficient credits" });

  await contract.methods.sellCredits(credits).send({ from: user.address });

  user.creditBalance -= credits;
  user.etherBalance += credits * 20;
  await user.save();

  await new Trade({ type: "sell", amount: credits, userId: user._id, status: "completed" }).save();

  res.json({ message: "Sell order successful" });
};
