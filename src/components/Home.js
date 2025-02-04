import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Card, CardContent } from "../components/Card";
import "./Home.css";

function Home() {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [userOrderType, setUserOrderType] = useState(null); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await axios.get("http://localhost:5000/orders");
    setBuyOrders(data.buyOrders);
    setSellOrders(data.sellOrders);

    // Check if the user has an active order
    const userAddress = localStorage.getItem("userAddress");
    const userBuyOrder = data.buyOrders.find(order => order.userId === userAddress);
    const userSellOrder = data.sellOrders.find(order => order.userId === userAddress);
    
    if (userBuyOrder) setUserOrderType("buy");
    else if (userSellOrder) setUserOrderType("sell");
    else setUserOrderType(null);
  };

  const placeOrder = async (type) => {
    if (userOrderType) {
      alert(`You already have an active ${userOrderType} order. Please cancel it before placing a new one.`);
      return;
    }

    const amount = prompt("Enter amount of carbon credits:");
    const price = prompt("Enter ETH price per credit:");
    if (!amount || !price) return;

    try {
      const { data } = await axios.post("http://localhost:5000/placeOrder", {
        userAddress: localStorage.getItem("userAddress"),
        credits: amount,
        price,
        type,
      });

      if (data.success) {
        fetchOrders();
        setUserOrderType(type);
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      alert("Error placing order: " + error.message);
    }
  };

  return (
    <div className="homepage-container">
      <Navbar />
      <div className="marketplace">
        <h2 className="marketplace-heading">Marketplace</h2>

        <div className="orders-section">
          <h3 className="orders-heading">Buy Orders</h3>
          {buyOrders.length === 0 ? <p>No buy transactions at the moment</p> : 
            buyOrders.map((order, index) => (
              <Card key={index} className="buy-order-card">
                <CardContent style={{ color: "green" }}>
                  {order.amount} Carbon Credits for {order.price} ETH
                </CardContent>
              </Card>
            ))
          }
        </div>

        <div className="orders-section">
          <h3 className="orders-heading">Sell Orders</h3>
          {sellOrders.length === 0 ? <p>No sell transactions at the moment</p> : 
            sellOrders.map((order, index) => (
              <Card key={index} className="sell-order-card">
                <CardContent style={{ color: "red" }}>
                  {order.amount} Carbon Credits for {order.price} ETH
                </CardContent>
              </Card>
            ))
          }
        </div>

        <div className="order-buttons">
          <button className="buy-button" onClick={() => placeOrder("buy")} disabled={userOrderType !== null}>
            Place Buy Order
          </button>
          <button className="sell-button" onClick={() => placeOrder("sell")} disabled={userOrderType !== null}>
            Place Sell Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
