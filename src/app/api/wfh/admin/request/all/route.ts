// This file will contain the admin functionality for fetching all WFH requests.

import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/userModel";

export async function GET() {
  try {
    await connect();

    const wfhRequests = await WorkFromHome.aggregate([
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
          dayType: 1,
          reason: 1,
          status: 1,
          attachment: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: "$userDoc._id",
            username: "$userDoc.username",
            employeeId: "$userDoc.employeeId",
            profilePhoto: {
              $ifNull: ["$userProfileDoc.profileImage", null],
            },
          },
        },
      },
    ]);

    return NextResponse.json(wfhRequests);
  } catch (error: any) {
    console.error("Error fetching WFH requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch WFH requests", details: error.message },
      { status: 500 }
    );
  }
}
