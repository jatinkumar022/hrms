// components/ThemeToggle.tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-[75px] h-[40px] bg-[#9e9e9e33] hover:bg-[#8d8d8d33] dark:hover:bg-[#81818133] dark:bg-[#1f1f1f]  rounded-full flex items-center px-3 transition-colors duration-300 cursor-pointer "
    >
      <div
        className={`absolute top-1 left-1 w-8 h-8 rounded-full  shadow-md transform transition-transform duration-300 ${
          isDark ? "translate-x-0 bg-black" : "translate-x-[34px] bg-[#ffffff] "
        }`}
      />

      <Moon
        className={`w-[18px] h-[18px] z-10 transition-opacity duration-300 ${
          isDark ? "text-white opacity-100" : "text-gray-500 opacity-60"
        }`}
      />

      <div className="flex-1" />

      <Sun
        className={`w-[18px] h-[18px] z-10 transition-opacity duration-300 ${
          !isDark ? "text-[#292929] opacity-100" : "text-gray-500 opacity-60 "
        }`}
      />
    </button>
  );
}
