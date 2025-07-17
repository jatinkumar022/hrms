import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { secondsToDuration } from "@/lib/attendanceHelpers";

dayjs.extend(utc);
dayjs.extend(timezone);

const antd_timezone = "Asia/Kolkata";

export async function POST(req: NextRequest) {
  await connect();
  try {
    const userId = await getUserFromToken(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ... (device type logic remains the same)
    const userAgent = req.headers.get("user-agent");
    let deviceType = "desktop";
    if (userAgent && /Mobi|Android/i.test(userAgent)) {
      deviceType = "mobile";
    }
    if (deviceType === "mobile") {
      return NextResponse.json(
        { error: "Actions are not allowed from mobile devices." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason;
    const location = body?.location;
    const now = dayjs().tz(antd_timezone);

    const attendance = await Attendance.findOne({
      userId,
      "workSegments.clockOut": null,
    }).sort({ date: -1 });

    if (
      !attendance ||
      !attendance.workSegments ||
      attendance.workSegments.length === 0
    ) {
      return NextResponse.json(
        { error: "No active clock-in found." },
        { status: 400 }
      );
    }

    const lastSegment =
      attendance.workSegments[attendance.workSegments.length - 1];
    if (lastSegment.clockOut) {
      // Should be redundant due to query, but for safety
      return NextResponse.json(
        { error: "Cannot end break when clocked out." },
        { status: 400 }
      );
    }

    const activeBreak = attendance.breaks?.find((b: any) => !b.end);
    if (!activeBreak) {
      return NextResponse.json(
        { error: "No active break to end." },
        { status: 400 }
      );
    }

    const attendanceDate = dayjs(attendance.date).tz(antd_timezone);

    const clockInTimeParts = lastSegment.clockIn.split(":").map(Number);
    const lastClockInTime = attendanceDate
      .hour(clockInTimeParts[0])
      .minute(clockInTimeParts[1])
      .second(clockInTimeParts[2]);

    const breakStartParts = activeBreak.start.split(":").map(Number);
    let breakStartTime = attendanceDate
      .hour(breakStartParts[0])
      .minute(breakStartParts[1])
      .second(breakStartParts[2]);

    if (breakStartTime.isBefore(lastClockInTime)) {
      breakStartTime = breakStartTime.add(1, "day");
    }

    const breakEndTime = now;
    const breakDurationSeconds = breakEndTime.diff(breakStartTime, "second");

    if (isNaN(breakDurationSeconds) || breakDurationSeconds < 0) {
      console.error("FATAL: Calculated invalid break duration.", {
        start: breakStartTime.toISOString(),
        end: breakEndTime.toISOString(),
        duration: breakDurationSeconds,
      });
      return NextResponse.json(
        {
          error: "Failed to calculate break duration due to an internal error.",
        },
        { status: 500 }
      );
    }

    activeBreak.end = now.format("HH:mm:ss");
    activeBreak.duration = breakDurationSeconds;
    activeBreak.reason = reason || undefined;
    activeBreak.endLocation = location;
    activeBreak.endDeviceType = deviceType;

    attendance.markModified("breaks");

    await attendance.save();

    let totalDailyBreakSeconds = 0;
    for (const brk of attendance.breaks) {
      if (brk.duration !== undefined) {
        totalDailyBreakSeconds += brk.duration;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Break ended",
      breakEndTime: now.format("HH:mm:ss"),
      breakDuration: secondsToDuration(breakDurationSeconds),
      totalBreakDurationToday: secondsToDuration(totalDailyBreakSeconds),
      attendance: attendance.toObject(),
    });
  } catch (error) {
    console.error("End break error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
