// models/Leave.ts
import { Schema, model, models, Types } from "mongoose";

const LeaveSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    type: {
      type: String,
      enum: ["paid", "unpaid", "half-day", "hourly"],
      required: true,
    },
    duration: { type: String }, // "04:00" — for hourly
    reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

LeaveSchema.index({ userId: 1, date: 1 }, { unique: false });

export default models.Leave || model("Leave", LeaveSchema);
