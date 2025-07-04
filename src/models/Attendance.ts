import { Schema, model, models, Types } from "mongoose";

const BreakSchema = new Schema({
  start: { type: String, required: true },
  end: { type: String },
  duration: { type: Number },
  reason: { type: String },
  startLocation: { type: String },
  startDeviceType: { type: String, enum: ["mobile", "desktop"] },
  endLocation: { type: String },
  endDeviceType: { type: String, enum: ["mobile", "desktop"] },
});

const WorkSegmentSchema = new Schema(
  {
    clockIn: { type: String, required: true },
    clockInLocation: { type: String },
    clockInDeviceType: { type: String, enum: ["mobile", "desktop"] },
    clockOut: { type: String },
    clockOutLocation: { type: String },
    clockOutDeviceType: { type: String, enum: ["mobile", "desktop"] },
    duration: { type: Number },
    productiveDuration: { type: Number },
    // location: { type: String },
    // deviceType: { type: String, enum: ["mobile", "desktop"] },
  },
  { _id: false }
);

const AttendanceSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    shiftId: { type: Types.ObjectId, ref: "Shift", required: true },

    workSegments: [WorkSegmentSchema],
    breaks: [BreakSchema],

    lateIn: { type: Boolean, default: false },
    earlyOut: { type: Boolean, default: false },
    excessiveBreak: { type: Boolean, default: false },

    requiresLateInReason: { type: Boolean, default: false },
    lateInReason: { type: String },
    requiresBreakReason: { type: Boolean, default: false },
    breakReason: { type: String },

    location: { type: String },
    deviceType: { type: String, enum: ["mobile", "desktop"] },

    status: {
      type: String,
      enum: ["present", "absent", "on_leave"],
      default: "absent",
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default models.Attendance || model("Attendance", AttendanceSchema);
