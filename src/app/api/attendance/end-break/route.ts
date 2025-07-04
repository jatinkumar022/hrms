import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";
import { secondsToDuration } from "@/lib/attendanceHelpers";

export async function POST(req: NextRequest) {
  await connect();
  try {
    const userId = await getUserFromToken(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const today = dayjs().format("YYYY-MM-DD");
    const now = dayjs();
    const attendance = await Attendance.findOne({ userId, date: today });
    if (
      !attendance ||
      !attendance.workSegments ||
      attendance.workSegments.length === 0
    ) {
      return NextResponse.json(
        { error: "No clock-in found for today." },
        { status: 400 }
      );
    }
    const lastSegment =
      attendance.workSegments[attendance.workSegments.length - 1];
    if (lastSegment.clockOut) {
      return NextResponse.json(
        { error: "Please clock in before ending a break." },
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
    const breakStartTime = dayjs(`${today}T${activeBreak.start}`);
    const breakDurationSeconds = now.diff(breakStartTime, "second");
    activeBreak.end = now.format("HH:mm:ss");
    activeBreak.duration = breakDurationSeconds;
    activeBreak.reason = reason || undefined;
    activeBreak.endLocation = location;
    activeBreak.endDeviceType = deviceType;
    attendance.markModified("breaks");
    let totalDailyBreakSeconds = 0;
    for (const brk of attendance.breaks) {
      if (brk.duration !== undefined) {
        totalDailyBreakSeconds += brk.duration;
      } else if (brk.start && !brk.end) {
        const tempBreakStartTime = dayjs(`${today}T${brk.start}`);
        totalDailyBreakSeconds += now.diff(tempBreakStartTime, "second");
      }
    }
    attendance.breakDuration = totalDailyBreakSeconds;
    await attendance.save();
    return NextResponse.json({
      success: true,
      message: "Break ended",
      breakEndTime: now.format("HH:mm:ss"),
      breakDuration: secondsToDuration(breakDurationSeconds),
      totalBreakDurationToday: secondsToDuration(totalDailyBreakSeconds),
      attendance: {
        ...attendance.toObject(),
        breaks: attendance.breaks.map((b: any) => ({
          start: b.start,
          end: b.end,
          duration: b.duration,
          reason: b.reason,
          startLocation: b.startLocation,
          startDeviceType: b.startDeviceType,
          endLocation: b.endLocation,
          endDeviceType: b.endDeviceType,
        })),
        workSegments: attendance.workSegments.map((w: any) => ({
          clockIn: w.clockIn,
          clockOut: w.clockOut,
          duration: w.duration,
          productiveDuration: w.productiveDuration,
          clockInLocation: w.clockInLocation,
          clockInDeviceType: w.clockInDeviceType,
          clockOutLocation: w.clockOutLocation,
          clockOutDeviceType: w.clockOutDeviceType,
        })),
      },
    });
  } catch (error) {
    console.error("End break error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
