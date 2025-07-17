// /app/api/attendance/daily-report/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import User from "@/models/userModel";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax"; // Import the minMax plugin
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Shift from "@/models/Shift";
import { secondsToDuration } from "@/lib/attendanceHelpers";

dayjs.extend(minMax); // Extend dayjs with the minMax plugin

export async function GET(req: NextRequest) {
  await connect();
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const queryDate = url.searchParams.get("date");
    const queryUserId = url.searchParams.get("userId");
    const date = queryDate || dayjs().format("YYYY-MM-DD");
    const userIdToQuery =
      currentUser.role === "admin" && queryUserId
        ? queryUserId
        : currentUser._id;

    // Find attendance for the specified date
    let attendance = await Attendance.findOne({
      userId: userIdToQuery,
      date,
    });

    // If no record for the specific date, check for an active one from a previous day (overnight case)
    if (!attendance) {
      const latestActive = await Attendance.findOne({
        userId: userIdToQuery,
        "workSegments.clockOut": null,
      }).sort({ date: -1 });

      // If the active record's date is the day before the query date, use it
      if (
        latestActive &&
        dayjs(date).isSame(dayjs(latestActive.date).add(1, "day"), "day")
      ) {
        attendance = latestActive;
      }
    }

    const user = await User.findById(userIdToQuery).populate("shiftId");

    if (!attendance || !user) {
      // Return absent report if no relevant attendance or user found
      const targetUser =
        user || (await User.findById(userIdToQuery).populate("shiftId"));
      return NextResponse.json({
        success: true,
        message: user ? "No attendance found for the day." : "User not found.",
        report: {
          date,
          user: targetUser
            ? {
                _id: targetUser._id,
                username: targetUser.username,
                email: targetUser.email,
                role: targetUser.role,
              }
            : null,
          shift: targetUser?.shiftId
            ? {
                _id: targetUser.shiftId._id,
                name: targetUser.shiftId.name,
                startTime: targetUser.shiftId.startTime,
                maxClockIn: targetUser.shiftId.maxClockIn,
              }
            : null,
          attendance: {
            status: "absent",
            totalDuration: "00:00:00",
            productiveDuration: "00:00:00",
            breakDuration: "00:00:00",
            breaks: [],
            workSegments: [],
          },
        },
      });
    }

    const attendanceObj = attendance.toObject({ virtuals: true });
    const attendanceDate = dayjs(attendance.date);

    let totalWorkSeconds = 0;
    let totalProductiveSeconds = 0;
    let totalBreakSeconds = 0;

    const processedWorkSegments = (attendanceObj.workSegments || []).map(
      (segment: any) => {
        let segmentDurationSeconds: number;
        let segmentProductiveDurationSeconds: number;

        if (
          segment.clockOut &&
          typeof segment.duration === "number" &&
          typeof segment.productiveDuration === "number"
        ) {
          // For completed segments, use the stored numeric values directly.
          segmentDurationSeconds = segment.duration;
          segmentProductiveDurationSeconds = segment.productiveDuration;
        } else {
          // For active segments, calculate duration on the fly.
          const segmentStartTime = dayjs(segment.clockIn, "HH:mm:ss")
            .year(attendanceDate.year())
            .month(attendanceDate.month())
            .date(attendanceDate.date());
          const now = dayjs();
          let segmentEndTime = now;

          if (segment.clockOut) {
            // Should not happen with the check above, but for safety
            segmentEndTime = dayjs(segment.clockOut, "HH:mm:ss")
              .year(attendanceDate.year())
              .month(attendanceDate.month())
              .date(attendanceDate.date());
            if (segmentEndTime.isBefore(segmentStartTime)) {
              segmentEndTime = segmentEndTime.add(1, "day");
            }
          }

          segmentDurationSeconds = segmentEndTime.diff(
            segmentStartTime,
            "second"
          );

          let breaksInSegmentSeconds = 0;
          for (const brk of attendanceObj.breaks || []) {
            let breakStartTime = dayjs(brk.start, "HH:mm:ss")
              .year(attendanceDate.year())
              .month(attendanceDate.month())
              .date(attendanceDate.date());
            if (breakStartTime.isBefore(segmentStartTime)) {
              breakStartTime = breakStartTime.add(1, "day");
            }

            let breakEndTime;
            if (brk.end) {
              breakEndTime = dayjs(brk.end, "HH:mm:ss")
                .year(attendanceDate.year())
                .month(attendanceDate.month())
                .date(attendanceDate.date());
              if (breakEndTime.isBefore(breakStartTime)) {
                breakEndTime = breakEndTime.add(1, "day");
              }
            } else {
              breakEndTime = now;
            }

            const overlapStart = dayjs.max(segmentStartTime, breakStartTime);
            const overlapEnd = dayjs.min(segmentEndTime, breakEndTime);

            if (overlapStart.isBefore(overlapEnd)) {
              breaksInSegmentSeconds += overlapEnd.diff(overlapStart, "second");
            }
          }
          segmentProductiveDurationSeconds = Math.max(
            0,
            segmentDurationSeconds - breaksInSegmentSeconds
          );
        }

        totalWorkSeconds += segmentDurationSeconds;
        totalProductiveSeconds += segmentProductiveDurationSeconds;

        // Sum total breaks from their stored duration for accuracy
        if (segment.clockOut) {
          // Logic to sum breaks within this completed segment
        }

        return {
          ...segment,
          duration: secondsToDuration(segmentDurationSeconds),
          productiveDuration: secondsToDuration(
            segmentProductiveDurationSeconds
          ),
        };
      }
    );

    // Recalculate total break duration from all break objects for the summary
    totalBreakSeconds = (attendanceObj.breaks || []).reduce(
      (acc: number, brk: any) => acc + (brk.duration || 0),
      0
    );

    return NextResponse.json({
      success: true,
      report: {
        date: attendanceDate.format("YYYY-MM-DD"),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        shift: user.shiftId
          ? {
              _id: user.shiftId._id,
              name: user.shiftId.name,
              startTime: user.shiftId.startTime,
              maxClockIn: user.shiftId.maxClockIn,
            }
          : null,
        attendance: {
          ...attendanceObj,
          totalDuration: secondsToDuration(totalWorkSeconds),
          productiveDuration: secondsToDuration(totalProductiveSeconds),
          breakDuration: secondsToDuration(totalBreakSeconds),
          workSegments: processedWorkSegments,
          breaks: (attendanceObj.breaks || []).map((b: any) => ({
            ...b,
            duration: b.duration
              ? secondsToDuration(b.duration)
              : b.end
              ? secondsToDuration(
                  dayjs(b.end, "HH:mm:ss").diff(
                    dayjs(b.start, "HH:mm:ss"),
                    "second"
                  )
                )
              : "Active",
          })),
        },
      },
    });
  } catch (error) {
    console.error("Daily report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
