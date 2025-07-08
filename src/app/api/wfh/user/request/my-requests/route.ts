// This file will contain the user functionality for fetching their own WFH requests.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wfhRequests = await WorkFromHome.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      message: "Your WFH requests fetched successfully",
      success: true,
      wfhRequests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
