"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithLabelProps {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  readOnly?: boolean;
}

export function DatePickerWithLabel({
  label,
  value,
  onChange,
  className,
  readOnly = false,
}: DatePickerWithLabelProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [hoverDate, setHover] = React.useState<Date | undefined>();
  const [open, setOpen] = React.useState(false);
  const [focused, setFoc] = React.useState(false);

  // ───────────────────── Helpers ─────────────────────
  const display = hoverDate ?? date;
  const isActive = open || focused;
  const isDate = date !== undefined || null;
  const clear = () => {
    setDate(undefined);
    setHover(undefined);
    onChange?.(undefined);
  };

  const pick = (d?: Date) => {
    // ignore “un‑select” clicks that return undefined
    if (!d) return;
    setDate(d);
    onChange?.(d);
    setOpen(false);
  };
  return (
    <div className={`relative  w-full ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={() => !readOnly && setOpen(true)}
            onFocusCapture={() => !readOnly && setFoc(true)}
            onBlurCapture={() => {
              setFoc(false);
              setHover(undefined);
              if (!readOnly) {
                setFoc(false);
                setHover(undefined);
              }
            }}
            disabled={readOnly}
            tabIndex={readOnly ? -1 : 0}
            onMouseDown={readOnly ? (e) => e.preventDefault() : undefined}
            className={`
              w-full h-[50px] text-left p-3 rounded-[5px] bg-transparent border relative
              transition-colors duration-200 appearance-none
              ${
                isActive
                  ? "border-sidebar-primary text-sidebar-primary"
                  : "border-zinc-300 text-zinc-900 dark:text-white dark:border-zinc-700"
              }
              focus:outline-none
            `}
          >
            {display ? display.toLocaleDateString() : " "}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto overflow-hidden p-0 z-50"
          align="start"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            // <- use onDayClick so we get a defined Date every time
            onDayClick={pick}
            onDayMouseEnter={setHover}
            onDayMouseLeave={() => setHover(undefined)}
          />
        </PopoverContent>
      </Popover>

      {!readOnly && date && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
        >
          <X size={16} />
        </button>
      )}

      {/* Floating label */}
      <label
        className={`
          absolute left-3 top-3 pointer-events-none origin-left transition-all duration-200
          ${
            isActive || isDate
              ? "-translate-y-6 scale-75 "
              : "translate-y-0 scale-100  -ml-2"
          }

          ${
            isActive
              ? "text-sidebar-primary "
              : "text-zinc-500 dark:text-zinc-400"
          }
        `}
      >
        <span className="bg-white px-2 dark:bg-black">{label}</span>
      </label>
    </div>
  );
}
