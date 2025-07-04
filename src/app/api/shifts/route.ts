// app/api/shifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import Shift from "@/models/Shift";
import { connect } from "@/dbConfig/dbConfig";

// GET: Fetch all shifts
export async function GET() {
  await connect();
  const shifts = await Shift.find();
  return NextResponse.json({ shifts });
}

// POST: Create a new shift
export async function POST(req: NextRequest) {
  await connect();
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
}
