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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input, Alert } from "antd";
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
import { useEffect, useMemo, useState } from "react";
import { getColumns, LeaveRow } from "./requestsData";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAllLeaveRequests,
  updateLeaveRequestStatus,
} from "@/redux/slices/leave/admin/adminLeaveSlice";
import { fetchAllUsers } from "@/redux/slices/users/allUsersSlice";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { getInitials } from "@/lib/getInitials";
import FullPageLoader from "@/components/loaders/FullPageLoader";

export default function LeaveRequestsTable() {
  const dispatch = useAppDispatch();
  const { allLeaveRequests, status, error } = useAppSelector(
    (state) => state.adminLeave
  );
  const { users: allUsers } = useAppSelector((state) => state.allUsers);

  const [globalFilter, setGlobalFilter] = useState("");
  const [yearFilter, setYearFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [userFilter, setUserFilter] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    dispatch(fetchAllLeaveRequests());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    let data: LeaveRow[] = allLeaveRequests;
    if (globalFilter) {
      data = data.filter(
        (row) =>
          row.reason.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.type.toLowerCase().includes(globalFilter.toLowerCase()) ||
          (row.userId &&
            row.userId.username
              .toLowerCase()
              .includes(globalFilter.toLowerCase()))
      );
    }
    if (userFilter && userFilter !== "all") {
      data = data.filter((row) => row.userId._id === userFilter);
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
  }, [
    allLeaveRequests,
    globalFilter,
    yearFilter,
    statusFilter,
    typeFilter,
    userFilter,
  ]);

  const handleApprove = (leaveId: string) => {
    dispatch(updateLeaveRequestStatus({ leaveId, status: "approved" }));
  };

  const handleReject = (leaveId: string) => {
    dispatch(updateLeaveRequestStatus({ leaveId, status: "rejected" }));
  };

  const handleView = (row: LeaveRow) => {
    // Implement view logic, e.g., open a modal with leave details
    console.log("View Leave:", row);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onApprove: handleApprove,
        onReject: handleReject,
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
    meta: {
      onApprove: handleApprove,
      onReject: handleReject,
      onView: handleView,
    },
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
      <div className="flex flex-wrap gap-2 justify-between items-center p-3">
        <h2 className="font-medium text-sm whitespace-nowrap">
          Leave Requests
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search"
            className="h-8  text-xs"
            value={globalFilter}
            style={{ width: "100px" }}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <Select
            value={userFilter || "all"}
            onValueChange={(value) =>
              setUserFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-8 w-48 text-xs">
              <SelectValue placeholder="Filter by User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {allUsers.map((user) => {
                const fullName = [user.firstName, user.lastName]
                  .filter(Boolean)
                  .join(" ");
                const fallbackName = fullName || user.username;

                return (
                  <SelectItem key={user._id} value={user._id}>
                    <div className="flex items-center gap-2">
                      {user.profileImage ? (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback>
                            {getInitials(fallbackName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <InitialsAvatar
                          name={fallbackName}
                          size={20}
                          className="text-xs"
                        />
                      )}
                      <span>{user.username}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
          <Button size="sm" className="h-8 px-2" onClick={handleExport}>
            <LuDownload className="mr-1" /> CSV
          </Button>
          <Button size="sm" className="h-8 px-2">
            +
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto mt-1 w-screen md:w-[calc(100vw-5rem)]">
        <Table className="min-w-[1200px] text-xs border-b">
          <TableHeader className="bg-slate-100 dark:bg-slate-800">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={`px-2 py-3 text-xs uppercase text-muted-foreground ${
                      h.column.id === "actions"
                        ? "sticky right-0 bg-slate-100 dark:bg-slate-800"
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
                          ? "sticky right-0 bg-white z-10 dark:bg-slate-900"
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
