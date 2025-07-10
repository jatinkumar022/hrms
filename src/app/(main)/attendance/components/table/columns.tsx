"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Location from "@/assets/location.svg";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { FaEye, FaFileInvoice } from "react-icons/fa6";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdDesktopMac, MdPhoneIphone } from "react-icons/md";
import { secondsToDuration } from "@/lib/attendanceHelpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const DeviceIconWithTooltip = ({ device }: { device: string }) => {
  const Icon = device === "desktop" ? MdDesktopMac : MdPhoneIphone;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon size={16} className="text-gray-500 cursor-pointer min-w-max" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{device}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export type AttendanceRow = {
  date: string;
  user: { username: string };
  shift: { name: string };
  attendance: {
    status: string;
    lateIn?: boolean;
    earlyOut?: boolean;
    lateInReason?: string;
    earlyOutReason?: string;
    totalDuration?: string;
    productiveDuration?: string;
    breakDuration?: string;
    breaks?: any[];
    workSegments?: any[];
  };
};

export const columns: ColumnDef<AttendanceRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "user.username",
    header: "Name",
    cell: ({ row }) => row.original.user.username,
  },
  {
    accessorKey: "attendance.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.attendance.status;
      if (status === "weekend")
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-[#202020] dark:text-blue-400 text-blue-500 border-none text-[11px] py-1 px-2 "
          >
            Weekend
          </Badge>
        );
      if (status === "present")
        return (
          <Badge
            variant="outline"
            className="bg-green-50 dark:bg-[#202020] dark:text-green-400 text-green-500 border-none text-[11px] py-1 px-2 "
          >
            Present
          </Badge>
        );
      if (status === "absent")
        return (
          <Badge
            variant="outline"
            className="bg-red-50 dark:bg-[#202020] dark:text-red-400 text-red-500 border-none text-[11px] py-1 px-2 "
          >
            Absent
          </Badge>
        );
      if (status === "on_leave")
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 dark:bg-[#202020] dark:text-orange-400 text-orange-500 border-none text-[11px] py-1 px-2 "
          >
            On Leave
          </Badge>
        );
      if (status === "on_remote")
        return (
          <Badge
            variant="outline"
            className="bg-cyan-50 dark:bg-[#202020] dark:text-cyan-400 text-cyan-500 border-none text-[11px] py-1 px-2 "
          >
            On Remote
          </Badge>
        );
      return status;
    },
  },
  {
    accessorKey: "attendance.lateIn",
    header: "Late In",
    cell: ({ row }) => {
      const status = row.original.attendance.status;
      if (status === "absent" || status === "weekend") return "-";
      return row.original.attendance.lateIn ? (
        <span className="text-red-500">Yes</span>
      ) : (
        <span className="text-green-500">No</span>
      );
    },
  },
  {
    accessorKey: "attendance.earlyOut",
    header: "Early Out",
    cell: ({ row }) => {
      const status = row.original.attendance.status;
      if (status === "absent" || status === "weekend") return "-";
      return row.original.attendance.earlyOut ? (
        <span className="text-red-500">Yes</span>
      ) : (
        <span className="text-green-500">No</span>
      );
    },
  },
  {
    accessorKey: "attendance.workSegments",
    header: "Clock In",
    cell: ({ row, table }) => {
      const status = row.original.attendance.status;
      if (status === "absent" || status === "weekend") return "-";
      const ws = row.original.attendance.workSegments;
      if (!ws || ws.length === 0) return "-";
      const first = ws[0];
      const locationStr = first.clockInLocation;
      let latLng: [number, number] | null = null;
      if (locationStr && locationStr.includes(",")) {
        const parts = locationStr.split(",").map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          latLng = [parts[0], parts[1]];
        }
      }
      const handleOpenMap = (
        table.options.meta as {
          handleOpenMap: (lat: number, lng: number, label: string) => void;
        }
      ).handleOpenMap;

      return (
        <div className="text-[11px] flex items-center gap-1 text-[#8d8d8d]">
          {first.clockIn || "-"}
          {latLng && (
            <Image
              src={Location}
              className="w-[14px] cursor-pointer"
              alt="Location"
              onClick={() =>
                handleOpenMap(latLng![0], latLng![1], "Clock In Location")
              }
            />
          )}
          {first.clockInDeviceType && (
            <DeviceIconWithTooltip device={first.clockInDeviceType} />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "attendance.workSegments",
    header: "Clock Out",
    cell: ({ row, table }) => {
      const status = row.original.attendance.status;
      if (status === "absent" || status === "weekend") return "-";
      const ws = row.original.attendance.workSegments;
      if (!ws || ws.length === 0) return "-";
      const last = ws[ws.length - 1];
      const locationStr = last.clockOutLocation;
      let latLng: [number, number] | null = null;
      if (locationStr && locationStr.includes(",")) {
        const parts = locationStr.split(",").map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          latLng = [parts[0], parts[1]];
        }
      }
      const handleOpenMap = (
        table.options.meta as {
          handleOpenMap: (lat: number, lng: number, label: string) => void;
        }
      ).handleOpenMap;

      return (
        <div className="text-[11px] flex items-center gap-1 text-[#8d8d8d]">
          {last.clockOut || "-"}
          {latLng && (
            <Image
              src={Location}
              className="w-[14px] cursor-pointer"
              alt="Location"
              onClick={() =>
                handleOpenMap(latLng![0], latLng![1], "Clock Out Location")
              }
            />
          )}
          {last.clockOutDeviceType && (
            <DeviceIconWithTooltip device={last.clockOutDeviceType} />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "attendance.totalDuration",
    header: "Total Time",
    cell: ({ row }) => {
      const status = row.original.attendance.status;
      if (status === "absent" || status === "weekend") return "-";
      const attendanceObj = row.original.attendance;
      let cumulativeWorkDurationSeconds = 0;
      const now = dayjs();
      if (attendanceObj.workSegments && attendanceObj.workSegments.length > 0) {
        for (const segment of attendanceObj.workSegments) {
          const segmentObj = segment;
          if (segmentObj.clockOut && segmentObj.duration !== undefined) {
            cumulativeWorkDurationSeconds += segmentObj.duration;
          } else if (segmentObj.clockIn && !segmentObj.clockOut) {
            // Active segment, calculate duration up to now
            const segmentStart = dayjs(
              `${row.original.date}T${segmentObj.clockIn}`
            );
            cumulativeWorkDurationSeconds += now.diff(segmentStart, "second");
          }
        }
      }
      return secondsToDuration(cumulativeWorkDurationSeconds) || "-";
    },
  },
  {
    accessorKey: "attendance.breakDuration",
    header: "Break Duration",
    cell: ({ row }) => {
      const status = row.original.attendance.status;
      if (status === "absent" || status === "weekend") return "-";
      return row.original.attendance.breakDuration || "-";
    },
  },
  {
    accessorKey: "attendance.productiveDuration",
    header: "Productive Duration",
    cell: ({ row }) => {
      const status = row.original.attendance.status;
      if (status === "absent" || status === "weekend") return "-";
      const attendanceObj = row.original.attendance;
      let cumulativeProductiveDurationSeconds = 0;
      const now = dayjs();
      if (attendanceObj.workSegments && attendanceObj.workSegments.length > 0) {
        for (const segment of attendanceObj.workSegments) {
          const segmentObj = segment;
          if (segmentObj.clockOut && segmentObj.duration !== undefined) {
            cumulativeProductiveDurationSeconds += segmentObj.duration;
          } else if (segmentObj.clockIn && !segmentObj.clockOut) {
            // Active segment, calculate duration up to now
            const segmentStart = dayjs(
              `${row.original.date}T${segmentObj.clockIn}`
            );
            cumulativeProductiveDurationSeconds += now.diff(
              segmentStart,
              "second"
            );
          }
        }
      }
      return secondsToDuration(cumulativeProductiveDurationSeconds) || "-";
    },
  },
  {
    accessorKey: "shift.name",
    header: "Shift",
    cell: ({ row }) => row.original.shift?.name || "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const view = (
        table.options.meta as { handleView: (r: AttendanceRow) => void }
      ).handleView;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <BsThreeDots />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => view(row.original)}>
              <FaEye size={16} className="mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FaFileInvoice size={16} className="mr-2" />
              Timesheet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
