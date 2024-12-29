"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input } from "@material-tailwind/react";
import { BsCheck } from "react-icons/bs";
import {
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb";
import { ScalePayContract } from "@/contracts/contracts";
import { WorkingHours } from "@/types/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { useActiveAccount } from "thirdweb/react";

const Settings = () => {
  const account = useActiveAccount();
  const getWorkingHours = async () => {
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    return await readContract({
      contract: ScalePayContract(scalePayAddress!),
      method:
        "function getWorkingHours() external view returns ((uint256 startTime, uint256 endTime, uint256 bufferTime, uint256[] workDays, int256 timezoneOffset) memory)",
    });
  };
  const [workingHours, setWorkingHours] = useState<WorkingHours>();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    getWorkingHours().then((workingHours) => {
      setWorkingHours(workingHours as any);
    });
  }, []);

  if (!workingHours) return <LoadingSpinner />;

  const handleSaveChanges = async () => {
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress!),
        method:
          "function updateWorkingHours(uint256 _startTime, uint256 _endTime, uint256 _bufferTime, uint256[] memory _workDays, int256 _timezoneOffset) external",
        params: [
          workingHours.startTime,
          workingHours.endTime,
          workingHours.bufferTime,
          workingHours.workDays,
          workingHours.timezoneOffset,
        ],
      });
      await sendAndConfirmTransaction({
        account,
        transaction,
      }).then(() => {
        toast.success("Working hours updated successfully");
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-400">Configure your workspace settings</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card
          className="p-6 bg-gray-900 text-white"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <h3 className="text-xl font-semibold mb-4">Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm mb-2">Log In Time</label>
              <Input
                type="time"
                value={new Date(
                  Number(workingHours.startTime - workingHours.timezoneOffset) *
                    1000
                ).toLocaleTimeString()}
                className="!border-gray-800 text-white"
                labelProps={{ className: "hidden" }}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Log Out Time</label>
              <Input
                type="time"
                value={new Date(
                  Number(workingHours.endTime - workingHours.timezoneOffset) *
                    1000
                ).toLocaleTimeString()}
                className="!border-gray-800 text-white"
                labelProps={{ className: "hidden" }}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Buffer Time (minutes)
              </label>
              <Input
                type="number"
                defaultValue="15"
                className="!border-gray-800 text-white"
                labelProps={{ className: "hidden" }}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>
        </Card>

        <Card
          className="p-6 bg-gray-900 text-white"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <h3 className="text-xl font-semibold mb-4">Working Days</h3>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className={`relative flex justify-center items-center gap-2 border border-gray-800 rounded-md p-2 cursor-pointer ${
                  workingHours.workDays.includes(BigInt(index))
                    ? "text-gray-400"
                    : ""
                }`}
                onClick={() => {
                  if (workingHours.workDays.includes(BigInt(index))) {
                    setWorkingHours((prev) => ({
                      ...prev!,
                      workDays: prev!.workDays.filter(
                        (d) => d !== BigInt(index)
                      ),
                    }));
                  } else {
                    setWorkingHours((prev) => ({
                      ...prev!,
                      workDays: [...prev!.workDays, BigInt(index)],
                    }));
                  }
                }}
              >
                {day}
                {workingHours.workDays.includes(BigInt(index)) && (
                  <div className="absolute inset-0 bg-green-500/40 rounded-md flex items-center justify-center">
                    <BsCheck className="h-12 w-12 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            size="lg"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
