import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEthereum } from "react-icons/fa";
import axios from "axios";
import "./Login.css";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userAddress, setUserAddress] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (isSignup) {
      await handleSignup();
    } else {
      await handleLogin();
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://localhost:5000/signup", { email, password });

      if (response.data.success) {
        setUserAddress(response.data.walletAddress); // Get wallet from backend
        localStorage.setItem("userAddress", response.data.walletAddress);
        alert("Signup successful! You can now log in.");
        setIsSignup(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Try again.");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", { email, password });

      if (response.data.success) {
        setUserAddress(response.data.walletAddress);
        localStorage.setItem("userAddress", response.data.walletAddress);
        navigate("/home");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid credentials. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <div className="ethereum-icon">
          <FaEthereum />
        </div>
        <h1 className="heading">Secure Carbon Credit Trading</h1>
        <p className="sub-heading">Powered by blockchain for transparency and security.</p>
      </div>

      <div className="login-card">
        <div className="button-container">
          <button className={`auth-button ${!isSignup ? "active" : ""}`} onClick={() => setIsSignup(false)}>
            Login
          </button>
          <button className={`auth-button ${isSignup ? "active" : ""}`} onClick={() => setIsSignup(true)}>
            Signup
          </button>
        </div>
        <h2 className="auth-heading">{isSignup ? "Signup" : "Login"}</h2>

        <input
          type="email"
          className="input-field"
          placeholder="Company Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-button-submit" onClick={handleAuth}>
          {isSignup ? "Signup" : "Login"}
        </button>

        {userAddress && (
          <p className="wallet-address">Wallet Address: {userAddress}</p>
        )}
      </div>
    </div>
  );
}

export default Login;
