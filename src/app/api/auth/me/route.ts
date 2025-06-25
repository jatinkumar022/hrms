import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ user: decoded });
  } catch (err) {
    console.error("JWT verification failed:", err); // 👈 see this in terminal
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
