import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import LeaveBalance from "@/models/LeaveBalance";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveBalance = await LeaveBalance.findOne({ userId });

    if (!leaveBalance) {
      return NextResponse.json(
        { error: "Leave balance not found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User leave balance fetched successfully",
      success: true,
      leaveBalance,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
