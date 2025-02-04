import { useState, useEffect } from "react";
import axios from "axios";
import "./Transactions.css";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const userAddress = localStorage.getItem("userAddress");

  useEffect(() => {
    axios.get(`http://localhost:5000/transactions/${userAddress}`).then(({ data }) => {
      setTransactions(data);
    });
  }, []);

  return (
    <div className="transactions-container">
      <h2>Recent Transactions</h2>
      {transactions.length === 0 ? <p>No transactions yet.</p> : 
        transactions.map((tx, index) => (
          <div key={index} className={`transaction-card ${tx.type === "buy" ? "buy" : "sell"}`}>
            <p>{tx.amount} Carbon Credits for {tx.price} ETH</p>
          </div>
        ))
      }
    </div>
  );
}

export default Transactions;
