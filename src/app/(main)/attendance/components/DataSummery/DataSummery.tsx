"use client";
import React, { useEffect } from "react";
import { Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchMonthlySummary } from "@/redux/slices/monthlySummarySlice";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";

const metricLabels = [
  { key: "workingHours", label: "Working Hours" },
  { key: "actualWorkingTime", label: "Actual Working Time", hasInfo: true },
  { key: "trackedHours", label: "Tracked Hours" },
  { key: "timeDifference", label: "Time Difference", hasInfo: true },
  { key: "clockInDays", label: "Clock In Days", color: "text-green-500" },
  { key: "payrollPresentDays", label: "Payroll Present Days" },
  { key: "odRemoteDays", label: "OD/Remote work" },
  { key: "absentDays", label: "Absent", color: "text-red-500" },
  { key: "shiftNotStartDays", label: "Shift Not Start" },
  { key: "onLeaveDays", label: "On Leave" },
  { key: "lateInDays", label: "Late IN", color: "text-orange-500" },
  { key: "earlyOutDays", label: "Early OUT", color: "text-orange-500" },
  { key: "paidLeave", label: "Paid Leave" },
  { key: "unpaidLeave", label: "Unpaid Leave" },
  { key: "odHourlyRemoteWork", label: "OD/Hourly Remote work" },
  { key: "hourlyPaidLeave", label: "Hourly Paid Leave" },
  { key: "hourlyUnpaidLeave", label: "Hourly Unpaid Leave" },
  { key: "weekendDays", label: "Weekend" },
  { key: "holidayDays", label: "Holiday" },
];

function DataSummery() {
  const dispatch = useAppDispatch();
  const { summary, isLoading, isError, errorMessage } = useAppSelector(
    (state) => state.monthlySummary
  );
  const isMobile = useMediaQuery("(max-width: 899px)");

  useEffect(() => {
    if (!summary && !isLoading && !isError) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      dispatch(fetchMonthlySummary({ month, year }));
    }
  }, [summary, isLoading, isError, dispatch]);

  if (isLoading) return <div className="p-4">Loading summary...</div>;
  if (isError) return <div className="p-4 text-red-500">{errorMessage}</div>;
  if (!summary) return null;

  const renderMetric = (metric: any) => (
    <div
      key={metric.key}
      className="flex justify-between items-center w-full border-b last:border-b-0 py-2"
    >
      <div className="text-gray-500 flex items-center gap-1">
        <span>{metric.label}</span>
        {metric.hasInfo && (
          <Info size={14} className="text-gray-400 cursor-pointer" />
        )}
      </div>
      <div className={cn("font-semibold text-gray-800", metric.color)}>
        {summary[metric.key] ?? "-"}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col w-full text-sm">
        {metricLabels.map(renderMetric)}
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto border-b bg-white  dark:bg-black p-1 text-xs w-screen md:w-[calc(100vw-5rem)]">
      {metricLabels.slice(0, 11).map((metric) => (
        <div
          key={metric.key}
          className="whitespace-nowrap px-3 py-1 border-r last:border-r-0 flex flex-col"
        >
          <div className={cn("font-semibold dark:text-white", metric.color)}>
            {summary[metric.key] ?? "-"}
          </div>
          <div className="text-gray-500 dark:text-[#c9c7c7] flex items-center gap-1 whitespace-nowrap">
            <span>{metric.label}</span>
            {metric.hasInfo && (
              <Info size={12} className="text-gray-400 cursor-pointer" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DataSummery;
