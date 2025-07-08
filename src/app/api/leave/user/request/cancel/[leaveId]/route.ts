import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();
export async function PATCH(request: NextRequest, context: any) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { leaveId } = context.params;
    const leaveRequest = await Leave.findOne({ _id: leaveId, userId });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "Leave request not found or unauthorized" },
        { status: 404 }
      );
    }

    if (leaveRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending leave requests can be cancelled" },
        { status: 400 }
      );
    }

    leaveRequest.status = "cancelled";
    await leaveRequest.save();

    return NextResponse.json({
      message: "Leave request cancelled successfully",
      success: true,
      cancelledLeave: leaveRequest,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
