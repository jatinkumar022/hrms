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
    const queryDate = url.searchParams.get("date"); // YYYY-MM-DD
    const queryUserId = url.searchParams.get("userId"); // Admin override
    const date = queryDate || dayjs().format("YYYY-MM-DD");
    const userIdToQuery =
      currentUser.role === "admin" && queryUserId
        ? queryUserId
        : currentUser._id;
    const attendance = await Attendance.findOne({
      userId: userIdToQuery,
      date,
    });

    if (!attendance) {
      // Populate user and shift info even if no attendance for the day, to show user/shift details
      const user = await User.findById(userIdToQuery).populate("shiftId");

      if (!user) {
        return NextResponse.json(
          { success: true, message: "User not found", report: null },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "No attendance found for today, defaulting to Absent.",
          report: {
            date,
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
              status: "absent", // Explicitly absent
            },
          },
        },
        { status: 200 }
      );
    }

    // Populate user and shift info (for existing attendance)
    const user = await User.findById(userIdToQuery).populate("shiftId");

    // Convert Mongoose document to a plain JavaScript object to remove internal properties
    const attendanceObj = attendance.toObject({ virtuals: true });

    const breaks = attendanceObj.breaks || [];
    type BreakType = {
      start: string;
      end?: string;
      duration?: number; // Now a number (seconds)
      reason?: string;
      startLocation?: string;
      startDeviceType?: string;
      endLocation?: string;
      endDeviceType?: string;
    };
    const breakSummary = (breaks as BreakType[]).map((b) => ({
      start: b.start,
      end: b.end || null,
      duration: b.duration !== undefined ? secondsToDuration(b.duration) : null, // Format from seconds to HH:mm:ss
      reason: b.reason || undefined,
      startLocation: b.startLocation,
      startDeviceType: b.startDeviceType,
      endLocation: b.endLocation,
      endDeviceType: b.endDeviceType,
    }));

    // Calculate total durations from work segments for display
    let cumulativeWorkDurationSeconds = 0;

    if (attendanceObj.workSegments && attendanceObj.workSegments.length > 0) {
      for (const segment of attendanceObj.workSegments) {
        const segmentObj = segment; // segment is already a plain object

        if (segmentObj.clockOut && segmentObj.duration !== undefined) {
          // Segment is completed, use stored numerical duration
          cumulativeWorkDurationSeconds += segmentObj.duration;
        } else {
          // Segment is active (user is currently clocked in)
          const segmentStartTime = dayjs(`${date}T${segmentObj.clockIn}`);
          const now = dayjs();
          const activeSegmentDurationSeconds = now.diff(
            segmentStartTime,
            "second"
          );
          cumulativeWorkDurationSeconds += activeSegmentDurationSeconds;
        }
      }
    }

    let cumulativeBreakDurationSeconds = 0;
    if (breaks.length > 0) {
      for (const brk of breaks) {
        if (brk.duration !== undefined) {
          cumulativeBreakDurationSeconds += brk.duration;
        } else if (brk.start && !brk.end) {
          // Handle active break
          const breakStartTime = dayjs(`${date}T${brk.start}`);
          const now = dayjs();
          const activeBreakDurationSeconds = now.diff(breakStartTime, "second");
          cumulativeBreakDurationSeconds += activeBreakDurationSeconds;
        }
      }
    }
    const finalProductiveSeconds = Math.max(
      0,
      cumulativeWorkDurationSeconds - cumulativeBreakDurationSeconds
    );

    return NextResponse.json({
      success: true,
      report: {
        date,
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
          // IMPORTANT: Removed top-level clockIn and clockOut as they are derived from workSegments
          lateIn: attendanceObj.lateIn || false, // Use from attendanceObj
          lateInReason: attendanceObj.lateInReason || undefined, // Use from attendanceObj
          earlyOut: attendanceObj.earlyOut || false, // Use from attendanceObj
          earlyOutReason: attendanceObj.earlyOutReason || undefined,
          totalDuration: secondsToDuration(cumulativeWorkDurationSeconds),
          productiveDuration: secondsToDuration(finalProductiveSeconds),
          breakDuration: secondsToDuration(cumulativeBreakDurationSeconds),
          breaks: breakSummary,
          workSegments: attendanceObj.workSegments.map((segment: any) => {
            const segmentObj = segment; // segment is already a plain object

            // Calculate duration and productive duration for active segments on the fly
            if (!segmentObj.clockOut) {
              const segmentStartTime = dayjs(`${date}T${segmentObj.clockIn}`);
              const now = dayjs();
              const activeSegmentDurationSeconds = now.diff(
                segmentStartTime,
                "second"
              );

              let activeSegmentBreaksSeconds = 0;
              for (const brk of attendanceObj.breaks || []) {
                // Use attendanceObj.breaks here
                const breakStartTime = dayjs(`${date}T${brk.start}`);
                const breakEndTime = brk.end
                  ? dayjs(`${date}T${brk.end}`)
                  : now;

                const overlapStart = dayjs.max(
                  segmentStartTime,
                  breakStartTime
                );
                const overlapEnd = dayjs.min(now, breakEndTime);

                if (overlapStart.isBefore(overlapEnd)) {
                  activeSegmentBreaksSeconds += overlapEnd.diff(
                    overlapStart,
                    "second"
                  );
                }
              }
              const activeSegmentProductiveSeconds = Math.max(
                0,
                activeSegmentDurationSeconds - activeSegmentBreaksSeconds
              );

              return {
                ...segmentObj, // Spread the plain segment object
                duration: secondsToDuration(activeSegmentDurationSeconds),
                productiveDuration: secondsToDuration(
                  activeSegmentProductiveSeconds
                ),
              };
            } else {
              // For completed segments, format the stored numerical duration
              return {
                ...segmentObj, // Spread the plain segment object
                duration:
                  segmentObj.duration !== undefined
                    ? secondsToDuration(segmentObj.duration)
                    : undefined,
                productiveDuration:
                  segmentObj.productiveDuration !== undefined
                    ? secondsToDuration(segmentObj.productiveDuration)
                    : undefined,
              };
            }
          }),
          status: attendanceObj.status, // Use from attendanceObj
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
