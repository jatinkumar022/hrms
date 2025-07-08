// app/api/shifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import Shift from "@/models/Shift";
import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";

// GET: Fetch all shifts
export async function GET(req: NextRequest) {
  await connect();
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shifts = await Shift.find();
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new shift
export async function POST(req: NextRequest) {
  await connect();
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { name, startTime, endTime, minClockIn, maxClockIn } = body;

    if (!name || !startTime || !endTime || !minClockIn || !maxClockIn) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const exists = await Shift.findOne({ name });
    if (exists) {
      return NextResponse.json(
        { error: "Shift with this name already exists" },
        { status: 409 }
      );
    }

    const shift = await Shift.create({
      name,
      startTime,
      endTime,
      minClockIn,
      maxClockIn,
    });

    return NextResponse.json({ success: true, shift });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
