import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import { getUserFromToken } from "@/lib/getUserFromToken";
import User from "@/models/userModel";
import Shift from "@/models/Shift";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lateInRecords = await Attendance.find({
      userId: user.id,
      lateIn: true,
    })
      .populate({ path: "userId", model: User, select: "username" })
      .populate({ path: "shiftId", model: Shift, select: "name" })
      .sort({ date: -1 })
      .lean();

    const data = lateInRecords.map((record) => {
      const {
        userId,
        shiftId,
        status,
        lateIn,
        earlyOut,
        lateInReason,
        workSegments,
        breakSegments,
        ...rest
      } = record;

      return {
        ...rest,
        user: userId,
        shift: shiftId,
        attendance: {
          status,
          lateIn,
          earlyOut,
          lateInReason,
          workSegments,
          breaks: breakSegments,
        },
      };
    });

    return NextResponse.json({
      message: "Late-in records fetched successfully",
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
