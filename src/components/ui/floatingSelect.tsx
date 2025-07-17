"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingSelectProps {
  label: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
}

export function FloatingSelect({
  label,
  options,
  value,
  onChange,
  className,
}: FloatingSelectProps) {
  const [selected, setSelected] = React.useState<string | undefined>(value);
  const [open, setOpen] = React.useState(false);
  const [key, setKey] = React.useState(0); // 👈 Force re-render on clear

  React.useEffect(() => {
    setSelected(value ?? undefined);
  }, [value]);

  const handleValueChange = (val: string) => {
    setSelected(val);
    onChange?.(val);
  };

  const clearSelection = () => {
    setSelected(undefined);
    onChange?.(undefined);
    setOpen(false);
    setKey((prev) => prev + 1); // 👈 Force re-render to fully reset select
  };

  const isActive = open;

  return (
    <div className={cn("relative !m-0  mt-2.5  w-full", className)} key={key}>
      <Select
        value={selected}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger
          className={cn(
            "w-full !h-[43.73px] rounded-[5px] !bg-transparent border text-left appearance-none transition-colors duration-200",
            {
              "border-sidebar-primary text-sidebar-primary": isActive,
              "border-zinc-300 text-zinc-900 dark:text-white dark:border-zinc-700":
                !isActive,
            },
            selected && "[&>svg]:hidden"
          )}
        >
          <SelectValue placeholder=" " />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label
        className={cn(
          "absolute left-3 top-3 pointer-events-none origin-left transition-all duration-200",
          {
            "-translate-y-6 scale-75": isActive || selected,
            "translate-y-0 scale-100 -ml-2": !(isActive || selected),
          },
          {
            "text-sidebar-primary": isActive,
            "text-zinc-500 dark:text-zinc-400": !isActive,
          }
        )}
      >
        <span
          className={cn("px-2", {
            "bg-white dark:bg-black": label,
            "bg-transparent": !label,
          })}
        >
          {label}
        </span>
      </label>

      {/* Clear Button */}
      {selected && (
        <button
          type="button"
          onClick={clearSelection}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none z-10 cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
