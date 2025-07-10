"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown, Eye, Trash2 } from "lucide-react";
import dayjs from "dayjs";

export type WfhRow = {
  _id: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  dayType: string;
  halfDayTime?: "First Half" | "Second Half";
  startTime?: string;
  endTime?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedBy?: { username: string };
  attachment?: string;
};

export const getColumns = ({
  onView,
  onCancel,
}: {
  onView: (row: WfhRow) => void;
  onCancel: (id: string) => void;
}): ColumnDef<WfhRow>[] => [
  {
    header: "Request Type",
    accessorKey: "dayType",
  },
  {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        From
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorKey: "startDate",
    cell: ({ row }) => dayjs(row.original.startDate).format("ddd DD MMM, YYYY"),
  },
  {
    header: "To",
    accessorKey: "endDate",
    cell: ({ row }) => dayjs(row.original.endDate).format("ddd DD MMM, YYYY"),
  },
  {
    header: "Details",
    cell: ({ row }) => {
      const { dayType, halfDayTime, startTime, endTime } = row.original;
      if (dayType === "Half Day") return halfDayTime;
      if (dayType === "Hourly") return `${startTime} - ${endTime}`;
      return "Full Day";
    },
  },
  {
    header: "Reason",
    accessorKey: "reason",
    cell: ({ getValue }) => {
      const txt = getValue() as string;
      if (!txt) return "N/A";
      return (
        <span className="w-48 whitespace-pre-wrap" title={txt}>
          {txt.slice(0, 45)}
          {txt.length > 45 && <span className="text-blue-600 pl-1">...</span>}
        </span>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
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
    accessorKey: "attachment",
    header: "Attachment",
    cell: ({ row }) => {
      const attachmentUrl = row.original.attachment;
      if (!attachmentUrl) return "N/A";
      return (
        <a
          href={attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View
        </a>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(row.original)}>
            <Eye className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          {row.original.status === "pending" && (
            <DropdownMenuItem
              onClick={() => onCancel(row.original._id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Cancel</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
