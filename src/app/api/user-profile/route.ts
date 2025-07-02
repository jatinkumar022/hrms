import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import UserProfile from "@/models/userProfile";

connect();

function calculateExperience(profile: any) {
  let totalMonths = 0;

  // Previous experiences
  if (Array.isArray(profile.previousExperience)) {
    for (const exp of profile.previousExperience) {
      if (exp.joiningDate && exp.lastDate) {
        const start = new Date(exp.joiningDate);
        const end = new Date(exp.lastDate);
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        if (months > 0) totalMonths += months;
      }
    }
  }

  // Current job
  if (profile.currentJob?.joiningDate) {
    const start = new Date(profile.currentJob.joiningDate);
    const now = new Date();
    const months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    if (months > 0) totalMonths += months;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years} Year${years !== 1 ? "s" : ""}, ${months} Month${
    months !== 1 ? "s" : ""
  }`;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const profile = await UserProfile.findOne({ user: userId }).lean();
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        officialEmail: profile.contactSocialLinks?.officialEmail || "",
        mobile: profile.contactSocialLinks?.personalMobile || "",
        reportingManager: profile.currentJob?.reportingManager || "",
        joiningDate: profile.currentJob?.joiningDate || "",
        experience: calculateExperience(profile),
        previousEmployer:
          Array.isArray(profile.previousExperience) &&
          profile.previousExperience.length > 0
            ? profile.previousExperience[profile.previousExperience.length - 1]
                .companyName || ""
            : "",
        displayName:
          profile.displayName ||
          [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
          "",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Fetch error",
      },
      { status: 500 }
    );
  }
}
