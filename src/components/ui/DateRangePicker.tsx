// components/RangeDatePicker.client.tsx
"use client";

import { useState } from "react";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

/* ------------ presets helper ---------------- */
const presets = [
  { label: "Today", fn: () => ({ from: new Date(), to: new Date() }) },
  {
    label: "Yesterday",
    fn: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }),
  },
  {
    label: "Last 7 Days",
    fn: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last 14 Days",
    fn: () => ({ from: subDays(new Date(), 13), to: new Date() }),
  },
  {
    label: "Last 30 Days",
    fn: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "Last 90 Days",
    fn: () => ({ from: subDays(new Date(), 89), to: new Date() }),
  },
  {
    label: "Last 365 Days",
    fn: () => ({ from: subDays(new Date(), 364), to: new Date() }),
  },
  {
    label: "Last Month",
    fn: () => {
      const m = subMonths(new Date(), 1);
      return { from: startOfMonth(m), to: endOfMonth(m) };
    },
  },
  {
    label: "Last 12 Months",
    fn: () => ({ from: subMonths(new Date(), 11), to: new Date() }),
  },
  {
    label: "Last Year",
    fn: () => {
      const y = subYears(new Date(), 1);
      return { from: startOfMonth(y), to: endOfMonth(y) };
    },
  },
];

export default function RangeDatePicker() {
  const [range, setRange] = useState<DateRange>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  const label =
    range.from && range.to
      ? `${format(range.from, "MMM dd, yyyy")} – ${format(
          range.to,
          "MMM dd, yyyy"
        )}`
      : "Select date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[300px] justify-start text-left">
          {label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="flex p-0">
        {/* ---- LEFT PRESET LIST ---- */}
        <div className="w-48 border-r border-gray-200 py-2">
          {presets.map((p) => {
            const r = p.fn();
            const active =
              range.from?.getTime() === r.from.getTime() &&
              range.to?.getTime() === r.to.getTime();
            return (
              <button
                key={p.label}
                onClick={() => setRange(r)}
                className={`w-full px-4 py-2 text-left text-sm
                  ${
                    active
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* ---- CALENDARS ---- */}
        <div className="p-4">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            pagedNavigation
            defaultMonth={range.from ?? new Date()}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
