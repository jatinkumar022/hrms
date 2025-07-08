import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    const adminId = await getUserFromToken(request);
    const adminUser = await User.findById(adminId);

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can view all users" },
        { status: 403 }
      );
    }

    const users = await User.aggregate([
      {
        $lookup: {
          from: "userprofiles",
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          profileImage: { $ifNull: ["$profile.profileImage", ""] },
          firstName: { $ifNull: ["$profile.firstName", ""] },
          lastName: { $ifNull: ["$profile.lastName", ""] },
        },
      },
    ]);

    return NextResponse.json({
      message: "Users fetched successfully",
      success: true,
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
