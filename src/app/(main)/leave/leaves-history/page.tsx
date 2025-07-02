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
import { Button } from "@/components/ui/button";
import { LuDownload } from "react-icons/lu";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { leaveRows, leaveColumns, LeaveRow } from "./leaveData";

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
      <div className="overflow-x-auto mt-1 w-screen md:w-[calc(100vw-5rem)]">
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
