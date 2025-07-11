"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WfhRequest } from "@/redux/slices/wfh/adminWfhSlice";
import {
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { InitialsAvatar } from "@/lib/InitialsAvatar";

type GetColumnsProps = {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (row: WfhRequest) => void;
};

export const getColumns = ({
  onApprove,
  onReject,
  onView,
}: GetColumnsProps): ColumnDef<WfhRequest>[] => [
  {
    accessorKey: "user.username",
    header: "Applicant",
    cell: ({ row }) => {
      const { username, profilePhoto } = row.original.user;
      return (
        <div className="flex items-center gap-2">
          {profilePhoto ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={profilePhoto} />
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
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        From
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => dayjs(row.original.startDate).format("ddd, DD MMM YYYY"),
  },
  {
    accessorKey: "endDate",
    header: "To",
    cell: ({ row }) => dayjs(row.original.endDate).format("ddd, DD MMM YYYY"),
  },
  {
    accessorKey: "numberOfDays",
    header: "No. Of Days",
  },
  {
    header: "Added Date",
    accessorKey: "createdAt",
    cell: ({ row }) => dayjs(row.original.createdAt).format("ddd DD MMM, YYYY"),
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
    header: "Action By",
    accessorKey: "approvedBy.username",
    cell: ({ row }) => {
      const { status, approvedBy, updatedAt } = row.original;
      if (status === "approved" && approvedBy) {
        return (
          <div>
            <div>{approvedBy.username}</div>
            <div className="text-xs text-muted-foreground">
              {dayjs(updatedAt).format("MMM DD, YYYY, hh:mm A")}
            </div>
          </div>
        );
      }
      if (status === "pending") return "N/A";
      return "System";
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
        case "cancelled":
          className = "bg-gray-100 text-gray-700 hover:bg-gray-200";
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
    cell: ({ row }) => {
      const wfh = row.original;
      const status = wfh.status;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {status !== "approved" && status !== "cancelled" && (
                <DropdownMenuItem onClick={() => onApprove(wfh._id)}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Approve</span>
                </DropdownMenuItem>
              )}
              {status !== "rejected" && status !== "cancelled" && (
                <DropdownMenuItem onClick={() => onReject(wfh._id)}>
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
        </div>
      );
    },
  },
];
