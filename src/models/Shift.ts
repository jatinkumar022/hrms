// models/Shift.ts
import { Schema, model, models } from "mongoose";

const ShiftSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["Default", "Second"],
      required: true,
    },
    startTime: {
      type: String, // Format: "HH:mm"
      required: true,
    },
    endTime: {
      type: String, // Format: "HH:mm"
      required: true,
    },
    minClockIn: {
      type: String, // Usually same as startTime
      required: true,
    },
    maxClockIn: {
      type: String, // e.g. "09:30" or "10:30"
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Shift || model("Shift", ShiftSchema);
