import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
dayjs.extend(minMax);
import { secondsToDuration } from "@/lib/attendanceHelpers";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Shift from "@/models/Shift";

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

    const activeBreak = attendance.breaks?.find((b: any) => !b.end);
    if (activeBreak) {
      return NextResponse.json(
        { error: "Please end your break before clocking out." },
        { status: 400 }
      );
    }

    const lastSegment =
      attendance.workSegments[attendance.workSegments.length - 1];
    if (!lastSegment || lastSegment.clockOut) {
      return NextResponse.json(
        { error: "No active clock-in to clock out from." },
        { status: 400 }
      );
    }
    const clockInTimeOfSegment = dayjs(`${today}T${lastSegment.clockIn}`);

    const totalSecondsForSegment = now.diff(clockInTimeOfSegment, "second");

    let breaksDuringSegmentSeconds = 0;
    for (const brk of attendance.breaks || []) {
      const breakStartTime = dayjs(`${today}T${brk.start}`);
      const breakEndTime = brk.end ? dayjs(`${today}T${brk.end}`) : now;

      const overlapStart = dayjs.max(clockInTimeOfSegment, breakStartTime);
      const overlapEnd = dayjs.min(now, breakEndTime);

      if (overlapStart.isBefore(overlapEnd)) {
        breaksDuringSegmentSeconds += overlapEnd.diff(overlapStart, "second");
      }
    }

    const productiveSecondsForSegment = Math.max(
      0,
      totalSecondsForSegment - breaksDuringSegmentSeconds
    );

    const isEarly =
      totalSecondsForSegment < 32400 || productiveSecondsForSegment < 28800;

    if (isEarly && (!reason || reason.trim().length < 3)) {
      return NextResponse.json(
        {
          error: "Clock-out too early. Please provide a valid reason.",
        },
        { status: 400 }
      );
    }

    lastSegment.clockOut = now.format("HH:mm:ss");
    lastSegment.duration = totalSecondsForSegment;
    lastSegment.productiveDuration = productiveSecondsForSegment;
    lastSegment.clockOutLocation = location;
    lastSegment.clockOutDeviceType = deviceType;

    attendance.markModified("workSegments");

    attendance.earlyOut = isEarly;
    attendance.earlyOutReason = isEarly ? reason : undefined;
    await attendance.save();

    let totalDailyWorkSeconds = 0;

    for (const segment of attendance.workSegments) {
      if (segment.duration !== undefined) {
        totalDailyWorkSeconds += segment.duration;
      } else {
        const segmentStartTime = dayjs(`${today}T${segment.clockIn}`);
        totalDailyWorkSeconds += now.diff(segmentStartTime, "second");
      }
    }

    let totalDailyBreakSeconds = 0;
    if (attendance.breaks && attendance.breaks.length > 0) {
      for (const brk of attendance.breaks) {
        if (brk.duration !== undefined) {
          totalDailyBreakSeconds += brk.duration;
        } else if (brk.start && !brk.end) {
          const breakStartTime = dayjs(`${today}T${brk.start}`);
          totalDailyBreakSeconds += now.diff(breakStartTime, "second");
        }
      }
    }

    const finalTotalHours = secondsToDuration(totalDailyWorkSeconds);
    const finalProductiveHours = secondsToDuration(
      Math.max(0, totalDailyWorkSeconds - totalDailyBreakSeconds)
    );

    return NextResponse.json({
      success: true,
      message: "Clock-out recorded",
      clockOutTime: now.format("HH:mm:ss"),
      segmentDuration: secondsToDuration(lastSegment.duration as number),
      totalDailyWorkHours: finalTotalHours,
      totalDailyProductiveHours: finalProductiveHours,
      earlyOut: attendance.earlyOut,
      earlyOutReason: attendance.earlyOutReason,
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
    console.error("Clock-out error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
