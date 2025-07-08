import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function GET(req: NextRequest) {
  await connect(); // Connect to the database

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const decoded: any = verify(token, process.env.TOKEN_SECRET!);
    const userId = decoded.userId; // Get user ID from the decoded token

    // Find the user and populate the shiftId field
    const user = await User.findById(userId).populate("shiftId");

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    // Return the user object, including the populated shift
    return NextResponse.json({ user });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
