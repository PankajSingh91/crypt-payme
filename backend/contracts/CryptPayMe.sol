// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptPayMe {
    address public owner;

    event PaymentReceived(
        address indexed sender,
        string senderName,
        uint256 amount,
        string upiId
    );

    constructor() {
        owner = msg.sender;
    }

    function sendPayment(
        string memory _senderName,
        string memory _upiId,
        uint256 _amount
    ) public payable {
        require(msg.value == _amount, "Sent ETH must equal the amount");
        require(msg.value > 0, "Must send ETH to pay");

        emit PaymentReceived(msg.sender, _senderName, msg.value, _upiId);
    }
}
