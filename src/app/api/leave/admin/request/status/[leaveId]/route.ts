import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import LeaveBalance from "@/models/LeaveBalance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import User from "@/models/userModel";
import Attendance from "@/models/Attendance";
import dayjs from "dayjs";

connect();
export async function PUT(request: NextRequest, context: any) {
  try {
    const userId = await getUserFromToken(request);
    const requestingUser = await User.findById(userId);

    if (!requestingUser || requestingUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can update leave request status" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const { status } = reqBody;
    const { leaveId } = context.params;
    if (!leaveId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: leaveId or status" },
        { status: 400 }
      );
    }

    const originalLeave = await Leave.findById(leaveId);
    if (!originalLeave) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }
    const wasPreviouslyApproved = originalLeave.status === "approved";

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, approvedBy: status === "approved" ? userId : undefined },
      { new: true }
    )
      .populate("userId", "username")
      .populate("approvedBy", "username");

    if (!updatedLeave) {
      // This should theoretically not be reached if originalLeave was found, but as a safeguard.
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    const {
      userId: leaveUserId,
      type,
      numberOfDays,
      startDate,
      endDate,
    } = updatedLeave;

    const balanceMap: Record<
      string,
      "casualLeave" | "sickLeave" | "earnedLeave" | "leaveWithoutPay"
    > = {
      "Casual Leave": "casualLeave",
      "Sick Leave": "sickLeave",
      "Earned Leave": "earnedLeave",
      LWP: "leaveWithoutPay",
    };
    const balancePath = balanceMap[type];

    if (balancePath) {
      if (status === "approved" && !wasPreviouslyApproved) {
        // Move from booked to used
        await LeaveBalance.findOneAndUpdate(
          { userId: leaveUserId },
          {
            $inc: {
              [`${balancePath}.booked`]: -numberOfDays,
              [`${balancePath}.used`]: numberOfDays,
            },
          }
        );
        // Create attendance records
        const user = await User.findById(leaveUserId);
        if (user && user.shiftId) {
          let currentDate = dayjs(startDate);
          while (
            currentDate.isBefore(endDate) ||
            currentDate.isSame(endDate, "day")
          ) {
            const dateString = currentDate.format("YYYY-MM-DD");
            await Attendance.findOneAndUpdate(
              { userId: leaveUserId, date: dateString },
              {
                status: "on_leave",
                shiftId: user.shiftId,
                workSegments: [],
                breaks: [],
                lateIn: false,
                lateInReason: undefined,
                earlyOut: false,
                earlyOutReason: undefined,
              },
              { upsert: true, new: true }
            );
            currentDate = currentDate.add(1, "day");
          }
        }
      } else if (status === "rejected" && !wasPreviouslyApproved) {
        // Return from booked to balance
        await LeaveBalance.findOneAndUpdate(
          { userId: leaveUserId },
          {
            $inc: {
              [`${balancePath}.booked`]: -numberOfDays,
              [`${balancePath}.balance`]: numberOfDays,
            },
          }
        );
      } else if (
        (status === "rejected" || status === "cancelled") &&
        wasPreviouslyApproved
      ) {
        // Return from used to balance
        await LeaveBalance.findOneAndUpdate(
          { userId: leaveUserId },
          {
            $inc: {
              [`${balancePath}.used`]: -numberOfDays,
              [`${balancePath}.balance`]: numberOfDays,
            },
          }
        );
      }
    }

    return NextResponse.json({
      message: `Leave request ${status} successfully`,
      success: true,
      updatedLeave,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
