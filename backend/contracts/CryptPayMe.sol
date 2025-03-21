// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptPayMe {
    address public owner;

    event PaymentReceived(address indexed sender, uint256 amount, string upiId);

    constructor() {
        owner = msg.sender;
    }

    function pay(string memory _upiId) public payable {
        require(msg.value > 0, "Must send ETH to pay");
        emit PaymentReceived(msg.sender, msg.value, _upiId);
    }
}
