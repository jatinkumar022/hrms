"use client";

import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import Input from "@/components/ui/meterialInput";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import Image from "next/image";

/**
 * RemoteRequest – Remote / WFH request form
 *
 * Behaviour
 * 1. By default it shows a single‑day, full‑day request (screenshot‑1)
 * 2. Ticking ➜ “hourly request” switches the row to Start / End time & live duration (screenshot‑2)
 * 3. Clicking “MORE THAN ONE DAY?” toggles an extra **To Date** input
 */
const RemoteRequest: React.FC = () => {
  const [isHourly, setIsHourly] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fromDate, setFromDate] = useState<Date | null>(new Date());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");

  const diffLabel = useMemo(() => {
    if (!isHourly || !startTime || !endTime) return "";
    if (isHourly) setMultiDay(false);
    const start = dayjs(`1970-01-01T${startTime}`);
    const end = dayjs(`1970-01-01T${endTime}`);
    const diffMin = end.diff(start, "minute");
    if (diffMin <= 0) return "";
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hrs.toString().padStart(2, "0")} Hrs ${mins
      .toString()
      .padStart(2, "0")} Mins`;
  }, [isHourly, startTime, endTime]);

  return (
    <div className="w-full  rounded-lg  text-sm">
      {/* ————————————————— Header ————————————————— */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-medium">Apply Remote Work Request</h2>

        <div className="flex gap-3 text-xs">
          <button className="w-24 py-[6px] border border-gray-300 rounded-xs cursor-pointer hover:bg-gray-50">
            Discard
          </button>
          <button className="w-24 py-[6px] bg-sidebar-primary text-white rounded-xs border border-sidebar-primary cursor-pointer hover:opacity-90">
            Save
          </button>
        </div>
      </div>

      {/* ————————————————— Form body ————————————————— */}
      <div className="px-6 py-6 space-y-6">
        {/* Employee */}
        <div className="md:w-1/3 min-w-80 w-full">
          <Input
            label="Employee"
            value="Jatin Ramani"
            readOnly
            icon={
              <Image
                src="https://office.dvijinfotech.com/uploads/staff_profile_images/67/small_WhatsApp%20Image%202024-09-02%20at%2021.15.52_0a414dd2.jpg"
                className="w-6 h-6 rounded-full -ml-1"
                alt=""
              />
            }
          />
        </div>

        {/* Remote type */}
        <div className="md:w-1/3 min-w-80 w-full">
          <FloatingSelect
            label="Select remote type"
            value="WFH"
            options={[{ label: "Work From Home", value: "WFH" }]}
            onChange={() => {}}
          />
        </div>

        {/* Hourly check */}
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="hourly"
            checked={isHourly}
            onCheckedChange={(checked) => setIsHourly(!!checked)}
            className="cursor-pointer"
          />
          <Label htmlFor="hourly" className="cursor-pointer select-none">
            This is an hourly remote work request
          </Label>
        </div>

        {/* From / To dates */}
        <div className="flex items-end gap-4 flex-wrap">
          <div className="md:w-1/3  min-w-80 w-full">
            <DatePickerWithLabel
              label="From Date"
              value={fromDate ?? undefined}
            />
          </div>

          {multiDay && (
            <div className="md:w-1/3  min-w-80 w-full">
              <DatePickerWithLabel
                label="To Date"
                value={toDate ?? undefined}
              />
            </div>
          )}

          {/* toggle link */}
          {!isHourly ? (
            <button
              type="button"
              className="text-sidebar-primary text-xs font-medium mb-3"
              onClick={() => setMultiDay((p) => !p)}
            >
              {multiDay ? "SINGLE DAY?" : "MORE THAN ONE DAY?"}
            </button>
          ) : (
            ""
          )}
        </div>

        {/* Day summary  |  Hourly summary */}
        {!isHourly ? (
          <div className="border border-gray-200 rounded flex justify-center items-center p-4 gap-8 w-full lg:w-1/2">
            <span className="font-medium text-gray-600 ">
              {dayjs(fromDate).format("ddd, DD MMM YYYY")}
            </span>
            <div className="w-1/2 -mt-6">
              <FloatingSelect
                label=""
                value="FULL_DAY"
                options={[
                  { label: "Full Day", value: "FULL_DAY" },
                  { label: "Half Day", value: "HALF_DAY" },
                ]}
                onChange={() => {}}
              />
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded flex justify-between  items-center p-4 gap-2 text-sm lg:w-1/2 w-full">
            <span className="font-medium text-gray-600 whitespace-nowrap mr-3">
              {dayjs(fromDate).format("ddd, DD MMM YYYY")}
            </span>

            {/* Start */}
            <div className="flex flex-col w-full">
              <Label
                htmlFor="startTime"
                className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500"
              >
                Start Time
              </Label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 border border-gray-300 rounded px-3 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* End */}
            <div className="flex flex-col w-full">
              <Label
                htmlFor="endTime"
                className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500"
              >
                End Time
              </Label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 border border-gray-300 rounded px-3 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* diff */}
            {diffLabel && (
              <span className="ml-auto pr-2 font-medium whitespace-nowrap text-gray-600">
                {diffLabel}
              </span>
            )}
          </div>
        )}

        {/* Reason & attachment */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="lg:w-1/2 w-full ">
            <textarea
              placeholder="Reason *"
              className="flex-1 min-h-[120px] w-full border border-gray-300 rounded p-4 outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <button
            type="button"
            className="w-14 h-14 shrink-0 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M9 10a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V7a1 1 0 0 1 2 0v10a1 1 0 0 0 2 0v-7a1 1 0 0 0-2 0v6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoteRequest;
