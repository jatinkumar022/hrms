// models/Holiday.ts
import { Schema, model, models } from "mongoose";

const HolidaySchema = new Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    title: { type: String, required: true },
    isNationalHoliday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

HolidaySchema.index({ date: 1 }, { unique: true });

export default models.Holiday || model("Holiday", HolidaySchema);
