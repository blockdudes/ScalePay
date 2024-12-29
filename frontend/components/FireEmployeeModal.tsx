"use client";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import { BsPersonX } from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";

interface FireEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  employeeAddress: string;
  onSubmit: () => Promise<void>;
}

const FireEmployeeModal = ({
  open,
  onClose,
  employeeName,
  employeeAddress,
  onSubmit,
}: FireEmployeeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await onSubmit();
      onClose();
    } catch (error) {
      console.error("Error firing employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      size="sm"
      open={open}
      handler={onClose}
      className="bg-gray-900 text-white border border-gray-800"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <DialogHeader
        className="flex items-center gap-3 border-b border-gray-800 text-white px-6 py-4"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <div className="p-2 bg-red-500/20 rounded-lg">
          <BsPersonX className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <Typography
            variant="h5"
            className="font-semibold"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Fire Employee
          </Typography>
          <Typography
            variant="small"
            className="text-gray-400 font-normal"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            This action cannot be undone
          </Typography>
        </div>
      </DialogHeader>

      <DialogBody
        className="px-6 py-8"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <div className="text-center space-y-4">
          <Typography
            className="text-lg text-white"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Are you sure you want to fire{" "}
            <span className="font-semibold">{employeeName} </span>
            <span className="font-semibold">({employeeAddress})</span>?
          </Typography>
          <Typography
            className="text-gray-400"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            This will immediately terminate their employment and they will no
            longer have access to the system.
          </Typography>
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
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
          disabled={isLoading}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <BsPersonX className="h-4 w-4" />
              <span>Fire Employee</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default FireEmployeeModal;
