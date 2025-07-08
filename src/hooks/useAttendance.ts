"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clockInUser } from "@/redux/slices/clockInSlice";
import { clockOutUser } from "@/redux/slices/clockOutSlice";
import { startBreak, endBreak } from "@/redux/slices/breakSlice";
import { fetchStatusReport } from "@/redux/slices/statusReportSlice";
import { useCallback, useEffect, useState } from "react";
import {
  parseDurationToSeconds,
  secondsToDuration,
} from "@/lib/attendanceHelpers";
import dayjs from "dayjs";

export interface AttendanceReport {
  // Define a more specific type for attendance report
  date: string;
  attendance: {
    breaks?: {
      start: string;
      end?: string;
      duration?: string;
      reason?: string;
      startLocation?: string;
      startDeviceType?: string;
      endLocation?: string;
      endDeviceType?: string;
    }[];
    workSegments?: {
      clockIn: string;
      clockOut?: string;
      duration?: string;
      productiveDuration?: string;
      clockInLocation?: string;
      clockInDeviceType?: string;
      clockOutLocation?: string;
      clockOutDeviceType?: string;
    }[];
    totalDuration?: string;
    productiveDuration?: string;
    breakDuration?: string;
    lateIn?: boolean;
    earlyOut?: boolean;
    lateInReason?: string;
    earlyOutReason?: string;
    status?: string;
  };
  user: { _id: string; username: string; email: string; role: string };
  shift: { _id: string; name: string; startTime: string; maxClockIn: string };
}

// Main hook for attendance actions and state
export function useAttendance() {
  const dispatch = useAppDispatch();
  const {
    report,
    isLoading: isReportLoading,
    isError: isReportError,
    errorMessage: reportErrorMessage,
  } = useAppSelector((state) => state.statusReport);
  const { isLoading: isClockInLoading } = useAppSelector(
    (state) => state.clockIn
  );
  const { isLoading: isClockOutLoading } = useAppSelector(
    (state) => state.clockOut
  );
  const { isLoading: isBreakLoading } = useAppSelector((state) => state.break);

  // Fetch status report on initial load or when dependencies change
  useEffect(() => {
    dispatch(fetchStatusReport());
  }, [dispatch]);

  const clockIn = useCallback(
    async ({ reason, location }: { reason?: string; location: string }) => {
      const resultAction = await dispatch(clockInUser({ reason, location }));
      if (clockInUser.fulfilled.match(resultAction)) {
        dispatch(fetchStatusReport()); // Re-fetch to sync full attendance state
      }
      return resultAction; // Return the result for component to handle success/error
    },
    [dispatch]
  );

  const clockOut = useCallback(
    async ({ reason, location }: { reason?: string; location: string }) => {
      const resultAction = await dispatch(clockOutUser({ reason, location }));
      if (clockOutUser.fulfilled.match(resultAction)) {
        dispatch(fetchStatusReport()); // Re-fetch to sync full attendance state
      }
      return resultAction;
    },
    [dispatch]
  );

  const breakStart = useCallback(
    async ({ reason, location }: { reason?: string; location: string }) => {
      const resultAction = await dispatch(startBreak({ reason, location }));
      if (startBreak.fulfilled.match(resultAction)) {
        dispatch(fetchStatusReport()); // Re-fetch to sync full attendance state
      }
      return resultAction;
    },
    [dispatch]
  );

  const breakEnd = useCallback(
    async ({ reason, location }: { reason?: string; location: string }) => {
      const resultAction = await dispatch(endBreak({ reason, location }));
      if (endBreak.fulfilled.match(resultAction)) {
        dispatch(fetchStatusReport()); // Re-fetch to sync full attendance state
      }
      return resultAction;
    },
    [dispatch]
  );

  // Live timer logic (renamed from useStrictWorkTimer)
  const { workTime, breakTime, netTime } = useWorkTimer(
    report?.attendance && report.date
      ? {
          ...report.attendance,
          date: report.date,
          workSegments: report.attendance.workSegments || [],
        }
      : null
  );

  return {
    report,
    workTime,
    breakTime,
    netTime,
    clockIn,
    clockOut,
    breakStart,
    breakEnd,
    isLoading:
      isReportLoading ||
      isClockInLoading ||
      isClockOutLoading ||
      isBreakLoading,
    isError: isReportError,
    errorMessage: reportErrorMessage,
    isReportLoading,
  };
}

// Internal helper hook for the live timer (purely client-side calculation)
function useWorkTimer(
  attendance: {
    workSegments: {
      clockIn: string;
      clockOut?: string;
      duration?: string;
      productiveDuration?: string;
      clockInLocation?: string;
      clockInDeviceType?: string;
      clockOutLocation?: string;
      clockOutDeviceType?: string;
    }[];
    breaks?: {
      start: string;
      end?: string;
      duration?: string;
      reason?: string;
      startLocation?: string;
      startDeviceType?: string;
      endLocation?: string;
      endDeviceType?: string;
    }[];
    date: string;
  } | null
) {
  const [workTime, setWorkTime] = useState("00:00:00");
  const [breakTime, setBreakTime] = useState("00:00:00");
  const [netTime, setNetTime] = useState("00:00:00");

  useEffect(() => {
    if (
      !attendance ||
      !attendance.workSegments ||
      attendance.workSegments.length === 0
    ) {
      setWorkTime("00:00:00");
      setBreakTime("00:00:00");
      setNetTime("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      let totalWorkSeconds = 0;
      let totalBreakSeconds = 0;
      const now = dayjs();

      // Calculate total work seconds from all segments
      for (const segment of attendance.workSegments) {
        const segmentClockInDate = dayjs(
          `${attendance.date}T${segment.clockIn}`
        );
        let segmentEndTargetDate;
        if (segment.clockOut) {
          segmentEndTargetDate = dayjs(
            `${attendance.date}T${segment.clockOut}`
          );
          if (segment.duration !== undefined) {
            totalWorkSeconds += parseDurationToSeconds(segment.duration);
          } else {
            totalWorkSeconds += segmentEndTargetDate.diff(
              segmentClockInDate,
              "second"
            );
          }
        } else {
          segmentEndTargetDate = now;
          totalWorkSeconds += segmentEndTargetDate.diff(
            segmentClockInDate,
            "second"
          );
        }
      }

      // Calculate total break seconds
      for (const brk of attendance.breaks || []) {
        const breakStartDate = dayjs(`${attendance.date}T${brk.start}`);
        let breakEndTargetDate;
        if (brk.end) {
          breakEndTargetDate = dayjs(`${attendance.date}T${brk.end}`);
          if (brk.duration !== undefined) {
            totalBreakSeconds += parseDurationToSeconds(brk.duration);
          } else {
            totalBreakSeconds += breakEndTargetDate.diff(
              breakStartDate,
              "second"
            );
          }
        } else {
          breakEndTargetDate = now;
          totalBreakSeconds += breakEndTargetDate.diff(
            breakStartDate,
            "second"
          );
        }
      }

      const netWorkSeconds = totalWorkSeconds - totalBreakSeconds;

      setWorkTime(secondsToDuration(totalWorkSeconds));
      setBreakTime(secondsToDuration(totalBreakSeconds));
      setNetTime(secondsToDuration(netWorkSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [attendance]);

  return { workTime, breakTime, netTime };
}
