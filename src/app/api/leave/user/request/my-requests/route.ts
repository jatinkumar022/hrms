// This file will contain the user functionality for fetching their own leave requests.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveRequests = await Leave.find({ userId: user._id })
      .select(
        "startDate endDate type days status reason rejectionReason numberOfDays createdAt updatedAt attachment"
      )
      .sort({
        createdAt: -1,
      });

    return NextResponse.json({
      message: "Your leave requests fetched successfully",
      success: true,
      leaveRequests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
