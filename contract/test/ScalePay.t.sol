// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {ScalePay} from "../src/ScalePay.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract ScalePayTest is Test {
    ScalePay public scalePay;
    MockERC20 public paymentToken;

    address public employer = address(1);
    address public employee1 = address(2);
    address public employee2 = address(3);

    uint256 public constant WORKING_HOURS_START = 32400; // 9:00 AM
    uint256 public constant WORKING_HOURS_END = 61200; // 5:00 PM
    uint256 public constant BUFFER_TIME = 15; // 15 minutes
    uint256 public constant PAID_LEAVES = 24; // 24 days per year
    int256 public constant TIMEZONE_OFFSET = 0; // 0 hours offset

    function setUp() public {
        // Deploy mock ERC20 token
        paymentToken = new MockERC20("Test Token", "TEST");

        // Setup working days (Monday to Friday)
        uint256[] memory workDays = new uint256[](5);
        workDays[0] = 1; // Monday
        workDays[1] = 2; // Tuesday
        workDays[2] = 3; // Wednesday
        workDays[3] = 4; // Thursday
        workDays[4] = 5; // Friday

        // Deploy ScalePay contract
        scalePay = new ScalePay(
            employer,
            address(paymentToken),
            WORKING_HOURS_START,
            WORKING_HOURS_END,
            BUFFER_TIME,
            PAID_LEAVES,
            workDays,
            TIMEZONE_OFFSET
        );

        // Mint tokens to employer
        paymentToken.mint(employer, 1000000e18);

        // Set employer as default caller
        vm.startPrank(employer);
        paymentToken.approve(address(scalePay), type(uint256).max);
        vm.stopPrank();
    }

    function testHireEmployee() public {
        vm.startPrank(employer);

        uint256 salary = 5000e18;
        string memory name = "John Doe";

        scalePay.hireEmployee(name, employee1, salary);

        ScalePay.Employee memory emp = scalePay.getEmployee(employee1);
        assertEq(emp.name, name);
        assertEq(emp.walletAddress, employee1);
        assertEq(emp.monthlySalary, salary);
        assertTrue(emp.isActive);

        vm.stopPrank();
    }

    function testMarkAttendance() public {
        // First hire an employee
        vm.prank(employer);
        scalePay.hireEmployee("John Doe", employee1, 5000e18);

        // Set block timestamp to 9:00 AM
        uint256 loginTime = block.timestamp - (block.timestamp % 86400) + 32400;
        vm.warp(loginTime);

        // Mark attendance as employee
        vm.startPrank(employee1);
        scalePay.markAttendance();

        // Check attendance record
        ScalePay.Attendance memory att = scalePay.getAttendance(
            employee1,
            loginTime - (loginTime % 86400)
        );

        assertEq(att.logInTime, 32400);
        assertFalse(att.isLate);

        vm.stopPrank();
    }

    function testRequestAndProcessLeave() public {
        // Hire employee
        vm.prank(employer);
        scalePay.hireEmployee("John Doe", employee1, 5000e18);

        // Request leave
        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = startDate + 2 days;

        vm.prank(employee1);
        scalePay.requestLeave(startDate, endDate, "Vacation", true);

        // Process leave request
        vm.prank(employer);
        scalePay.processLeaveRequest(employee1, 0, true, "Approved");

        // Check leave request
        ScalePay.LeaveRequest[] memory requests = scalePay.getLeaveRequests(
            employee1
        );
        assertTrue(requests[0].isApproved);
        assertTrue(requests[0].isProcessed);
    }

    function testCalculateAndPaySalary() public {
        uint256 salary = 6200e18;
        // Hire employee with monthly salary of 5000 tokens (with 18 decimals)
        vm.prank(employer);
        scalePay.hireEmployee("John Doe", employee1, salary);

        // Mark attendance for one month
        for (uint256 i = 0; i <= 31; i++) {
            uint256 today = block.timestamp - (block.timestamp % 86400);
            // Login at 9:00 AM
            uint256 loginTime = today + WORKING_HOURS_START;
            vm.warp(loginTime);
            vm.prank(employee1);
            scalePay.markAttendance();

            // Verify login - need to account for timezone offset
            ScalePay.Attendance memory att = scalePay.getAttendance(
                employee1,
                today
            );
            // The stored logInTime will be UTC timestamp
            assertEq(att.logInTime, loginTime);
            assertFalse(att.isLate);

            // Logout at 5:00 PM
            uint256 logoutTime = today + WORKING_HOURS_END;
            vm.warp(logoutTime);
            vm.prank(employee1);
            scalePay.markAttendance();

            // Verify logout - need to account for timezone offset
            att = scalePay.getAttendance(employee1, today);
            // The stored logOutTime will be UTC timestamp
            assertEq(att.logOutTime, logoutTime);
            assertFalse(att.isEarlyCheckout);

            // Move to next day
            vm.warp(today + 86400);
        }

        // Calculate salary
        uint256 _salary = scalePay.calculateSalary(employee1);
        assertEq(_salary, salary); // Should be full salary as no deductions

        // Pay salary
        vm.prank(employer);
        scalePay.paySalaryToAllEmployees();

        // Check payment
        assertEq(paymentToken.balanceOf(employee1), salary);
    }
}
