// This file will contain the user functionality for fetching their own WFH requests.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import { getUserFromToken } from "@/lib/getUserFromToken";
import UserProfile from "@/models/userProfile";
import User from "@/models/userModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wfhRequests = await WorkFromHome.find({ userId: user._id })
      .populate({
        path: "userId",
        model: User,
        select: "username firstName lastName",
      })
      .sort({ createdAt: -1 })
      .lean();

    const userIds = wfhRequests.map((request: any) => request.userId._id);
    const userProfiles = await UserProfile.find({
      user: { $in: userIds },
    }).select("user profileImage");

    const profileImageMap = userProfiles.reduce((acc: any, profile: any) => {
      acc[profile.user.toString()] = profile.profileImage;
      return acc;
    }, {});

    const formattedRequests = wfhRequests.map((request: any) => ({
      ...request,
      user: {
        ...request.userId,
        profileImage: profileImageMap[request.userId._id.toString()] || null,
      },
    }));

    return NextResponse.json(formattedRequests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
