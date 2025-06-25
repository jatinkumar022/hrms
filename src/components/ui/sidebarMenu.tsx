"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import clsx from "clsx";
import Link from "next/link";

type DropdownItem =
  | { label: string; onClick?: () => void; to: string }
  | "divider";

interface RightSideDropdownProps {
  items: DropdownItem[];
  children: ReactNode;
  className?: string;
}

export default function RightSideDropdown({
  items,
  children,
  className,
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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          ` ${open ? "text-sidebar-primary bg-[#39588080]" : ""} `, // optional for removing button outline
          className
        )}
      >
        {children}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-full top-0 ml-5 w-60 bg-white dark:bg-black dark:text-white border rounded shadow z-50">
          <ul className="py-1 text-sm">
            {items.map((item, index) =>
              item === "divider" ? (
                <li key={index} className="border-t my-2" />
              ) : (
                <Link
                  href={item?.to}
                  key={index}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className="px-4 py-2 block hover:bg-[#f0f0f0]  dark:hover:bg-[#0c0c0c] cursor-pointer border-l-2 border-transparent hover:border-sidebar-primary"
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
