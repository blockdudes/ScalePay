"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ScalePayContract } from "@/contracts/contracts";
import { Attendance } from "@/types/types";
import { Card, Select, Option } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { BsCalendarCheck, BsCalendarX } from "react-icons/bs";
import { readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

const EmployeeAttendance = () => {
  const account = useActiveAccount();
  const [attendanceRecords, setAttendanceRecords] = useState<
    Attendance[] | null
  >(null);
  const [stats, setStats] = useState<{
    present: number;
    absent: number;
    late: number;
    totalWorkingDays: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = async () => {
    if (!account) return;
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    if (!scalePayAddress) return;

    readContract({
      contract: ScalePayContract(scalePayAddress),
      method:
        "function getEmployee(address _employeeAddress) external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses) memory)",
      params: [account.address],
    }).then((employee) => {
      const startDate =
        Number(employee.lastPayoutDate) -
        (Number(employee.lastPayoutDate) % 86400);
      const endDate =
        Math.floor(Date.now() / 1000) - (Math.floor(Date.now() / 1000) % 86400);
      setAttendanceRecords([]);
      const dates = Array.from(
        { length: (endDate - startDate) / 86400 + 1 },
        (_, index) => startDate + index * 86400
      );
      Promise.all(
        dates.map((date) =>
          readContract({
            contract: ScalePayContract(scalePayAddress),
            method:
              "function getAttendance(address _employeeAddress, uint256 _date) external view returns ((uint256 date, uint256 logInTime, uint256 logOutTime, uint256 status, bool isLate, bool isEarlyCheckout) memory)",
            params: [employee.walletAddress, BigInt(date)],
          }).then((attendance) => {
            if (attendance.date == BigInt(0)) {
              attendance.date = BigInt(date);
            }
            return attendance;
          })
        )
      ).then((attendance) => {
        const stats = {
          present: 0,
          absent: 0,
          late: 0,
          totalWorkingDays: dates.length,
        };
        attendance.forEach((record) => {
          if (Number(record.status) === 2) stats.present++;
          if (Number(record.status) === 1) stats.late++;
          if (Number(record.status) === 0) stats.absent++;
        });
        setAttendanceRecords(attendance.toReversed());
        setStats(stats);
        setIsLoading(false);
      });
    });
  };

  useEffect(() => {
    fetchAttendance();
  }, [account]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <BsCalendarCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Present Days</p>
              <h3 className="text-xl font-bold">{stats!.present}</h3>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <BsCalendarX className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Absent Days</p>
              <h3 className="text-xl font-bold">{stats!.absent}</h3>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div>
            <p className="text-sm text-gray-400">Late Check-ins</p>
            <h3 className="text-xl font-bold">{stats!.late}</h3>
          </div>
        </Card>

        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div>
            <p className="text-sm text-gray-400">Attendance Rate</p>
            <h3 className="text-xl font-bold">
              {Math.round((stats!.present / stats!.totalWorkingDays) * 100)}%
            </h3>
          </div>
        </Card>
      </div>

      {/* Attendance Records */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Attendance Records</h3>
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
                  "Date",
                  "Check In",
                  "Check Out",
                  "Duration",
                  "Status",
                  "Remarks",
                ].map((head) => (
                  <th key={head} className="border-b border-gray-800 p-4">
                    <span className="text-gray-400 font-normal">{head}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-600 text-white">
              {attendanceRecords?.map((record, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="p-4">
                    {new Date(Number(record.date) * 1000).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={record.isLate ? "text-yellow-500" : ""}>
                      {new Date(
                        (Number(record.logInTime) +
                          new Date().getTimezoneOffset() * 60) *
                          1000
                      ).toLocaleTimeString() == "00:00:00"
                        ? "N/A"
                        : new Date(
                            (Number(record.logInTime) +
                              new Date().getTimezoneOffset() * 60) *
                              1000
                          ).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        record.isEarlyCheckout ? "text-yellow-500" : ""
                      }
                    >
                      {new Date(
                        (Number(record.logOutTime) +
                          new Date().getTimezoneOffset() * 60) *
                          1000
                      ).toLocaleTimeString() == "00:00:00"
                        ? "N/A"
                        : new Date(
                            (Number(record.logOutTime) +
                              new Date().getTimezoneOffset() * 60) *
                              1000
                          ).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {record.logOutTime != BigInt(0) ?
                      new Date(
                        Number(record.logOutTime) * 1000 -
                          Number(record.logInTime) * 1000
                      ).toLocaleTimeString() : "N/A"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        Number(record.status) == 2
                          ? "bg-green-500"
                          : Number(record.status) == 1
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {Number(record.status) == 2
                        ? "Present"
                        : Number(record.status) == 1
                        ? "Half Day"
                        : "Absent"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {!record.isLate && !record.isEarlyCheckout && "—"}
                    {record.isLate && "Late Check-in"}
                    {record.isLate && record.isEarlyCheckout && ", "}
                    {record.isEarlyCheckout && "Early Check-out"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
