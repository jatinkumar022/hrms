import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import Leave from "@/models/Leave";
import User from "@/models/userModel";
import UserProfile from "@/models/userProfile";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingLeaves = await Leave.find({
      status: "approved",
    })
      .populate({
        path: "userId",
        model: User,
        select: "username email",
      })
      .sort({ startDate: "ascending" })
      .lean();

    const userIds = upcomingLeaves.map((leave: any) => leave.userId._id);
    const userProfiles = await UserProfile.find({
      user: { $in: userIds },
    }).select("user profileImage");

    const profileImageMap = userProfiles.reduce((acc: any, profile: any) => {
      acc[profile.user.toString()] = profile.profileImage;
      return acc;
    }, {});

    const leavesWithProfileImages = upcomingLeaves.map((leave: any) => ({
      ...leave,
      user: {
        ...leave.userId,
        profileImage: profileImageMap[leave.userId._id.toString()] || "",
      },
    }));

    return NextResponse.json(leavesWithProfileImages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
