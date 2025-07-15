import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attendance from "@/models/Attendance";
import Leave from "@/models/Leave";
import WorkFromHome from "@/models/WorkFromHome";
import Holiday from "@/models/Holiday";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from "@/models/userModel";
import { getUserFromToken } from "@/lib/getUserFromToken";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import minMax from "dayjs/plugin/minMax";
import duration from "dayjs/plugin/duration";
dayjs.extend(minMax);
dayjs.extend(duration);
dayjs.extend(isSameOrBefore);

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
    const endDate = startDate.endOf("month");
    const processEndDate = dayjs.min(endDate, now) ?? now;
    const userIdToQuery = currentUser._id;
    // Fetch all necessary data for the month
    const attendanceRecords = await Attendance.find({
      userId: userIdToQuery,
      date: {
        $gte: startDate.format("YYYY-MM-DD"),
        $lte: processEndDate.format("YYYY-MM-DD"),
      },
    }).lean();

    const leaveRecords = await Leave.find({
      userId: userIdToQuery,
      status: "approved",
      $or: [
        {
          startDate: {
            $lte: processEndDate.format("YYYY-MM-DD"),
            $gte: startDate.format("YYYY-MM-DD"),
          },
        },
        {
          endDate: {
            $lte: processEndDate.format("YYYY-MM-DD"),
            $gte: startDate.format("YYYY-MM-DD"),
          },
        },
        {
          startDate: { $lte: startDate.format("YYYY-MM-DD") },
          endDate: { $gte: processEndDate.format("YYYY-MM-DD") },
        },
      ],
    }).lean();
    const wfhRecords = await WorkFromHome.find({
      userId: userIdToQuery,
      status: "approved",
      $or: [
        {
          startDate: {
            $lte: processEndDate.format("YYYY-MM-DD"),
            $gte: startDate.format("YYYY-MM-DD"),
          },
        },
        {
          endDate: {
            $lte: processEndDate.format("YYYY-MM-DD"),
            $gte: startDate.format("YYYY-MM-DD"),
          },
        },
        {
          startDate: { $lte: startDate.format("YYYY-MM-DD") },
          endDate: { $gte: processEndDate.format("YYYY-MM-DD") },
        },
      ],
    }).lean();
    const holidayRecords = await Holiday.find({
      date: {
        $gte: startDate.format("YYYY-MM-DD"),
        $lte: endDate.format("YYYY-MM-DD"),
      },
    }).lean();

    // Create maps for quick lookup
    const attendanceMap = new Map(attendanceRecords.map((r) => [r.date, r]));
    const holidayMap = new Map(holidayRecords.map((h) => [h.date, h]));
    const leaveMap = new Map();
    leaveRecords.forEach((l) => {
      let current = dayjs(l.startDate);
      const end = dayjs(l.endDate);
      while (current.isSameOrBefore(end)) {
        leaveMap.set(current.format("YYYY-MM-DD"), {
          leaveType: l.leaveType,
          session: l.session,
        });
        current = current.add(1, "day");
      }
    });
    const wfhSet = new Set();
    wfhRecords.forEach((w) => {
      let current = dayjs(w.startDate);
      const end = dayjs(w.endDate);
      while (current.isSameOrBefore(end)) {
        wfhSet.add(current.format("YYYY-MM-DD"));
        current = current.add(1, "day");
      }
    });
    let workingSeconds = 0;
    let actualWorkingSeconds = 0;
    let breakSeconds = 0;
    let clockInDays = 0;
    let payrollPresentDays = 0;
    let odRemoteDays = 0;
    let absentDays = 0;
    let onLeaveDays = 0;
    let lateInDays = 0;
    let earlyOutDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;

    let currentDate = startDate;
    while (currentDate.isSameOrBefore(processEndDate)) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      const dayOfWeek = currentDate.day(); // 0=Sunday, 6=Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const attendance = attendanceMap.get(dateStr);
      const isHoliday = holidayMap.has(dateStr);
      const leaveInfo = leaveMap.get(dateStr);
      const isWfh = wfhSet.has(dateStr);

      let dayIsWorkDay = false;
      let dayIsPaidLeave = false;
      let leaveValue = 0;

      if (attendance) {
        if (["present", "remote", "od"].includes(attendance.status)) {
          dayIsWorkDay = true;
          clockInDays++;

          if (attendance.status === "remote" || attendance.status === "od") {
            odRemoteDays++;
          }
          if (attendance.lateIn) {
            lateInDays++;
          }
          if (attendance.earlyOut) {
            earlyOutDays++;
          }

          let dayWorkingSeconds = 0;
          let dayActualWorkSeconds = 0;
          if (attendance.workSegments && attendance.workSegments.length > 0) {
            let firstClockIn, lastClockOut;
            for (const segment of attendance.workSegments) {
              if (segment.clockIn) {
                const start = dayjs(`${dateStr}T${segment.clockIn}`);
                if (!firstClockIn || start.isBefore(firstClockIn)) {
                  firstClockIn = start;
                }
                let end;
                if (segment.clockOut) {
                  end = dayjs(`${dateStr}T${segment.clockOut}`);
                } else if (dateStr === now.format("YYYY-MM-DD")) {
                  end = now;
                }
                if (end) {
                  dayActualWorkSeconds += end.diff(start, "second");
                  if (!lastClockOut || end.isAfter(lastClockOut)) {
                    lastClockOut = end;
                  }
                }
              }
            }
            if (firstClockIn && lastClockOut) {
              dayWorkingSeconds = lastClockOut.diff(firstClockIn, "second");
            }
          }
          actualWorkingSeconds += dayActualWorkSeconds;
          workingSeconds += dayWorkingSeconds;
          breakSeconds += dayWorkingSeconds - dayActualWorkSeconds;
        }
      }

      if (leaveInfo) {
        leaveValue =
          leaveInfo.session === "full_day" ? 1 : leaveInfo.session ? 0.5 : 0;
        if (leaveValue > 0) {
          onLeaveDays += leaveValue;
          if (leaveInfo.leaveType !== "lop") {
            dayIsPaidLeave = true;
          }
        }
      }

      // Determine daily status for payroll and absence
      if (dayIsWorkDay || isWfh) {
        payrollPresentDays += 1;
      } else if (dayIsPaidLeave) {
        payrollPresentDays += leaveValue;
      }

      if (isHoliday) {
        holidayDays++;
      } else if (isWeekend) {
        weekendDays++;
      } else if (!dayIsWorkDay && !isWfh && leaveValue < 1) {
        absentDays += 1 - leaveValue;
      }

      currentDate = currentDate.add(1, "day");
    }

    function formatDuration(seconds: number) {
      if (isNaN(seconds) || seconds < 0) {
        return "00:00:00";
      }
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
    const actualWorkingTime = formatDuration(actualWorkingSeconds);
    const breakHours = formatDuration(breakSeconds);
    const summary = {
      workingHours,
      actualWorkingTime,
      breakHours,
      clockInDays,
      payrollPresentDays,
      odRemoteDays,
      absentDays,
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
