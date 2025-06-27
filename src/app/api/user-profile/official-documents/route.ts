import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import UserProfile from "@/models/userProfile";

connect();

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    const body = await req.json();
    const officialDocs = body.data?.documents?.official;
    if (!userId || !officialDocs) {
      return NextResponse.json(
        { success: false, message: "Missing user or data" },
        { status: 400 }
      );
    }
    const updated = await UserProfile.findOneAndUpdate(
      { user: userId },
      { $set: { "documents.official": officialDocs } },
      { new: true, runValidators: true, upsert: true }
    );
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
