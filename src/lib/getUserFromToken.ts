import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function getUserFromToken(
  req: NextRequest
): Promise<string | null> {
  const cookieToken = req.cookies.get("token")?.value;
  if (!cookieToken) return null;

  try {
    const decoded: any = jwt.verify(cookieToken, process.env.TOKEN_SECRET!);
    return decoded.userId;
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}
