// components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Location from "@/assets/location.svg";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { FaEye, FaFileInvoice } from "react-icons/fa6";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdDesktopMac, MdPhoneIphone } from "react-icons/md";

const DeviceIconWithTooltip = ({ device }: { device: string }) => {
  const isDesktop = device === "desktop";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-[16px] text-gray-500">
          {isDesktop ? <MdDesktopMac /> : <MdPhoneIphone />}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        Clocked in device: {isDesktop ? "Desktop" : "Mobile"}
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
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}
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
            className="bg-blue-50 text-blue-500 border-none text-[11px] py-1 px-2 "
          >
            Weekend
          </Badge>
        );
      if (status === "present")
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-[#47c947] border-none text-[11px] py-1 px-2 "
          >
            Present
          </Badge>
        );
      if (status === "absent")
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-500 border-none text-[11px] py-1 px-2 "
          >
            Absent
          </Badge>
        );
      return status;
    },
  },
  {
    accessorKey: "attendance.lateIn",
    header: "Late In",
    cell: ({ row }) =>
      row.original.attendance.lateIn ? (
        <span className="text-red-500">Yes</span>
      ) : (
        <span className="text-green-500">No</span>
      ),
  },
  {
    accessorKey: "attendance.earlyOut",
    header: "Early Out",
    cell: ({ row }) =>
      row.original.attendance.earlyOut ? (
        <span className="text-red-500">Yes</span>
      ) : (
        <span className="text-green-500">No</span>
      ),
  },
  {
    accessorKey: "attendance.workSegments",
    header: "Clock In",
    cell: ({ row, table }) => {
      const ws = row.original.attendance.workSegments;
      if (!ws || ws.length === 0) return "-";

      const first = ws[0];
      const locationStr = first.clockInLocation;
      const deviceType = first.clockInDeviceType;
      const handleOpenMap = (table.options.meta as any).handleOpenMap;

      let latLng: [number, number] | null = null;
      if (locationStr && locationStr.includes(",")) {
        const [lat, lng] = locationStr.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) latLng = [lat, lng];
      }

      return (
        <div className="text-[11px] flex items-center gap-1 text-[#8d8d8d]">
          {first.clockIn || "-"}
          {latLng && (
            <Image
              src={Location}
              className="w-[14px] cursor-pointer"
              alt="Location"
              onClick={() =>
                handleOpenMap(latLng[0], latLng[1], "Clock In Location")
              }
            />
          )}
          {deviceType && <DeviceIconWithTooltip device={deviceType} />}
        </div>
      );
    },
  },

  {
    accessorKey: "attendance.workSegments",
    header: "Clock Out",
    cell: ({ row, table }) => {
      const ws = row.original.attendance.workSegments;
      if (!ws || ws.length === 0) return "-";

      const last = ws[ws.length - 1];
      const locationStr = last.clockOutLocation;
      const deviceType = last.clockOutDeviceType;
      const handleOpenMap = (table.options.meta as any).handleOpenMap;

      let latLng: [number, number] | null = null;
      if (locationStr && locationStr.includes(",")) {
        const [lat, lng] = locationStr.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) latLng = [lat, lng];
      }

      return (
        <div className="text-[11px] flex items-center gap-1 text-[#8d8d8d]">
          {last.clockOut || "-"}
          {latLng && (
            <Image
              src={Location}
              className="w-[14px] cursor-pointer"
              alt="Location"
              onClick={() =>
                handleOpenMap(latLng[0], latLng[1], "Clock Out Location")
              }
            />
          )}
          {deviceType && <DeviceIconWithTooltip device={deviceType} />}
        </div>
      );
    },
  },

  {
    accessorKey: "attendance.totalDuration",
    header: "Total Time",
    cell: ({ row }) => {
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
      const totalDuration = formatDuration(cumulativeWorkDurationSeconds);
      return totalDuration || "-";
    },
  },
  {
    accessorKey: "attendance.breakDuration",
    header: "Break Duration",
    cell: ({ row }) => row.original.attendance.breakDuration || "-",
  },
  {
    accessorKey: "attendance.productiveDuration",
    header: "Productive Duration",
    cell: ({ row }) => {
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
      const productiveDuration = dayjs
        .duration(cumulativeProductiveDurationSeconds, "seconds")
        .format("HH:mm:ss");
      return productiveDuration || "-";
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
        <div className="flex justify-end pr-3 group w-[80px]">
          <div className="absolute group-hover:opacity-0 transition-opacity duration-200">
            <button className="text-gray-500 hover:text-black">
              <BsThreeDots />
            </button>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-200">
            <button
              className="cursor-pointer text-sidebar-primary p-1"
              onClick={() => view(row.original)}
            >
              <FaEye size={16} />
            </button>
            <button className="cursor-pointer text-sidebar-primary p-1">
              <FaFileInvoice size={16} />
            </button>
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
