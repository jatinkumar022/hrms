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
import { MoreHorizontal, CheckCircle, XCircle, Eye } from "lucide-react";
import dayjs from "dayjs";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";

export type WfhRequestRow = {
  _id: string;
  userId: { _id: string; username: string; profileImage?: string };
  startDate: string;
  endDate: string;
  dayType: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedBy?: { username: string };
  halfDayTime?: "First Half" | "Second Half";
  startTime?: string;
  endTime?: string;
};

export const getColumns = ({
  onApprove,
  onReject,
  onView,
}: {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (row: WfhRequestRow) => void;
}): ColumnDef<WfhRequestRow>[] => [
  {
    header: "Applicant",
    accessorKey: "userId.username",
    cell: ({ row }) => {
      const { username, profileImage } = row.original.userId;
      return (
        <div className="flex items-center gap-2">
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
    header: "Request Type",
    accessorKey: "dayType",
  },
  {
    header: "From",
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
          className = "bg-green-100 text-green-700";
          break;
        case "pending":
          className = "bg-yellow-100 text-yellow-700";
          break;
        case "rejected":
          className = "bg-red-100 text-red-700";
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
      const wfhId = row.original._id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.original.status === "pending" && (
              <>
                <DropdownMenuItem onClick={() => onApprove(wfhId)}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Approve</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReject(wfhId)}>
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  <span>Reject</span>
                </DropdownMenuItem>
              </>
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
