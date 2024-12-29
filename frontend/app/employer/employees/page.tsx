"use client";
import {
  ScalePayContract,
  USDCContract,
  USDCContractAddress,
  USDTContract,
} from "@/contracts/contracts";
import {
  Button,
  Card,
  MenuList,
  Menu,
  MenuHandler,
  MenuItem,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsPersonAdd, BsThreeDots } from "react-icons/bs";
import {
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
  sendTransaction,
} from "thirdweb";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import { Employee } from "@/types/types";
import { useActiveAccount } from "thirdweb/react";
import DeductFineModal from "@/components/DeductFineModal";
import GiveBonusModal from "@/components/GiveBonusModal";
import FireEmployeeModal from "@/components/FireEmployeeModal";

const EmployeesPage = () => {
  const account = useActiveAccount();
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showGiveBonusModal, setShowGiveBonusModal] = useState(false);
  const [showDeductFineModal, setShowDeductFineModal] = useState(false);
  const [showFireEmployeeModal, setShowFireEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [scalePayAddress, setScalePayAddress] = useState<string | null>(null);
  const [acceptedTokenAddress, setAcceptedTokenAddress] = useState<
    string | null
  >(null);

  const fetchEmployees = async () => {
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    setScalePayAddress(scalePayAddress);
    readContract({
      contract: ScalePayContract(scalePayAddress!),
      method:
        "function getEmployees() public view returns ((string name, address walletAddress, uint256 monthlySalary, uint256 joiningDate, uint256 lastPayoutDate, uint256 availablePaidLeaves, bool isActive, uint256 totalFines, uint256 totalBonuses)[] memory)",
    }).then((employees) => {
      setEmployees(employees.map((employee) => employee));
    });
  };

  const fetchAcceptedToken = async () => {
    const scalePayAddress = window.localStorage.getItem("scalePayAddress");
    setScalePayAddress(scalePayAddress);
    const acceptedToken = await readContract({
      contract: ScalePayContract(scalePayAddress!),
      method: "function getPaymentToken() external view returns (address)",
    });
    setAcceptedTokenAddress(acceptedToken);
  };

  useEffect(() => {
    fetchEmployees();
    fetchAcceptedToken();
  }, []);

  const handleAddEmployee = async (data: {
    name: string;
    walletAddress: string;
    monthlySalary: string;
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
        contract: ScalePayContract(scalePayAddress!),
        method:
          "function hireEmployee(string memory _name, address _walletAddress, uint256 _monthlySalary) external",
        params: [
          data.name,
          data.walletAddress,
          BigInt(Number(data.monthlySalary) * 1e6),
        ],
      });

      await sendAndConfirmTransaction({
        account,
        transaction,
      });
      toast.success("Employee added successfully!");
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Failed to add employee. Please try again.");
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleGiveBonus = async (amount: string) => {
    if (!account) {
      toast.error("Please connect your wallet");
      throw new Error("account not found");
    }
    if (!scalePayAddress) {
      toast.error("Can't connect to Blockchain Network");
      throw new Error("scalePayAddress not found");
    }
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      throw new Error("selectedEmployee not found");
    }

    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress!),
        method:
          "function applyBonus(address _employeeAddress, uint256 _amount) external",
        params: [selectedEmployee.walletAddress, BigInt(Number(amount) * 1e6)],
      });
      await sendAndConfirmTransaction({
        account,
        transaction,
      });
      toast.success("Bonus applied successfully!");
      fetchEmployees();
    } catch (error) {
      console.error("Error giving bonus:", error);
      toast.error("Failed to give bonus. Please try again.");
      throw error;
    }
  };

  const handleDeductFine = async (amount: string) => {
    if (!account) {
      toast.error("Please connect your wallet");
      throw new Error("account not found");
    }
    if (!scalePayAddress) {
      toast.error("Can't connect to Blockchain Network");
      throw new Error("Can't connect to Blockchain Network");
    }
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      throw new Error("Please select an employee");
    }
    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress!),
        method:
          "function applyFine(address _employeeAddress, uint256 _amount) external",
        params: [selectedEmployee.walletAddress, BigInt(Number(amount) * 1e6)],
      });
      await sendAndConfirmTransaction({
        account,
        transaction,
      });
      toast.success("Fine deducted successfully!");
      fetchEmployees();
    } catch (error) {
      console.error("Error deducting fine:", error);
      toast.error("Failed to deduct fine. Please try again.");
      throw error;
    }
  };

  const handleFireEmployee = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      throw new Error("account not found");
    }
    if (!scalePayAddress) {
      toast.error("Can't connect to Blockchain Network");
      throw new Error("scalePayAddress not found");
    }
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      throw new Error("selectedEmployee not found");
    }
    if (!acceptedTokenAddress) {
      toast.error("Can't connect to Blockchain Network");
      throw new Error("acceptedTokenAddress not found");
    }
    try {
      const transaction = prepareContractCall({
        contract: ScalePayContract(scalePayAddress!),
        method: "function fireEmployee(address _employeeAddress) external",
        params: [selectedEmployee.walletAddress],
      });
      await sendAndConfirmTransaction({
        account,
        transaction,
      });
      toast.success("Employee fired successfully!");
      fetchEmployees();
    } catch (error) {
      console.error("Error firing employee:", error);
      toast.error("Failed to fire employee. Please try again.");
      throw error;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Employees</h2>
          <p className="text-gray-400">Manage your team members</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setShowAddEmployeeModal(true)}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <BsPersonAdd />
          Add Employee
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
              {[
                "Name",
                "Wallet Address",
                "Monthly Salary",
                "Status",
                "Joined Date",
                "Actions",
              ].map((head) => (
                <th key={head} className="border-b border-gray-800 p-4">
                  <span className="text-gray-400 font-normal">{head}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-600 text-white">
            {employees.map((employee, index) => {
              const joinedDate = new Date(
                Number(employee.joiningDate) * 1000
              ).toLocaleDateString();

              return (
                <tr key={index} className="border-b border-gray-800">
                  <td className="p-4">
                    <span className="font-medium">{employee.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm">
                      {employee.walletAddress}
                    </span>
                  </td>
                  <td className="p-4">
                    <span>${Number(employee.monthlySalary) / 1e6}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        employee.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span>{joinedDate}</span>
                  </td>
                  <td className="p-4">
                    <Menu placement="bottom">
                      <MenuHandler>
                        <Button
                          disabled={!employee.isActive}
                          variant="text"
                          className="p-2"
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                        >
                          <BsThreeDots className="text-white" />
                        </Button>
                      </MenuHandler>
                      <MenuList
                        className="bg-gray-900 text-white"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      >
                        <MenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowGiveBonusModal(true);
                          }}
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                        >
                          Give Bonus
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowDeductFineModal(true);
                          }}
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                        >
                          Deduct Fine
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowFireEmployeeModal(true);
                          }}
                          placeholder={undefined}
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                        >
                          Fire Employee
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <AddEmployeeModal
        open={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSubmit={handleAddEmployee}
      />
      <GiveBonusModal
        open={showGiveBonusModal}
        onClose={() => setShowGiveBonusModal(false)}
        onSubmit={handleGiveBonus}
        employeeName={selectedEmployee?.name || ""}
        employeeAddress={selectedEmployee?.walletAddress || ""}
      />
      <DeductFineModal
        open={showDeductFineModal}
        onClose={() => setShowDeductFineModal(false)}
        onSubmit={handleDeductFine}
        employeeName={selectedEmployee?.name || ""}
        employeeAddress={selectedEmployee?.walletAddress || ""}
      />
      <FireEmployeeModal
        open={showFireEmployeeModal}
        onClose={() => setShowFireEmployeeModal(false)}
        onSubmit={handleFireEmployee}
        employeeName={selectedEmployee?.name || ""}
        employeeAddress={selectedEmployee?.walletAddress || ""}
      />
    </div>
  );
};

export default EmployeesPage;
