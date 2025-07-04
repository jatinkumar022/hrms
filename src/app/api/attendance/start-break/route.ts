import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";

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
        { error: "Please clock in before starting a break." },
        { status: 400 }
      );
    }
    const isBreakActive = attendance.breaks?.some((b: any) => !b.end);
    if (isBreakActive) {
      return NextResponse.json(
        { error: "Break already active. Please end your current break first." },
        { status: 400 }
      );
    }
    const totalBreakSoFar =
      attendance.breakDuration !== undefined ? attendance.breakDuration : 0;
    const breakLimit = 3600;
    const requiresReason = totalBreakSoFar >= breakLimit;
    if (requiresReason && (!reason || reason.trim().length < 3)) {
      return NextResponse.json(
        {
          error: `Total break time exceeded ${
            breakLimit / 60
          } minutes. Reason required.`,
        },
        { status: 400 }
      );
    }
    attendance.breaks.push({
      start: now.format("HH:mm:ss"),
      reason: requiresReason ? reason : undefined,
      startLocation: location,
      startDeviceType: deviceType,
    });
    attendance.markModified("breaks");
    await attendance.save();
    return NextResponse.json({
      success: true,
      message: "Break started",
      breakStartTime: now.format("HH:mm:ss"),
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
    console.error("Start break error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
