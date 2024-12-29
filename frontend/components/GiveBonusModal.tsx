"use client";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Typography,
} from "@material-tailwind/react";
import { BsCashCoin } from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";

interface GiveBonusModalProps {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  employeeAddress: string;
  onSubmit: (amount: string) => Promise<void>;
}

const GiveBonusModal = ({
  open,
  onClose,
  employeeName,
  employeeAddress,
  onSubmit,
}: GiveBonusModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await onSubmit(amount);
      onClose();
      setAmount("");
    } catch (error) {
      console.error("Error giving bonus:", error);
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
      <form>
        <DialogHeader
          className="flex items-center gap-3 border-b border-gray-800 text-white px-6 py-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="p-2 bg-green-500/20 rounded-lg">
            <BsCashCoin className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <Typography
              variant="h5"
              className="font-semibold"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Give Bonus
            </Typography>
            <Typography
              variant="small"
              className="text-gray-400 font-normal"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Add bonus amount for {employeeName} ({employeeAddress})
            </Typography>
          </div>
        </DialogHeader>

        <DialogBody
          className="px-6 py-8 space-y-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <div className="space-y-2">
            <Typography
              variant="small"
              className="text-gray-400 font-medium"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Bonus Amount (USD)
            </Typography>
            <Input
              type="number"
              size="lg"
              placeholder="Enter bonus amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="1"
              className="!border-gray-800 focus:!border-gray-600 caret-white text-white"
              labelProps={{ className: "hidden" }}
              icon={<BsCashCoin className="h-4 w-4 text-gray-400" />}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
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
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
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
                <BsCashCoin className="h-4 w-4" />
                <span>Give Bonus</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default GiveBonusModal;
