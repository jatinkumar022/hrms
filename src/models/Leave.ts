// models/Leave.ts
import { Schema, model, models, Types } from "mongoose";

const LeaveDaySchema = new Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    dayType: {
      type: String,
      enum: ["Full Day", "First Half", "Second Half"],
      required: true,
    },
  },
  { _id: false }
);

const LeaveSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, required: true }, // "YYYY-MM-DD"
    numberOfDays: { type: Number, required: true },
    days: [LeaveDaySchema],
    type: {
      type: String,
      enum: ["LWP", "Casual Leave", "Sick Leave", "Earned Leave"],
      required: true,
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    attachment: {
      type: String, // URL to the uploaded file
    },
  },
  { timestamps: true }
);

LeaveSchema.index({ userId: 1, startDate: 1 }, { unique: false });

export default models.Leave || model("Leave", LeaveSchema);
