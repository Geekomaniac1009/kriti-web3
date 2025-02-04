const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  sellerAddress: { type: String, required: true },
  buyerAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
