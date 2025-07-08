// models/Leave.ts
import { Schema, model, models, Types } from "mongoose";

const LeaveSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, required: true }, // "YYYY-MM-DD"
    numberOfDays: { type: Number, required: true },
    leaveDayType: {
      type: String,
      enum: ["Full Day", "Half Day", "Hourly"],
      required: true,
    },
    halfDayTime: {
      type: String,
      enum: ["First Half", "Second Half"],
      required: function (this: any) {
        return this.leaveDayType === "Half Day";
      },
    },
    type: {
      type: String,
      enum: ["LWP", "Casual Leave", "Sick Leave", "Earned Leave"],
      required: true,
    },
    duration: {
      type: String,
      required: function (this: any) {
        return this.leaveDayType === "Hourly";
      },
    }, // "04:00" — for hourly
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
  },
  { timestamps: true }
);

LeaveSchema.index({ userId: 1, startDate: 1 }, { unique: false });

export default models.Leave || model("Leave", LeaveSchema);
