"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";

export type DropdownItem =
  | { label: string; onClick?: () => void; to: string }
  | "divider";

interface RightSideDropdownProps {
  items: DropdownItem[];
  children: ReactNode;
  className?: string;
  pathname: string;
}

export default function RightSideDropdown({
  items,
  children,
  className,
  pathname,
}: RightSideDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = items.some((item) => {
    if (typeof item === "string") return false;
    // Exact match for root, prefix match for others.
    if (item.to === "/") return false;
    return pathname.startsWith(item.to);
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className={clsx(
          "p-2.5 rounded-xl cursor-pointer transition-colors duration-200",
          {
            "text-sidebar-primary  !bg-[#39588080] ": open || isActive,
            "text-gray-400 hover:!text-sidebar-primary hover:!bg-[#39588080]":
              !open && !isActive,
          },
          className
        )}
      >
        {children}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-full top-0 ml-5 w-60 bg-white dark:bg-black dark:text-white border rounded shadow z-50">
          <ul className="py-1 text-sm">
            {items.map((item, index) =>
              item === "divider" ? (
                <li key={index} className="border-t my-2" />
              ) : (
                <Link
                  href={item.to}
                  key={index}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={clsx(
                    "px-4 py-2 block hover:bg-[#f0f0f0] dark:hover:bg-[#0c0c0c] cursor-pointer border-l-2 hover:text-sidebar-primary",
                    {
                      "border-sidebar-primary text-sidebar-primary":
                        pathname === item.to,
                      "border-transparent hover:border-sidebar-primary":
                        pathname !== item.to,
                    }
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
