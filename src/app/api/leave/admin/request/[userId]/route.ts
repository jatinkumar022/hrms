// This file will contain the admin functionality for fetching specific user leave requests.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import { getUserFromToken } from "@/lib/getUserFromToken";
import User from "@/models/userModel";

connect();

export async function GET(request: NextRequest, { params }: any) {
  try {
    const requestingUserId = await getUserFromToken(request);
    const { userId } = params;

    const requestingUser = await User.findById(requestingUserId);

    if (!requestingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins can fetch any user's leave requests, users can only fetch their own
    if (requestingUser.role !== "admin" && requestingUserId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to view other users' leave requests" },
        { status: 403 }
      );
    }

    const leaveRequests = await Leave.find({ userId }).sort({ appliedAt: -1 });

    return NextResponse.json({
      message: "User leave requests fetched successfully",
      success: true,
      leaveRequests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
