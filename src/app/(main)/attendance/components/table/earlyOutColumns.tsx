export type EarlyOut = {
  date: string;
  earlyOutTime: string;
  clockOutStatus: string;
  reason: string;
  actionBy: string;
};

// ———————————————————————————— Columns ————————————————————————————
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "lucide-react";
import { BsThreeDots } from "react-icons/bs";
import { FaEye } from "react-icons/fa6";

export const earlyOutColumns: ColumnDef<EarlyOut>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "earlyOutTime", header: "Early Out Time" },
  {
    accessorKey: "clockOutStatus",
    header: "Clock‑out Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("clockOutStatus");
      const color =
        status === "remain"
          ? "bg-red-50 text-red-500"
          : "bg-green-50 text-green-600";
      return (
        <Badge
          fontVariant="outline"
          className={`border-none px-2 py-1 text-[11px] ${color}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div title={row.getValue("reason")} className="truncate max-w-[160px]">
        {row.getValue("reason")}
      </div>
    ),
  },
  { accessorKey: "actionBy", header: "Action By" },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const view = (table.options.meta as { handleView: (r: EarlyOut) => void })
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
