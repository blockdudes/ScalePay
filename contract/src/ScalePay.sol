// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ScalePay is Ownable, ReentrancyGuard {
    // Struct representing an employee's details
    struct Employee {
        string name; // Name of the employee
        address walletAddress; // Wallet address of the employee
        uint256 monthlySalary; // Monthly salary of the employee
        uint256 joiningDate; // Timestamp of when the employee joined
        uint256 lastPayoutDate; // Timestamp of the last salary payout
        uint256 availablePaidLeaves; // Number of paid leaves available
        bool isActive; // Status indicating if the employee is active
        uint256 totalFines; // Total fines applied to the employee
        uint256 totalBonuses; // Total bonuses awarded to the employee
    }

    // Struct representing the working hours configuration
    struct WorkingHours {
        uint256 startTime; // Start time in seconds from midnight (e.g., 9:00 AM = 32400)
        uint256 endTime; // End time in seconds from midnight (e.g., 5:00 PM = 61200)
        uint256 bufferTime; // Buffer time in minutes (e.g., 15 minutes)
        DayOfWeek[] workDays; // Array of working days
        int256 timezoneOffset; // New field: offset in seconds from UTC
    }

    // Struct representing an employee's attendance record
    struct Attendance {
        uint256 date; // Date of attendance
        uint256 logInTime; // Timestamp of login
        uint256 logOutTime; // Timestamp of logout
        AttendanceStatus status; // Attendance status (absent, half-day, full-day)
        bool isLate; // Indicates if the employee was late
        bool isEarlyCheckout; // Indicates if the employee checked out early
    }

    // Struct representing a leave request made by an employee
    struct LeaveRequest {
        uint256 startDate; // Start date of the leave
        uint256 endDate; // End date of the leave
        string reason; // Reason for the leave
        bool isPaidLeave; // Indicates if the leave is paid
        bool isApproved; // Indicates if the leave request is approved
        bool isProcessed; // Indicates if the leave request has been processed
        string remarks; // Remarks regarding the leave request
    }

    // Enum representing attendance status
    enum AttendanceStatus {
        ABSENT, // Employee was absent
        HALF_DAY, // Employee was present for half a day
        FULL_DAY // Employee was present for a full day
    }

    // Enum representing days of the week
    enum DayOfWeek {
        Sunday, // Sunday
        Monday, // Monday
        Tuesday, // Tuesday
        Wednesday, // Wednesday
        Thursday, // Thursday
        Friday, // Friday
        Saturday // Saturday
    }

    // State variables
    mapping(address => Employee) private employees; // Mapping of employee addresses to their details
    mapping(address => mapping(uint256 => Attendance)) private attendance; // Mapping of employee addresses to their attendance records by date
    mapping(address => LeaveRequest[]) private leaveRequests; // Mapping of employee addresses to their leave requests
    address[] private employeeAddresses; // Array of employee addresses
    WorkingHours private workingHours; // Working hours configuration
    uint256 private paidLeavesPerYear; // Number of paid leaves per year
    IERC20 private paymentToken; // ERC20 token used for salary payments

    // Events
    event EmployeeHired(
        address indexed employeeAddress, // Address of the hired employee
        string name, // Name of the hired employee
        uint256 salary // Salary of the hired employee
    );
    event EmployeeFired(address indexed employeeAddress); // Event emitted when an employee is fired
    event AttendanceMarked(
        address indexed employee, // Address of the employee
        uint256 date, // Date of attendance
        AttendanceStatus status // Attendance status
    );
    event LeaveRequested(
        address indexed employee, // Address of the employee requesting leave
        uint256 startDate, // Start date of the leave
        uint256 endDate, // End date of the leave
        bool isPaidLeave // Indicates if the leave is paid
    );
    event LeaveProcessed(
        address indexed employee, // Address of the employee whose leave is processed
        uint256 requestId, // ID of the leave request
        bool approved, // Indicates if the leave request is approved
        string remarks // Remarks regarding the leave request
    );
    event SalaryPaid(
        address indexed employee, // Address of the employee receiving salary
        uint256 amount, // Amount of salary paid
        uint256 fines, // Total fines deducted
        uint256 bonuses // Total bonuses added
    );

    // Custom Errors
    error EmployeeNotActive(); // Error indicating the employee is not active
    error EmployeeAlreadyExists(); // Error indicating the employee already exists
    error InvalidAddress(); // Error indicating an invalid address
    error InvalidSalary(); // Error indicating an invalid salary
    error EmployeeNotFound(); // Error indicating the employee was not found
    error InsufficientPaidLeaves(); // Error indicating insufficient paid leaves
    error InvalidStartDate(); // Error indicating an invalid start date
    error InvalidEndDate(); // Error indicating an invalid end date
    error RequestAlreadyProcessed(); // Error indicating the request has already been processed
    error InvalidRequestId(); // Error indicating an invalid request ID
    error InsufficientAllowance(); // Error indicating insufficient allowance for salary payment
    error SalaryTransferFailed(); // Error indicating salary transfer failed
    error InvalidWorkingHours(); // Error indicating invalid working hours

    // Modifiers
    modifier onlyActiveEmployee() {
        if (!employees[msg.sender].isActive) revert EmployeeNotActive(); // Revert if the employee is not active
        _;
    }

    constructor(
        address _employer, // Address of the employer
        address _paymentToken, // Address of the payment token
        uint256 _workingHoursStartTime, // Start time of working hours
        uint256 _workingHoursEndTime, // End time of working hours
        uint256 _workingHoursBufferTime, // Buffer time for working hours
        uint256 _paidLeavesPerYear, // Number of paid leaves per year
        uint256[] memory _workDays, // Array of working days
        int256 _timezoneOffset // Timezone offset in seconds from UTC
    ) Ownable(_employer) {
        paymentToken = IERC20(_paymentToken); // Initialize payment token
        DayOfWeek[] memory __workDays = new DayOfWeek[](_workDays.length); // Create array for working days
        for (uint256 i = 0; i < _workDays.length; i++) {
            __workDays[i] = DayOfWeek(_workDays[i]); // Map input work days to enum
        }
        workingHours = WorkingHours(
            _workingHoursStartTime,
            _workingHoursEndTime,
            _workingHoursBufferTime,
            __workDays, // Set working hours configuration
            _timezoneOffset // Set timezone offset
        );
        paidLeavesPerYear = _paidLeavesPerYear; // Set paid leaves per year
    }

    function markAttendance() external onlyActiveEmployee {
        uint256 utcTimestamp = block.timestamp;
        int256 offset = workingHours.timezoneOffset;

        // Get the local date for the UTC timestamp
        uint256 localTimestamp = uint256(int256(utcTimestamp) + offset);
        uint256 localDate = (localTimestamp / 86400) * 86400;

        // Store attendance using local date as key
        Attendance storage todayAttendance = attendance[msg.sender][localDate];

        if (todayAttendance.logInTime == 0) {
            // Log in process
            todayAttendance.date = localDate;
            // Store UTC timestamp for precise duration calculation
            todayAttendance.logInTime = utcTimestamp;
            todayAttendance.isLate =
                (localTimestamp % 86400) >
                (workingHours.startTime + workingHours.bufferTime * 60);
        } else {
            // Log out process
            // Store UTC timestamp for precise duration calculation
            todayAttendance.logOutTime = utcTimestamp;
            todayAttendance.isEarlyCheckout =
                (localTimestamp % 86400) <
                (workingHours.endTime - workingHours.bufferTime * 60);

            // Calculate actual worked duration using UTC timestamps
            uint256 workedDuration = todayAttendance.logOutTime -
                todayAttendance.logInTime;
            uint256 halfDayDuration = (workingHours.endTime -
                workingHours.startTime) / 2;

            // Calculate attendance status based on actual duration
            if (!todayAttendance.isLate && !todayAttendance.isEarlyCheckout) {
                todayAttendance.status = AttendanceStatus.FULL_DAY;
            } else {
                if (workedDuration >= halfDayDuration) {
                    todayAttendance.status = AttendanceStatus.HALF_DAY;
                } else {
                    todayAttendance.status = AttendanceStatus.ABSENT;
                }
            }
        }

        emit AttendanceMarked(msg.sender, localDate, todayAttendance.status);
    }

    // Additional functions for leave management, salary calculation, and payouts
    function hireEmployee(
        string memory _name, // Name of the employee
        address _walletAddress, // Wallet address of the employee
        uint256 _monthlySalary // Monthly salary of the employee
    ) external onlyOwner {
        if (employees[_walletAddress].isActive) revert EmployeeAlreadyExists(); // Revert if employee already exists
        if (_walletAddress == address(0)) revert InvalidAddress(); // Revert if address is invalid
        if (_monthlySalary <= 0) revert InvalidSalary(); // Revert if salary is invalid

        employees[_walletAddress] = Employee({
            name: _name, // Set employee name
            walletAddress: _walletAddress, // Set employee wallet address
            monthlySalary: _monthlySalary, // Set employee monthly salary
            joiningDate: block.timestamp, // Set joining date to current timestamp
            lastPayoutDate: block.timestamp, // Set last payout date to current timestamp
            availablePaidLeaves: paidLeavesPerYear, // Set available paid leaves
            isActive: true, // Set employee status to active
            totalFines: 0, // Initialize total fines to zero
            totalBonuses: 0 // Initialize total bonuses to zero
        });

        employeeAddresses.push(_walletAddress); // Add employee address to the list
        emit EmployeeHired(_walletAddress, _name, _monthlySalary); // Emit employee hired event
    }

    function fireEmployee(address _employeeAddress) external onlyOwner {
        if (!employees[_employeeAddress].isActive) revert EmployeeNotFound(); // Revert if employee not found
        employees[_employeeAddress].isActive = false; // Set employee status to inactive
        emit EmployeeFired(_employeeAddress); // Emit employee fired event
    }

    function requestLeave(
        uint256 _startDate, // Start date of the leave request
        uint256 _endDate, // End date of the leave request
        string memory _reason, // Reason for the leave request
        bool _isPaidLeave // Indicates if the leave is paid
    ) external onlyActiveEmployee {
        if (_startDate < block.timestamp) revert InvalidStartDate(); // Revert if start date is in the past
        if (_endDate < _startDate) revert InvalidEndDate(); // Revert if end date is before start date

        if (_isPaidLeave) {
            uint256 leaveDays = (_endDate - _startDate) / 1 days + 1; // Calculate number of leave days
            if (employees[msg.sender].availablePaidLeaves < leaveDays)
                revert InsufficientPaidLeaves(); // Revert if insufficient paid leaves
        }

        leaveRequests[msg.sender].push(
            LeaveRequest({
                startDate: _startDate, // Set start date of leave
                endDate: _endDate, // Set end date of leave
                reason: _reason, // Set reason for leave
                isPaidLeave: _isPaidLeave, // Set paid leave status
                isApproved: false, // Initialize approval status to false
                isProcessed: false, // Initialize processed status to false
                remarks: "" // Initialize remarks as empty
            })
        );

        emit LeaveRequested(msg.sender, _startDate, _endDate, _isPaidLeave); // Emit leave requested event
    }

    function processLeaveRequest(
        address _employeeAddress, // Address of the employee whose leave is processed
        uint256 _requestId, // ID of the leave request
        bool _approved, // Indicates if the leave request is approved
        string memory _remarks // Remarks regarding the leave request
    ) external onlyOwner {
        if (_requestId >= leaveRequests[_employeeAddress].length)
            revert InvalidRequestId(); // Revert if request ID is invalid
        LeaveRequest storage request = leaveRequests[_employeeAddress][
            _requestId
        ]; // Reference the leave request
        if (request.isProcessed) revert RequestAlreadyProcessed(); // Revert if request has already been processed

        request.isApproved = _approved; // Set approval status
        request.isProcessed = true; // Mark request as processed
        request.remarks = _remarks; // Set remarks for the leave request

        if (_approved && request.isPaidLeave) {
            uint256 leaveDays = (request.endDate - request.startDate) /
                1 days +
                1; // Calculate number of leave days
            employees[_employeeAddress].availablePaidLeaves -= leaveDays; // Deduct leave days from available paid leaves
        }

        emit LeaveProcessed(_employeeAddress, _requestId, _approved, _remarks); // Emit leave processed event
    }

    function applyFine(
        address _employeeAddress, // Address of the employee to apply fine
        uint256 _amount // Amount of fine to apply
    ) external onlyOwner {
        if (!employees[_employeeAddress].isActive) revert EmployeeNotFound(); // Revert if employee not found
        employees[_employeeAddress].totalFines += _amount; // Apply fine to employee's total fines
    }

    function applyBonus(
        address _employeeAddress, // Address of the employee to apply bonus
        uint256 _amount // Amount of bonus to apply
    ) external onlyOwner {
        if (!employees[_employeeAddress].isActive) revert EmployeeNotFound(); // Revert if employee not found
        employees[_employeeAddress].totalBonuses += _amount; // Apply bonus to employee's total bonuses
    }

    function calculateSalary(
        address _employeeAddress // Address of the employee whose salary is calculated
    ) public view returns (uint256) {
        Employee memory employee = employees[_employeeAddress]; // Get employee details
        if (!employee.isActive) revert EmployeeNotFound(); // Revert if employee not found

        uint256 startDate = employee.lastPayoutDate; // Get last payout date
        uint256 totalDays = (block.timestamp - startDate) / 1 days; // Calculate total days since last payout
        uint256 halfDays = 0; // Initialize half days count
        uint256 absentDays = 0; // Initialize absent days count
        uint256 dailySalary = employee.monthlySalary / 30; // Calculate daily salary assuming 30 days in a month

        for (uint256 i = 0; i < totalDays; i++) {
            uint256 date = startDate + (i * 1 days); // Calculate date for attendance check
            // Convert to local date
            uint256 localDate = uint256(
                int256(date) + workingHours.timezoneOffset
            );
            localDate = (localDate / 86400) * 86400;

            Attendance memory dayAttendance = attendance[_employeeAddress][
                localDate
            ]; // Get attendance record for the date

            // Adjusting for paid leaves
            bool isOnPaidLeave = false; // Initialize paid leave status
            for (
                uint256 j = 0;
                j < leaveRequests[_employeeAddress].length;
                j++
            ) {
                if (
                    leaveRequests[_employeeAddress][j].isApproved &&
                    leaveRequests[_employeeAddress][j].isPaidLeave &&
                    date >= leaveRequests[_employeeAddress][j].startDate &&
                    date <= leaveRequests[_employeeAddress][j].endDate
                ) {
                    isOnPaidLeave = true; // Mark as on paid leave if conditions are met
                    break; // Exit loop if found
                }
            }

            if (!isOnPaidLeave) {
                if (dayAttendance.status == AttendanceStatus.HALF_DAY) {
                    halfDays += 1; // Increment half days count
                } else if (dayAttendance.status == AttendanceStatus.ABSENT) {
                    // Check if today is a work day
                    uint256 dayOfWeek = (date / 86400 + 4) % 7; // Calculate day of the week
                    bool isWorkDay = false; // Initialize work day status
                    for (uint256 k = 0; k < workingHours.workDays.length; k++) {
                        if (uint256(workingHours.workDays[k]) == dayOfWeek) {
                            isWorkDay = true; // Mark as work day if found
                            break; // Exit loop if found
                        }
                    }
                    if (isWorkDay) {
                        absentDays += 1; // Increment absent days count if it's a work day
                    }
                }
            }
        }

        // Calculate salary based on half days and absent days
        uint256 halfDaySalary = halfDays * (dailySalary / 2); // Calculate salary deduction for half days
        uint256 absentDayDeduction = absentDays * dailySalary; // Calculate salary deduction for absent days
        uint256 finalSalary = ((employee.monthlySalary * totalDays) / 31) -
            halfDaySalary -
            absentDayDeduction +
            employee.totalBonuses -
            employee.totalFines; // Calculate final salary after deductions and bonuses
        return finalSalary; // Return final salary
    }

    function paySalary(
        address _employeeAddress, // Address of the employee to pay salary
        uint256 amount // Amount of salary to pay
    ) internal onlyOwner nonReentrant {
        if (!employees[_employeeAddress].isActive) revert EmployeeNotFound(); // Revert if employee not found

        if (amount <= 0) revert SalaryTransferFailed(); // Revert if amount is invalid

        Employee storage employee = employees[_employeeAddress]; // Reference employee details
        uint256 fines = employee.totalFines; // Get total fines
        uint256 bonuses = employee.totalBonuses; // Get total bonuses

        // Reset fines and bonuses
        employee.totalFines = 0; // Reset total fines
        employee.totalBonuses = 0; // Reset total bonuses
        employee.lastPayoutDate = block.timestamp; // Update last payout date

        // Transfer salary
        require(
            paymentToken.transferFrom(
                address(owner()),
                _employeeAddress,
                amount
            ),
            "Salary transfer failed" // Revert if salary transfer fails
        );

        emit SalaryPaid(_employeeAddress, amount, fines, bonuses); // Emit salary paid event
    }

    function paySalaryToAllEmployees() external onlyOwner {
        if (employeeAddresses.length == 0) revert EmployeeNotFound(); // Revert if no employees found
        uint256 totalAllowance = paymentToken.allowance(
            address(owner()),
            address(this)
        ); // Get total allowance for salary payment
        uint256 totalSalary = 0; // Initialize total salary
        uint256[] memory salaries = new uint256[](employeeAddresses.length); // Create array for salaries
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].isActive) {
                salaries[i] = calculateSalary(employeeAddresses[i]); // Calculate salary for active employees
                totalSalary += salaries[i]; // Accumulate total salary
            }
        }
        if (totalAllowance < totalSalary) revert InsufficientAllowance(); // Revert if total allowance is insufficient

        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            if (employees[employeeAddresses[i]].isActive) {
                paySalary(employeeAddresses[i], salaries[i]); // Pay salary to active employees
            }
        }
    }

    function updateWorkingHours(
        uint256 _startTime, // New start time for working hours
        uint256 _endTime, // New end time for working hours
        uint256 _bufferTime, // New buffer time for working hours
        uint256[] memory _workDays, // New array of working days
        int256 _timezoneOffset // New parameter
    ) external onlyOwner {
        if (_startTime >= _endTime) revert InvalidWorkingHours(); // Revert if start time is not less than end time
        workingHours.startTime = _startTime; // Update start time
        workingHours.endTime = _endTime; // Update end time
        workingHours.bufferTime = _bufferTime; // Update buffer time
        workingHours.timezoneOffset = _timezoneOffset; // Update timezone offset
        DayOfWeek[] memory __workDays = new DayOfWeek[](_workDays.length); // Create array for new working days
        for (uint256 i = 0; i < _workDays.length; i++) {
            __workDays[i] = DayOfWeek(_workDays[i]); // Map input work days to enum
        }
        workingHours.workDays = __workDays; // Update working days
    }

    function updatePaidLeaves(uint256 _newPaidLeaves) external onlyOwner {
        paidLeavesPerYear = _newPaidLeaves; // Update number of paid leaves per year
    }

    // View functions for private data
    function getEmployee(
        address _employeeAddress // Address of the employee to retrieve
    ) external view returns (Employee memory) {
        return employees[_employeeAddress]; // Return employee details
    }

    function getEmployeeAddresses() external view returns (address[] memory) {
        return employeeAddresses; // Return employee addresses
    }

    function getEmployees() external view returns (Employee[] memory) {
        Employee[] memory _employees = new Employee[](employeeAddresses.length); // Create array for employees
        for (uint256 i = 0; i < employeeAddresses.length; i++) {
            _employees[i] = employees[employeeAddresses[i]]; // Copy employee details
        }
        return _employees; // Return employees
    }

    function getAttendance(
        address _employeeAddress, // Address of the employee to retrieve attendance
        uint256 _date // Date of attendance to retrieve
    ) external view returns (Attendance memory) {
        return attendance[_employeeAddress][_date]; // Return attendance record for the date
    }

    function getLeaveRequests(
        address _employeeAddress // Address of the employee to retrieve leave requests
    ) external view returns (LeaveRequest[] memory) {
        return leaveRequests[_employeeAddress]; // Return leave requests for the employee
    }

    function getWorkingHours() external view returns (WorkingHours memory) {
        return workingHours; // Return working hours
    }

    function getPaidLeavesPerYear() external view returns (uint256) {
        return paidLeavesPerYear; // Return number of paid leaves per year
    }

    function getPaymentToken() external view returns (address) {
        return address(paymentToken); // Return payment token
    }
}
