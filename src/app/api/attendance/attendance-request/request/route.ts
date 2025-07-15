import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import AttendanceRequest from "@/models/AttendanceRequest";
import Attendance from "@/models/Attendance";
import dayjs from "dayjs";

await connect();

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, requestType, requestedTime, reason } = await req.json();

    if (!date || !requestType || !requestedTime || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Regex to validate HH:mm:ss format
    const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;

    // Validate date and time format
    if (
      !dayjs(date, "YYYY-MM-DD", true).isValid() ||
      !timeRegex.test(requestedTime)
    ) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    // Find the relevant attendance record
    const attendanceRecord = await Attendance.findOne({
      userId: currentUser._id,
      date,
    });

    // A clock-in request requires no prior attendance record for that day
    if (requestType === "clock-in" && attendanceRecord) {
      return NextResponse.json(
        { error: "An attendance record for this day already exists." },
        { status: 400 }
      );
    }

    // Other request types require an existing attendance record
    if (requestType !== "clock-in" && !attendanceRecord) {
      return NextResponse.json(
        {
          error:
            "No attendance record found for this day to apply the correction.",
        },
        { status: 404 }
      );
    }

    const newRequest = new AttendanceRequest({
      userId: currentUser._id,
      date,
      requestType,
      requestedTime,
      reason,
      attendanceId: attendanceRecord?._id,
      status: "pending",
    });

    await newRequest.save();

    return NextResponse.json({
      success: true,
      message: "Attendance correction request submitted successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error submitting attendance request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
