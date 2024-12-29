"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@material-tailwind/react";
import { toast } from "react-hot-toast";
import {
  ScalePayContract,
  ScalePayFactoryContract,
} from "@/contracts/contracts";
import { readContract } from "thirdweb";

const EmployeeOnboarding = () => {
  const [employerPublicKey, setEmployerPublicKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!employerPublicKey) {
      toast.error("Please enter your employer's public key");
      return;
    }
    setIsLoading(true);
    try {
      const scalePayAddress = await readContract({
        contract: ScalePayFactoryContract,
        method:
          "function getDeployedContract(address _owner) external view returns (address)",
        params: [employerPublicKey],
      });
      if (scalePayAddress === "0x0000000000000000000000000000000000000000") {
        toast.error("Employer not found");
        setIsLoading(false);
        return;
      }
      window.localStorage.setItem("scalePayAddress", scalePayAddress);
      const isEmployee = await readContract({
        contract: ScalePayContract(scalePayAddress),
        method:
          "function getEmployee(address _employeeAddress) external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses) memory)",
        params: [employerPublicKey],
      });
      if (
        isEmployee.name === "" &&
        isEmployee.walletAddress ===
          "0x0000000000000000000000000000000000000000"
      ) {
        toast.error(
          "Either you are not an employee or your account is not set up yet"
        );
        setIsLoading(false);
        return;
      } else {
        window.localStorage.setItem("employerPublicKey", employerPublicKey);
        router.push("/employee");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-[35%] place-self-center flex flex-col justify-center">
      <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, Employee!</h1>
        <p className="text-sm text-gray-500 mb-2">
          Enter your employer's public key if you're an existing employee. If
          new, ask your employer to add you to their system before proceeding.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Note: Employer must set up their account first and add you to their
          system before proceeding.
        </p>
        <div className="flex flex-col gap-6">
          <div className="w-full flex flex-col gap-4">
            <label className="text-xl font-bold text-white">
              Employer Public Key
            </label>
            <Input
              color="white"
              value={employerPublicKey}
              onChange={(e) => setEmployerPublicKey(e.target.value)}
              className="text-base !border !border-gray-400 focus:!border-white"
              labelProps={{
                className: "hidden",
              }}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            loading={isLoading}
            variant="filled"
            color="white"
            className="text-base flex items-center justify-center"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;
