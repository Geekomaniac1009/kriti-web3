import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

function Navbar({ currentTime }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  let hoverTimeout = null;

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setDropdownOpen(false);
    }, 600); // Dropdown stays open for 600ms after hover
  };

  return (
    <div className="navbar-container">
      <div className="navbar-left">
        <h1 className="logo">Carbon Market</h1>
      </div>
      <div className="navbar-right">
        <span className="time-display">{currentTime}</span>
        <div 
          className="user-icon-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <FaUserCircle className="user-icon" size={30} />
          {dropdownOpen && (
            <motion.div
              className="dropdown-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link to="/transactionlog" className="dropdown-link">Transaction Log</Link>
              <Link to="/rewards" className="dropdown-link">Rewards</Link>
              <Link to="/balance" className="dropdown-link">Balance</Link>
              <Link to="/apply" className="dropdown-link">Apply for Credits</Link>
              <Link to="/logout" className="dropdown-link logout-link">Logout</Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
