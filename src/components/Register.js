import React, { useState } from "react";
import { connectWeb3, loadContract } from "../utils/contract";

const Register = () => {
  const [companyName, setCompanyName] = useState("");

  const handleRegister = async () => {
    const { web3, userAddress } = await connectWeb3();
    const contract = await loadContract(web3);
    await contract.methods.registerCompany(companyName).send({ from: userAddress });
    alert("Registration successful!");
  };

  return (
    <div>
      <h2>Register Company</h2>
      <input type="text" placeholder="Company Name" onChange={(e) => setCompanyName(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
