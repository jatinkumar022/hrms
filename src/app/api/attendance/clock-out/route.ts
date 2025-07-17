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
    const now = dayjs();

    // Find the latest attendance record with an unclosed work segment
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
    const attendanceDate = dayjs(attendance.date).format("YYYY-MM-DD");
    const clockInTimeOfSegment = dayjs(
      `${attendanceDate}T${lastSegment.clockIn}`
    );

    const totalSecondsForSegment = now.diff(clockInTimeOfSegment, "second");

    let breaksDuringSegmentSeconds = 0;
    for (const brk of attendance.breaks || []) {
      const breakStartTime = dayjs(`${attendanceDate}T${brk.start}`);
      const breakEndTime = brk.end
        ? dayjs(`${attendanceDate}T${brk.end}`)
        : now;

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

    let totalDailyWorkSeconds = totalSecondsForSegment;
    let totalDailyProductiveSeconds = productiveSecondsForSegment;

    for (let i = 0; i < attendance.workSegments.length - 1; i++) {
      const segment = attendance.workSegments[i];
      if (segment.duration) {
        totalDailyWorkSeconds += segment.duration;
      }
      if (segment.productiveDuration) {
        totalDailyProductiveSeconds += segment.productiveDuration;
      }
    }

    const requiredWorkSeconds = 9 * 3600; // 9 hours
    const requiredProductiveSeconds = 8 * 3600; // 8 hours

    const isEarly =
      totalDailyWorkSeconds < requiredWorkSeconds ||
      totalDailyProductiveSeconds < requiredProductiveSeconds;

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

    const finalTotalHours = secondsToDuration(totalDailyWorkSeconds);
    const finalProductiveHours = secondsToDuration(totalDailyProductiveSeconds);

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
          ...b,
          duration:
            b.duration !== undefined
              ? secondsToDuration(b.duration)
              : undefined,
        })),
        workSegments: attendance.workSegments.map((w: any) => ({
          ...w,
          duration:
            w.duration !== undefined
              ? secondsToDuration(w.duration)
              : undefined,
          productiveDuration:
            w.productiveDuration !== undefined
              ? secondsToDuration(w.productiveDuration)
              : undefined,
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
