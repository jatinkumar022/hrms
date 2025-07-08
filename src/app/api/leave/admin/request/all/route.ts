import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveRequests = await Leave.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "userId",
          foreignField: "user",
          as: "profileDetails",
        },
      },
      {
        $unwind: {
          path: "$profileDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approvedBy",
          foreignField: "_id",
          as: "approvedByDetails",
        },
      },
      {
        $unwind: {
          path: "$approvedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          calculatedDays: {
            $add: [
              {
                $divide: [
                  {
                    $subtract: [
                      { $toDate: "$endDate" },
                      { $toDate: "$startDate" },
                    ],
                  },
                  1000 * 60 * 60 * 24,
                ],
              },
              1,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          startDate: 1,
          endDate: 1,
          type: 1,
          leaveDayType: 1,
          reason: 1,
          status: 1,
          rejectionReason: 1,
          createdAt: 1,
          updatedAt: 1,
          numberOfDays: {
            $cond: {
              if: { $eq: ["$leaveDayType", "Half Day"] },
              then: 0.5,
              else: { $ifNull: ["$numberOfDays", "$calculatedDays"] },
            },
          },
          userId: {
            _id: "$userDetails._id",
            username: "$userDetails.username",
            profileImage: "$profileDetails.profileImage",
          },
          approvedBy: {
            _id: "$approvedByDetails._id",
            username: "$approvedByDetails.username",
          },
        },
      },
      {
        $sort: { createdAt: -1 },
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
