const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    walletAddress: { type: String, required: true },
    ether: { type: Number, default: 0, min: 0 },
    credits: { type: Number, default: 0, min: 0 },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }]
});

module.exports = mongoose.model("User", userSchema);
