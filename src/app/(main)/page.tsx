"use client";
import { cn } from "@/lib/utils";
import { MdMyLocation } from "react-icons/md";
import { Calendar } from "@geist-ui/icons";
import { TbActivityHeartbeat } from "react-icons/tb";
import Warning from "@/assets/warning-image.png";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiOutlineLogin, AiOutlineLogout } from "react-icons/ai";
import {
  IoLaptopOutline,
  IoFastFoodOutline,
  IoReturnDownBackOutline,
} from "react-icons/io5";
import DashboardOverview from "@/components/Dashboard/DashboardOverview";
import DashboardDetails from "@/components/Dashboard/DashboardDetails";
import { useEffect, useState } from "react";
import type { AttendanceStatus, DashboardData } from "@/lib/types";

const timeEntries = [
  {
    label: "Clock In",
    time: "09:51 AM",
    leftIcon: <AiOutlineLogin size={22} />,
    rightIcon: <IoLaptopOutline size={19} />,
  },
  {
    label: "Break Start",
    time: "01:00 PM",
    leftIcon: <IoFastFoodOutline size={22} />,
    rightIcon: <IoLaptopOutline size={19} />,
  },
  {
    label: "Break End",
    time: "01:30 PM",
    leftIcon: <IoReturnDownBackOutline size={22} />,
    rightIcon: <IoLaptopOutline size={19} />,
  },
  {
    label: "Clock Out",
    time: "06:00 PM",
    leftIcon: <AiOutlineLogout size={22} />,
    rightIcon: <IoLaptopOutline size={19} />,
  },
];
const DashboardData: DashboardData = {
  lateArrivals: [{ duration: "00 H : 03 M", date: "05 Jun, 2025" }],
  attendance: [
    { label: "Present", value: 11 },
    { label: "Absent", value: 0 },
    { label: "Late In", value: 1 },
    { label: "Early Out", value: 0 },
    { label: "Penalty", value: 0 },
  ],
  leaves: [
    { label: "Leave without pay", balance: "Unlimited", booked: 0 },
    { label: "Earn leave", balance: 0, booked: 0 },
    { label: "Sick leave", balance: 0.5, booked: 2.5 },
    { label: "Casual leave", balance: 0.5, booked: 4 },
  ],
  upcomingHolidays: [
    "Bakrid (Eid al-Adha) – 17 Jun, 2025",
    "Independence Day – 15 Aug, 2025",
    "Raksha Bandhan – 19 Aug, 2025",
    "Bakrid (Eid al-Adha) – 17 Jun, 2025",
    "Independence Day – 15 Aug, 2025",
    "Raksha Bandhan – 19 Aug, 2025",
    "Bakrid (Eid al-Adha) – 17 Jun, 2025",
    "Independence Day – 15 Aug, 2025",
    "Raksha Bandhan – 19 Aug, 2025",
    "Bakrid (Eid al-Adha) – 17 Jun, 2025",
    "Independence Day – 15 Aug, 2025",
    "Raksha Bandhan – 19 Aug, 2025",
  ],
  attendanceRecords: [
    { date: "2025-06-02", statuses: ["present"] as AttendanceStatus[] },
    {
      date: "2025-06-03",
      statuses: ["present", "early-out"] as AttendanceStatus[],
    },
    {
      date: "2025-06-04",
      statuses: ["present", "late-in"] as AttendanceStatus[],
    },
    {
      date: "2025-06-05",
      statuses: ["present", "late-in", "early-out"] as AttendanceStatus[],
    },
    { date: "2025-06-06", statuses: ["remote-work"] as AttendanceStatus[] },
    { date: "2025-06-09", statuses: ["holiday"] as AttendanceStatus[] },
    { date: "2025-06-10", statuses: ["absent"] as AttendanceStatus[] },
    { date: "2025-06-11", statuses: ["leave"] as AttendanceStatus[] },
    {
      date: "2025-06-12",
      statuses: ["missing-clock-out"] as AttendanceStatus[],
    },
    { date: "2025-06-13", statuses: ["present"] as AttendanceStatus[] },
    {
      date: "2025-06-14",
      statuses: ["present", "early-out"] as AttendanceStatus[],
    },
    {
      date: "2025-06-15",
      statuses: ["present", "late-in"] as AttendanceStatus[],
    },
    { date: "2025-06-16", statuses: ["holiday"] as AttendanceStatus[] },
    { date: "2025-06-17", statuses: ["absent"] as AttendanceStatus[] },
    { date: "2025-06-18", statuses: ["leave"] as AttendanceStatus[] },
    { date: "2025-06-19", statuses: ["remote-work"] as AttendanceStatus[] },
    { date: "2025-06-20", statuses: ["present"] as AttendanceStatus[] },
    {
      date: "2025-06-23",
      statuses: ["missing-clock-out"] as AttendanceStatus[],
    },
    {
      date: "2025-06-24",
      statuses: ["present", "late-in"] as AttendanceStatus[],
    },
    {
      date: "2025-06-25",
      statuses: ["present", "early-out"] as AttendanceStatus[],
    },
  ],

  chartData: [
    { date: "1", beforeBreak: 0, break: 0, afterBreak: 0, missing: 0 },
    { date: "2", beforeBreak: 0, break: 0, afterBreak: 0, missing: 0 },
    { date: "3", beforeBreak: 7, break: 1, afterBreak: 1, missing: 0 },
    { date: "4", beforeBreak: 4, break: 1, afterBreak: 4, missing: 0 },
    { date: "5", beforeBreak: 1, break: 1, afterBreak: 7, missing: 0 },
    { date: "6", beforeBreak: 3, break: 1, afterBreak: 5, missing: 0 },
    { date: "7", beforeBreak: 2, break: 1, afterBreak: 6, missing: 0 },
    { date: "8", beforeBreak: 0, break: 0, afterBreak: 0, missing: 0 },
    { date: "9", beforeBreak: 0, break: 0, afterBreak: 0, missing: 0 },
    { date: "10", beforeBreak: 4, break: 1, afterBreak: 4, missing: 0 },
    { date: "11", beforeBreak: 4, break: 1, afterBreak: 3.5, missing: 0.5 },
    { date: "12", beforeBreak: 4, break: 1, afterBreak: 4, missing: 0 },
    { date: "13", beforeBreak: 3.5, break: 1, afterBreak: 3.5, missing: 2 },
    { date: "14", beforeBreak: 4, break: 1, afterBreak: 4, missing: 0 },
    { date: "15", beforeBreak: 0, break: 0, afterBreak: 0, missing: 0 }, // Saturday (off)
    { date: "16", beforeBreak: 0, break: 0, afterBreak: 0, missing: 0 }, // Sunday (off)
    { date: "17", beforeBreak: 4, break: 1, afterBreak: 4, missing: 0 },
  ],
};

export default function Dashboard() {
  function formatDuration(ms: number): string {
    const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  function useWorkTimer(
    clockInTime: Date,
    breaks: { start: Date; end?: Date }[]
  ) {
    const [workTime, setWorkTime] = useState("00:00:00");
    const [breakTime, setBreakTime] = useState("00:00:00");
    const [netTime, setNetTime] = useState("00:00:00");

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();

        // ⏱ Total work time
        const workMs = now.getTime() - clockInTime.getTime();

        // ☕ Total break time
        const breakMs = breaks.reduce((total, brk) => {
          const end = brk.end ?? now;
          return total + (end.getTime() - brk.start.getTime());
        }, 0);

        setWorkTime(formatDuration(workMs));
        setBreakTime(formatDuration(breakMs));
        setNetTime(formatDuration(workMs - breakMs));
      }, 1000);

      return () => clearInterval(interval);
    }, [clockInTime, breaks]);

    return { workTime, breakTime, netTime };
  }

  const clockInTime = new Date("2025-06-23T10:00:00");

  const breaks = [
    {
      start: new Date("2025-06-23T10:00:00"),
      end: new Date("2025-06-23T10:55:00"),
    },
  ];

  const { workTime, breakTime, netTime } = useWorkTimer(clockInTime, breaks);
  return (
    <Tabs defaultValue="overview" className=" overflow-hidden h-full">
      <TabsList className="flex gap-3  px-1 dark:bg-black bg-white">
        <TabsTrigger
          value="overview"
          className="relative px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400
    data-[state=active]:text-blue-600
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full
    after:bg-transparent after:border-none after:outline-none data-[state=active]:after:bg-blue-600 cursor-pointer"
        >
          Overview
        </TabsTrigger>

        <TabsTrigger
          value="dashboard"
          className="relative pb-2 text-sm font-medium text-gray-500 dark:text-zinc-400 transition-all ease-in-out
        data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
        data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-blue-600 dark:data-[state=active]:after:bg-blue-400
        focus:outline-none ring-0 border-none cursor-pointer"
        >
          Dashboard
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="overview"
        className="w-full h-full overflow-hidden bg-[#e9e9e9] dark:bg-[#141414] font-normal relative "
      >
        <div className="flex w-full h-screen ">
          <div className="flex-1 overflow-y-auto mb-[111px]">
            <DashboardOverview data={DashboardData} />
          </div>

          <div className="w-[386px] h-full sticky right-0 top-0 border  shrink-0">
            <div className="absolute inset-0 z-0">
              <div
                className={cn(
                  "absolute inset-0",
                  "[background-size:20px_20px]",
                  "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
                  "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
                )}
              />

              <div className="absolute inset-0 bg-white dark:bg-black pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center pt-10">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white ">
                <Image
                  src="https://files.superworks.com/profileImages/8lFl0kUNHz.jpeg"
                  alt="Jatin Ramani"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="mt-3 text-lg font-semibold text-center text-neutral-800 dark:text-white">
                  Jatin Ramani
                </h2>
                <p className="text-zinc-500 dark:text-zinc-300  ">
                  Software Engineer | React Developer
                </p>
              </div>

              <div className="w-full max-w-sm mx-auto p-4 relative mt-2.5">
                <div className="flex items-center  justify-between mb-4">
                  <div className="absolute left-0  bg-sidebar-primary py-2.5 px-0.5 rounded-r-2xl"></div>
                  <h2 className="font-medium text-sidebar-primary ">
                    My Timing
                  </h2>
                  <span className="text-sm text-zinc-500 dark:text-zinc-300">
                    Productive Time:
                    <span className="font-medium text-gray-900 dark:text-white">
                      {netTime}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 border rounded-md mb-4 overflow-hidden bg-white dark:bg-black">
                  <div className="text-center border-r py-3 ">
                    <p className="text-green-600 font-medium mb-1">
                      Current Time
                    </p>
                    <p className="text-xl font-medium text-black dark:text-white">
                      {workTime}
                    </p>
                  </div>
                  <div className="text-center py-3 ">
                    <p className="text-red-500 font-medium mb-1">Break Time</p>
                    <p className="text-xl font-medium text-black dark:text-white">
                      {breakTime}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button className="w-full py-2 border border-[#fa584f] text-[#fa584f] font-medium bg-white dark:bg-black cursor-pointer">
                    BREAK
                  </button>
                  <button className="w-full py-2 bg-[#fa584f] text-white font-medium hover:bg-[#ff5050] cursor-pointer">
                    CLOCK OUT
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 px-3 py-2 border rounded  text-sm text-sidebar-primary bg-white dark:bg-black">
                  <MdMyLocation size={20} />
                  <span className="text-gray-700 dark:text-zinc-300">
                    Location Data Available
                  </span>
                </div>
                <div className="mt-4 rounded-md  w-fit font-sans  bg-white dark:bg-zinc-900">
                  <div className="mt-4 flex items-start bg-[#fefae8] rounded-md relative p-3">
                    <div className="mr-3 text-gray-800 dark:text-zinc-800 mt-[2px]">
                      <Calendar size={18} />
                    </div>
                    <p className="text-sm text-gray-800 dark:text-zinc-800 leading-snug">
                      <strong>Tomorrow</strong> will be the last day of this
                      period. Please make sure your timesheet is complete!
                    </p>

                    <Image
                      src={Warning}
                      alt="design"
                      className="absolute right-0 bottom-0 w-15 h-15 pointer-events-none opacity-70"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-md   font-sans ">
                  <div className="text-sidebar-primary flex gap-2 items-center">
                    <TbActivityHeartbeat size={22} />
                    <span className="dark:text-white">
                      {" "}
                      Attendance activity
                    </span>
                  </div>
                  <div className="space-y-3 mt-4 max-h-[14rem] overflow-y-auto">
                    {timeEntries.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {/* Left circular icon */}
                        <div className="flex items-center justify-center p-2 rounded-full border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300">
                          {entry.leftIcon}
                        </div>

                        {/* Time box */}
                        <div className="flex w-full items-center justify-between bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-md border border-zinc-200 dark:border-zinc-700">
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {entry.time}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {entry.label}
                            </p>
                          </div>
                          <div className="text-zinc-600 dark:text-zinc-300">
                            {entry.rightIcon}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="dashboard"
        className="w-full   bg-[#e9e9e9] dark:bg-[#141414] font-normal"
      >
        <div className="h-screen  overflow-y-auto">
          <div className=" overflow-y-auto mb-[111px]">
            <DashboardDetails />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
