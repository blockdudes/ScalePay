"use client";
import { ScalePayContract } from "@/contracts/contracts";
import { Attendance, Employee } from "@/types/types";
import { Card } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

const AttendancePage = () => {
  const account = useActiveAccount();
  const [attendance, setAttendance] = useState<(Employee & Attendance)[]>([]);

  useEffect(() => {
    if (account) {
      if (!window) return;
      const scalePayAddress = window.localStorage.getItem("scalePayAddress");
      if (!scalePayAddress) return;
      const utcTimestamp: number = Math.floor(Date.now() / 1000);
      const localDate: number = utcTimestamp - (utcTimestamp % 86400);

      readContract({
        contract: ScalePayContract(scalePayAddress),
        method:
          "function getEmployees() external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses)[] memory)",
      }).then((employees) => {
        setAttendance([]);
        return Promise.all(
          employees.map((employee) =>
            readContract({
              contract: ScalePayContract(scalePayAddress),
              method:
                "function getAttendance(address _employeeAddress, uint256 _date) external view returns ((uint256 date, uint256 logInTime, uint256 logOutTime, uint256 status, bool isLate, bool isEarlyCheckout) memory)",
              params: [employee.walletAddress, BigInt(localDate)],
            }).then((attendance) =>
              setAttendance((prev) => {
                return [...prev, { ...employee, ...attendance }];
              })
            )
          )
        );
      });
    }
  }, [account]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Attendance</h2>
          <p className="text-gray-400">Track employee attendance records</p>
        </div>
      </div>

      <Card
        className="overflow-hidden"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr className="bg-gray-900">
              {[
                "Employee",
                "Date",
                "Check In",
                "Check Out",
                "Status",
                "Duration",
              ].map((head) => (
                <th key={head} className="border-b border-gray-800 p-4">
                  <span className="text-gray-400 font-normal">{head}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-600 text-white">
            {attendance.map((attendanceRecord) => (
              <tr
                key={attendanceRecord.walletAddress}
                className="border-b border-gray-800"
              >
                <td className="p-4">
                  <span className="font-semibold">{attendanceRecord.name}</span>
                </td>
                <td className="p-4">{new Date().toLocaleDateString()}</td>
                <td className="p-4">
                  {new Date(
                    (Number(attendanceRecord.logInTime) +
                      new Date().getTimezoneOffset() * 60) *
                      1000
                  ).toLocaleTimeString() == "00:00:00"
                    ? "N/A"
                    : new Date(
                        (Number(attendanceRecord.logInTime) +
                          new Date().getTimezoneOffset() * 60) *
                          1000
                      ).toLocaleTimeString()}
                </td>
                <td className="p-4">
                  {new Date(
                    Number(attendanceRecord.logOutTime) * 1000 +
                      new Date().getTimezoneOffset() * 60 * 1000
                  ).toLocaleTimeString() == "00:00:00"
                    ? "N/A"
                    : new Date(
                        Number(attendanceRecord.logOutTime) * 1000 +
                          new Date().getTimezoneOffset() * 60 * 1000
                      ).toLocaleTimeString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      attendanceRecord.status === BigInt(2)
                        ? "bg-green-500"
                        : attendanceRecord.isLate ||
                          attendanceRecord.isEarlyCheckout
                        ? "bg-yellow-500 text-black"
                        : "bg-red-500"
                    }`}
                  >
                    {attendanceRecord.status === BigInt(2)
                      ? "Full Day"
                      : attendanceRecord.status === BigInt(1)
                      ? "Half Day"
                      : "Absent"}
                  </span>
                </td>
                <td className="p-4">
                  {attendanceRecord.logOutTime ?
                    Number(
                      attendanceRecord.logOutTime - attendanceRecord.logInTime
                    ) / 60 : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AttendancePage;
