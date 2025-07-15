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
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
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
import { getColumns, CorrectionRequestRow } from "./correctionData";
import {
  fetchPendingRequests,
  processAttendanceRequest,
} from "@/redux/slices/attendance-request/admin/adminAttendanceRequestSlice";
// import { fetchAllUsers } from "@/redux/slices/users/allUsersSlice";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { getInitials } from "@/lib/getInitials";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { SearchInput } from "@/components/ui/searchbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoInformationCircleOutline } from "react-icons/io5";

export default function AdminAttendanceRequestsPage() {
  const dispatch = useAppDispatch();
  const {
    requests,
    loading: status,
    error,
  } = useAppSelector((state) => state.adminAttendanceRequest);
  // const { users: allUsers } = useAppSelector((state) => state.allUsers);

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [userFilter, setUserFilter] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const isMobile = useMediaQuery("(max-width: 899px)");

  useEffect(() => {
    dispatch(fetchPendingRequests() as any);
    // dispatch(fetchAllUsers());
  }, [dispatch]);

  const uniqueUsers = useMemo(() => {
    const userMap = new Map();
    requests.forEach((request) => {
      if (!userMap.has(request.userId._id)) {
        userMap.set(request.userId._id, request.userId);
      }
    });
    return Array.from(userMap.values());
  }, [requests]);

  const filteredData = useMemo(() => {
    let data: CorrectionRequestRow[] = requests;
    if (globalFilter) {
      data = data.filter(
        (row) =>
          row.reason.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.requestType.toLowerCase().includes(globalFilter.toLowerCase()) ||
          (row.userId &&
            row.userId.username
              .toLowerCase()
              .includes(globalFilter.toLowerCase()))
      );
    }
    if (userFilter && userFilter !== "all") {
      data = data.filter((row) => row.userId._id === userFilter);
    }
    if (statusFilter && statusFilter !== "all") {
      data = data.filter((row) => row.status === statusFilter);
    }
    if (typeFilter && typeFilter !== "all") {
      data = data.filter((row) => row.requestType === typeFilter);
    }
    return data;
  }, [requests, globalFilter, statusFilter, typeFilter, userFilter]);

  const handleApprove = (requestId: string) => {
    dispatch(processAttendanceRequest({ requestId, action: "approve" }) as any);
  };

  const handleReject = (requestId: string) => {
    dispatch(processAttendanceRequest({ requestId, action: "reject" }) as any);
  };

  const handleView = (row: CorrectionRequestRow) => {
    console.log("View Request:", row);
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
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (status) {
    return <FullPageLoader show={status} />;
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error || "Failed to load requests"}
        type="error"
        showIcon
      />
    );
  }

  return (
    <>
      <FullPageLoader show={status} />
      <div className="flex flex-wrap gap-2 justify-between items-center p-1.5 px-3 border-b ">
        <h2 className="font-medium text-sm whitespace-nowrap">
          {filteredData.length}{" "}
          <span className="text-[gray] dark:text-[#c9c7c7]">Requests</span>
        </h2>
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="border-none outline-none cursor-pointer">
                  <div className="flex h-9 items-center dark:text-[#c9c7c7] gap-2 rounded-xs border px-2 py-1 text-xs font-medium">
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
                    value={userFilter || "all"}
                    onValueChange={(value) =>
                      setUserFilter(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue placeholder="Filter by User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center gap-2">
                            {user.profileImage ? (
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.profileImage} />
                                <AvatarFallback>
                                  {getInitials(user.username)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <InitialsAvatar
                                name={user.username}
                                className="h-5 w-5 text-xs"
                              />
                            )}
                            <span>{user.username}</span>
                          </div>
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
                      <SelectValue placeholder="Request Type" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="clock-in">Clock-in</SelectItem>
                      <SelectItem value="clock-out">Clock-out</SelectItem>
                      <SelectItem value="break-in">Break-in</SelectItem>
                      <SelectItem value="break-out">Break-out</SelectItem>
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
                value={userFilter || "all"}
                onValueChange={(value) =>
                  setUserFilter(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="Filter by User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      <div className="flex items-center gap-2">
                        {user.profileImage ? (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback>
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <InitialsAvatar
                            name={user.username}
                            className="h-5 w-5 text-xs"
                          />
                        )}
                        <span>{user.username}</span>
                      </div>
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
                <SelectTrigger className="h-8 w-32 text-xs">
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
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="clock-in">Clock-in</SelectItem>
                  <SelectItem value="clock-out">Clock-out</SelectItem>
                  <SelectItem value="break-in">Break-in</SelectItem>
                  <SelectItem value="break-out">Break-out</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>
      <div className="overflow-x-auto w-screen md:w-[calc(100vw-5rem)] h-[calc(100vh-165px)] md:h-[calc(100vh-168px)]">
        <Table className="min-w-[700px] text-xs border-b">
          <TableHeader className="bg-[#fafafb]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-2 py-2 whitespace-nowrap font-semibold tracking-wide ${
                      header.column.id === "actions"
                        ? "sticky right-0 bg-white z-10 shadow"
                        : ""
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                    <TableCell
                      key={cell.id}
                      className={`px-2 py-2 whitespace-nowrap text-muted-foreground ${
                        cell.column.id === "actions"
                          ? "sticky right-0 bg-white dark:bg-[#111111] w-8  z-10 shadow"
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
      <div className="sticky bottom-0 flex items-center justify-between p-2 text-xs border-t bg-white dark:bg-black z-30">
        <div className="flex items-center gap-2 text-muted-foreground">
          {" "}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-7 w-7 p-0">
                <IoInformationCircleOutline size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div>
                <span>Information</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Entries</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="!h-7 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-medium w-7 h-7 border rounded-md">
              {table.getState().pagination.pageIndex + 1}
            </div>
            <Button
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
