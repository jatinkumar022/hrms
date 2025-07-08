"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { FaClipboardList } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { useAttendance } from "@/hooks/useAttendance";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import {
  secondsToDuration,
  parseDurationToSeconds,
} from "@/lib/attendanceHelpers";
import { useState } from "react";
import AttendanceReasonDialog from "@/components/Dashboard/AttendanceReasonDialog";
import { Toaster, toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";
import FullPageLoader from "@/components/loaders/FullPageLoader";

dayjs.extend(minMax);

export default function FinalOutTimePage() {
  const {
    report,
    workTime: totalWorkTime,
    breakTime: totalBreakTime,
    netTime: productiveTime,
    clockOut,
    isLoading,
    isError,
    errorMessage,
  } = useAttendance();

  const {
    location,
    loading: loadingLocation,
    error: locationError,
    getLocation,
  } = useGeolocation();

  const [isEarlyClockOutReasonDialogOpen, setIsEarlyClockOutReasonDialogOpen] =
    useState(false);

  const attendance = report?.attendance;

  // Required work and productive time (defined at component level)
  const requiredTotalWorkSeconds = 9 * 3600; // 9 hours
  const requiredProductiveWorkSeconds = 8 * 3600; // 8 hours

  const statusBarsData = [
    {
      label: "Total Time",
      time: totalWorkTime,
      color: "text-green-600",
    },
    {
      label: "Productive Time",
      time: productiveTime,
      color: "text-orange-500",
    },
    { label: "Break Time", time: totalBreakTime, color: "text-yellow-500" },
  ];

  const handleAction = async (action: () => Promise<any>) => {
    const result = await action();
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(result.payload.message || "Action successful!");
    } else {
      toast.error(result.payload || "An error occurred.");
    }
  };

  const onClockOutAttempt = () => {
    // First, try to get the location
    getLocation();

    // The actual clock-out logic will be handled in a useEffect or after location is available
    // For now, we'll let the user know if location is still loading or has an error.
    if (loadingLocation) {
      toast.info("Getting your current location...");
      return;
    }
    if (locationError) {
      toast.error(`Location Error: ${locationError}`);
      return;
    }
    if (!location) {
      toast.error("Location not available. Please try again.");
      return;
    }

    const now = dayjs();
    let totalDailyWorkSeconds = 0;
    let totalDailyProductiveSeconds = 0;
    // let totalDailyBreakSeconds = 0;

    if (attendance?.workSegments) {
      for (const segment of attendance.workSegments) {
        const segmentClockInDate = dayjs(`${report?.date}T${segment.clockIn}`);
        let segmentEndTargetDate;

        if (segment.clockOut) {
          segmentEndTargetDate = dayjs(`${report?.date}T${segment.clockOut}`);
          totalDailyWorkSeconds += parseDurationToSeconds(
            segment.duration || "00:00:00"
          );
          totalDailyProductiveSeconds += parseDurationToSeconds(
            segment.productiveDuration || "00:00:00"
          );
        } else {
          segmentEndTargetDate = now;
          totalDailyWorkSeconds += segmentEndTargetDate.diff(
            segmentClockInDate,
            "second"
          );

          let activeSegmentBreaksSeconds = 0;
          for (const brk of attendance?.breaks || []) {
            const breakStartTime = dayjs(`${report?.date}T${brk.start}`);
            const breakEndTime = brk.end
              ? dayjs(`${report?.date}T${brk.end}`)
              : now;

            const overlapStart = dayjs.max(segmentClockInDate, breakStartTime);
            const overlapEnd = dayjs.min(now, breakEndTime);

            if (overlapStart.isBefore(overlapEnd)) {
              activeSegmentBreaksSeconds += overlapEnd.diff(
                overlapStart,
                "second"
              );
            }
          }
          totalDailyProductiveSeconds += Math.max(
            0,
            totalDailyWorkSeconds - activeSegmentBreaksSeconds
          );
        }
      }
    }

    // if (attendance?.breaks) {
    //   for (const brk of attendance.breaks) {
    //     if (brk.end) {
    //       totalDailyBreakSeconds += parseDurationToSeconds(
    //         brk.duration || "00:00:00"
    //       );
    //     } else if (brk.start) {
    //       const breakStartTime = dayjs(`${report?.date}T${brk.start}`);
    //       totalDailyBreakSeconds += now.diff(breakStartTime, "second");
    //     }
    //   }
    // }

    const isEarlyClockOut =
      totalDailyWorkSeconds < requiredTotalWorkSeconds ||
      totalDailyProductiveSeconds < requiredProductiveWorkSeconds;

    if (isEarlyClockOut) {
      setIsEarlyClockOutReasonDialogOpen(true);
    } else {
      // Pass the location along with the reason (empty string for non-early clock out)
      handleAction(() => clockOut({ reason: "", location }));
    }
  };

  const handleEarlyClockOutWithReason = async (reason: string) => {
    if (reason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters long.");
      return;
    }

    if (!location) {
      toast.error(
        "Location not available. Please try again or refresh the page."
      );
      return;
    }
    // Pass the location along with the reason
    await handleAction(() => clockOut({ reason, location }));
    setIsEarlyClockOutReasonDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full px-5 py-4 bg-gray-50 dark:bg-zinc-950">
      <FullPageLoader show={isLoading} />
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300 text-sm font-medium mb-4">
        <Link href={"/"} className="cursor-pointer flex items-center gap-1">
          <IoIosArrowBack className="text-lg" />
          Dashboard
        </Link>
        <span className="text-gray-400 dark:text-zinc-600">/</span>
        <span className="text-blue-600 dark:text-blue-400">
          Daily Attendance Report
        </span>
      </div>

      {/* Status Report Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-zinc-900 rounded-md shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-zinc-300">
          <FaClipboardList className="text-blue-500" />
          <span className="font-medium">Status Report</span>
          <span className="text-gray-500 dark:text-zinc-600">|</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            <span className="text-gray-700 dark:text-zinc-300">
              {report?.date && dayjs(report.date).format("MMM DD, YYYY")}
            </span>
          </div>
          <Button
            variant="outline"
            className="text-blue-500 border-blue-500 px-2 py-1 text-xs dark:text-blue-400 dark:border-blue-400"
          >
            Copy Report
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 text-sm text-gray-700 dark:text-zinc-300 dark:border-zinc-700"
          >
            <FiFilter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-sm dark:bg-blue-700 dark:hover:bg-blue-800">
            + Add Work Log
          </Button>
        </div>
      </div>

      {/* Status Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statusBarsData.map((item, i) => (
          <Card
            key={i}
            className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 flex flex-col items-center justify-center shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <div className={`font-semibold text-lg ${item.color}`}>
              {item.time}
            </div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              {item.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-9 text-xs text-gray-600 dark:text-zinc-400 font-medium py-3 border-y border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 rounded-t-md">
        <div className="col-span-2 px-3">Project Name</div>
        <div className="col-span-1 px-3">Section Name</div>
        <div className="col-span-2 px-3">Task/Ticket Name</div>
        <div className="col-span-1 px-3">Activity Type</div>
        <div className="col-span-1 px-3">Time Slot (Start : End)</div>
        <div className="col-span-1 px-3">Total Hours</div>
        <div className="col-span-1 px-3">Billable</div>
        <div className="col-span-1 px-3">Action</div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center flex-grow p-10 bg-white dark:bg-zinc-900 rounded-b-md shadow-sm">
        {isError ? (
          <div className="text-center">
            <p className="text-lg text-red-500 dark:text-red-400 mb-2">
              Error: {errorMessage}
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Please try again later.
            </p>
          </div>
        ) : (
          <>
            <img
              src="/empty-report.png"
              alt="Status empty"
              className="w-32 h-32 mb-3 opacity-80"
            />
            <p className="text-base text-gray-500 dark:text-zinc-400">
              Status report is empty
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              No attendance records for today.
            </p>
          </>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <HiOutlineLocationMarker className="w-4 h-4" />
          <span>Location Retrieved</span>
        </div>

        <div className="flex gap-2">
          <Link
            href={"/"}
            className="w-40 text-center py-2 border border-[#727272] text-[#727272] font-medium  cursor-pointer"
          >
            Cancel
          </Link>
          <Button
            onClick={onClockOutAttempt}
            className="w-full"
            disabled={isLoading || loadingLocation}
          >
            {isLoading ? "Clocking Out..." : "Clock Out"}
          </Button>
        </div>
      </div>

      <Toaster />

      {/* Early Clock-Out Reason Dialog (using reusable component) */}
      <AttendanceReasonDialog
        open={isEarlyClockOutReasonDialogOpen}
        onOpenChange={setIsEarlyClockOutReasonDialogOpen}
        title="Reason Required for Early Clock-Out"
        label={`You are clocking out before the required work time (${secondsToDuration(
          requiredTotalWorkSeconds
        )}) or productive time (${secondsToDuration(
          requiredProductiveWorkSeconds
        )}). Please provide a reason.`}
        buttonText="Submit Reason and Clock Out"
        onSubmit={handleEarlyClockOutWithReason}
      />
    </div>
  );
}
