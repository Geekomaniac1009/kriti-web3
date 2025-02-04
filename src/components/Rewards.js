import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Rewards.css";

const Rewards = () => {
    const [rewards, setRewards] = useState([]);
    const [user, setUser] = useState(null);
    const [referral, setReferral] = useState(null);
    const userId = "652345abcde"; // Example user ID

    useEffect(() => {
        axios.get("http://localhost:5000/rewards").then(res => setRewards(res.data));
        axios.get(`http://localhost:5000/user/${userId}`).then(res => setUser(res.data));
    }, []);

    const purchaseReward = (rewardId) => {
        axios.post("http://localhost:5000/purchase", { userId, rewardId })
            .then(res => {
                setReferral(res.data.referralCode);
                axios.get(`http://localhost:5000/user/${userId}`).then(res => setUser(res.data));
            })
            .catch(err => alert(err.response.data.error));
    };

    return (
        <div className="rewards-container">
            <h1>Corporate Rewards Marketplace</h1>
            {user && (
                <div className="user-balance">
                    <p>Your Balance: <strong>{user.ether} ETH</strong></p>
                </div>
            )}
            <div className="rewards-list">
                {rewards.map(reward => (
                    <div key={reward._id} className="reward-card">
                        <h3>{reward.title}</h3>
                        <p>{reward.description}</p>
                        <p className="reward-price">{reward.price} ETH</p>
                        <button onClick={() => purchaseReward(reward._id)}>Redeem</button>
                    </div>
                ))}
            </div>
            {referral && (
                <div className="referral-box">
                    <h3>🎉 Congratulations!</h3>
                    <p>Your Referral Code: <strong>{referral}</strong></p>
                </div>
            )}
        </div>
    );
};

export default Rewards;
