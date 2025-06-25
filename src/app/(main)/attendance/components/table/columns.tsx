// components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { HiTicket } from "react-icons/hi2";
import Location from "@/assets/location.svg";
import Laptop from "@/assets/laptop.svg";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { FaEye, FaFileInvoice } from "react-icons/fa6";

export type Attendance = {
  date: string;
  displayName: string;
  dayStatus: "FD" | "WK";
  attendanceStatus: "P" | "-";
  action: string;
  clockIn: string;
  clockOut: string;
  totalTime: string;
  breakHours: string;
  productiveHours: string;
  extraTime: string;
  shift: string;
  location: string;
  jobTitle: string;
  ClockINIP: string;
  ClockOUTIP: string;
};

export const columns: ColumnDef<Attendance>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "displayName", header: "Display Name" },
  {
    accessorKey: "dayStatus",
    header: "Day Status",
    cell: ({ row }) => {
      const status = row.getValue("dayStatus");
      const color =
        status === "FD"
          ? "bg-green-50 text-[#47c947]"
          : "bg-blue-50 text-[#4784c9]";
      return (
        <span className={`px-2 py-1 rounded text-[10px] font-medium ${color}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "attendanceStatus",
    header: "Attendance Status",
    cell: ({ row }) => {
      const status = row.getValue("attendanceStatus");
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-[#47c947] border-none text-[11px] py-1 px-2 "
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Attendance Action",
    cell: ({ row }) => {
      const action = row.getValue("action");
      return (
        <div className="border text-[11px] flex  items-center gap-2 px-2 py-2 text-[#8d8d8d]">
          <HiTicket className="text-blue-400" /> {action}
        </div>
      );
    },
  },
  {
    accessorKey: "clockIn",
    header: "Clock IN",
    cell: ({ row }) => {
      const clockIn = row.getValue("clockIn");
      return (
        <div className=" text-[11px] flex  items-center gap-1  text-[#8d8d8d]">
          {clockIn}
          {clockIn === "-" ? (
            ""
          ) : (
            <div className="flex gap-1">
              <Image
                src={Location}
                className="w-[14px] cursor-pointer"
                alt=""
              />
              <Image src={Laptop} className="w-[14px] cursor-pointer" alt="" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "clockOut",
    header: "Clock OUT",
    cell: ({ row }) => {
      const clockOut = row.getValue("clockOut");
      return (
        <div className=" text-[11px] flex  items-center gap-1  text-[#8d8d8d]">
          {clockOut}
          {clockOut === "-" ? (
            ""
          ) : (
            <div className="flex gap-1">
              <Image
                src={Location}
                className="w-[14px] cursor-pointer"
                alt=""
              />
              <Image src={Laptop} className="w-[14px] cursor-pointer" alt="" />
            </div>
          )}
        </div>
      );
    },
  },
  { accessorKey: "totalTime", header: "Total Time" },
  { accessorKey: "breakHours", header: "Break Hours" },
  { accessorKey: "productiveHours", header: "Productive Hours" },
  {
    accessorKey: "extraTime",
    header: "Extra Time",
    cell: ({ row }) => {
      const extraTime = row.getValue("extraTime");
      return <div className=" text-sidebar-primary">{extraTime}</div>;
    },
  },
  { accessorKey: "shift", header: "Shift" },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "jobTitle", header: "Job Title" },
  { accessorKey: "ClockINIP", header: "Clock In IP" },
  { accessorKey: "ClockOUTIP", header: "Clock Out IP" },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const view = (
        table.options.meta as { handleView: (r: Attendance) => void }
      ).handleView;
      return (
        <div className="flex justify-end pr-3 group w-[80px]">
          <div className="absolute group-hover:opacity-0 transition-opacity duration-200">
            <button className="text-gray-500 hover:text-black">
              <BsThreeDots />
            </button>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-200">
            <button
              className="cursor-pointer text-sidebar-primary p-1"
              onClick={() => view(row.original)}
            >
              <FaEye size={16} />
            </button>
            <button className="cursor-pointer text-sidebar-primary p-1">
              <FaFileInvoice size={16} />
            </button>
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
