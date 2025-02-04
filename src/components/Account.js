import { useState, useEffect } from "react";
import { FaEthereum } from "react-icons/fa";
import { GiRecycle } from "react-icons/gi";
import Transactions from "./Transactions";
import "./Account.css";

function AccountPage() {
  const [balance, setBalance] = useState({ eth: 0, carbonCredits: 0 });

  useEffect(() => {
    // Simulated fetch for balance data
    setBalance({ eth: 2.5, carbonCredits: 120 });
  }, []);

  return (
    <div className="account-container">
      <div className="balances">
        <div className="balance-box eth-balance">
          <FaEthereum className="icon" />
          <h2>{balance.eth} ETH</h2>
        </div>
        <div className="balance-box carbon-balance">
          <GiRecycle className="icon" />
          <h2>{balance.carbonCredits} Carbon Credits</h2>
        </div>
      </div>
      <Transactions />
    </div>
  );
}

export default AccountPage;
