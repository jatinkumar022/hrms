import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import LeaveBalance from "@/models/LeaveBalance";
import { getUserFromToken } from "@/lib/getUserFromToken";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/userModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const reqBody = await request.json();
    const {
      startDate,
      endDate,
      leaveDayType,
      halfDayTime,
      type,
      duration,
      reason,
    } = reqBody;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    let calculatedDays = end.diff(start, "day") + 1;

    if (leaveDayType === "Half Day") {
      calculatedDays = 0.5;
    }

    // Validate required fields
    if (
      !startDate ||
      !endDate ||
      !calculatedDays ||
      !leaveDayType ||
      !type ||
      !reason
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if leave type is valid based on LeaveBalance model
    const validLeaveTypes = [
      "LWP",
      "Casual Leave",
      "Sick Leave",
      "Earned Leave",
    ];
    if (!validLeaveTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid leave type" },
        { status: 400 }
      );
    }

    // Check if user has sufficient leave balance (if not LWP)
    if (type !== "LWP") {
      const userLeaveBalance = await LeaveBalance.findOne({ userId });
      if (!userLeaveBalance) {
        return NextResponse.json(
          { error: `No leave balance found for ${type}` },
          { status: 400 }
        );
      }

      let availableBalance = 0;
      if (type === "Casual Leave")
        availableBalance =
          userLeaveBalance.casualLeave.balance -
          userLeaveBalance.casualLeave.booked;
      else if (type === "Sick Leave")
        availableBalance =
          userLeaveBalance.sickLeave.balance -
          userLeaveBalance.sickLeave.booked;
      else if (type === "Earned Leave")
        availableBalance =
          userLeaveBalance.earnedLeave.balance -
          userLeaveBalance.earnedLeave.booked;

      if (availableBalance < calculatedDays) {
        return NextResponse.json(
          {
            error: `Insufficient ${type} balance. Available: ${availableBalance}, Requested: ${calculatedDays}`,
          },
          { status: 400 }
        );
      }
    }

    // Create new leave request
    const newLeave = new Leave({
      userId,
      startDate,
      endDate,
      numberOfDays: calculatedDays,
      leaveDayType,
      halfDayTime: leaveDayType === "Half Day" ? halfDayTime : undefined,
      type,
      duration: leaveDayType === "Hourly" ? duration : undefined,
      reason,
      status: "pending", // Default status
    });

    const savedLeave = await newLeave.save();

    return NextResponse.json({
      message: "Leave request submitted successfully",
      success: true,
      leave: savedLeave,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
