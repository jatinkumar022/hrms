"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import dayjs from "dayjs";

// 1. Type
export type LeaveRow = {
  _id: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  leaveDayType: "Full Day" | "Half Day" | "Hourly";
  halfDayTime?: "First Half" | "Second Half";
  duration?: string;
  type: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  approvedBy?: { username: string };
  // actionBy is not in the model, will be handled separately if available
};

// 2. Column Definitions
export const getColumns = ({
  onView,
}: {
  onView: (row: LeaveRow) => void;
}): ColumnDef<LeaveRow>[] => [
  {
    header: "Leave Type",
    accessorKey: "type",
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          From
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
      const { leaveDayType, halfDayTime } = row.original;
      if (leaveDayType === "Half Day") return halfDayTime;
      return leaveDayType;
    },
  },
  {
    header: "No. Of Days/Hours",
    accessorKey: "numberOfDays",
    cell: ({ row }) => {
      const { numberOfDays, leaveDayType, halfDayTime } = row.original;
      if (leaveDayType === "Half Day" && halfDayTime) {
        return `${numberOfDays} (${halfDayTime})`;
      }
      return `${numberOfDays}`;
    },
  },
  {
    header: "Added Date",
    accessorKey: "createdAt",
    cell: ({ row }) => dayjs(row.original.createdAt).format("ddd DD MMM, YYYY"),
  },
  {
    header: "Reason",
    accessorKey: "reason",
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
      console.log(approvedBy);
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
      // Fallback for rejected or other statuses without an explicit approver
      return "System";
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
