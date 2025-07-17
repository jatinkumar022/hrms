"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import TextArea from "antd/es/input/TextArea";

interface AttendanceReasonDialogProps {
  open: boolean;
  onOpenChange?: (val: boolean) => void;
  trigger?: ReactNode;
  title: string;
  label: string;
  placeholder?: string;
  buttonText: string;
  buttonColor?: string;
  onSubmit: (reason: string) => void;
}

export default function AttendanceReasonDialog({
  open,
  onOpenChange,
  trigger,
  title,
  label,
  placeholder = "Enter reason...",
  buttonText,
  buttonColor = "#25bb3e",
  onSubmit,
}: AttendanceReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (reason.trim().length < 3) {
      setError("Reason must be at least 3 characters long.");
      return;
    }

    onSubmit(reason.trim());
    setReason("");
    setError("");
    if (onOpenChange) onOpenChange(false); // optional: close on submit
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    if (error && e.target.value.trim().length >= 3) {
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="md:!w-xl md:!max-w-xl rounded-sm !p-3 !px-4">
        <DialogHeader>
          <DialogTitle className="!pt-1 ">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="text-sm">{label}</div>
          <TextArea
            value={reason}
            onChange={handleChange}
            placeholder={placeholder}
            rows={4}
            className={error ? "!border-red-500 dark:!bg-[#111111]" : ""}
          />
          {error && <div className="text-xs text-red-500 mt-0.5">{error}</div>}
          <div className="text-end mt-2">
            <Button
              style={{ backgroundColor: buttonColor }}
              className="px-8 py-2 text-white rounded-none font-medium hover:opacity-90"
              onClick={handleSubmit}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
