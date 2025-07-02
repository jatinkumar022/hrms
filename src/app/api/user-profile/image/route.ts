import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import UserProfile from "@/models/userProfile";

connect();

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    const body = await req.json();
    const profileImage = body.profileImage;
    if (!userId || !profileImage) {
      return NextResponse.json(
        { success: false, message: "Missing user or image" },
        { status: 400 }
      );
    }
    // Log for debugging
    console.log(
      "Updating profile image for userId:",
      userId,
      "with image:",
      profileImage
    );

    const updated = await UserProfile.findOneAndUpdate(
      { user: userId },
      { profileImage },
      { new: true, runValidators: true, upsert: true }
    );
    console.log("Update result:", updated);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      profileImage: updated.profileImage,
    });
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

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const updated = await UserProfile.findOneAndUpdate(
      { user: userId },
      { profileImage: "" },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      profileImage: updated.profileImage,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Delete error",
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
      profileImage: profile?.profileImage || "",
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
