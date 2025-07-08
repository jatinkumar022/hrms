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

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, approvedBy: status === "approved" ? userId : undefined },
      { new: true }
    )
      .populate("userId", "username")
      .populate("approvedBy", "username");

    if (!updatedLeave) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    if (status === "approved") {
      const {
        userId: leaveUserId,
        type,
        numberOfDays,
        leaveDayType,
        duration,
        startDate,
        endDate,
      } = updatedLeave;

      const user = await User.findById(leaveUserId);
      if (!user) {
        console.error(`User with ID ${leaveUserId} not found.`);
        return NextResponse.json(
          { error: "User not found for leave request" },
          { status: 404 }
        );
      }

      const shiftId = user.shiftId; // Assuming shiftId is stored in the User model
      if (!shiftId) {
        console.error(
          `Shift ID not found for user ${leaveUserId}. Cannot create attendance record.`
        );
        return NextResponse.json(
          { error: "Shift ID not found for user" },
          { status: 500 }
        );
      }
      let daysToDeduct = numberOfDays;

      if (leaveDayType === "Hourly" && duration) {
        const [hours, minutes] = duration.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes;

        daysToDeduct = totalMinutes / 480;
      }

      let fieldToUpdate = "";

      if (type === "Casual Leave") {
        fieldToUpdate = "casualLeave.booked";
      } else if (type === "Sick Leave") {
        fieldToUpdate = "sickLeave.booked";
      } else if (type === "Earned Leave") {
        fieldToUpdate = "earnedLeave.booked";
      } else if (type === "LWP") {
        fieldToUpdate = "leaveWithoutPay.booked";
      }

      if (fieldToUpdate) {
        await LeaveBalance.findOneAndUpdate(
          { userId: leaveUserId },
          {
            $inc: {
              [fieldToUpdate]: daysToDeduct,
              [`${fieldToUpdate.replace(".booked", ".balance")}`]:
                -daysToDeduct,
            },
          },
          { upsert: true, new: true }
        );
      }

      const start = dayjs(startDate);
      const end = dayjs(endDate);
      let currentDate = start;

      while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD");
        console.log(
          `Processing attendance for userId: ${leaveUserId}, date: ${dateString}`
        );

        try {
          const updatedAttendance = await Attendance.findOneAndUpdate(
            { userId: leaveUserId, date: dateString },
            {
              status: "on_leave",
              shiftId: shiftId,
              workSegments: [],
              breaks: [],
              lateIn: false,
              lateInReason: undefined,
              earlyOut: false,
              earlyOutReason: undefined,
            },
            { upsert: true, new: true }
          );
          console.log(
            `Attendance update result for ${dateString}:`,
            updatedAttendance
          );
        } catch (attendanceError: any) {
          console.error(
            `Error updating attendance for ${dateString}:`,
            attendanceError
          );
        }

        currentDate = currentDate.add(1, "day");
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
