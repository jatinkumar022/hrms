"use client";
import { cn } from "@/lib/utils";
import { MdMyLocation } from "react-icons/md";
import { TbActivityHeartbeat } from "react-icons/tb";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiOutlineLogin, AiOutlineLogout } from "react-icons/ai";
import { IoFastFoodOutline, IoReturnDownBackOutline } from "react-icons/io5";
import DashboardOverview from "@/components/Dashboard/DashboardOverview";
import DashboardDetails from "@/components/Dashboard/DashboardDetails";
import type { AttendanceStatus, DashboardData } from "@/lib/types";
import { useState, useMemo } from "react";
import AttendanceReasonDialog from "@/components/Dashboard/AttendanceReasonDialog";
import Link from "next/link";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { parseDurationToSeconds } from "@/lib/attendanceHelpers";
import { useAttendance } from "@/hooks/useAttendance";
import { Toaster, toast } from "sonner";
import React from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import ButtonLoader from "@/components/loaders/ButtonLoader";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchProfileImage } from "@/redux/slices/profileImageSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { fetchUserBasicInfo } from "@/redux/slices/userBasicInfoSlice";

dayjs.extend(minMax);

interface WorkSegmentType {
  clockIn: string;
  clockOut?: string;
  duration?: string;
  productiveDuration?: string;
}

interface BreakType {
  start: string;
  end?: string;
  duration?: string;
  reason?: string;
}

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
  const {
    report,
    workTime,
    breakTime,
    netTime,
    clockIn,
    breakStart,
    breakEnd,
    isLoading,
    isReportLoading,
  } = useAttendance();
  const { user } = useAppSelector((state) => state.login);
  const userName = user?.username || "";
  const profileImage = useAppSelector(
    (state) => state.profileImage.profileImage
  );
  const { info: userBasicInfo } = useAppSelector(
    (state) => state.userBasicInfo
  );
  const { loading: loadingLocation, getLocation } = useGeolocation();
  const isMobile = useIsMobile();

  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [isEndBreakReasonDialogOpen, setIsEndBreakReasonDialogOpen] =
    useState(false);
  const [isStartBreakReasonDialogOpen, setIsStartBreakReasonDialogOpen] =
    useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  React.useEffect(() => {
    if (isReportLoading && isInitialLoad) {
      // It's loading, do nothing
    } else if (!isReportLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isReportLoading, isInitialLoad]);
  React.useEffect(() => {
    dispatch(fetchProfileImage());
    dispatch(fetchUserBasicInfo());
  }, []);

  const dispatch = useAppDispatch();
  const handleAction = async (action: () => Promise<any>) => {
    const result = await action();
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(result.payload.message || "Action successful!");
    } else {
      toast.error(result.payload || "An error occurred.");
    }
  };

  const attendance = report?.attendance;
  const shift = report?.shift;

  const hasAnyClockIn =
    (attendance?.workSegments && attendance.workSegments.length > 0) || false;
  const isClockedInCurrently = attendance?.workSegments?.some(
    (segment: WorkSegmentType) => !segment.clockOut
  );
  const isBreakActive = attendance?.breaks?.some((b: BreakType) => !b.end);
  const isClockedOutForToday = hasAnyClockIn && !isClockedInCurrently;

  // Generate dynamic attendance activities
  const activities = useMemo(() => {
    if (!attendance || (!attendance.workSegments && !attendance.breaks)) {
      return [];
    }

    const generatedActivities: {
      time: string;
      label: string;
      icon: React.ReactElement;
    }[] = [];

    // Process work segments
    attendance.workSegments?.forEach((segment: WorkSegmentType) => {
      if (segment.clockIn) {
        const dateTimeString = `${report?.date}T${segment.clockIn}`;
        const formattedTime = dayjs(dateTimeString).format("hh:mm A");
        generatedActivities.push({
          time: formattedTime,
          label: "Clock In",
          icon: <AiOutlineLogin size={22} />,
        });
      }
      if (segment.clockOut) {
        const dateTimeString = `${report?.date}T${segment.clockOut}`;
        const formattedTime = dayjs(dateTimeString).format("hh:mm A");
        generatedActivities.push({
          time: formattedTime,
          label: "Clock Out",
          icon: <AiOutlineLogout size={22} />,
        });
      }
    });

    // Process breaks
    attendance.breaks?.forEach((b: BreakType) => {
      if (b.start) {
        const dateTimeString = `${report?.date}T${b.start}`;
        const formattedTime = dayjs(dateTimeString).format("hh:mm A");
        generatedActivities.push({
          time: formattedTime,
          label: "Break Start",
          icon: <IoFastFoodOutline size={22} />,
        });
      }
      if (b.end) {
        const dateTimeString = `${report?.date}T${b.end}`;
        const formattedTime = dayjs(dateTimeString).format("hh:mm A");
        generatedActivities.push({
          time: formattedTime,
          label: "Break End",
          icon: <IoReturnDownBackOutline size={22} />,
        });
      }
    });

    return generatedActivities.sort((a, b) => {
      const timeA = dayjs(`${report?.date}T${a.time}`, "YYYY-MM-DDTHH:mm A");
      const timeB = dayjs(`${report?.date}T${b.time}`, "YYYY-MM-DDTHH:mm A");
      return timeA.diff(timeB);
    });
  }, [attendance, report?.date]);

  const onClockInAttempt = async () => {
    const currentLocation = await getLocation();

    if (!currentLocation) {
      toast.error("Location not available. Please allow location access.");
      return;
    }

    const now = dayjs();
    const maxClockInTime = dayjs(`${report?.date}T${shift?.maxClockIn}`);

    const isLate = now.isAfter(maxClockInTime);

    if (isLate) {
      setIsReasonDialogOpen(true);
    } else {
      handleAction(() => clockIn({ reason: "", location: currentLocation }));
    }
  };

  const handleLateClockIn = async (reason: string) => {
    if (reason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters long.");
      return;
    }

    const currentLocation = await getLocation();

    if (!currentLocation) {
      toast.error(
        "Location not available. Please allow location access or try again."
      );
      return;
    }

    await handleAction(() => clockIn({ reason, location: currentLocation }));
    setIsReasonDialogOpen(false);
  };

  const onEndBreakAttempt = async () => {
    const currentLocation = await getLocation();

    if (!currentLocation) {
      toast.error("Location not available. Please allow location access.");
      return;
    }

    const now = dayjs();
    const activeBreak = attendance?.breaks?.find((b: BreakType) => !b.end);

    if (!activeBreak) {
      toast.error("No active break to end.");
      return;
    }

    // Calculate total break time today to check for excessive break
    let totalBreakSecondsToday = 0;
    attendance?.breaks?.forEach((brk: BreakType) => {
      if (brk.duration !== undefined) {
        totalBreakSecondsToday += parseDurationToSeconds(brk.duration);
      } else if (brk.start && !brk.end) {
        const breakStartTime = dayjs(`${report?.date}T${brk.start}`);
        totalBreakSecondsToday += now.diff(breakStartTime, "second");
      }
    });

    // Assume a break limit for demonstration (e.g., 60 minutes = 3600 seconds)
    const breakLimitSeconds = 3600; // 1 hour
    const isExcessiveBreak = totalBreakSecondsToday >= breakLimitSeconds;

    if (isExcessiveBreak) {
      setIsEndBreakReasonDialogOpen(true);
    } else {
      handleAction(() => breakEnd({ reason: "", location: currentLocation }));
    }
  };

  const handleEndBreakWithReason = async (reason: string) => {
    if (reason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters long.");
      return;
    }

    const currentLocation = await getLocation();

    if (!currentLocation) {
      toast.error(
        "Location not available. Please allow location access or try again."
      );
      return;
    }

    await handleAction(() => breakEnd({ reason, location: currentLocation }));
    setIsEndBreakReasonDialogOpen(false);
  };

  const onStartBreakAttempt = async () => {
    const currentLocation = await getLocation();

    if (!currentLocation) {
      toast.error("Location not available. Please allow location access.");
      return;
    }

    const activeBreak = attendance?.breaks?.find((b: BreakType) => !b.end);
    if (activeBreak) {
      toast.error("Break already active. Please end your current break first.");
      return;
    }
    const totalBreakSoFar = attendance?.breakDuration
      ? parseDurationToSeconds(attendance.breakDuration)
      : 0;
    const breakLimit = 3600; // 1 hour
    const requiresReason = totalBreakSoFar >= breakLimit;

    if (requiresReason) {
      setIsStartBreakReasonDialogOpen(true);
    } else {
      handleAction(() => breakStart({ reason: "", location: currentLocation }));
    }
  };

  const handleStartBreakWithReason = async (reason: string) => {
    if (reason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters long.");
      return;
    }

    const currentLocation = await getLocation();

    if (!currentLocation) {
      toast.error(
        "Location not available. Please allow location access or try again."
      );
      return;
    }

    await handleAction(() => breakStart({ reason, location: currentLocation }));
    setIsStartBreakReasonDialogOpen(false);
  };

  const hasAttendance =
    (attendance?.workSegments && attendance.workSegments.length > 0) || false;

  const shouldShowClockInButton =
    !hasAttendance || (!isClockedInCurrently && isClockedOutForToday);
  return (
    <>
      <FullPageLoader show={isInitialLoad} />
      <Tabs defaultValue="overview" className="md:h-full md:flex md:flex-col">
        <TabsList className="flex gap-3 sticky top-0 px-1 dark:bg-black bg-white z-40">
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
          className="w-full bg-white dark:bg-[#141414] font-normal relative md:h-full md:overflow-hidden"
        >
          <div className="flex w-full flex-col-reverse md:flex-row md:h-full">
            <div className="flex-1 md:overflow-y-auto">
              <DashboardOverview data={DashboardData} />
            </div>

            <div className="w-full relative shrink-0 border-b md:w-[380px] md:border-l md:border-b-0 md:ml-1 md:h-full">
              {!isMobile && (
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
              )}

              <div className="relative z-10 flex flex-col items-center pt-10 md:h-full">
                <div className="max-w-24 w-24 h-24 max-h-24 min-h-max rounded-full overflow-hidden border-4 border-white ">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <InitialsAvatar
                      name={userName}
                      className="w-full h-full text-4xl"
                    />
                  )}
                </div>
                <div className="mt-3">
                  <h2 className=" text-lg font-semibold text-center text-neutral-800 dark:text-white">
                    {userBasicInfo?.displayName || user?.username}
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-300  ">
                    {userBasicInfo?.jobTitle || user?.role || "Employee"}
                  </p>
                </div>

                <div className="relative mt-2.5 flex w-full flex-1 flex-col p-4 md:min-h-0">
                  <div className="mb-4 flex items-center  justify-between">
                    <div className="absolute left-0  bg-sidebar-primary py-2.5 px-0.5 rounded-r-2xl"></div>
                    <h2 className="font-medium text-sidebar-primary ">
                      My Timing
                    </h2>
                    <span className="text-sm font-medium text-[#1f2125d5] dark:text-zinc-300">
                      Productive Time:
                      <span className="font-bold text-gray-900 dark:text-white">
                        {netTime}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 border py-3 border-[orange] mb-4 overflow-hidden bg-white dark:bg-black">
                    <div className="text-center border-r border-[orange]  ">
                      <p className="text-green-600 font-bold mb-1">
                        Current Time
                      </p>
                      <p className="text-xl font-bold text-[#1f2125d5] dark:text-white">
                        {workTime}
                      </p>
                    </div>
                    <div className="text-center ">
                      <p className="text-[#ff6961] font-bold mb-1">
                        Break Time
                      </p>
                      <p className="text-xl font-bold text-[#1f2125d5] dark:text-white">
                        {breakTime}
                      </p>
                    </div>
                  </div>
                  {shouldShowClockInButton ? (
                    // {true ? (
                    <button
                      onClick={onClockInAttempt}
                      disabled={
                        isLoading || isClockedInCurrently || loadingLocation
                      }
                    >
                      <div className="w-full py-2 bg-[#25bb3e] border-2 border-[#25bb3e] text-white font-medium hover:bg-[#25bb3ef1] cursor-pointer mb-4 flex justify-center items-center">
                        {isLoading ? <ButtonLoader /> : "CLOCK IN"}
                      </div>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {!isBreakActive ? (
                        <>
                          <button
                            onClick={onStartBreakAttempt}
                            disabled={
                              isLoading ||
                              !isClockedInCurrently ||
                              isBreakActive ||
                              loadingLocation
                            }
                          >
                            <div className="w-full py-2 border-2 border-[#ff6961] dark:border-[#f13b3b] text-[#ff6961] dark:text-[#f13b3b] font-medium bg-white dark:bg-black cursor-pointer flex justify-center items-center">
                              {isLoading ? (
                                <ButtonLoader color="#ff6961" />
                              ) : (
                                "BREAK"
                              )}
                            </div>
                          </button>

                          <Link href="/clock-out">
                            <div className="w-full text-center py-2 bg-[#ff6961] dark:bg-[#f13b3b] text-white font-medium hover:bg-[#ff5050] cursor-pointer flex justify-center items-center border-2 border-[#ff6961] dark:border-[#f13b3b]">
                              CLOCK OUT
                            </div>
                          </Link>
                        </>
                      ) : (
                        <>
                          <button
                            className="w-full py-2 col-span-2 border-2 border-[#2ccc47] bg-[#2ccc47] font-medium text-white cursor-pointer mb-4 flex justify-center items-center"
                            onClick={onEndBreakAttempt}
                            disabled={
                              isLoading || !isBreakActive || loadingLocation
                            }
                          >
                            {isLoading ? (
                              <ButtonLoader color="#2ccc47" />
                            ) : (
                              "End Break"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 p-3 border rounded  text-sm text-sidebar-primary bg-white dark:bg-black border-[#233d7075]">
                    <MdMyLocation size={20} />
                    <span className="text-gray-700 dark:text-zinc-300">
                      Location Data Available
                    </span>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col font-sans md:min-h-0">
                    <div className="flex items-center gap-2 text-sidebar-primary">
                      <TbActivityHeartbeat size={22} />
                      <span className="dark:text-white">
                        {" "}
                        Attendance activity
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 md:flex-1 md:overflow-y-auto">
                      {activities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex items-center justify-center rounded-full border border-zinc-300 p-2 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
                            {activity.icon}
                          </div>

                          <div className="flex w-full items-center justify-between bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-md border border-zinc-200 dark:border-zinc-700">
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {activity.time}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {activity.label}
                              </p>
                            </div>
                            <div className="text-zinc-600 dark:text-zinc-300">
                              {/* {activity.rightIcon} */}
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
          className="w-full bg-[#e9e9e9] dark:bg-[#141414] font-normal"
        >
          <div className="">
            <DashboardDetails />
          </div>
        </TabsContent>
        <Toaster /> {/* Toast container for the whole page */}
        {/* Late Clock-In Reason Dialog (using reusable component) */}
        <AttendanceReasonDialog
          open={isReasonDialogOpen}
          onOpenChange={setIsReasonDialogOpen}
          title="Reason Required for Late Clock-In"
          label={`You are clocking in after your shift's maximum clock-in time (${shift?.maxClockIn}). Please provide a reason.`}
          buttonText="Submit Reason and Clock In"
          onSubmit={handleLateClockIn}
        />
        {/* End Break Reason Dialog (using reusable component) */}
        <AttendanceReasonDialog
          open={isEndBreakReasonDialogOpen}
          onOpenChange={setIsEndBreakReasonDialogOpen}
          title="Reason Required for Ending Break"
          label="You are ending a break that has exceeded 1 hour. Please provide a reason."
          buttonText="Submit Reason and End Break"
          onSubmit={handleEndBreakWithReason}
        />
        {/* Start Break Reason Dialog (using reusable component) */}
        <AttendanceReasonDialog
          open={isStartBreakReasonDialogOpen}
          onOpenChange={setIsStartBreakReasonDialogOpen}
          title="Reason Required for Starting Break"
          label="You are starting a break that would exceed 1 hour. Please provide a reason."
          buttonText="Submit Reason and Start Break"
          onSubmit={handleStartBreakWithReason}
        />
      </Tabs>
    </>
  );
}
