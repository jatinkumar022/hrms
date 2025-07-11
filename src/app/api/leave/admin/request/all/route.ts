import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import { getUserFromToken } from "@/lib/getUserFromToken";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const user = await getUserFromToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveRequests = await Leave.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      { $unwind: "$userDoc" },
      {
        $lookup: {
          from: "users",
          localField: "approvedBy",
          foreignField: "_id",
          as: "approvedByDoc",
        },
      },
      {
        $unwind: {
          path: "$approvedByDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "userId",
          foreignField: "user",
          as: "userProfileDoc",
        },
      },
      {
        $unwind: {
          path: "$userProfileDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          startDate: 1,
          endDate: 1,
          numberOfDays: 1,
          days: 1,
          type: 1,
          reason: 1,
          status: 1,
          attachment: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            _id: "$userDoc._id",
            username: "$userDoc.username",
            profileImage: { $ifNull: ["$userProfileDoc.profileImage", ""] },
          },
          approvedBy: {
            _id: "$approvedByDoc._id",
            username: "$approvedByDoc.username",
          },
        },
      },
    ]);

    return NextResponse.json({
      message: "Leave requests fetched successfully",
      success: true,
      leaveRequests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
