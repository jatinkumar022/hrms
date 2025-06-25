"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { BsThreeDots } from "react-icons/bs";
import { FaEye } from "react-icons/fa6";

export type LateIn = {
  date: string;
  clockInTime: string;
  lateInTime: string;
  penalty: string;
  lateInReason: string;
};

export const lateInColumns: ColumnDef<LateIn>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "clockInTime", header: "Clock In Time" },
  {
    accessorKey: "lateInTime",
    header: "Late In Time",
    cell: ({ row }) => (
      <span
        className={`text-[11px] font-medium ${
          row.getValue<string>("lateInTime")?.startsWith("00 H : 00")
            ? "text-[#8d8d8d]"
            : "text-sidebar-primary"
        }`}
      >
        {row.getValue("lateInTime")}
      </span>
    ),
  },
  {
    accessorKey: "penalty",
    header: "Penalty",
    cell: ({ row }) => {
      const penalty = row.getValue<string>("penalty");
      return (
        <Badge
          variant="outline"
          className={`px-2 py-1 text-[11px] border-none ${
            penalty === "-"
              ? "bg-gray-50 text-gray-400"
              : "bg-red-50 text-red-500"
          }`}
        >
          {penalty}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lateInReason",
    header: "Reason",
    cell: ({ row }) => (
      <div
        title={row.getValue("lateInReason")}
        className="truncate max-w-[160px]"
      >
        {row.getValue("lateInReason")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const view = (table.options.meta as { handleView: (r: LateIn) => void })
        .handleView;
      return (
        <div className="flex justify-end pr-3 group w-[60px]">
          <div className="absolute group-hover:opacity-0 transition-opacity">
            <button className="text-gray-500 hover:text-black">
              <BsThreeDots />
            </button>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex transition-opacity">
            <button
              className="cursor-pointer text-sidebar-primary p-1"
              onClick={() => view(row.original)}
            >
              <FaEye size={16} />
            </button>
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
