import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Shift from "@/models/Shift";
import { getUserFromToken } from "@/lib/getUserFromToken";

type Params = { params: { userId: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
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

    const user = await User.findById(params.userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    user.shiftId = shiftId;
    await user.save();

    return new Response(
      JSON.stringify({
        message: "Shift assigned successfully",
        updatedUser: {
          _id: user._id,
          email: user.email,
          shiftId: user.shiftId,
          role: user.role,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Assign shift error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
