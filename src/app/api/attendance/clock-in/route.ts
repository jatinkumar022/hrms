import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import User from "@/models/userModel";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Shift from "@/models/Shift";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  await connect();
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { reason, location } = await req
      .json()
      .catch(() => ({ reason: null, location: null }));

    const today = dayjs().format("YYYY-MM-DD");
    const now = dayjs();
    console.log(location);
    const user = await User.findById(userId).populate("shiftId");
    if (!user || !user.shiftId) {
      return NextResponse.json(
        { error: "User or shift not found" },
        { status: 404 }
      );
    }

    const shift = user.shiftId;
    const shiftStart = dayjs(`${today}T${shift.startTime}`);
    const maxClockIn = dayjs(`${today}T${shift.maxClockIn}`);

    let attendance = await Attendance.findOne({ userId, date: today });

    // Check if there's an existing active clock-in segment
    const activeSegment = attendance?.workSegments?.find(
      (segment: any) => !segment.clockOut
    );

    if (activeSegment) {
      return NextResponse.json(
        { error: "Already clocked in. Please clock out first." },
        { status: 400 }
      );
    }

    // Cannot clock in before shift start (applies to all clock-ins)
    if (now.isBefore(shiftStart)) {
      return NextResponse.json(
        {
          error: `Clock-in not allowed before shift starts at ${shift.startTime}`,
        },
        { status: 400 }
      );
    }

    // If clock-in after maxClockIn, reason is mandatory (applies to all clock-ins)
    const isLate = now.isAfter(maxClockIn);
    const requiresReason = isLate;

    if (requiresReason && (!reason || reason.trim().length < 3)) {
      return NextResponse.json(
        {
          error: `Clock-in after ${shift.maxClockIn} requires a valid reason.`,
        },
        { status: 400 }
      );
    }

    if (!attendance) {
      // First clock-in of the day, create new attendance record
      attendance = await Attendance.create({
        userId,
        shiftId: shift._id,
        date: today,
        workSegments: [
          {
            clockIn: now.format("HH:mm:ss"),
            clockInLocation: location,
            clockInDeviceType: deviceType,
          },
        ],
        lateIn: isLate,
        requiresLateInReason: requiresReason,
        lateInReason: requiresReason ? reason : undefined,
        breaks: [], // Initialize breaks array
        status: "present", // Set status to present on first clock-in
      });
      attendance.markModified("workSegments"); // Explicitly mark workSegments array as modified
    } else {
      // Subsequent clock-in for the day (after a clock-out)
      // Ensure workSegments array exists for older documents before pushing
      if (!attendance.workSegments) {
        attendance.workSegments = [];
      }
      attendance.workSegments.push({
        clockIn: now.format("HH:mm:ss"),
        clockInLocation: location,
        clockInDeviceType: deviceType,
      });
      attendance.markModified("workSegments"); // Explicitly mark workSegments array as modified
      // Update status to present if it was previously absent/on_leave (e.g., if it was manually set)
      attendance.status = "present";
      // No need to reset lateIn/reason here, as it's for the first clock-in.
    }

    await attendance.save();

    // Build response with clockInLocation and clockInDeviceType
    return NextResponse.json({
      success: true,
      message: "Clock-in recorded",
      time: now.format("HH:mm:ss"),
      isLate,
      reasonRequired: requiresReason,
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
    console.error("Clock-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
