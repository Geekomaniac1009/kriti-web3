const mongoose = require('mongoose');
const Reward = require('./models/Reward');

mongoose.connect('mongodb://localhost:27017/trading', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const rewards = [
    {
        title: "Priority Support for 1 Month",
        description: "Get exclusive access to 24/7 business support.",
        price: 0.3
    },
    {
        title: "Discounted Health Insurance",
        description: "10% off corporate health insurance plans for employees.",
        price: 0.5
    },
    {
        title: "Premium Co-Working Space Access",
        description: "1-month premium access to top-rated co-working spaces.",
        price: 1.0
    },
    {
        title: "Business Class Flight Upgrade",
        description: "Upgrade one economy ticket to business class.",
        price: 2.5
    },
    {
        title: "Tech Gadgets for Employees",
        description: "Get the latest productivity-enhancing gadgets.",
        price: 1.8
    },
    {
        title: "Corporate Wellness Program",
        description: "1-month subscription to corporate wellness sessions.",
        price: 0.9
    }
];

Reward.insertMany(rewards)
    .then(() => {
        console.log("Rewards inserted successfully!");
        mongoose.connection.close();
    })
    .catch(err => console.log("Error inserting rewards:", err));
