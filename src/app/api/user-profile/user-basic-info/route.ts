import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import UserProfile from "@/models/userProfile";

connect();

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await UserProfile.findOne({ user: userId }).select(
      "displayName currentJob.jobTitle"
    );

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        displayName: profile.displayName,
        jobTitle: profile.currentJob?.jobTitle,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Fetch error",
      },
      { status: 500 }
    );
  }
}
