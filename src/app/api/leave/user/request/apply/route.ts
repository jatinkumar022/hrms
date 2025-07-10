import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import Leave from "@/models/Leave";
import LeaveBalance from "@/models/LeaveBalance";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

export async function POST(request: NextRequest) {
  try {
    await connect();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { startDate, endDate, numberOfDays, days, type, reason, attachment } =
      body;

    if (
      !startDate ||
      !endDate ||
      !numberOfDays ||
      !days ||
      !Array.isArray(days) ||
      days.length === 0 ||
      !type ||
      !reason
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // --- Date Consistency Validation ---
    const expectedDates: string[] = [];
    let currentDate = dayjs(startDate);
    const lastDate = dayjs(endDate);

    while (currentDate.isSameOrBefore(lastDate)) {
      expectedDates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    const providedDates = days.map((day: any) => day.date);

    if (
      expectedDates.length !== providedDates.length ||
      !expectedDates.every(
        (expectedDate, index) => expectedDate === providedDates[index]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Provided dates in 'days' array do not match the 'startDate' and 'endDate' range.",
        },
        { status: 400 }
      );
    }

    // --- Backend calculation of numberOfDays for validation ---
    const calculatedDays = days.reduce((acc: number, day: any) => {
      if (day.dayType === "Full Day") {
        return acc + 1;
      }
      if (day.dayType === "First Half" || day.dayType === "Second Half") {
        return acc + 0.5;
      }
      return acc;
    }, 0);

    if (calculatedDays !== numberOfDays) {
      return NextResponse.json(
        { error: "The number of days does not match the selected day types." },
        { status: 400 }
      );
    }

    // --- Overlap Validation ---
    const existingLeave = await Leave.findOne({
      userId,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (existingLeave) {
      return NextResponse.json(
        {
          error:
            "You have already applied for leave within the selected date range.",
        },
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

      const balanceMap: Record<
        string,
        "casualLeave" | "sickLeave" | "earnedLeave"
      > = {
        "Casual Leave": "casualLeave",
        "Sick Leave": "sickLeave",
        "Earned Leave": "earnedLeave",
      };
      const balancePath = balanceMap[type];

      if (balancePath) {
        const leaveTypeBalance =
          userLeaveBalance[balancePath as keyof typeof userLeaveBalance];

        if (leaveTypeBalance.balance < numberOfDays) {
          return NextResponse.json(
            {
              error: `Insufficient ${type} balance. Available: ${leaveTypeBalance.balance}, Requested: ${numberOfDays}`,
            },
            { status: 400 }
          );
        }

        // Move balance to booked
        await LeaveBalance.findByIdAndUpdate(userLeaveBalance._id, {
          $inc: {
            [`${balancePath}.balance`]: -numberOfDays,
            [`${balancePath}.booked`]: numberOfDays,
          },
        });
      }
    }

    const newLeave = new Leave({
      userId,
      startDate,
      endDate,
      numberOfDays,
      days,
      type,
      reason,
      attachment,
    });

    const savedLeave = await newLeave.save();

    return NextResponse.json({
      message: "Leave request submitted successfully",
      leave: savedLeave,
    });
  } catch (error: any) {
    console.error("Error submitting leave request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
