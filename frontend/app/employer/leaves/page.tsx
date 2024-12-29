"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ScalePayContract } from "@/contracts/contracts";
import { Employee, LeaveRequest } from "@/types/types";
import { Button, Card, Select, Option } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsCalendarCheck } from "react-icons/bs";
import {
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

const LeavesPage = () => {
  const account = useActiveAccount();
  const [leaveRequests, setLeaveRequests] = useState<
    (Employee & LeaveRequest & { id: bigint })[]
  >([]);
  const [scalePayAddress, setScalePayAddress] = useState<string | null>(null);

  const fetchLeaveRequests = async () => {
    if (!account) return;
    if (!window) return;
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    setScalePayAddress(scalePayAddress);
    if (!scalePayAddress) return;
    readContract({
      contract: ScalePayContract(scalePayAddress),
      method:
        "function getEmployees() external view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses)[] memory)",
    }).then((employees) =>
      Promise.all(
        employees.map((employee) =>
          readContract({
            contract: ScalePayContract(scalePayAddress),
            method:
              "function getLeaveRequests(address _employeeAddress) external view returns ((uint256 startDate, uint256 endDate, string reason, bool isPaidLeave, bool isApproved, bool isProcessed, string remarks)[] memory)",
            params: [employee.walletAddress],
          }).then((leaves) => {
            setLeaveRequests((_) =>
              leaves.map((leave, index) => ({
                ...employee,
                ...leave,
                id: BigInt(index),
              }))
            );
          })
        )
      )
    );
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [account]);

  const handleApproveLeave = async (
    requestId: bigint,
    employeeAddress: string,
    remarks: string
  ) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!scalePayAddress) {
      toast.error("Can't connect to Blockchain Network");
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress),
        method:
          "function processLeaveRequest(address _employeeAddress, uint256 _requestId, bool _approved, string memory _remarks) external",
        params: [employeeAddress, BigInt(requestId), true, remarks],
      });

      await sendAndConfirmTransaction({
        account,
        transaction,
      });
      toast.success("Leave request approved!");
      fetchLeaveRequests();
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Failed to approve leave. Please try again.");
    }
  };

  const handleRejectLeave = async (
    requestId: bigint,
    employeeAddress: string,
    remarks: string
  ) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!scalePayAddress) {
      toast.error("Can't connect to Blockchain Network");
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress),
        method:
          "function processLeaveRequest(address _employeeAddress, uint256 _requestId, bool _approved, string memory _remarks) external",
        params: [employeeAddress, BigInt(requestId), false, remarks],
      });

      await sendAndConfirmTransaction({
        account,
        transaction,
      });
      toast.success("Leave request rejected!");
      fetchLeaveRequests();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error("Failed to reject leave. Please try again.");
    }
  };

  if (leaveRequests === null) return <LoadingSpinner />;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-sm text-gray-400">Pending Requests</p>
              <h3 className="text-2xl font-bold">
                {leaveRequests.filter((req) => !req.isProcessed).length}
              </h3>
            </div>
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
              <p className="text-sm text-gray-400">Approved Requests</p>
              <h3 className="text-2xl font-bold">
                {
                  leaveRequests
                    .values()
                    .toArray()
                    .flat()
                    .filter((req) => req.isProcessed && req.isApproved).length
                }
              </h3>
            </div>
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
              <p className="text-sm text-gray-400">Rejected Requests</p>
              <h3 className="text-2xl font-bold">
                {
                  leaveRequests
                    .values()
                    .toArray()
                    .flat()
                    .filter((req) => req.isProcessed && !req.isApproved).length
                }
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Leave Requests</h2>
          <p className="text-gray-400">Manage employee leave requests</p>
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
                "Leave Type",
                "Start Date",
                "End Date",
                "Reason",
                "Status",
                "Actions",
              ].map((head, index) => (
                <th key={index} className="border-b border-gray-800 p-4">
                  <span className="text-gray-400 font-normal">{head}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-600 text-white">
            {leaveRequests
              .values()
              .toArray()
              .flat()
              .map((request, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="p-4">
                    <div>
                      <span className="font-medium">{request.name}</span>
                      <span className="block text-xs text-gray-400">
                        {request.walletAddress}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize">
                      {request.isPaidLeave ? "Paid Leave" : "Unpaid Leave"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(
                      Number(request.startDate) * 1000
                    ).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {new Date(
                      Number(request.endDate) * 1000
                    ).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{request.reason}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        request.isApproved
                          ? "bg-green-500"
                          : request.isProcessed && !request.isApproved
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {request.isProcessed
                        ? request.isApproved
                          ? "Approved"
                          : "Rejected"
                        : "Pending"}
                    </span>
                  </td>
                  <td className="p-4">
                    {!request.isProcessed && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() =>
                            handleApproveLeave(
                              request.id,
                              request.walletAddress,
                              "Approved"
                            )
                          }
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() =>
                            handleRejectLeave(
                              request.id,
                              request.walletAddress,
                              "Rejected"
                            )
                          }
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default LeavesPage;
