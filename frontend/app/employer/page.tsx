"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ScalePayContract,
  USDCContract,
  USDCContractAddress,
  USDTContract,
} from "@/contracts/contracts";
import { Attendance, Employee, LeaveRequest } from "@/types/types";
import { Button, Card } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BsPeopleFill, BsClock, BsCalendar, BsCashCoin } from "react-icons/bs";
import {
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
  sendTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

const Employer = () => {
  const account = useActiveAccount();
  const [scalePayAddress, setScalePayAddress] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[][]>([]);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!account) return;
    if (!window) return;
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    setScalePayAddress(scalePayAddress);
    if (!scalePayAddress) return;
    const utcTimestamp: number = Math.floor(Date.now() / 1000);
    const offset: number = new Date().getTimezoneOffset() * 60;

    // Get the local date for the UTC timestamp
    const localTimestamp: number = utcTimestamp + offset;
    const localDate: number = Math.floor(localTimestamp / 86400) * 86400;
    readContract({
      contract: ScalePayContract(scalePayAddress),
      method:
        "function getEmployees() external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses)[] memory)",
    })
      .then((employees) => {
        setEmployees(employees as any);
        return employees;
      })
      .then((employees) =>
        Promise.all([
          Promise.all(
            employees.map((employee) =>
              readContract({
                contract: ScalePayContract(scalePayAddress),
                method:
                  "function getAttendance(address _employeeAddress, uint256 _date) external view returns ((uint256 date, uint256 logInTime, uint256 logOutTime, uint256 status, bool isLate, bool isEarlyCheckout) memory)",
                params: [employee.walletAddress, BigInt(localDate)],
              })
            )
          ),
          Promise.all(
            employees.map((employee) =>
              readContract({
                contract: ScalePayContract(scalePayAddress),
                method:
                  "function getLeaveRequests(address _employeeAddress) external view returns ((uint256 startDate, uint256 endDate, string reason, bool isPaidLeave, bool isApproved, bool isProcessed, string remarks)[] memory)",
                params: [employee.walletAddress],
              })
            )
          ),
        ])
      )
      .then(([attendance, leaves]) => {
        setAttendance(attendance);
        setLeaves(
          leaves.map((employeeLeaves) => employeeLeaves.map((leave) => leave))
        );
        setIsLoading(false);
      });
    readContract({
      contract: ScalePayContract(scalePayAddress),
      method: "function getPaymentToken() external view returns (address)",
    }).then((paymentToken) => {
      if (paymentToken !== "0x0000000000000000000000000000000000000000") {
        setPaymentToken(paymentToken);
      }
    });
  }, [account]);

  const handlePaySalaries = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!scalePayAddress) {
      toast.error("Cannot connect to Blockchain Network");
      return;
    }
    if (!paymentToken) {
      toast.error("Cannot fetch payment token");
      return;
    }
    let loader = toast.loading("Approving token for ScalePay...");
    try {
      const approveTransaction = prepareContractCall({
        contract:
          paymentToken == USDCContractAddress ? USDCContract : USDTContract,
        method: "function approve(address,uint256) external returns (bool)",
        params: [scalePayAddress, BigInt(1e18)],
      });
      await sendAndConfirmTransaction({
        account,
        transaction: approveTransaction,
      }).then((receipt) => {
        toast.remove(loader);
        toast.success("Token approved successfully");
        loader = toast.loading("Distributing payroll...");
      });
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress),
        method: "function paySalaryToAllEmployees() external",
      });
      await sendAndConfirmTransaction({
        account,
        transaction,
      }).then((receipt) => {
        toast.remove(loader);
        toast.success("Payroll distributed successfully");
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to distribute payroll");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        className="bg-gray-900 border border-gray-800 p-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="text-blue-500">
            <BsCashCoin size={24} />
          </div>
          <h3 className="font-medium">Pay Salaries</h3>
        </div>
        <div className="text-2xl font-bold mt-2">
          <Button
            color="blue"
            variant="text"
            className="w-full"
            onClick={handlePaySalaries}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Distribute Payroll
          </Button>
        </div>
      </Card>
      <StatsCard
        icon={<BsPeopleFill size={24} />}
        title="Total Employees"
        value={employees.filter((e) => e.isActive).length.toString()}
      />
      <StatsCard
        icon={<BsClock size={24} />}
        title="Present Today"
        value={attendance
          .filter((a) => a.status === BigInt(2))
          .length.toString()}
      />
      <StatsCard
        icon={<BsCalendar size={24} />}
        title="Pending Leave Requests"
        value={leaves
          .flat()
          .filter((l) => !l.isProcessed)
          .length.toString()}
      />
      <StatsCard
        icon={<BsCashCoin size={24} />}
        title="Total Bonuses (in USD)"
        value={(
          employees.reduce(
            (acc, employee) => acc + employee.totalBonuses,
            BigInt(0)
          ) / BigInt(1e6)
        ).toString()}
      />
      <StatsCard
        icon={<BsCashCoin size={24} />}
        title="Total Fines (in USD)"
        value={(
          employees.reduce(
            (acc, employee) => acc + employee.totalFines,
            BigInt(0)
          ) / BigInt(1e6)
        ).toString()}
      />
    </div>
  );
};

const StatsCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <Card
    className="bg-gray-900 border border-gray-800 p-6"
    placeholder={undefined}
    onPointerEnterCapture={undefined}
    onPointerLeaveCapture={undefined}
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="text-blue-500">{icon}</div>
      <h3 className="font-medium">{title}</h3>
    </div>
    <div className="text-2xl font-bold mb-2">{value}</div>
  </Card>
);

export default Employer;
