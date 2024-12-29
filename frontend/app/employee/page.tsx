"use client";
import { ScalePayContract } from "@/contracts/contracts";
import { Attendance, Employee } from "@/types/types";
import { Button, Card } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { BsClockFill, BsCalendarCheck, BsCashStack } from "react-icons/bs";
import {
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb/transaction";
import { useActiveAccount } from "thirdweb/react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/LoadingSpinner";

const EmployeeDashboard = () => {
  const account = useActiveAccount();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!account) return;
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    if (!scalePayAddress) return;
    readContract({
      contract: ScalePayContract(scalePayAddress!),
      method:
        "function getEmployee(address _employeeAddress) external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses) memory)",
      params: [account.address],
    }).then((employee) => {
      const utcTimestamp: number = Math.floor(Date.now() / 1000);
      const localDate: number = utcTimestamp - (utcTimestamp % 86400);
      setEmployee(employee);
      readContract({
        contract: ScalePayContract(scalePayAddress),
        method:
          "function getAttendance(address _employeeAddress, uint256 _date) external view returns ((uint256 date, uint256 logInTime, uint256 logOutTime, uint256 status, bool isLate, bool isEarlyCheckout) memory)",
        params: [employee.walletAddress, BigInt(localDate)],
      }).then((attendance) => {
        setAttendance(attendance);
        setIsLoading(false);
      });
    });
  }, [account]);

  useEffect(() => {
    if (!attendance) return;
    if (duration) return;
    if (
      new Date(
        (Number(attendance?.logInTime) + new Date().getTimezoneOffset() * 60) *
          1000
      ).toLocaleTimeString() == "00:00:00"
    )
      return;
    const interval = setInterval(() => {
      const duration = new Date(
        (Math.floor(Date.now() / 1000) - Number(attendance?.logInTime)) * 1000
      ).toLocaleTimeString();
      setDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [attendance]);

  const handleCheckInOut = async () => {
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    if (!scalePayAddress) {
      toast.error("Couldn't connect to Blockchain Network");
      return;
    }
    if (!account) {
      toast.error("Connect your wallet to continue");
      return;
    }
    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress!),
        method: "function markAttendance() external",
        params: [],
      });
      await sendAndConfirmTransaction({
        account,
        transaction,
      }).then((receipt) => {
        toast.success("Attendance marked successfully");
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BsClockFill className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Status</p>
              <h3 className="text-xl font-bold">
                {new Date(
                  (Number(attendance?.logInTime) +
                    new Date().getTimezoneOffset() * 60) *
                    1000
                ).toLocaleTimeString() == "00:00:00" ? (
                  "Not Checked In"
                ) : new Date(
                    (Number(attendance?.logOutTime) +
                      new Date().getTimezoneOffset() * 60) *
                      1000
                  ).toLocaleTimeString() == "00:00:00" ? (
                  <span>
                    Clocking <span className="text-gray-400">{duration}</span>
                  </span>
                ) : (
                  "Checked Out"
                )}
              </h3>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={
              new Date(
                (Number(attendance?.logInTime) +
                  new Date().getTimezoneOffset() * 60) *
                  1000
              ).toLocaleTimeString() != "00:00:00" &&
              new Date(
                (Number(attendance?.logOutTime) +
                  new Date().getTimezoneOffset() * 60) *
                  1000
              ).toLocaleTimeString() != "00:00:00"
            }
            onClick={handleCheckInOut}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {new Date(
              (Number(attendance?.logInTime) +
                new Date().getTimezoneOffset() * 60) *
                1000
            ).toLocaleTimeString() == "00:00:00"
              ? "Check In"
              : new Date(
                  (Number(attendance?.logOutTime) +
                    new Date().getTimezoneOffset() * 60) *
                    1000
                ).toLocaleTimeString() == "00:00:00"
              ? "Check Out"
              : "Checked Out"}
          </Button>
        </Card>

        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <BsCashStack className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Salary</p>
              <h3 className="text-xl font-bold">
                ${Number(employee?.monthlySalary) / 1e6}
              </h3>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Till {new Date().toLocaleDateString()}
          </div>
        </Card>

        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BsCalendarCheck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Leave Balance</p>
              <h3 className="text-xl font-bold">
                {Number(employee?.availablePaidLeaves)} days
              </h3>
            </div>
          </div>
          <div className="text-sm text-gray-400">Remaining</div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
