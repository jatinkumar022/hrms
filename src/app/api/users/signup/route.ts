import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import UserProfile from "@/models/userProfile";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { username, email, password } = requestBody;
    console.log("Received request body:", requestBody);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Create a corresponding user profile
    const newUserProfile = new UserProfile({
      user: savedUser._id,
      contact: {
        officialEmail: savedUser.email,
      },
      contactSocialLinks: {
        officialEmail: savedUser.email,
      },
      firstName: savedUser.username,
    });

    await newUserProfile.save();

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
