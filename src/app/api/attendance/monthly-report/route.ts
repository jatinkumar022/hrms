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
import duration from "dayjs/plugin/duration";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import Leave from "@/models/Leave";
dayjs.extend(minMax);
dayjs.extend(duration);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
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
    const startOfMonth = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
    const endOfMonth = startOfMonth.endOf("month");

    const today = dayjs(); // Get current actual date for comparison
    const todayDateLimit = today.isSame(startOfMonth, "month")
      ? today
      : startOfMonth.endOf("month");

    const userIdToQuery = currentUser._id;

    // Get all attendance records for the user in the month
    const attendanceRecords = await Attendance.find({
      userId: userIdToQuery,
      date: {
        $gte: startOfMonth.format("YYYY-MM-DD"),
        $lte: todayDateLimit.format("YYYY-MM-DD"), // Only fetch up to today for attendance
      },
    }).sort({ date: 1 });

    // Get all approved leave records for the user in the month (full month)
    const approvedLeaves = await Leave.find({
      userId: userIdToQuery,
      status: "approved",
      $or: [
        {
          startDate: { $lte: endOfMonth.format("YYYY-MM-DD") },
          endDate: { $gte: startOfMonth.format("YYYY-MM-DD") },
        },
      ],
    });

    // Get user and shift info
    const user = await User.findById(userIdToQuery).populate("shiftId");

    // Build a map of date -> attendance for quick lookup
    const attendanceMap = new Map();
    for (const att of attendanceRecords) {
      attendanceMap.set(att.date, att);
    }
    console.log("Attendance Records fetched:", attendanceRecords);
    console.log("Attendance Map:", attendanceMap);

    // Build a map of date -> leave for quick lookup
    const leaveMap = new Map();
    for (const leave of approvedLeaves) {
      let currentLeaveDate = dayjs(leave.startDate);
      while (currentLeaveDate.isBefore(dayjs(leave.endDate).add(1, "day"))) {
        const dateString = currentLeaveDate.format("YYYY-MM-DD");
        if (
          currentLeaveDate.isSameOrAfter(startOfMonth, "day") &&
          currentLeaveDate.isSameOrBefore(endOfMonth, "day")
        ) {
          // Only add to map if within the current month's range
          if (!leaveMap.has(dateString)) {
            leaveMap.set(dateString, leave); // Store the first approved leave for the day
          }
        }
        currentLeaveDate = currentLeaveDate.add(1, "day");
      }
    }
    console.log("Approved Leaves fetched:", approvedLeaves);
    console.log("Leave Map:", leaveMap);

    // Build the full month array
    const records = [];

    for (let d = 1; d <= endOfMonth.date(); d++) {
      const currentDate = startOfMonth.date(d);
      const dateString = currentDate.format("YYYY-MM-DD");
      const attendance = attendanceMap.get(dateString);
      const leaveForDay = leaveMap.get(dateString);
      const dayOfWeek = currentDate.day(); // 0=Sunday, 6=Saturday

      console.log(
        `Processing date: ${dateString}, Attendance: ${!!attendance}, Leave: ${!!leaveForDay}`
      );

      if (attendance) {
        // Actual attendance record exists
        const attendanceObj = attendance.toObject({ virtuals: true });
        console.log(
          `  -> Status set to: ${attendanceObj.status} (from attendance record)`
        );
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

        if (
          attendanceObj.workSegments &&
          attendanceObj.workSegments.length > 0
        ) {
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
              const breakStart = dayjs(`${attendanceObj.date}T${brk.start}`);
              cumulativeBreakDurationSeconds += recordNow.diff(
                breakStart,
                "second"
              );
            }
          }
        }

        records.push({
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
        });
      } else if (leaveForDay) {
        // Approved leave exists for this day
        console.log(`  -> Status set to: on_leave (from approved leave)`);
        records.push({
          date: dateString,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          shift: {
            _id: user.shiftId?._id || null,
            name: user.shiftId?.name || "N/A",
            startTime: user.shiftId?.startTime || "N/A",
            maxClockIn: user.shiftId?.maxClockIn || "N/A",
          },
          attendance: {
            lateIn: false,
            earlyOut: false,
            totalDuration: "00:00:00",
            productiveDuration: "00:00:00",
            breakDuration: "00:00:00",
            breaks: [],
            workSegments: [],
            status: "on_leave",
          },
        });
      } else if (currentDate.isSameOrBefore(today, "day")) {
        // No attendance or leave, and day is today or in the past
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        console.log(`  -> Status set to: ${isWeekend ? "weekend" : "absent"}`);
        records.push({
          date: dateString,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          shift: {
            _id: user.shiftId?._id || null,
            name: user.shiftId?.name || "N/A",
            startTime: user.shiftId?.startTime || "N/A",
            maxClockIn: user.shiftId?.maxClockIn || "N/A",
          },
          attendance: {
            lateIn: false,
            earlyOut: false,
            totalDuration: "00:00:00",
            productiveDuration: "00:00:00",
            breakDuration: "00:00:00",
            breaks: [],
            workSegments: [],
            status: isWeekend ? "weekend" : "absent",
          },
        });
      } else {
        // Day is in the future and no leave, so skip (do not add to records)
        console.log(`  -> Skipping future date with no leave.`);
      }
    }

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Monthly report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
