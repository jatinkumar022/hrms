import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/userModel";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import duration from "dayjs/plugin/duration";
dayjs.extend(minMax);
dayjs.extend(duration);
export async function GET(req: NextRequest) {
  await connect();
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const queryMonth = url.searchParams.get("month");
    const queryYear = url.searchParams.get("year");
    const now = dayjs();
    const year = queryYear ? parseInt(queryYear) : now.year();
    const month = queryMonth ? parseInt(queryMonth) : now.month() + 1;
    const startDate = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
    const today = dayjs().isSame(startDate, "month")
      ? dayjs()
      : startDate.endOf("month");
    const userIdToQuery = currentUser._id;

    const attendanceRecords = await Attendance.find({
      userId: userIdToQuery,
      date: {
        $gte: startDate.format("YYYY-MM-DD"),
        $lte: today.format("YYYY-MM-DD"),
      },
    }).sort({ date: 1 });
    console.log(attendanceRecords);
    let workingSeconds = 0;
    let clockInDays = 0;
    let payrollPresentDays = 0;
    let odRemoteDays = 0;
    let absentDays = 0;
    const shiftNotStartDays = 0;
    let onLeaveDays = 0;
    let lateInDays = 0;
    let earlyOutDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    const holidays: string[] = []; // Fill with your holiday dates as "YYYY-MM-DD" if available

    attendanceRecords.forEach((rec) => {
      const { status, lateIn, earlyOut, workSegments } = rec;
      const date = rec.date;
      const dayOfWeek = dayjs(date).day(); // 0=Sunday, 6=Saturday
      // Calculate working seconds from workSegments
      let dayWorkSeconds = 0;
      if (workSegments && workSegments.length > 0) {
        for (const segment of workSegments) {
          if (segment.clockIn && segment.clockOut) {
            const start = dayjs(`${date}T${segment.clockIn}`);
            const end = dayjs(`${date}T${segment.clockOut}`);
            dayWorkSeconds += end.diff(start, "second");
          } else if (segment.clockIn && !segment.clockOut) {
            const start = dayjs(`${date}T${segment.clockIn}`);
            const end = dayjs();
            dayWorkSeconds += end.diff(start, "second");
          }
        }
      }
      workingSeconds += dayWorkSeconds;
      if (status === "present") {
        clockInDays++;
        payrollPresentDays++;
      }
      if (status === "remote" || status === "od") {
        odRemoteDays++;
      }
      if (status === "absent") {
        absentDays++;
      }
      if (status === "on_leave") {
        onLeaveDays++;
      }
      if (lateIn) {
        lateInDays++;
      }
      if (earlyOut) {
        earlyOutDays++;
      }
      if ((dayOfWeek === 0 || dayOfWeek === 6) && status !== "present") {
        weekendDays++;
      }
      if (holidays.includes(date)) {
        holidayDays++;
      }
    });

    function formatDuration(seconds: number) {
      const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
      return `${h}:${m}:${s}`;
    }

    const workingHours = formatDuration(workingSeconds);
    const summary = {
      workingHours,
      clockInDays,
      payrollPresentDays,
      odRemoteDays,
      absentDays,
      shiftNotStartDays, // You can implement this if you track shift start
      onLeaveDays,
      lateInDays,
      earlyOutDays,
      weekendDays,
      holidayDays,
    };
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Monthly summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
