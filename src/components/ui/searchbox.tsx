// components/ui/search-input.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn utility

interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8d8d8d] dark:text-[#c9c7c7] pointer-events-none" />
      <Input
        type="search"
        placeholder="Search employees..."
        className={cn(
          "pl-9 pr-3 py-2 h-9 text-sm rounded-md border dark:bg-input/40 shadow-none",
          "placeholder:text-[#8d8d8d] dark:placeholder:text-[#c9c7c7]",
          "text-foreground dark:text-white",
          "border border-input",
          "focus-visible:outline outline-1 focus-visible:outline-blue-500 dark:focus-visible:outline-sidebar-primary",
          "focus-visible:ring-0 focus-visible:ring-offset-2 ",
          "dark:focus-visible:ring-offset-[#00000005] focus-visible:ring-offset-sidebar-primary",
          className
        )}
        {...props}
      />
    </div>
  );
}
