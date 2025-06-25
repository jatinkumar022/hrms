"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";

// Remote work type
export type RemoteRequest = {
  id: string;
  name: string;
  image: string;
  type: string;
  country: string;
  state: string;
  from: string;
  to: string;
  nuOfDaysHours: string;
  status: "approved" | "pending" | "rejected";
  requestedOn: string;
  reason: string;
  actionBy: string;
};

export const remoteColumns: ColumnDef<RemoteRequest>[] = [
  {
    accessorKey: "name",
    header: "Employee",
    cell: ({ row }) => {
      const name = row.original.name;
      const image = row.original.image;
      return (
        <div className="flex items-center gap-2">
          <img
            src={image}
            alt={name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "from", header: "From" },
  { accessorKey: "to", header: "To" },
  {
    accessorKey: "nuOfDaysHours",
    header: "Days",
    cell: ({ row }) => (
      <div className="text-center">{row.original.nuOfDaysHours}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === "approved"
          ? "bg-green-50 text-green-600"
          : status === "pending"
          ? "bg-yellow-50 text-yellow-600"
          : "bg-red-50 text-red-600";
      return (
        <Badge variant="outline" className={`border-none text-xs ${color}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  { accessorKey: "requestedOn", header: "Requested On" },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground max-w-xs truncate">
        {row.original.reason}
      </div>
    ),
  },
  {
    accessorKey: "actionBy",
    header: "Action By",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.actionBy}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const view = (
        table.options.meta as { onView: (r: RemoteRequest) => void }
      )?.onView;
      const approve = (
        table.options.meta as { onApprove: (r: RemoteRequest) => void }
      )?.onApprove;
      const reject = (
        table.options.meta as { onReject: (r: RemoteRequest) => void }
      )?.onReject;

      return (
        <div className="flex justify-end pr-3 group w-[100px] relative">
          <div className="absolute group-hover:hidden  transition-opacity duration-200 group-hover:pointer-events-none  ">
            <button className="text-gray-500 hover:text-black">
              <BsThreeDots />
            </button>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-200">
            <button
              onClick={() => view?.(row.original)}
              className="cursor-pointer text-muted-foreground p-1"
            >
              <FaEye size={14} />
            </button>
            <button
              onClick={() => approve?.(row.original)}
              className="cursor-pointer text-green-600 p-1"
            >
              <FaCheck size={14} />
            </button>
            <button
              onClick={() => reject?.(row.original)}
              className="cursor-pointer text-red-500 p-1"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
