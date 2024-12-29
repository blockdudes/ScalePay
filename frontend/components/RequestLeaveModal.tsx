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
  Textarea,
} from "@material-tailwind/react";
import { BsCalendarPlus } from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";

interface RequestLeaveFormData {
  leaveType: "paid" | "unpaid";
  startDate: string;
  endDate: string;
  reason: string;
}

interface RequestLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RequestLeaveFormData) => Promise<void>;
}

const RequestLeaveModal = ({
  open,
  onClose,
  onSubmit,
}: RequestLeaveModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RequestLeaveFormData>({
    leaveType: "unpaid",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        leaveType: "paid",
        startDate: "",
        endDate: "",
        reason: "",
      });
    } catch (error) {
      console.error("Error submitting leave request:", error);
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
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <form onSubmit={handleSubmit}>
        <DialogHeader
          className="flex items-center gap-3 border-b border-gray-800 text-white px-6 py-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BsCalendarPlus className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <Typography
              variant="h5"
              className="font-semibold"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Request Leave
            </Typography>
            <Typography
              variant="small"
              className="text-gray-400 font-normal"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Submit a new leave request
            </Typography>
          </div>
        </DialogHeader>

        <DialogBody
          className="px-6 py-8 space-y-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {/* Leave Type */}
          <div className="space-y-2">
            <Typography
              variant="small"
              className="text-gray-400 font-medium"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Leave Type
            </Typography>
            <Select
              value={formData.leaveType}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  leaveType: val as "paid" | "unpaid",
                })
              }
              className="!border !border-white focus:!border-white text-white"
              menuProps={{
                className: "bg-gray-900 text-white flex flex-col gap-1",
              }}
              labelProps={{ className: "hidden" }}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              <Option value="unpaid">Unpaid Leave</Option>
              <Option value="paid">Paid Leave</Option>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Typography
                variant="small"
                className="text-gray-400 font-medium"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                Start Date
              </Typography>
              <Input
                type="date"
                min={
                  new Date(new Date().setDate(new Date().getDate() + 7))
                    .toISOString()
                    .split("T")[0]
                }
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="!border !border-white !focus:!border-white text-white"
                labelProps={{ className: "hidden" }}
                required
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="space-y-2">
              <Typography
                variant="small"
                className="text-gray-400 font-medium"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                End Date
              </Typography>
              <Input
                type="date"
                value={formData.endDate}
                min={
                  formData.startDate || new Date().toISOString().split("T")[0]
                }
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="!border !border-white !focus:!border-white text-white"
                labelProps={{ className: "hidden" }}
                required
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Typography
              variant="small"
              className="text-gray-400 font-medium"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Reason
            </Typography>
            <Textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="!border !border-white !focus:!border-white text-white"
              labelProps={{ className: "hidden" }}
              rows={4}
              required
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
            type="submit"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <BsCalendarPlus className="h-4 w-4" />
                <span>Submit Request</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default RequestLeaveModal;
