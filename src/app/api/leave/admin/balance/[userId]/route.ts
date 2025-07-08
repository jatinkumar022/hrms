import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import LeaveBalance from "@/models/LeaveBalance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import User from "@/models/userModel";

connect();

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const adminUserId = await getUserFromToken(request);
    const adminUser = await User.findById(adminUserId);

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can update leave balance" },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const reqBody = await request.json();
    const { casualLeave, sickLeave, earnedLeave, leaveWithoutPay } = reqBody;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const updateFields: any = {};
    if (casualLeave !== undefined)
      updateFields["casualLeave.balance"] = casualLeave;
    if (sickLeave !== undefined) updateFields["sickLeave.balance"] = sickLeave;
    if (earnedLeave !== undefined)
      updateFields["earnedLeave.balance"] = earnedLeave;
    if (leaveWithoutPay !== undefined)
      updateFields["leaveWithoutPay.balance"] = leaveWithoutPay;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedBalance = await LeaveBalance.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "Leave balance updated successfully",
      success: true,
      leaveBalance: updatedBalance,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const requestingUserId = await getUserFromToken(request);
    const { userId } = params;

    const requestingUser = await User.findById(requestingUserId);

    if (!requestingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins can fetch any user's leave balance, users can only fetch their own
    if (requestingUser.role !== "admin" && requestingUserId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to view other users' leave balance" },
        { status: 403 }
      );
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
