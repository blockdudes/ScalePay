"use client";
import {
  ScalePayFactoryContract,
  USDCContractAddress,
  USDTContractAddress,
} from "@/contracts/contracts";
import {
  Button,
  Input,
  Option,
  Select,
  Tooltip,
  Typography,
} from "@material-tailwind/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsCheck, BsInfoCircle } from "react-icons/bs";
import {
  parseEventLogs,
  prepareContractCall,
  prepareEvent,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

const EmployerOnboarding = () => {
  const account = useActiveAccount();
  const router = useRouter();
  const [token, setToken] = useState<"USDC" | "USDT">("USDC");
  const [paidLeaves, setPaidLeaves] = useState<number>(15);
  const [localInTime, setLocalInTime] = useState<string>("09:00");
  const [localOutTime, setLocalOutTime] = useState<string>("17:00");
  const [bufferTime, setBufferTime] = useState<number>(10);
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleContinue = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    if (workingDaysPerWeek.length === 0) {
      toast.error("Please select at least one working day");
      return;
    }
    if (localInTime === "") {
      toast.error("Please select a log in time");
      return;
    }
    if (localOutTime === "") {
      toast.error("Please select a log out time");
      return;
    }
    var tokenAddress;
    if (token === "USDC") {
      tokenAddress = USDCContractAddress;
    } else if (token === "USDT") {
      tokenAddress = USDTContractAddress;
    } else {
      toast.error("Please select a token");
      return;
    }

    setIsLoading(true);
    const timezoneOffsetInSeconds = -(new Date().getTimezoneOffset() * 60);
    const localInTimeInSeconds =
      Number(localInTime.split(":")[0]) * 3600 +
      Number(localInTime.split(":")[1]) * 60;
    const localOutTimeInSeconds =
      Number(localOutTime.split(":")[0]) * 3600 +
      Number(localOutTime.split(":")[1]) * 60;

    try {
      const transaction = prepareContractCall({
        contract: ScalePayFactoryContract,
        method:
          "function createScalePay(address _paymentToken, uint256 _workingHoursStartTime, uint256 _workingHoursEndTime, uint256 _workingHoursBufferTime, uint256 _paidLeavesPerYear, uint256[] memory _workDays, int256 _timezoneOffset ) external returns (address)",
        params: [
          tokenAddress,
          BigInt(localInTimeInSeconds),
          BigInt(localOutTimeInSeconds),
          BigInt(bufferTime),
          BigInt(paidLeaves),
          workingDaysPerWeek.map((day) => BigInt(day)),
          BigInt(timezoneOffsetInSeconds),
        ],
      });
      await sendAndConfirmTransaction({
        account,
        transaction,
      })
        .then((tx) => {
          const contractDeployedEvent = prepareEvent({
            signature:
              "event ScalePayDeployed(address indexed owner, address scalePayAddress, address paymentToken)",
          });
          const [event] = parseEventLogs({
            logs: tx.logs,
            events: [contractDeployedEvent],
          });
          localStorage.setItem("scalePayAddress", event.args.scalePayAddress);
          router.push("/employer");
          toast.success("Account setup successfully");
        })
        .catch((error) => {
          console.log(error);
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <div className="w-[680px] flex flex-col bg-gray-900 border border-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, Employer!</h1>
        <p className="text-sm text-gray-500 mb-4">
          Complete your onboarding process by filling out the required
          information. This will ensure a smooth experience for you and your
          team.
        </p>
        <div className="flex flex-col justify-center gap-4">
          <div className="flex flex-col gap-2">
            <label>Select Payout Token</label>
            <Select
              onChange={(value) => {
                setToken(value as "USDC" | "USDT");
              }}
              value={token}
              labelProps={{
                className: "hidden",
              }}
              className="!border !border-white focus:!border-white text-white"
              menuProps={{
                className: "bg-gray-900 text-white flex flex-col gap-1",
              }}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              <Option value="USDC">USDC</Option>
              <Option value="USDT">USDT</Option>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label>Paid leaves per year</label>
            <Input
              type="number"
              color="white"
              value={paidLeaves}
              onChange={(e) => {
                setPaidLeaves(Number(e.target.value));
              }}
              labelProps={{
                className: "hidden",
              }}
              className="!border !border-white focus:!border-white !text-white"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label>Log in Timing</label>
              <Input
                type="time"
                color="white"
                value={localInTime}
                onChange={(e) => setLocalInTime(e.target.value)}
                labelProps={{
                  className: "hidden",
                }}
                className="!border !border-white focus:!border-white !text-white"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Log out Timing</label>
              <Input
                type="time"
                color="white"
                value={localOutTime}
                onChange={(e) => {
                  setLocalOutTime(e.target.value);
                }}
                labelProps={{
                  className: "hidden",
                }}
                className="!border !border-white focus:!border-white !text-white"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                Buffer Time (in minutes)
                <Tooltip
                  content={
                    <div>
                      <Typography
                        color="white"
                        className="font-medium"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      >
                        Buffer Time
                      </Typography>
                      <Typography
                        variant="small"
                        color="white"
                        className="font-normal opacity-80"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      >
                        This is the acceptable time limit for the employee to
                        log in and out before the shift starts and after the
                        shift ends
                      </Typography>
                    </div>
                  }
                >
                  <BsInfoCircle size={15} />
                </Tooltip>
              </label>
              <Input
                type="number"
                color="white"
                value={bufferTime}
                onChange={(e) => {
                  setBufferTime(Number(e.target.value));
                }}
                labelProps={{
                  className: "hidden",
                }}
                className="!border !border-white focus:!border-white !text-white"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label>Working days per week</label>
            <div className="w-full h-14 grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, index) => (
                <div
                  key={index}
                  className="relative flex justify-center items-center gap-2 border border-white rounded-md p-2 cursor-pointer"
                  onClick={() => {
                    if (workingDaysPerWeek.includes(index)) {
                      setWorkingDaysPerWeek((prev) =>
                        prev.filter((day) => day !== index)
                      );
                    } else {
                      setWorkingDaysPerWeek((prev) => [...prev, index]);
                    }
                  }}
                >
                  {day}
                  {workingDaysPerWeek.includes(index) && (
                    <div className="absolute top-0 right-0 left-0 bottom-0 bg-green-400/80 rounded-md p-2 flex justify-center items-center">
                      <BsCheck size={50} className="opacity-60" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Button
            size="lg"
            color="white"
            className="w-full text-base flex justify-center items-center"
            onClick={handleContinue}
            loading={isLoading}
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

export default EmployerOnboarding;
