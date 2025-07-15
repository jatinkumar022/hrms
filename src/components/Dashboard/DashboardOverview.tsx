"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaHandshakeAngle, FaPersonWalkingLuggage } from "react-icons/fa6";
import { LuStethoscope } from "react-icons/lu";
import { MdDirectionsRun, MdKeyboardArrowRight } from "react-icons/md";
import { RiFlightTakeoffFill } from "react-icons/ri";
import Notask from "@/assets/no-tasks.svg";
import NoUpcommingHoliday from "@/assets/no-upcoming-holiday.svg";
import NoIncrement from "@/assets/no-increment.svg";
import Image from "next/image";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { MdOutlineDirectionsRun } from "react-icons/md";
import { PiClockCountdownFill } from "react-icons/pi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import DailyTimeChart from "./Chart";
import Link from "next/link";
import { AttendanceStatus } from "@/lib/types";
import type { DashboardData } from "@/lib/types";

export interface LateArrival {
  /** e.g. "00 H : 03 M" */
  duration: string;
  /** e.g. "05 Jun, 2025" */
  date: string;
}

export interface AttendanceItem {
  label: string;
  value: number | string;
}

export interface LeaveItem {
  label: string;
  balance: number | string;
  booked: number | string;
}

const leaveIconMap = {
  "Leave without pay": <RiFlightTakeoffFill className="text-green-600" />,
  "Earn leave": <FaHandshakeAngle className="text-green-600" />,
  "Sick leave": <LuStethoscope className="text-yellow-600" />,
  "Casual leave": <FaPersonWalkingLuggage className="text-rose-600" />,
};

/**
 * One attendance record for a single calendar day.
 */
export interface AttendanceRecord {
  /** ISO‑8601 date string, e.g. "2025-06-05". */
  date: string;
  /** One or more statuses applicable to the day. */
  statuses: AttendanceStatus[];
}

const statusStyles: Record<AttendanceStatus, string> = {
  present: "bg-green-600",
  holiday: "bg-cyan-500",
  absent: "bg-red-400",
  leave: "bg-purple-500",
  "remote-work": "bg-orange-400",
  "missing-clock-out": "bg-neutral-500",
  "late-in": "text-red-400",
  "early-out": "text-orange-400",
  weekend: "bg-blue-500",
};
const attendanceLegend: Record<AttendanceStatus, string> = {
  present: "Present",
  holiday: "Holiday",
  absent: "Absent",
  leave: "Leave",
  "remote-work": "Remote Work",
  "missing-clock-out": "Missing Clock Out",
  "late-in": "Late In",
  "early-out": "Early Out",
  weekend: "Weekend",
};
const weekdayLabels = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
export default function DashboardOverview({ data }: { data: DashboardData }) {
  const month = new Date();

  const recordMap = React.useMemo(() => {
    const map: Record<string, AttendanceStatus[]> = {};
    data.attendanceRecords.forEach(({ date, statuses }) => {
      map[date] = statuses;
    });
    return map;
  }, [data.attendanceRecords]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const leadingBlanks = getDay(startOfMonth(month));

  return (
    <div className="min-h-screen  p-4">
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 mb-5">
        <Card className="rounded-xl bg-white dark:bg-[#070707]">
          <CardContent>
            <DailyTimeChart data={data.chartData} />
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-white dark:bg-[#070707]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-white">
              Notice Board (0)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
              <Image
                src={NoUpcommingHoliday}
                alt="No Holidays"
                className="w-36 h-36 object-contain"
              />
              <p className="mb-3">No Notice Found</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="custom-grid">
        <Card className="rounded-xl bg-white dark:bg-[#070707]">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-white">
              Attendance Calendar
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-base text-blue-500 cursor-pointer px-3 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                ?
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {Object.entries(attendanceLegend).map(([status, label]) => (
                  <DropdownMenuItem
                    key={status}
                    className="flex items-center gap-2"
                  >
                    {status === "late-in" && (
                      <MdOutlineDirectionsRun className="text-[#f13b3b] text-lg" />
                    )}
                    {status === "early-out" && (
                      <PiClockCountdownFill className="text-orange-400 text-lg" />
                    )}
                    {status !== "late-in" && status !== "early-out" && (
                      <span
                        className={`w-3 h-3 rounded-full inline-block ${
                          statusStyles[status as AttendanceStatus]
                        }`}
                      />
                    )}
                    <span className="text-sm">{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-0.5 pt-1  text-sm">
              {/* Week‑day labels */}
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="text-center text-zinc-500 dark:text-zinc-400 font-medium pb-2 tracking-wide"
                >
                  {label}
                </div>
              ))}

              {/* Leading blank cells */}
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {/* Actual calendar days */}
              {daysInMonth.map((day) => {
                const iso = format(day, "yyyy-MM-dd");
                const statuses = recordMap[iso] ?? [];
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                const dotStyle =
                  statuses.length > 0
                    ? statusStyles[statuses[0]]
                    : isWeekend
                    ? statusStyles.weekend
                    : "";

                return (
                  <div
                    key={iso}
                    className="relative h-12 flex items-center justify-center flex-col gap-2"
                  >
                    {/* Day number */}
                    <div className="  text-xs text-zinc-400">
                      {day.getDate()}
                    </div>
                    <div className="flex items-center h-3 gap-1">
                      {statuses.includes("late-in") && (
                        <span
                          title="Late In"
                          className=" text-[#f13b3b] text-xs leading-none"
                        >
                          <MdOutlineDirectionsRun />
                        </span>
                      )}
                      {statuses.includes("early-out") && (
                        <span
                          title="Late In"
                          className=" text-orange-400 text-xs leading-none"
                        >
                          <PiClockCountdownFill />
                        </span>
                      )}

                      {dotStyle && (
                        <span
                          title={statuses[0]}
                          className={`w-2 h-2 rounded-full ${dotStyle}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl bg-white dark:bg-[#070707] group">
          <CardHeader className="flex items-center justify-between pb-2 ">
            <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-white">
              Late arrivals ({data.lateArrivals.length})
            </CardTitle>
            <Link
              href="#"
              className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
            >
              View <MdKeyboardArrowRight size={22} className="mt-0.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {data.lateArrivals.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-3">
                <Image
                  src={Notask}
                  alt="No Late Arrivals"
                  className="w-28 h-28 object-contain mb-2"
                />
                <p className=" text-sm">No late arrivals this month</p>
              </div>
            ) : (
              data.lateArrivals.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-1 text-zinc-800 dark:text-white"
                >
                  <span className="p-2 rounded-md bg-blue-100 text-blue-600">
                    <MdDirectionsRun size={20} />
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold">{item.duration}</p>
                    <p className="text-xs text-muted-foreground">
                      Late In time
                    </p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* My Attendance ----------------------------------------------------- */}
        <Card className="rounded-2xl bg-white dark:bg-[#070707] shadow-sm group">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-zinc-800 dark:text-white">
              My Attendance
            </CardTitle>
            <Link
              href="#"
              className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
            >
              View <MdKeyboardArrowRight size={22} className="mt-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            {data.attendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                <Image
                  src={Notask}
                  alt="No Attendance"
                  className="w-24 h-24 object-contain mb-3"
                />
                <p className="text-sm">No attendance data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.attendance.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Leave ---------------------------------------------------------- */}
        <Card className="rounded-xl bg-white dark:bg-[#070707] group">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-white">
              My Leave
            </CardTitle>
            <Link
              href="#"
              className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
            >
              View <MdKeyboardArrowRight size={22} className="mt-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="  text-sm">
            {data.leaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-3">
                <Image
                  src={NoIncrement}
                  alt="No Leave Data"
                  className="w-36 h-36 object-contain"
                />
                <p className=" text-sm">No leave records found</p>
              </div>
            ) : (
              data.leaves.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-4 py-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  {/* Icon + Label */}
                  <div className="flex items-center gap-4">
                    <div className="text-2xl text-green-600">
                      {leaveIconMap[item.label as keyof typeof leaveIconMap]}
                    </div>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {item.label}
                    </span>
                  </div>

                  {/* Balance + Booked */}
                  <div className="flex items-center divide-x divide-zinc-200 dark:divide-zinc-700 ml-auto text-xs">
                    <div className="pr-4 text-right">
                      <p className="text-muted-foreground">Balance</p>
                      <p className="font-semibold text-green-600">
                        {item.balance}
                      </p>
                    </div>
                    <div className="pl-4 text-right">
                      <p className="text-muted-foreground">Booked</p>
                      <p className="font-semibold text-zinc-800 dark:text-white">
                        {item.booked}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Holidays ------------------------------------------------- */}
        <Card className="rounded-xl bg-white dark:bg-[#070707] group">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-white">
              Upcoming Holidays ({data.upcomingHolidays.length})
            </CardTitle>
            <Link
              href="#"
              className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
            >
              View <MdKeyboardArrowRight size={22} className="mt-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="min-h-[150px] max-h-[250px] overflow-auto text-sm">
            {data.upcomingHolidays.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground">
                <Image
                  src={NoUpcommingHoliday}
                  alt="No Holidays"
                  className="w-36 h-36 object-contain"
                />
                <p className="mb-3">No upcoming holiday for the month</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.upcomingHolidays.map((h, idx) => {
                  const [name, date] = h.split(" – ");
                  return (
                    <li
                      key={idx}
                      className="flex items-start gap-3 bg-zinc-100 dark:bg-[#111111] rounded-md px-3 py-2"
                    >
                      <div className="mt-1 text-blue-500">
                        <RiFlightTakeoffFill size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-800 dark:text-white">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
