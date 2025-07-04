import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import User from "@/models/userModel";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Shift from "@/models/Shift";
import { secondsToDuration } from "@/lib/attendanceHelpers";
import minMax from "dayjs/plugin/minMax";
dayjs.extend(minMax);
export async function GET(req: NextRequest) {
  await connect();
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const queryMonth = url.searchParams.get("month"); // 1-based (1=Jan)
    const queryYear = url.searchParams.get("year");
    const now = dayjs();
    const year = queryYear ? parseInt(queryYear) : now.year();
    const month = queryMonth ? parseInt(queryMonth) : now.month() + 1; // dayjs month is 0-based
    const startDate = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
    const today = dayjs().isSame(startDate, "month")
      ? dayjs()
      : startDate.endOf("month");
    const userIdToQuery = currentUser._id;

    // Get all attendance records for the user in the month, up to today
    const attendanceRecords = await Attendance.find({
      userId: userIdToQuery,
      date: {
        $gte: startDate.format("YYYY-MM-DD"),
        $lte: today.format("YYYY-MM-DD"),
      },
    }).sort({ date: 1 });

    // Get user and shift info
    const user = await User.findById(userIdToQuery).populate("shiftId");

    const records = attendanceRecords.map((attendance) => {
      const attendanceObj = attendance.toObject({ virtuals: true });
      const breaks = attendanceObj.breaks || [];
      const breakSummary = breaks.map((b: any) => ({
        start: b.start,
        end: b.end || null,
        duration:
          b.duration !== undefined ? secondsToDuration(b.duration) : null,
        reason: b.reason || undefined,
        startLocation: b.startLocation,
        startDeviceType: b.startDeviceType,
        endLocation: b.endLocation,
        endDeviceType: b.endDeviceType,
      }));
      let cumulativeWorkDurationSeconds = 0;
      let cumulativeProductiveDurationSeconds = 0;
      const recordDate = dayjs(attendanceObj.date);
      const recordNow = recordDate.isSame(dayjs(), "day")
        ? dayjs()
        : recordDate.endOf("day");
      if (attendanceObj.workSegments && attendanceObj.workSegments.length > 0) {
        for (const segment of attendanceObj.workSegments) {
          const segmentObj = segment;
          const segmentStart = dayjs(
            `${attendanceObj.date}T${segmentObj.clockIn}`
          );
          const segmentEnd = segmentObj.clockOut
            ? dayjs(`${attendanceObj.date}T${segmentObj.clockOut}`)
            : recordNow;
          const segmentDuration = segmentEnd.diff(segmentStart, "second");
          cumulativeWorkDurationSeconds += segmentDuration;

          // Subtract overlapping breaks for productive time
          let breaksDuringSegmentSeconds = 0;
          for (const brk of breaks) {
            const breakStart = dayjs(`${attendanceObj.date}T${brk.start}`);
            const breakEnd = brk.end
              ? dayjs(`${attendanceObj.date}T${brk.end}`)
              : recordNow;
            const overlapStart = dayjs.max(segmentStart, breakStart);
            const overlapEnd = dayjs.min(segmentEnd, breakEnd);
            if (overlapStart.isBefore(overlapEnd)) {
              breaksDuringSegmentSeconds += overlapEnd.diff(
                overlapStart,
                "second"
              );
            }
          }
          const productiveSeconds = Math.max(
            0,
            segmentDuration - breaksDuringSegmentSeconds
          );
          cumulativeProductiveDurationSeconds += productiveSeconds;
        }
      }
      let cumulativeBreakDurationSeconds = 0;
      if (breaks.length > 0) {
        for (const brk of breaks) {
          if (brk.duration !== undefined) {
            cumulativeBreakDurationSeconds += brk.duration;
          } else if (brk.start && !brk.end) {
            // Active break
            const breakStart = dayjs(`${attendanceObj.date}T${brk.start}`);
            cumulativeBreakDurationSeconds += recordNow.diff(
              breakStart,
              "second"
            );
          }
        }
      }
      return {
        date: attendanceObj.date,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        shift: {
          _id: user.shiftId?._id,
          name: user.shiftId?.name,
          startTime: user.shiftId?.startTime,
          maxClockIn: user.shiftId?.maxClockIn,
        },
        attendance: {
          lateIn: attendanceObj.lateIn || false,
          lateInReason: attendanceObj.lateInReason || undefined,
          earlyOut: attendanceObj.earlyOut || false,
          totalDuration: secondsToDuration(cumulativeWorkDurationSeconds),
          productiveDuration: secondsToDuration(
            cumulativeProductiveDurationSeconds
          ),
          breakDuration: secondsToDuration(cumulativeBreakDurationSeconds),
          breaks: breakSummary,
          workSegments: attendanceObj.workSegments.map((segment: any) => ({
            ...segment,
            duration:
              segment.duration !== undefined
                ? secondsToDuration(segment.duration)
                : undefined,
            productiveDuration:
              segment.productiveDuration !== undefined
                ? secondsToDuration(segment.productiveDuration)
                : undefined,
          })),
          status: attendanceObj.status,
        },
      };
    });

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Monthly report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
