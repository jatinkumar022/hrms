"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { RemoteRequest, RemoteTableMeta } from "@/lib/types";

export const remoteColumns: ColumnDef<RemoteRequest>[] = [
  {
    accessorKey: "name",
    header: "Employee",
    cell: ({ row }) => {
      const name = row.original.name;
      const image = row.original.image;
      return (
        <div className="flex items-center gap-2">
          <Image
            src={image}
            alt={name}
            width={32}
            height={32}
            className="rounded-full object-cover"
            unoptimized
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
    cell: ({ row }: { row: Row<RemoteRequest> }) => (
      <div className="text-center">{row.original.nuOfDaysHours}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase() || "pending";
      const color =
        status === "approved"
          ? "bg-green-50 text-green-600"
          : status === "pending"
          ? "bg-yellow-50 text-yellow-600"
          : "bg-red-50 text-red-600";
      return (
        <Badge variant="outline" className={`border-none text-xs ${color}`}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  { accessorKey: "requestedOn", header: "Requested On" },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }: { row: Row<RemoteRequest> }) => (
      <div className="text-xs text-muted-foreground max-w-xs truncate">
        {row.original.reason}
      </div>
    ),
  },
  {
    accessorKey: "actionBy",
    header: "Action By",
    cell: ({ row }: { row: Row<RemoteRequest> }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.actionBy}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const { onView, onApprove, onReject } = table.options
        .meta as RemoteTableMeta;

      return (
        <div className="flex justify-end pr-3 group w-[100px] relative">
          <div className="absolute group-hover:hidden transition-opacity duration-200 group-hover:pointer-events-none">
            <button className="text-gray-500 hover:text-black">
              <BsThreeDots />
            </button>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-200">
            <button
              onClick={() => onView?.(row.original)}
              className="cursor-pointer text-muted-foreground p-1"
            >
              <FaEye size={14} />
            </button>
            <button
              onClick={() => onApprove?.(row.original)}
              className="cursor-pointer text-green-600 p-1"
            >
              <FaCheck size={14} />
            </button>
            <button
              onClick={() => onReject?.(row.original)}
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
