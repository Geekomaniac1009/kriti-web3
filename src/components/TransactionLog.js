import { useState, useEffect } from "react";
import axios from "axios";
import "./TransactionLog.css";

function TransactionLog() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data } = await axios.get(`http://localhost:5000/transactions?page=${page}&limit=10`);
    setTransactions((prev) => [...prev, ...data]);
    setPage(page + 1);
    setLoading(false);
  };

  return (
    <div className="transaction-log">
      <h2>Transaction Log</h2>
      {transactions.map((tx, index) => (
        <div key={index} className={`transaction-card ${tx.type === "buy" ? "buy" : "sell"}`}>
          <p>{tx.amount} Carbon Credits for {tx.price} ETH</p>
        </div>
      ))}
      <button className="load-more" onClick={fetchTransactions} disabled={loading}>
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
}

export default TransactionLog;
