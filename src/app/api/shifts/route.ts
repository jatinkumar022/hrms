// src/app/api/users/[userId]/assign-shift/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function PATCH(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  await connect();
  const { userId } = context.params;
  const body = await req.json();
  const { shiftId } = body;

  if (!shiftId) {
    return NextResponse.json({ error: "shiftId is required" }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.shiftId = shiftId;
  await user.save();

  return NextResponse.json({ success: true, message: "Shift assigned" });
}
