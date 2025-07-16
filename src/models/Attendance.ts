import { Schema, model, models, Types, Document } from "mongoose";

export interface IBreakSegment extends Document {
  start: string;
  end?: string;
  duration?: number;
  reason?: string;
  startLocation?: string;
  startDeviceType?: "mobile" | "desktop";
  endLocation?: string;
  endDeviceType?: "mobile" | "desktop";
}

const BreakSchema = new Schema<IBreakSegment>({
  start: { type: String, required: true },
  end: { type: String },
  duration: { type: Number },
  reason: { type: String },
  startLocation: { type: String },
  startDeviceType: { type: String, enum: ["mobile", "desktop"] },
  endLocation: { type: String },
  endDeviceType: { type: String, enum: ["mobile", "desktop"] },
});

export interface IWorkSegment {
  clockIn: string;
  clockInLocation?: string;
  clockInDeviceType?: "mobile" | "desktop";
  clockOut?: string;
  clockOutLocation?: string;
  clockOutDeviceType?: "mobile" | "desktop";
  duration?: number;
  productiveDuration?: number;
}

const WorkSegmentSchema = new Schema<IWorkSegment>(
  {
    clockIn: { type: String, required: true },
    clockInLocation: { type: String },
    clockInDeviceType: { type: String, enum: ["mobile", "desktop"] },
    clockOut: { type: String },
    clockOutLocation: { type: String },
    clockOutDeviceType: { type: String, enum: ["mobile", "desktop"] },
    duration: { type: Number },
    productiveDuration: { type: Number },
  },
  { _id: false }
);

export interface IAttendance extends Document {
  userId: Types.ObjectId;
  date: string;
  shiftId: Types.ObjectId;
  workSegments: Types.DocumentArray<IWorkSegment>;
  breaks: Types.DocumentArray<IBreakSegment>; // Changed from breaks
  lateIn: boolean;
  earlyOut: boolean;
  earlyOutReason?: string;
  excessiveBreak: boolean;
  requiresLateInReason: boolean;
  lateInReason?: string;
  requiresBreakReason: boolean;
  breakReason?: string;
  location?: string;
  deviceType?: "mobile" | "desktop";
  status: "present" | "absent" | "on_leave" | "on_remote";
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    shiftId: { type: Schema.Types.ObjectId, ref: "Shift", required: true },

    workSegments: [WorkSegmentSchema],
    breaks: [BreakSchema], // Changed from breaks

    lateIn: { type: Boolean, default: false },
    earlyOut: { type: Boolean, default: false },
    earlyOutReason: { type: String },
    excessiveBreak: { type: Boolean, default: false },

    requiresLateInReason: { type: Boolean, default: false },
    lateInReason: { type: String },
    requiresBreakReason: { type: Boolean, default: false },
    breakReason: { type: String },

    location: { type: String },
    deviceType: { type: String, enum: ["mobile", "desktop"] },

    status: {
      type: String,
      enum: ["present", "absent", "on_leave", "on_remote"],
      default: "absent",
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance =
  models.Attendance || model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
