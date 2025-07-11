import { Schema, model, models, Types, Document, Model } from "mongoose";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

interface IWorkFromHome extends Document {
  userId: Types.ObjectId;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  dayType: "Full Day" | "Half Day" | "Hourly";
}

const WorkFromHomeDaySchema = new Schema(
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

const WorkFromHomeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, required: true }, // "YYYY-MM-DD"
    numberOfDays: { type: Number, required: true },
    days: {
      type: [WorkFromHomeDaySchema],
      required: function (this: any) {
        return this.dayType !== "Hourly";
      },
    },
    dayType: {
      type: String,
      enum: ["Full Day", "Half Day", "Hourly"],
      required: true,
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

WorkFromHomeSchema.pre<IWorkFromHome>("save", async function (next) {
  if (this.isNew) {
    const WFHModel = this.constructor as Model<IWorkFromHome>;

    const existingWfh = await WFHModel.findOne({
      userId: this.userId,
      status: "approved",
      $or: [
        {
          startDate: { $lte: this.endDate },
          endDate: { $gte: this.startDate },
        },
      ],
    });

    if (existingWfh) {
      const error = new Error(
        "You have an overlapping approved Work From Home request."
      );
      return next(error);
    }
  }
  next();
});

WorkFromHomeSchema.index({ userId: 1, startDate: 1 }, { unique: false });

export default models.WorkFromHome || model("WorkFromHome", WorkFromHomeSchema);
