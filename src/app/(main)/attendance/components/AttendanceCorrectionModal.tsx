"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  submitAttendanceRequest,
  resetState,
} from "@/redux/slices/attendance-request/user/userAttendanceRequestSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MaterialTextArea from "@/components/ui/materialTextArea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AttendanceRequestType } from "@/models/AttendanceRequest";
import { Label } from "@/components/ui/label";

export interface CorrectionModalData {
  requestType: AttendanceRequestType;
  time: string; // pre-filled time e.g., "10:04"
}

interface AttendanceCorrectionModalProps {
  open: boolean;
  onClose: () => void;
  date: string; // The date for the request
  initialData?: CorrectionModalData;
}

const AttendanceCorrectionModal = ({
  open,
  onClose,
  date,
  initialData,
}: AttendanceCorrectionModalProps) => {
  const dispatch = useAppDispatch();
  const { loading, success, error } = useAppSelector(
    (state) => state.userAttendanceRequest
  );

  const [requestType, setRequestType] = useState<AttendanceRequestType | "">(
    ""
  );
  const [requestedTime, setRequestedTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (initialData) {
      setRequestType(initialData.requestType);
      setRequestedTime(initialData.time);
    } else {
      // Reset if no initial data
      setRequestType("");
      setRequestedTime("");
    }
  }, [initialData]);

  useEffect(() => {
    if (success) {
      toast.success("Your request has been submitted successfully.");
      dispatch(resetState());
      onClose(); // Close the modal on success
    }
    if (error) {
      toast.error(error);
      dispatch(resetState());
    }
  }, [success, error, dispatch, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType || !requestedTime || !reason) {
      toast.error("Please fill out all fields.");
      return;
    }

    const payload = {
      date,
      requestType: requestType as AttendanceRequestType,
      requestedTime: `${requestedTime}:00`,
      reason,
    };
    dispatch(submitAttendanceRequest(payload));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:bg-black">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Attendance Correction Request
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Request a change for a clock-in, clock-out, or break time. This will
            be sent for approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-2">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="requestType">Request Type</Label>
            <Select
              value={requestType}
              onValueChange={(value) =>
                setRequestType(value as AttendanceRequestType)
              }
            >
              <SelectTrigger id="requestType" className="w-full">
                <SelectValue placeholder="Select a correction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clock-in">Clock In</SelectItem>
                <SelectItem value="clock-out">Clock Out</SelectItem>
                <SelectItem value="break-in">Break In</SelectItem>
                <SelectItem value="break-out">Break Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              className="w-full"
            />
          </div>

          <MaterialTextArea
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <DialogFooter className="!mt-8 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceCorrectionModal;
