"use client";
import { useEffect, useState } from "react";
import { Button, Card } from "@material-tailwind/react";
import { BsPlusLg } from "react-icons/bs";
import { LeaveRequest } from "@/types/types";
import {
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb";
import { ScalePayContract } from "@/contracts/contracts";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "react-hot-toast";
import RequestLeaveModal from "@/components/RequestLeaveModal";
import LoadingSpinner from "@/components/LoadingSpinner";

const Leave = () => {
  const account = useActiveAccount();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [scalePayAddress, setScalePayAddress] = useState<string | null>(null);
  const [paidLeavesPerYear, setPaidLeavesPerYear] = useState<number>(0);
  const [availablePaidLeaves, setAvailablePaidLeaves] = useState<number>(0);
  const [leaves, setLeaves] = useState<
    (LeaveRequest & { id: bigint })[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaveRequests = async () => {
    if (!account) return;
    if (!scalePayAddress) return;

    readContract({
      contract: ScalePayContract(scalePayAddress),
      method:
        "function getEmployee(address _employeeAddress) external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses) memory)",
      params: [account.address],
    })
      .then((employee) => {
        setAvailablePaidLeaves(Number(employee.availablePaidLeaves));
        return readContract({
          contract: ScalePayContract(scalePayAddress),
          method:
            "function getLeaveRequests(address _employeeAddress) external view returns ((uint256 startDate, uint256 endDate, string reason, bool isPaidLeave, bool isApproved, bool isProcessed, string remarks)[] memory)",
          params: [employee.walletAddress],
        });
      })
      .then((leaves) => {
        setLeaves(
          leaves.map((leave, index) => ({ ...leave, id: BigInt(index) }))
        );
      });
  };

  const fetchPaidLeavesPerYear = async () => {
    if (!account) return;
    if (!scalePayAddress) return;

    readContract({
      contract: ScalePayContract(scalePayAddress),
      method: "function getPaidLeavesPerYear() external view returns (uint256)",
    }).then((paidLeavesPerYear) =>
      setPaidLeavesPerYear(Number(paidLeavesPerYear))
    );
  };

  useEffect(() => {
    if (!scalePayAddress) {
      setScalePayAddress(window.localStorage.getItem("scalePayAddress"));
    }
    fetchLeaveRequests();
    fetchPaidLeavesPerYear();
  }, [account, scalePayAddress]);

  useEffect(() => {
    // check if leaves and paidLeavesPerYear are loaded
    if (leaves && paidLeavesPerYear) {
      setIsLoading(false);
    }
  }, [leaves, paidLeavesPerYear]);

  const handleRequestLeave = async (data: {
    leaveType: "paid" | "unpaid";
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    if (!account) {
      toast.error("Please connect your wallet");
      throw new Error("account not found");
    }
    if (!scalePayAddress) {
      toast.error("Can't connect to Blockchain Network");
      throw new Error("scalePayAddress not found");
    }

    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress),
        method:
          "function requestLeave(uint256 _startDate, uint256 _endDate, string memory _reason, bool _isPaidLeave) external",
        params: [
          BigInt(new Date(data.startDate).getTime() / 1000),
          BigInt(new Date(data.endDate).getTime() / 1000),
          data.reason,
          data.leaveType === "paid",
        ],
      });

      await sendAndConfirmTransaction({
        account,
        transaction,
      });
      toast.success("Leave request submitted successfully!");
      fetchLeaveRequests();
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error("Failed to submit leave request. Please try again.");
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="p-6 bg-gray-900"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <p className="text-sm text-gray-400 mb-1">Paid Leaves</p>
          <div className="text-2xl text-white font-bold">
            {Number(paidLeavesPerYear)} days
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Used: {paidLeavesPerYear - availablePaidLeaves}</span>
            <span>Remaining: {availablePaidLeaves}</span>
          </div>
        </Card>
      </div>

      {/* Leave Requests */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Leave Requests</h3>
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowRequestModal(true)}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            <BsPlusLg className="h-4 w-4" />
            Request Leave
          </Button>
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
                {["Type", "Duration", "Reason", "Status", "Remarks"].map(
                  (head) => (
                    <th key={head} className="border-b border-gray-800 p-4">
                      <span className="text-gray-400 font-normal">{head}</span>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-gray-600 text-white">
              {leaves!.map((leave) => (
                <tr key={leave.id} className="border-b border-gray-800">
                  <td className="p-4">
                    <span className="capitalize">
                      {leave.isPaidLeave ? "Paid Leave" : "Unpaid Leave"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(
                      Number(leave.startDate) * 1000 +
                        new Date().getTimezoneOffset() * 60 * 1000
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      Number(leave.endDate) * 1000 +
                        new Date().getTimezoneOffset() * 60 * 1000
                    ).toLocaleDateString()}
                  </td>
                  <td className="p-4">{leave.reason}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        leave.isApproved
                          ? "bg-green-500"
                          : leave.isProcessed && !leave.isApproved
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {leave.isApproved
                        ? "Approved"
                        : leave.isProcessed && !leave.isApproved
                        ? "Rejected"
                        : "Pending"}
                    </span>
                  </td>
                  {leave.remarks ? (
                    <td className="p-4">{leave.remarks}</td>
                  ) : (
                    <td className="p-4 text-gray-400">N/A</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <RequestLeaveModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequestLeave}
      />
    </div>
  );
};

export default Leave;
