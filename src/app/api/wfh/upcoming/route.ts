import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import UserProfile from "@/models/userProfile";
import User from "@/models/userModel";
import dayjs from "dayjs";

connect();

export async function GET() {
  try {
    const today = dayjs().startOf("day").format("YYYY-MM-DD");

    const upcomingWfh = await WorkFromHome.find({
      status: "approved",
      startDate: { $gte: today },
    })
      .populate({
        path: "userId",
        model: User,
        select: "username firstName lastName",
      })
      .sort({ startDate: 1 })
      .lean();

    const userIds = upcomingWfh.map((wfh: any) => wfh.userId._id);
    const userProfiles = await UserProfile.find({
      user: { $in: userIds },
    }).select("user profileImage");

    const profileImageMap = userProfiles.reduce((acc: any, profile: any) => {
      acc[profile.user.toString()] = profile.profileImage;
      return acc;
    }, {});

    const formattedWfh = upcomingWfh.map((wfh: any) => {
      let days;
      if (wfh.dayType === "Hourly") {
        days = [
          {
            date: wfh.startDate,
            dayType: "Hourly",
            startTime: wfh.startTime,
            endTime: wfh.endTime,
          },
        ];
      } else {
        days = wfh.days;
      }

      const user = {
        ...wfh.userId,
        profileImage: profileImageMap[wfh.userId._id.toString()] || null,
      };

      return {
        ...wfh,
        user: user,
        days: days,
      };
    });

    return NextResponse.json(formattedWfh);
  } catch (error: any) {
    console.error("Error fetching upcoming WFH:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
