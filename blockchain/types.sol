// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Types {
    struct Order {
        address user;
        uint256 amount;
        uint256 remainingAmount;
        uint256 timestamp;
        bool isActive;
    }

    struct Queue {
        uint256 front;
        uint256 rear;
        mapping(uint256 => Order) orders;
    }
}