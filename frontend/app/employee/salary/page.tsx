"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ScalePayContract } from "@/contracts/contracts";
import { Employee } from "@/types/types";
import { Card, Select, Option } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import {
  BsCashStack,
  BsArrowUp,
  BsArrowDown,
  BsDownload,
} from "react-icons/bs";
import { readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

const Salary = () => {
  const account = useActiveAccount();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salaryTillDate, setSalaryTillDate] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (!account) return;
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    readContract({
      contract: ScalePayContract(scalePayAddress!),
      method:
        "function getEmployee(address _employeeAddress) external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses) memory)",
      params: [account.address],
    }).then((employee) => {
      setEmployee(employee);
    });
    readContract({
      contract: ScalePayContract(scalePayAddress!),
      method:
        "function calculateSalary(address _employeeAddress) public view returns (uint256)",
      params: [account.address],
    }).then((salaryTillDate) => {
      setSalaryTillDate(salaryTillDate);
    });
  }, [account]);

  if (!employee) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BsCashStack className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Base Salary</p>
              <h3 className="text-xl font-bold">
                ${(Number(employee.monthlySalary) / 1e6).toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="text-sm text-gray-400">Monthly</div>
        </Card>

        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <BsArrowUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Bonuses</p>
              <h3 className="text-xl font-bold">
                ${(Number(employee.totalBonuses) / 1e6).toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="text-sm text-gray-400">This Payout</div>
        </Card>

        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <BsArrowDown className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Deductions</p>
              <h3 className="text-xl font-bold">
                ${(Number(employee.totalFines) / 1e6).toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="text-sm text-gray-400">This Payout</div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card
        className="p-6 bg-gray-900 text-white"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <h3 className="text-xl font-semibold mb-4">Current Month Breakdown</h3>
        <div className="space-y-4">
          {
            <div>
              <div className="flex justify-between text-sm mb-1">
                <h4 className="text-sm text-gray-400 mb-2">Deductions</h4>
                <span className="text-red-500">
                  -${(Number(employee.totalFines) / 1e6).toFixed(2)}
                </span>
              </div>
            </div>
          }
          {
            <div>
              <div className="flex justify-between text-sm mb-1">
                <h4 className="text-sm text-gray-400 mb-2">Bonuses</h4>
                <span className="text-green-500">
                  +${(Number(employee.totalBonuses) / 1e6).toFixed(2)}
                </span>
              </div>
            </div>
          }
          <div className="border-t border-gray-800 pt-4">
            <div className="flex justify-between font-semibold">
              <span>Salary (till date)</span>
              <span>${(Number(salaryTillDate) / 1e6).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Salary;
