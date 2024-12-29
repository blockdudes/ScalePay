"use client";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import {
  BsPersonAdd,
  BsWallet2,
  BsCurrencyDollar,
  BsCalendar3,
} from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";

interface AddEmployeeFormData {
  name: string;
  walletAddress: string;
  monthlySalary: string;
}

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddEmployeeFormData) => Promise<void>;
}

const AddEmployeeModal = ({
  open,
  onClose,
  onSubmit,
}: AddEmployeeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddEmployeeFormData>({
    name: "",
    walletAddress: "",
    monthlySalary: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.persist();

    try {
      setIsLoading(true);
      await onSubmit(formData);
      onClose();
      //   Reset form
      setFormData({
        name: "",
        walletAddress: "",
        monthlySalary: "",
      });
    } catch (error) {
      console.error("Error adding employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      size="md"
      open={open}
      handler={onClose}
      className="bg-gray-900 text-white border border-gray-800"
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <form>
        <DialogHeader
          className="flex items-center gap-3 border-b border-gray-800 px-6 py-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BsPersonAdd className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <Typography
              variant="h5"
              className="font-semibold text-white"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Add New Employee
            </Typography>
            <Typography
              variant="small"
              className="text-gray-400 font-normal"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Enter the employee details to add them to your organization
            </Typography>
          </div>
        </DialogHeader>

        <DialogBody
          className="px-6 py-8 space-y-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {/* Employee Name */}
          <div className="space-y-2">
            <Typography
              variant="small"
              className="text-gray-400 font-medium"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Employee Name
            </Typography>
            <Input
              size="lg"
              placeholder="Enter employee's full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="!border-gray-800 focus:!border-gray-600 caret-white text-white"
              labelProps={{ className: "hidden" }}
              icon={<BsPersonAdd className="h-4 w-4 text-gray-400" />}
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Typography
              variant="small"
              className="text-gray-400 font-medium"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Wallet Address
            </Typography>
            <Input
              size="lg"
              placeholder="Enter employee's wallet address"
              value={formData.walletAddress}
              onChange={(e) =>
                setFormData({ ...formData, walletAddress: e.target.value })
              }
              required
              className="!border-gray-800 focus:!border-gray-600 font-mono caret-white text-white"
              labelProps={{ className: "hidden" }}
              icon={<BsWallet2 className="h-4 w-4 text-gray-400" />}
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
            <Typography
              variant="small"
              className="text-gray-500 italic"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Make sure the wallet address is correct as it cannot be changed
              later
            </Typography>
          </div>

          {/* Monthly Salary */}
          <div className="space-y-2">
            <Typography
              variant="small"
              className="text-gray-400 font-medium"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Monthly Salary (USD)
            </Typography>
            <Input
              type="number"
              size="lg"
              placeholder="Enter monthly salary"
              value={formData.monthlySalary}
              onChange={(e) =>
                setFormData({ ...formData, monthlySalary: e.target.value })
              }
              required
              min="0"
              step="1"
              className="!border-gray-800 focus:!border-gray-600 caret-white text-white"
              labelProps={{ className: "hidden" }}
              icon={<BsCurrencyDollar className="h-4 w-4 text-gray-400" />}
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </div>
        </DialogBody>

        <DialogFooter
          className="flex justify-end gap-4 border-t border-gray-800 px-6 py-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <Button
            variant="text"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                <span>Adding Employee...</span>
              </>
            ) : (
              <>
                <BsPersonAdd className="h-4 w-4" />
                <span>Add Employee</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default AddEmployeeModal;
