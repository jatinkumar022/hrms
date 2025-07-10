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
import { Alert } from "antd";
import { LuDownload } from "react-icons/lu";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useEffect, useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { getColumns, LeaveRow } from "./leaveData";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { fetchMyLeaveRequests } from "@/redux/slices/leave/user/userLeaveSlice";
import { SearchInput } from "@/components/ui/searchbox";

export default function LeaveHistoryTable() {
  const dispatch = useAppDispatch();
  const { myLeaveRequests, status, error } = useAppSelector(
    (state) => state.userLeave
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [yearFilter, setYearFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const isMobile = useMediaQuery("(max-width: 899px)");

  useEffect(() => {
    dispatch(fetchMyLeaveRequests());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    let data: LeaveRow[] = myLeaveRequests;
    if (globalFilter) {
      data = data.filter(
        (row) =>
          row.reason.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.type.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }
    if (yearFilter && yearFilter !== "all") {
      data = data.filter(
        (row) =>
          row.startDate.includes(yearFilter) || row.endDate.includes(yearFilter)
      );
    }
    if (statusFilter && statusFilter !== "all") {
      data = data.filter((row) => row.status === statusFilter);
    }
    if (typeFilter && typeFilter !== "all") {
      data = data.filter((row) => row.type === typeFilter);
    }
    return data;
  }, [myLeaveRequests, globalFilter, yearFilter, statusFilter, typeFilter]);

  const handleView = (row: LeaveRow) => {
    // Implement view logic, e.g., open a modal with leave details
    console.log("View Leave:", row);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onView: handleView,
      }),
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = () => {
    console.log("Export CSV clicked");
    alert("CSV export not yet implemented for dynamic data.");
  };

  if (status === "failed") {
    return (
      <Alert
        message="Error"
        description={error || "Failed to load leave requests"}
        type="error"
        showIcon
      />
    );
  }

  return (
    <>
      <FullPageLoader show={status === "loading"} />
      <div className="flex flex-wrap gap-2 justify-between items-center p-1.5 px-3 border-b">
        <h2 className="font-medium text-sm whitespace-nowrap">
          {filteredData.length}{" "}
          <span className="text-[gray]">Leaves Applied</span>
        </h2>
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="border-none  outline-none cursor-pointer">
                  <div className="flex h-9 items-center dark:text-[#c9c7c7] gap-2 rounded-xs border  px-2 py-1 text-xs font-medium">
                    <FaFilter className="mr-2" /> Filters
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="flex flex-col gap-3">
                  <SearchInput
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full"
                  />
                  <Select
                    value={yearFilter || "all"}
                    onValueChange={(value) =>
                      setYearFilter(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="all">All Years</SelectItem>
                      {Array.from({ length: 5 }, (_, i) =>
                        String(new Date().getFullYear() - i)
                      ).map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={typeFilter || "all"}
                    onValueChange={(value) =>
                      setTypeFilter(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue placeholder="Leave Type" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Casual Leave">Casual</SelectItem>
                      <SelectItem value="Sick Leave">Sick</SelectItem>
                      <SelectItem value="Earned Leave">Earned</SelectItem>
                      <SelectItem value="LWP">LWP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <SearchInput
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <Select
                value={yearFilter || "all"}
                onValueChange={(value) =>
                  setYearFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {Array.from({ length: 5 }, (_, i) =>
                    String(new Date().getFullYear() - i)
                  ).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter || "all"}
                onValueChange={(value) =>
                  setTypeFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Casual Leave">Casual</SelectItem>
                  <SelectItem value="Sick Leave">Sick</SelectItem>
                  <SelectItem value="Earned Leave">Earned</SelectItem>
                  <SelectItem value="LWP">LWP</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          {isMobile ? (
            <button className="border-none  outline-none cursor-pointer">
              <div className="flex h-9 items-center dark:text-[#c9c7c7] gap-2 rounded-xs border  px-2 py-1 text-xs font-medium">
                <LuDownload className="mr-1" /> CSV
              </div>
            </button>
          ) : (
            <button onClick={handleExport}>
              <div className="h-9 px-3 flex items-center gap-1 text-xs text-[black] dark:text-[#c9c7c7] border-input dark:hover:bg-input/30 hover:text-white cursor-pointer rounded-md border dark:bg-input/40">
                {" "}
                <LuDownload className="mr-1" /> CSV
              </div>
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto  w-screen md:w-[calc(100vw-5rem)]">
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
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
    </>
  );
}
