import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This route can be used for post-upload logic, like saving the URL to a database.
    // For now, it will just confirm the user is authenticated.
    const body = await req.json();
    const { secure_url } = body;

    console.log("Received uploaded file URL:", secure_url);

    // TODO: Add logic here to save the secure_url to your user's profile or a relevant document model.

    return NextResponse.json({ success: true, message: "Upload confirmed." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Upload confirmation failed", details: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
