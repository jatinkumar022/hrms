"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { InitialsAvatar } from "@/lib/InitialsAvatar";

export type CorrectionRequestRow = {
  _id: string;
  date: string;
  requestType: "clock-in" | "clock-out" | "break-in" | "break-out";
  requestedTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userId: { _id: string; username: string; profileImage?: string };
};

export const getColumns = ({
  onApprove,
  onReject,
  onView,
}: {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (row: CorrectionRequestRow) => void;
}): ColumnDef<CorrectionRequestRow>[] => [
  {
    header: "Applicant",
    accessorKey: "userId.username",
    cell: ({ row }) => {
      const { username, profileImage } = row.original.userId;
      return (
        <div className="flex items-center gap-2 w-40">
          {profileImage ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={profileImage} />
              <AvatarFallback>{getInitials(username)}</AvatarFallback>
            </Avatar>
          ) : (
            <InitialsAvatar name={username} className="w-8 h-8" />
          )}
          <span>{username}</span>
        </div>
      );
    },
  },
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
    cell: ({ row }) => (
      <div className="w-28">
        {dayjs(row.original.date).format("ddd DD MMM, YYYY")}
      </div>
    ),
  },
  {
    accessorKey: "requestType",
    header: "Type",
    cell: ({ row }) => <div className="w-24">{row.original.requestType}</div>,
  },
  {
    accessorKey: "requestedTime",
    header: "Requested Time",
    cell: ({ row }) => <div className="w-28">{row.original.requestedTime}</div>,
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const requestId = row.original._id;
      const status = row.original.status;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {status !== "approved" && (
              <DropdownMenuItem onClick={() => onApprove(requestId)}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Approve</span>
              </DropdownMenuItem>
            )}
            {status !== "rejected" && (
              <DropdownMenuItem onClick={() => onReject(requestId)}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                <span>Reject</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View Details</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
