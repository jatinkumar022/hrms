import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import AttendanceRequest from "@/models/AttendanceRequest";
import Attendance from "@/models/Attendance";
import User from "@/models/userModel";
import Shift from "@/models/Shift";

await connect();

export async function POST(req: NextRequest) {
  try {
    const adminUser = await getUserFromToken(req);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await req.json(); // action: "approve" or "reject"

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Missing requestId or action" },
        { status: 400 }
      );
    }

    const request = await AttendanceRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { error: `Request has already been ${request.status}.` },
        { status: 400 }
      );
    }

    if (action === "reject") {
      request.status = "rejected";
      request.actionTakenBy = adminUser._id;
      await request.save();
      return NextResponse.json({
        success: true,
        message: "Request rejected.",
      });
    }

    if (action === "approve") {
      // --- Main Approval Logic ---
      const { userId, date, requestType, requestedTime, attendanceId } =
        request;
      let attendanceRecord = await Attendance.findById(attendanceId);

      // 1. Handle Clock-In Request
      if (requestType === "clock-in") {
        const user = await User.findById(userId);
        if (!user || !user.shift) {
          return NextResponse.json(
            { error: "User or user's shift not found." },
            { status: 404 }
          );
        }
        const shift = await Shift.findById(user.shift);
        if (!shift) {
          return NextResponse.json(
            { error: "Shift details not found." },
            { status: 404 }
          );
        }

        attendanceRecord = new Attendance({
          userId,
          date,
          shiftId: user.shift,
          status: "present",
          workSegments: [{ clockIn: requestedTime, clockOut: null }],
          lateIn: requestedTime > shift.maxClockIn,
        });
      }
      // 2. Handle Clock-Out Request
      else if (requestType === "clock-out") {
        if (!attendanceRecord)
          return NextResponse.json({ error: "Attendance not found" });
        const lastWorkSegment =
          attendanceRecord.workSegments[
            attendanceRecord.workSegments.length - 1
          ];
        if (lastWorkSegment.clockOut) {
          return NextResponse.json({
            error: "User has already clocked out.",
          });
        }
        lastWorkSegment.clockOut = requestedTime;
      }
      // 3. Handle Break-In Request
      else if (requestType === "break-in") {
        if (!attendanceRecord)
          return NextResponse.json({ error: "Attendance not found" });
        const lastBreak =
          attendanceRecord.breaks?.[attendanceRecord.breaks.length - 1];
        if (lastBreak && !lastBreak.end) {
          return NextResponse.json({
            error: "User is already on a break.",
          });
        }
        attendanceRecord.breaks.push({
          start: requestedTime,
        } as any);
      }
      // 4. Handle Break-Out Request
      else if (requestType === "break-out") {
        if (!attendanceRecord)
          return NextResponse.json({ error: "Attendance not found" });
        const lastBreak =
          attendanceRecord.breaks[attendanceRecord.breaks.length - 1];
        if (!lastBreak || lastBreak.end) {
          return NextResponse.json({
            error: "User is not on a break or already broke out.",
          });
        }
        lastBreak.end = requestedTime;
      }

      await attendanceRecord?.save();

      request.status = "approved";
      request.actionTakenBy = adminUser._id;
      await request.save();

      return NextResponse.json({
        success: true,
        message: `Request approved and attendance updated.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing attendance request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
