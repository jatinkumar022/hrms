"use client";
import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { DatePickerProps } from "antd";
import "antd/dist/reset.css";
import { cn } from "@/lib/utils";

interface DatePickerWithLabelProps {
  label: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  readOnly?: boolean;
  className?: string;
  showFooter?: boolean;
}
export function DatePickerWithLabel({
  label,
  value,
  onChange,
  readOnly = false,
  className = "h-fit",
  showFooter = true,
}: DatePickerWithLabelProps) {
  const [date, setDate] = useState<Date | null | undefined>(value);
  const [tempDate, setTempDate] = useState<Date | null | undefined>(value);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDate(value);
    setTempDate(value);
  }, [value]);

  const handleDaySelect: DatePickerProps["onChange"] = (d) => {
    const selected = d?.toDate() ?? null;
    setTempDate(selected);
    onChange?.(selected); // <-- call passed prop directly
  };
  const isActive = focused;
  const isDate = date instanceof Date && !isNaN(date.getTime());
  return (
    <div className={cn("relative !m-0 mt-2.5  w-full", className)}>
      <DatePicker
        open={open}
        onOpenChange={setOpen}
        value={tempDate ? dayjs(tempDate) : null}
        onChange={handleDaySelect}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={readOnly}
        format="DD/MM/YYYY"
        placeholder=" "
        allowClear={true} // disable default clear button
        className={cn(
          "w-full h-[44.6px] !bg-transparent rounded-[5px] border pl-3 pr-10 font-medium",
          {
            "!border-sidebar-primary !text-sidebar-primary": isActive,
            "border-zinc-300 text-zinc-900 dark:text-white dark:border-zinc-700":
              !isActive,
          }
        )}
        dropdownClassName={cn({ hideFooter: !showFooter })}
        style={{ background: "transparent" }}
      />

      {/* Floating label */}
      <label
        className={cn(
          "absolute left-3 top-3 pointer-events-none origin-left transition-all duration-200",
          {
            "-translate-y-6 scale-75": isActive || isDate,
            "translate-y-0 scale-100 -ml-2": !(isActive || isDate),
          },
          {
            "text-sidebar-primary": isActive,
            "text-zinc-500 dark:text-zinc-400": !isActive,
          }
        )}
      >
        <span className="bg-white px-2 dark:bg-black">{label}</span>
      </label>
    </div>
  );
}
