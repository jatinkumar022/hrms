// This file will contain the user functionality for cancelling a WFH request.

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import WorkFromHome from "@/models/WorkFromHome";
import { getUserFromToken } from "@/lib/getUserFromToken";

connect();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { wfhId: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wfhId } = params;

    const wfhRequest = await WorkFromHome.findOne({
      _id: wfhId,
      userId: user._id,
    });

    if (!wfhRequest) {
      return NextResponse.json(
        { error: "WFH request not found or you are not authorized" },
        { status: 404 }
      );
    }

    if (wfhRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending requests can be cancelled" },
        { status: 400 }
      );
    }

    await WorkFromHome.findByIdAndDelete(wfhId);

    return NextResponse.json({
      message: "WFH request cancelled successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
