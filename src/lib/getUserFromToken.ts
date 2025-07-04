import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    await connect(); // ensure DB is connected
    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const user = await User.findById(decoded.userId).select(
      "role _id shiftId email username"
    );
    console.log(user);
    return user;
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}
