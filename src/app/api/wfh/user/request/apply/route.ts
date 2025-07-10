// This file will contain the user functionality for applying for Work From Home.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqBody = await request.json();
    const {
      startDate,
      endDate,
      numberOfDays,
      dayType,
      halfDayTime,
      startTime,
      endTime,
      reason,
      attachment,
    } = reqBody;

    const newWorkFromHomeRequest = new WorkFromHome({
      userId: user._id,
      startDate,
      endDate,
      numberOfDays,
      dayType,
      halfDayTime,
      startTime,
      endTime,
      reason,
      attachment,
    });

    const savedRequest = await newWorkFromHomeRequest.save();

    return NextResponse.json({
      message: "Work From Home request submitted successfully",
      success: true,
      request: savedRequest,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
