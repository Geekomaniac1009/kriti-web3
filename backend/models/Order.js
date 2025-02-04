const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["buy", "sell"], required: true }, // Buy or Sell
  credits: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" }, // FCFS Handling
});

module.exports = mongoose.model("Order", OrderSchema);
