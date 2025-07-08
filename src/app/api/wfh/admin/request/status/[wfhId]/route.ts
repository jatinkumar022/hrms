// This file will contain the admin functionality for updating the status of a WFH request.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import { getUserFromToken } from "@/lib/getUserFromToken";
import User from "@/models/userModel";
import Attendance from "@/models/Attendance";
import dayjs from "dayjs";

connect();

export async function PUT(request: NextRequest, context: any) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wfhId } = context.params;
    const { status } = await request.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedRequest = await WorkFromHome.findByIdAndUpdate(
      wfhId,
      { status, approvedBy: user._id },
      { new: true }
    ).populate("userId", "username");

    if (!updatedRequest) {
      return NextResponse.json(
        { error: "WFH request not found" },
        { status: 404 }
      );
    }

    if (status === "approved") {
      const { userId: wfhUserId, startDate, endDate } = updatedRequest;
      const wfhUser = await User.findById(wfhUserId);

      if (!wfhUser) {
        return NextResponse.json(
          { error: "User not found for WFH request" },
          { status: 404 }
        );
      }

      const shiftId = wfhUser.shiftId;
      if (!shiftId) {
        return NextResponse.json(
          { error: "Shift ID not found for user" },
          { status: 500 }
        );
      }

      const start = dayjs(startDate);
      const end = dayjs(endDate);
      let currentDate = start;

      while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
        const dateString = currentDate.format("YYYY-MM-DD");
        await Attendance.findOneAndUpdate(
          { userId: wfhUserId, date: dateString },
          {
            status: "on_remote",
            shiftId: shiftId,
          },
          { upsert: true, new: true }
        );
        currentDate = currentDate.add(1, "day");
      }
    }

    return NextResponse.json({
      message: `WFH request ${status}`,
      success: true,
      request: updatedRequest,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
