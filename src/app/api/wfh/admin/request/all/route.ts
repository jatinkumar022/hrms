// This file will contain the admin functionality for fetching all WFH requests.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wfhRequests = await WorkFromHome.aggregate([
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
        $project: {
          _id: 1,
          startDate: 1,
          endDate: 1,
          dayType: 1,
          status: 1,
          reason: 1,
          createdAt: 1,
          userId: {
            _id: "$userDetails._id",
            username: "$userDetails.username",
            profileImage: "$profileDetails.profileImage",
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return NextResponse.json({
      message: "WFH requests fetched successfully",
      success: true,
      wfhRequests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
