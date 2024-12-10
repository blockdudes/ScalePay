// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {ScalePayFactory} from "../src/ScalePayFactory.sol";
import {ScalePay} from "../src/ScalePay.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract ScalePayFactoryTest is Test {
    ScalePayFactory public factory;
    MockERC20 public paymentToken;
    
    address public employer = address(1);
    
    uint256 public constant WORKING_HOURS_START = 32400; // 9:00 AM
    uint256 public constant WORKING_HOURS_END = 61200; // 5:00 PM
    uint256 public constant BUFFER_TIME = 15; // 15 minutes
    uint256 public constant PAID_LEAVES = 24; // 24 days per year
    int256 public constant TIMEZONE_OFFSET = 0; // 0 hours offset
    function setUp() public {
        factory = new ScalePayFactory();
        paymentToken = new MockERC20("Test Token", "TEST");
    }
    
    function testCreateScalePay() public {
        uint256[] memory workDays = new uint256[](5);
        workDays[0] = 1; // Monday
        workDays[1] = 2; // Tuesday
        workDays[2] = 3; // Wednesday
        workDays[3] = 4; // Thursday
        workDays[4] = 5; // Friday
        
        vm.startPrank(employer);
        
        address scalePayAddress = factory.createScalePay(
            address(paymentToken),
            WORKING_HOURS_START,
            WORKING_HOURS_END,
            BUFFER_TIME,
            PAID_LEAVES,
            workDays,
            TIMEZONE_OFFSET
        );
        
        // Verify deployment
        assertTrue(scalePayAddress != address(0));
        
        // Verify ownership
        ScalePay scalePay = ScalePay(scalePayAddress);
        assertEq(scalePay.owner(), employer);
        
        // Verify working hours
        ScalePay.WorkingHours memory workingHours = scalePay.getWorkingHours();
        assertEq(workingHours.startTime, WORKING_HOURS_START);
        assertEq(workingHours.endTime, WORKING_HOURS_END);
        assertEq(workingHours.bufferTime, BUFFER_TIME);
        assertEq(workingHours.timezoneOffset, TIMEZONE_OFFSET);
        
        vm.stopPrank();
    }
    
    function testGetDeployedContract() public {
        uint256[] memory workDays = new uint256[](5);
        for(uint256 i = 1; i <= 5; i++) {
            workDays[i-1] = i;
        }
        
        vm.startPrank(employer);
        
        // Deploy contract
        address scalePayAddress = factory.createScalePay(
            address(paymentToken),
            WORKING_HOURS_START,
            WORKING_HOURS_END,
            BUFFER_TIME,
            PAID_LEAVES,
            workDays,
            TIMEZONE_OFFSET
        );
        
        // Get deployed contract
        address deployedContract = factory.getDeployedContract(employer);
        assertEq(deployedContract, scalePayAddress);
        
        vm.stopPrank();
    }
} 