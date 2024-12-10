// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ScalePay.sol";

contract ScalePayFactory {
    // Event emitted when a new ScalePay contract is created
    event ScalePayDeployed(
        address indexed owner,
        address scalePayAddress,
        address paymentToken
    );

    // Mapping to track all deployed ScalePay contracts
    mapping(address => address) public deployedContract;

    error ContractAlreadyDeployed();

    function createScalePay(
        address _paymentToken,
        uint256 _workingHoursStartTime,
        uint256 _workingHoursEndTime,
        uint256 _workingHoursBufferTime,
        uint256 _paidLeavesPerYear,
        uint256[] memory _workDays,
        int256 _timezoneOffset
    ) external returns (address) {
        if (deployedContract[msg.sender] != address(0)){
            revert ContractAlreadyDeployed();
        }
        // Deploy new ScalePay contract
        ScalePay scalePay = new ScalePay(
            msg.sender,
            _paymentToken,
            _workingHoursStartTime,
            _workingHoursEndTime,
            _workingHoursBufferTime,
            _paidLeavesPerYear,
            _workDays,
            _timezoneOffset
        );

        // Store the deployed contract address
        deployedContract[msg.sender] = address(scalePay);

        // Emit deployment event
        emit ScalePayDeployed(msg.sender, address(scalePay), _paymentToken);

        return address(scalePay);
    }

    // View function to get all contracts deployed by an owner
    function getDeployedContract(address _owner) 
        external 
        view 
        returns (address) 
    {
        return deployedContract[_owner];
    }
} 