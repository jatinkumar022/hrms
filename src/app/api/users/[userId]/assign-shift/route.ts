// src/app/api/users/[userId]/assign-shift/route.ts

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Shift from "@/models/Shift";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest } from "next/server";
export async function PATCH(req: NextRequest, params: { userId: string }) {
  try {
    await connect();

    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }

    if (currentUser.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const { shiftId } = await req.json();
    if (!shiftId) {
      return new Response(JSON.stringify({ error: "shiftId is required" }), {
        status: 400,
      });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return new Response(JSON.stringify({ error: "Shift not found" }), {
        status: 404,
      });
    }

    const userToUpdate = await User.findById(params.userId);
    if (!userToUpdate) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    userToUpdate.shiftId = shiftId;
    await userToUpdate.save();

    return new Response(
      JSON.stringify({
        message: "Shift assigned successfully",
        updatedUser: {
          _id: userToUpdate._id,
          email: userToUpdate.email,
          shiftId: userToUpdate.shiftId,
          role: userToUpdate.role,
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in assign-shift:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
