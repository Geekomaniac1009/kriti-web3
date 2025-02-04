import Web3 from "web3";
import contractABI from "../abi/Marketplace.json";

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

export const connectWeb3 = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    return { web3, userAddress: accounts[0] };
  } else {
    console.error("No Ethereum provider found!");
  }
};

export const loadContract = async (web3) => {
  return new web3.eth.Contract(contractABI, contractAddress);
};
