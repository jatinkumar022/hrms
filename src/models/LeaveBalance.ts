import { Schema, model, models, Types } from "mongoose";

const LeaveBalanceSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  casualLeave: {
    balance: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
  },
  sickLeave: {
    balance: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
  },
  earnedLeave: {
    balance: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
  },
  leaveWithoutPay: {
    balance: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
  },
});

LeaveBalanceSchema.index({ userId: 1 }, { unique: true });

export default models.LeaveBalance || model("LeaveBalance", LeaveBalanceSchema);
