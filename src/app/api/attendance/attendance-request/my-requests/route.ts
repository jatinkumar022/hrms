import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import AttendanceRequest from "@/models/AttendanceRequest";

await connect();

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await AttendanceRequest.find({
      userId: currentUser._id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching user attendance requests:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
