import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import UserProfile from "@/models/userProfile";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export async function GET() {
  await connect();
  try {
    const users = await User.find({}).select("-password");
    const userProfiles = await UserProfile.find({});

    const userProfileMap = new Map(
      userProfiles.map((p) => [p.user.toString(), p])
    );

    const employeeDirectory = users
      .map((user) => {
        const profile = userProfileMap.get(user._id.toString());
        if (!profile) return null;

        // Correctly reference joiningDate from multiple possible locations
        const joiningDate =
          profile.currentJob?.joiningDate ||
          profile.joiningDate ||
          user.joiningDate;

        let currentExperience = "N/A";
        if (joiningDate) {
          const now = dayjs();
          const start = dayjs(joiningDate);
          const diff = now.diff(start);
          const dur = dayjs.duration(diff);
          const years = dur.years();
          const months = dur.months();
          currentExperience = `${years} Year${
            years !== 1 ? "s" : ""
          } ${months} Month${months !== 1 ? "s" : ""}`;
        }

        let totalPreviousExperienceMonths = 0;
        // Correctly reference the previousExperience array
        if (profile.previousExperience) {
          profile.previousExperience.forEach((job) => {
            if (job.joiningDate && job.lastDate) {
              const start = dayjs(job.joiningDate);
              const end = dayjs(job.lastDate);
              totalPreviousExperienceMonths += end.diff(start, "month");
            }
          });
        }
        const prevExpYears = Math.floor(totalPreviousExperienceMonths / 12);
        const prevExpMonths = totalPreviousExperienceMonths % 12;
        const previousExperience = `${prevExpYears} Year${
          prevExpYears !== 1 ? "s" : ""
        } ${prevExpMonths} Month${prevExpMonths !== 1 ? "s" : ""}`;
        console.log("=================================================");
        console.log("profile", profile.contactSocialLinks);
        return {
          id: user._id,
          // Correct paths for all fields
          displayName: profile.displayName || user.username,
          jobTitle: profile.currentJob?.jobTitle || "N/A",
          department: profile.currentJob?.department || "N/A",
          officialEmail:
            profile.contactSocialLinks?.officialEmail || user.email,
          mobile: profile.contactSocialLinks?.personalMobile || "N/A",
          currentCity: profile.address?.current?.city || "N/A",
          permanentCity: profile.address?.permanent?.city || "N/A",
          joiningDate: joiningDate
            ? dayjs(joiningDate).format("DD MMM YYYY")
            : "N/A",
          currentExperience,
          previousExperience,
          profileImage: profile.profileImage || "",
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: employeeDirectory,
    });
  } catch (error: any) {
    console.error("Error fetching employee directory:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
