"use client";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "antd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LuDownload } from "react-icons/lu";
import { FaEye, FaPen, FaClockRotateLeft } from "react-icons/fa6";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* 1️⃣  Mock data                                                       */
/* ------------------------------------------------------------------ */
export interface LeaveRow {
  id: number;
  type: string;
  from: string;
  to: string;
  days: string;
  added: string;
  reason: string;
  actionBy: string; // "Name\nDateTime"
  status: "Approved" | "Pending" | "Rejected";
}

export const leaveRows: LeaveRow[] = [
  {
    id: 1,
    type: "Casual Leave",
    from: "Mon 13 Jan, 2025",
    to: "Mon 13 Jan, 2025",
    days: "1",
    added: "Wed 08 Jan, 2025",
    reason: "I am writing to request casual leave for personal work.",
    actionBy: "Payal Parmar\nJan 09, 2025, 09:46 AM",
    status: "Approved",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "Mon 27 Jan, 2025",
    to: "Tue 28 Jan, 2025",
    days: "2",
    added: "Wed 29 Jan, 2025",
    reason: "I was admitted for surgery at 27/01/2025.",
    actionBy: "Payal Parmar\nJan 29, 2025, 11:30 AM",
    status: "Approved",
  },
  {
    id: 3,
    type: "Casual Leave",
    from: "Mon 17 Feb, 2025",
    to: "Mon 17 Feb, 2025",
    days: "1",
    added: "Tue 11 Feb, 2025",
    reason: "I need to attend marriage of friend so requesting leave.",
    actionBy: "Payal Parmar\nFeb 11, 2025, 04:54 PM",
    status: "Approved",
  },
  {
    id: 4,
    type: "Casual Leave",
    from: "Thu 22 May, 2025",
    to: "Fri 23 May, 2025",
    days: "2",
    added: "Mon 12 May, 2025",
    reason: "I would like to request a casual leave.",
    actionBy: "Payal Parmar\nMay 12, 2025, 11:15 AM",
    status: "Approved",
  },
  {
    id: 5,
    type: "Sick Leave",
    from: "Mon 26 May, 2025",
    to: "Mon 26 May, 2025",
    days: "0.5 (Second Half)",
    added: "Mon 26 May, 2025",
    reason: "I am feeling unwell due to a fever and cannot work.",
    actionBy: "Payal Parmar\nMay 26, 2025, 10:58 AM",
    status: "Approved",
  },
];

/* ------------------------------------------------------------------ */
/* 2️⃣  Column definition                                               */
/* ------------------------------------------------------------------ */
import { ColumnDef } from "@tanstack/react-table";

export const leaveColumns: ColumnDef<LeaveRow>[] = [
  {
    header: "Leave Type",
    accessorKey: "type",
  },
  {
    header: "From",
    accessorKey: "from",
  },
  {
    header: "To",
    accessorKey: "to",
  },
  {
    header: "No. Of Days/Hours",
    accessorKey: "days",
    cell: ({ getValue }) => (
      <span className="text-blue-600 cursor-pointer">
        {getValue() as string}
      </span>
    ),
  },
  {
    header: "Added Date",
    accessorKey: "added",
  },
  {
    header: "Reason",
    accessorKey: "reason",
    cell: ({ getValue }) => {
      const txt = getValue() as string;
      return (
        <span>
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
    accessorKey: "actionBy",
    cell: ({ getValue }) => {
      const [name, dt] = (getValue() as string).split("\n");
      return (
        <div>
          <div>{name}</div>
          <div className="text-muted-foreground text-[10px]">{dt}</div>
        </div>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => (
      <Badge variant="default" className="capitalize">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex gap-2 justify-end">
        <FaClockRotateLeft className="text-blue-500 cursor-pointer" />
        <FaPen className="text-blue-500 cursor-pointer" />
        <FaEye className="text-gray-600 cursor-pointer" />
      </div>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* 3️⃣  Helper utils                                                    */
/* ------------------------------------------------------------------ */
const csvOf = (rows: LeaveRow[]) => {
  if (!rows.length) return "";
  const header = Object.keys(rows[0])
    .filter((k) => k !== "id")
    .join(",");
  const lines = rows.map((r) =>
    Object.entries(r)
      .filter(([k]) => k !== "id")
      .map(([, v]) => String(v).replace(/\n/g, " "))
      .join(",")
  );
  return [header, ...lines].join("\n");
};

/* ------------------------------------------------------------------ */
/* 4️⃣  Component                                                       */
/* ------------------------------------------------------------------ */
export default function LeaveHistoryTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("2025");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredRows = useMemo(() => {
    return leaveRows.filter((row) => {
      const matchGlobal = row.reason
        .toLowerCase()
        .includes(globalFilter.toLowerCase());
      const matchYear = yearFilter
        ? row.from.includes(yearFilter) || row.to.includes(yearFilter)
        : true;
      const matchStatus = statusFilter ? row.status === statusFilter : true;
      const matchType = typeFilter ? row.type === typeFilter : true;
      return matchGlobal && matchYear && matchStatus && matchType;
    });
  }, [globalFilter, yearFilter, statusFilter, typeFilter]);

  const table = useReactTable({
    data: filteredRows,
    columns: leaveColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = () => {
    const csv = csvOf(filteredRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-between items-center p-3">
        <h2 className="font-medium text-sm whitespace-nowrap">
          {filteredRows.length}{" "}
          <span className="text-[gray]">Leaves Applied</span>
        </h2>
        <div className="flex  items-center gap-2">
          <Input
            placeholder="Search"
            className="h-8  text-xs"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Casual Leave">Casual</SelectItem>
              <SelectItem value="Sick Leave">Sick</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 px-2" onClick={handleExport}>
            <LuDownload className="mr-1" /> CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto mt-1 w-[calc(100vw-5rem)]">
        <Table className="min-w-[1200px] text-xs border-b">
          <TableHeader className="bg-[#fafafb]">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={`px-2 py-2 whitespace-nowrap font-semibold tracking-wide ${
                      h.column.id === "actions"
                        ? "sticky right-0 bg-white z-10 shadow"
                        : ""
                    }`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`px-2 py-2 whitespace-nowrap text-muted-foreground ${
                      cell.column.id === "actions"
                        ? "sticky right-0 bg-white z-10 shadow"
                        : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
