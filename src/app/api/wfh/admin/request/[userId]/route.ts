import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import mongoose from "mongoose";
import { getUserFromToken } from "@/lib/getUserFromToken";
import User from "@/models/userModel";

export async function GET(request: NextRequest, { params }: any) {
  try {
    await connect();
    const { userId } = params;

    const requestingUserId = await getUserFromToken(request);
    const requestingUser = await User.findById(requestingUserId);

    if (!requestingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      requestingUser.role !== "admin" &&
      String(requestingUserId) !== userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized to view other users' WFH requests" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    const wfhRequests = await WorkFromHome.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
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
