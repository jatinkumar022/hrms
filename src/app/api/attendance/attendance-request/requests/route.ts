import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import AttendanceRequest from "@/models/AttendanceRequest";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/userModel.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import UserProfile from "@/models/userProfile.js";

await connect();

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await AttendanceRequest.aggregate([
      { $match: { status: "pending" } },
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
          date: 1,
          requestType: 1,
          requestedTime: 1,
          reason: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            _id: "$userDoc._id",
            username: "$userDoc.username",
            profileImage: { $ifNull: ["$userProfileDoc.profileImage", ""] },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching attendance requests:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
