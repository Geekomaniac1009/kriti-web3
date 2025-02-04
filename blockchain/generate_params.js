const { buildPoseidon } = require('circomlibjs');

async function generateParams() {
    const poseidon = await buildPoseidon();
    
    // Your input values
    const ownerSecretKey = BigInt("0x617F2E2fD72FD9D5503197092aC168c91465E7f2");
    const currentBalance = BigInt(1000); // increased for safety
    const salt = BigInt(14009);
    
    // Generate commitment = Poseidon(secretKey, balance, salt)
    const commitment = poseidon([ownerSecretKey, currentBalance, salt]);
    
    // Generate nullifier = Poseidon(commitment, salt)
    const nullifier = poseidon([commitment, salt]);
    
    // Convert field elements to BigInt strings
    const commitmentStr = poseidon.F.toString(commitment);
    const nullifierStr = poseidon.F.toString(nullifier);
    
    console.log("Input Values for input.json:");
    console.log(JSON.stringify({
        ownerSecretKey: ownerSecretKey.toString(),
        currentBalance: currentBalance.toString(),
        salt: salt.toString(),
        tradeAmount: "2",
        commitment: commitmentStr,
        nullifier: nullifierStr
    }, null, 2));
}

generateParams().catch(console.error);