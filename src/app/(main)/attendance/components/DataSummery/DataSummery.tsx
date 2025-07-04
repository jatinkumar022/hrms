import React, { useEffect } from "react";
import { Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchMonthlySummary } from "@/redux/slices/monthlySummarySlice";

const metricLabels = [
  { key: "workingHours", label: "Working Hours" },
  { key: "clockInDays", label: "Clock In Days" },
  { key: "payrollPresentDays", label: "Payroll Present Days" },
  { key: "odRemoteDays", label: "OD/Remote Work" },
  { key: "absentDays", label: "Absent" },
  { key: "shiftNotStartDays", label: "Shift Not Start" },
  { key: "onLeaveDays", label: "On Leave" },
  { key: "lateInDays", label: "Late IN" },
  { key: "earlyOutDays", label: "Early OUT" },
  { key: "weekendDays", label: "Weekend" },
  { key: "holidayDays", label: "Holiday" },
];

function DataSummery() {
  const dispatch = useAppDispatch();
  const { summary, isLoading, isError, errorMessage } = useAppSelector(
    (state) => state.monthlySummary
  );

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

  return (
    <div className="flex overflow-x-auto border-b bg-white p-1 text-xs w-screen md:w-[calc(100vw-5rem)] ">
      {metricLabels.map((metric, index) => (
        <div
          key={index}
          className="whitespace-nowrap px-3 py-1 border-r last:border-r-0 flex flex-col "
        >
          <div className="font-semibold text-gray-800 text-start">
            {summary[metric.key] ?? "-"}
          </div>
          <div className="text-gray-500 flex items-center gap-1 whitespace-nowrap ">
            <span>{metric.label}</span>
            <Info size={12} className="text-gray-400 cursor-pointer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default DataSummery;
