// Folder: /app/api/user-profile/[section]

import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import UserProfile from "@/models/userProfile";

connect();

// Shared update handler
async function updateSection(userId: string, sectionData: any) {
  return await UserProfile.findOneAndUpdate(
    { user: userId },
    { $set: sectionData },
    { new: true, runValidators: true, upsert: true }
  );
}

// Template route for section updates
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    const body = await req.json();
    const sectionData = body.data;

    if (!userId || !sectionData) {
      return NextResponse.json(
        { success: false, message: "Missing user or data" },
        { status: 400 }
      );
    }

    const updated = await updateSection(userId, sectionData);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Update error",
      },
      { status: 500 }
    );
  }
}

// Template route for section fetch
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await UserProfile.findOne({ user: userId });

    return NextResponse.json({
      success: true,
      profile: profile || {},
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
/*
Usage:
  PUT /api/user-profile/personal-info
  Headers: { Authorization: Bearer <token> }
  Body:
  {
    data: {
      firstName: "Jatin",
      gender: "male",
      ...
    }
  }

  GET /api/user-profile/personal-info
  Headers: { Authorization: Bearer <token> }
*/
