import { Schema, model, models, Types } from "mongoose";

const WorkFromHomeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, required: true }, // "YYYY-MM-DD"
    numberOfDays: { type: Number, required: true },
    dayType: {
      type: String,
      enum: ["Full Day", "Half Day", "Hourly"],
      required: true,
    },
    halfDayTime: {
      type: String,
      enum: ["First Half", "Second Half"],
      required: function (this: any) {
        return this.dayType === "Half Day";
      },
    },
    startTime: {
      type: String, // "HH:mm"
      required: function (this: any) {
        return this.dayType === "Hourly";
      },
    },
    endTime: {
      type: String, // "HH:mm"
      required: function (this: any) {
        return this.dayType === "Hourly";
      },
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

WorkFromHomeSchema.index({ userId: 1, startDate: 1 }, { unique: false });

export default models.WorkFromHome || model("WorkFromHome", WorkFromHomeSchema);
