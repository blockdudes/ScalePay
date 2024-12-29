export type Employee = {
  name: string;
  walletAddress: string;
  monthlySalary: bigint;
  joiningDate: bigint;
  lastPayoutDate: bigint;
  availablePaidLeaves: bigint;
  isActive: boolean;
  totalFines: bigint;
  totalBonuses: bigint;
};

export type Attendance = {
  date: bigint;
  logInTime: bigint;
  logOutTime: bigint;
  status: bigint; // 0: Absent, 1: Half Day, 2: Full Day
  isLate: boolean;
  isEarlyCheckout: boolean;
};

export type LeaveRequest = {
  startDate: bigint;
  endDate: bigint;
  reason: string;
  isPaidLeave: boolean;
  isApproved: boolean;
  isProcessed: boolean;
  remarks: string;
};

export type WorkingHours = {
  startTime: bigint;
  endTime: bigint;
  bufferTime: bigint;
  workDays: bigint[];
  timezoneOffset: bigint;
};
