"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CorrectionRequestRow = {
  _id: string;
  date: string;
  requestType: "clock-in" | "clock-out" | "break-in" | "break-out";
  requestedTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export const getColumns = ({
  onView,
}: {
  onView: (row: CorrectionRequestRow) => void;
}): ColumnDef<CorrectionRequestRow>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => dayjs(row.original.date).format("ddd DD MMM, YYYY"),
  },
  {
    accessorKey: "requestType",
    header: "Type",
  },
  {
    accessorKey: "requestedTime",
    header: "Requested Time",
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ getValue }) => {
      const txt = getValue() as string;
      return (
        <span className="w-48 whitespace-pre-wrap">
          {txt.slice(0, 45)}
          {txt.length > 45 && (
            <span className="text-blue-600 pl-1">...More</span>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let className = "";
      switch (status) {
        case "approved":
          className = "bg-green-100 text-green-700 hover:bg-green-200";
          break;
        case "pending":
          className = "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
          break;
        case "rejected":
          className = "bg-red-100 text-red-700 hover:bg-red-200";
          break;
      }
      return (
        <Badge
          variant="outline"
          className={`capitalize border-none ${className}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Submitted On",
    cell: ({ row }) => dayjs(row.original.createdAt).format("ddd DD MMM, YYYY"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer">
              <div className="flex items-center justify-center hover:bg-[#313131] rounded-sm p-1 h-8 w-8 dark:text-[#c9c7c7]">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row.original)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
