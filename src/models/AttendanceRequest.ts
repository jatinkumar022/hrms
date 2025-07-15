import mongoose, { Document, Model, Schema } from "mongoose";

export type AttendanceRequestType =
  | "clock-in"
  | "clock-out"
  | "break-in"
  | "break-out";

// Interface for the AttendanceRequest document
export interface IAttendanceRequest extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  date: string; // The date of the event, format "YYYY-MM-DD"
  requestType: AttendanceRequestType;
  requestedTime: string; // The time the user is requesting, format "HH:mm:ss"
  reason: string;
  status: "pending" | "approved" | "rejected";
  actionTakenBy?: mongoose.Schema.Types.ObjectId; // Admin who took action
  attendanceId?: mongoose.Schema.Types.ObjectId; // Reference to the attendance record being corrected
}

// Mongoose Schema for AttendanceRequest
const AttendanceRequestSchema = new Schema<IAttendanceRequest>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      enum: ["clock-in", "clock-out", "break-in", "break-out"],
      required: true,
    },
    requestedTime: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    actionTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
  },
  { timestamps: true }
);

// Create and export the model
const AttendanceRequest: Model<IAttendanceRequest> =
  mongoose.models.AttendanceRequest ||
  mongoose.model<IAttendanceRequest>(
    "AttendanceRequest",
    AttendanceRequestSchema
  );

export default AttendanceRequest;
