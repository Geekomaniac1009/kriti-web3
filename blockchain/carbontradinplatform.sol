// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Types.sol";
import "./PrivateLedger.sol";
import "./verifier.sol";

contract CarbonTradingPlatform {
    using Types for Types.Order;
    using Types for Types.Queue;

    uint256 public constant PRICE_PER_CREDIT = 1 ether;
    Types.Queue public buyQueue;
    Types.Queue public sellQueue;
    PrivateLedger public ledger;
    Groth16Verifier public verifier;

    // Prevent double-spending
    mapping(bytes32 => bool) public usedNullifiers;

    event OrderPlaced(address indexed user, uint256 amount, uint256 timestamp, string orderType);
    event OrderMatched(address buyer, address seller, uint256 amount, uint256 etherAmount);
    event ProofVerified(bytes32 commitment, bytes32 nullifier);

    constructor(address _ledgerAddress, address _verifierAddress) {
        ledger = PrivateLedger(_ledgerAddress);
        verifier = Groth16Verifier(_verifierAddress);
    }

    event VerificationFailed(string reason);
    event NullifierCheckFailed(bytes32 nullifier);
    event AmountMismatchFailed(uint256 expected, uint256 received);

    function placeBuyOrder(
        uint256 amount,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input
    ) public payable {
        // Extract parameters from public inputs
        uint256 tradeAmount = input[0];
        bytes32 commitment = bytes32(input[1]);
        bytes32 nullifier = bytes32(input[2]);
        
        // Verify ZK proof
        if (!verifier.verifyProof(a, b, c, input)) {
            emit VerificationFailed("Invalid ZK proof");
            revert("Invalid ZK proof");
        }
        
        // Validate trade amount matches the order
        if (amount != tradeAmount) {
            emit AmountMismatchFailed(amount, tradeAmount);
            revert("Trade amount mismatch");
        }
        
        // Prevent double-spending
        if (usedNullifiers[nullifier]) {
            emit NullifierCheckFailed(nullifier);
            revert("Nullifier already used");
        }
        
        // Validate payment
        uint256 expectedPayment = amount * PRICE_PER_CREDIT;
        if (msg.value != expectedPayment) {
            emit AmountMismatchFailed(expectedPayment, msg.value);
            revert("Insufficient ether sent");
        }
        
        // Record commitment (optional, depends on your privacy design)
        ledger.updateCommitment(msg.sender, commitment);
        
        // Create buy order
        uint256 currentRear = buyQueue.rear++;
        buyQueue.orders[currentRear] = Types.Order({
            user: msg.sender,
            amount: amount,
            remainingAmount: amount,
            timestamp: block.timestamp,
            isActive: true
        });
        
        // Emit events
        emit OrderPlaced(msg.sender, amount, block.timestamp, "Buy");
        emit ProofVerified(commitment, nullifier);
        
        tryMatchOrders();
    }

    function placeSellOrder(
        uint256 amount,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input
    ) public {
        // Extract parameters from public inputs
        uint256 tradeAmount = input[0];
        bytes32 commitment = bytes32(input[1]);
        bytes32 nullifier = bytes32(input[2]);
        
        // Verify ZK proof
        require(verifier.verifyProof(a, b, c, input), "Invalid ZK proof");
        
        // Validate trade amount matches the order
        require(amount == tradeAmount, "Trade amount mismatch");
        
        // Prevent double-spending
        require(!usedNullifiers[nullifier], "Nullifier already used");
        usedNullifiers[nullifier] = true;
        
        // Record commitment (optional, depends on your privacy design)
        ledger.updateCommitment(msg.sender, commitment);
        
        // Create sell order
        uint256 currentRear = sellQueue.rear++;
        sellQueue.orders[currentRear] = Types.Order({
            user: msg.sender,
            amount: amount,
            remainingAmount: amount,
            timestamp: block.timestamp,
            isActive: true
        });
        
        // Emit events
        emit OrderPlaced(msg.sender, amount, block.timestamp, "Sell");
        emit ProofVerified(commitment, nullifier);
        
        tryMatchOrders();
    }

    function tryMatchOrders() internal {
        while (buyQueue.front < buyQueue.rear && sellQueue.front < sellQueue.rear) {
            Types.Order storage buyOrder = buyQueue.orders[buyQueue.front];
            Types.Order storage sellOrder = sellQueue.orders[sellQueue.front];

            if (!buyOrder.isActive) {
                buyQueue.front++;
                continue;
            }
            if (!sellOrder.isActive) {
                sellQueue.front++;
                continue;
            }

            uint256 tradeAmount = min(buyOrder.remainingAmount, sellOrder.remainingAmount);
            uint256 etherAmount = tradeAmount * PRICE_PER_CREDIT;

            // Process trade
            ledger.transfer(buyOrder.user, sellOrder.user, bytes32(0), bytes32(0));
            payable(sellOrder.user).transfer(etherAmount);

            buyOrder.remainingAmount -= tradeAmount;
            sellOrder.remainingAmount -= tradeAmount;

            emit OrderMatched(buyOrder.user, sellOrder.user, tradeAmount, etherAmount);

            if (buyOrder.remainingAmount == 0) {
                buyOrder.isActive = false;
                buyQueue.front++;
            }
            if (sellOrder.remainingAmount == 0) {
                sellOrder.isActive = false;
                sellQueue.front++;
            }
        }
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }

    // Existing view functions remain the same...
    function getBuyOrder(uint256 index) public view returns (
        address user,
        uint256 amount,
        uint256 remainingAmount,
        uint256 timestamp,
        bool isActive
    ) {
        Types.Order storage order = buyQueue.orders[index];
        return (order.user, order.amount, order.remainingAmount, order.timestamp, order.isActive);
    }

    function getSellOrder(uint256 index) public view returns (
        address user,
        uint256 amount,
        uint256 remainingAmount,
        uint256 timestamp,
        bool isActive
    ) {
        Types.Order storage order = sellQueue.orders[index];
        return (order.user, order.amount, order.remainingAmount, order.timestamp, order.isActive);
    }

    function getQueueStates() public view returns (
        uint256 buyFront,
        uint256 buyRear,
        uint256 sellFront,
        uint256 sellRear
    ) {
        return (buyQueue.front, buyQueue.rear, sellQueue.front, sellQueue.rear);
    }
}