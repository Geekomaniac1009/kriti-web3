const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number // Price in Ether
});

module.exports = mongoose.model('Reward', rewardSchema);
