import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login"; 
import Home from "./components/Home";
import Account from "./components/Account";
import Apply from "./components/Apply"; 
import TransactionLog from "./components/TransactionLog";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/transactionlog" element={<TransactionLog />} />
        
      </Routes>
    </Router>
  );
}

export default App;
