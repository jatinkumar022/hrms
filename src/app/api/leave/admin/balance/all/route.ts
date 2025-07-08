import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import LeaveBalance from "@/models/LeaveBalance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import User from "@/models/userModel";

connect();

export async function POST(request: NextRequest) {
  try {
    const adminUserId = await getUserFromToken(request);
    const adminUser = await User.findById(adminUserId);

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can bulk update leave balance" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const { casualLeave, sickLeave, earnedLeave, leaveWithoutPay } = reqBody;

    if (
      casualLeave === undefined &&
      sickLeave === undefined &&
      earnedLeave === undefined &&
      leaveWithoutPay === undefined
    ) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (casualLeave !== undefined)
      updateFields.$inc = {
        ...updateFields.$inc,
        "casualLeave.balance": casualLeave,
      };
    if (sickLeave !== undefined)
      updateFields.$inc = {
        ...updateFields.$inc,
        "sickLeave.balance": sickLeave,
      };
    if (earnedLeave !== undefined)
      updateFields.$inc = {
        ...updateFields.$inc,
        "earnedLeave.balance": earnedLeave,
      };
    if (leaveWithoutPay !== undefined)
      updateFields.$inc = {
        ...updateFields.$inc,
        "leaveWithoutPay.balance": leaveWithoutPay,
      };

    // Find all users and update their leave balances
    const allUsers = await User.find({});
    const bulkOperations = allUsers.map((user) => ({
      updateOne: {
        filter: { userId: user._id },
        update: updateFields,
        upsert: true,
      },
    }));

    await LeaveBalance.bulkWrite(bulkOperations);

    return NextResponse.json({
      message: "Leave balances updated for all users successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUserId = await getUserFromToken(request);
    const adminUser = await User.findById(adminUserId);

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can view all leave balances" },
        { status: 403 }
      );
    }

    const allLeaveBalances = await LeaveBalance.find({}).populate(
      "userId",
      "username email"
    );

    return NextResponse.json({
      message: "All user leave balances fetched successfully",
      success: true,
      leaveBalances: allLeaveBalances,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
