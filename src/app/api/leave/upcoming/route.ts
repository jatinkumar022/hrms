import { connect } from "@/dbConfig/dbConfig";
import Leave from "@/models/Leave";
import User from "@/models/userModel";
import UserProfile from "@/models/userProfile";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET() {
  try {
    await connect();

    const today = dayjs().startOf("day").format("YYYY-MM-DD");

    const upcomingLeaves = await Leave.find({
      status: "approved",
      startDate: { $gte: today },
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
