import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

const { CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } =
  process.env;

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
  throw new Error("Missing Cloudinary API key, secret, or cloud name");
}

cloudinary.config({
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  cloud_name: CLOUDINARY_CLOUD_NAME,
});

export async function POST(request: Request) {
  // --- Start of Debugging Logs ---
  console.log("--- Cloudinary Signature Request ---");
  console.log(
    "CLOUDINARY_CLOUD_NAME available:",
    !!process.env.CLOUDINARY_CLOUD_NAME
  );
  console.log(
    "CLOUDINARY_API_KEY available:",
    !!process.env.CLOUDINARY_API_KEY
  );
  console.log(
    "CLOUDINARY_API_SECRET available:",
    !!process.env.CLOUDINARY_API_SECRET
  );
  // --- End of Debugging Logs ---

  const body = await request.json();
  const { paramsToSign } = body;

  try {
    if (!CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary API secret is not configured.");
    }
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      CLOUDINARY_API_SECRET
    );
    return NextResponse.json({
      signature,
      api_key: CLOUDINARY_API_KEY,
      cloud_name: CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
