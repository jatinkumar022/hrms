"use client";
import { Card } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { FaClipboardList } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { useAttendance } from "@/hooks/useAttendance";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import {
  secondsToDuration,
  parseDurationToSeconds,
} from "@/lib/attendanceHelpers";
import { useEffect, useMemo, useState } from "react";
import AttendanceReasonDialog from "@/components/Dashboard/AttendanceReasonDialog";
import { Toaster, toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdDesktopMac, MdMyLocation, MdPhoneIphone } from "react-icons/md";
import Image from "next/image";
import LocationIcon from "@/assets/location.svg";
import MapModalLoader from "../attendance/components/DataSummery/MapModalLoader";
import { useRouter } from "next/navigation";
import NoActivity from "@/assets/no-increment.svg";
dayjs.extend(minMax);

type ActivityEvent = {
  type: "Clock In" | "Clock Out" | "Break In" | "Break Out";
  time: string;
  location: string;
  device?: "mobile" | "desktop";
  reason?: string;
};

const DeviceIconWithTooltip = ({ device }: { device?: string }) => {
  if (!device) return null;
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

const columns: ColumnDef<ActivityEvent>[] = [
  {
    accessorKey: "type",
    header: "Activity",
    cell: ({ row }) => {
      const type = row.original.type;
      let badgeClass = "";
      if (type === "Clock In" || type === "Break Out") {
        badgeClass =
          "bg-green-50 dark:bg-[#202020] dark:text-green-400 text-green-500";
      } else if (type === "Clock Out" || type === "Break In") {
        badgeClass =
          "bg-yellow-50 dark:bg-[#202020] dark:text-yellow-400 text-yellow-500";
      }
      return (
        <Badge
          variant="outline"
          className={`${badgeClass} border-none text-[11px] py-1 px-2`}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row, table }) => {
      const locationStr = row.original.location;
      let latLng: [number, number] | null = null;
      if (locationStr && locationStr.includes(",")) {
        const parts = locationStr.split(",").map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          latLng = [parts[0], parts[1]];
        }
      }
      const { handleOpenMap } = table.options.meta as {
        handleOpenMap: (lat: number, lng: number, label: string) => void;
      };

      return (
        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
          {latLng && (
            <Image
              src={LocationIcon}
              className="w-[14px] cursor-pointer"
              alt="Location"
              onClick={() =>
                handleOpenMap(
                  latLng![0],
                  latLng![1],
                  `${row.original.type} Location`
                )
              }
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "device",
    header: "Device",
    cell: ({ row }) => <DeviceIconWithTooltip device={row.original.device} />,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-sm italic text-gray-500">
        {row.original.reason || "-"}
      </span>
    ),
  },
];

export default function FinalOutTimePage() {
  const { report, clockOut, isLoading } = useAttendance();

  const router = useRouter();

  const {
    location,
    loading: loadingLocation,
    error: locationError,
    getLocation,
  } = useGeolocation();

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapModalLat, setMapModalLat] = useState(0);
  const [mapModalLng, setMapModalLng] = useState(0);
  const [mapModalLabel, setMapModalLabel] = useState("");

  const handleOpenMap = (lat: number, lng: number, label: string) => {
    setMapModalLat(lat);
    setMapModalLng(lng);
    setMapModalLabel(label);
    setMapModalOpen(true);
  };

  const [isEarlyClockOutReasonDialogOpen, setIsEarlyClockOutReasonDialogOpen] =
    useState(false);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const attendance = report?.attendance;
  const isClockedInCurrently = attendance?.workSegments?.some(
    (segment) => !segment.clockOut
  );
  const isBreakActive = attendance?.breaks?.some((b) => !b.end);

  const requiredTotalWorkSeconds = 9 * 3600;
  const requiredProductiveWorkSeconds = 8 * 3600;

  const { totalWorkSeconds, totalBreakSeconds, firstClockIn, lastClockOut } =
    useMemo(() => {
      if (!attendance) {
        return {
          totalWorkSeconds: 0,
          totalBreakSeconds: 0,
          firstClockIn: null,
          lastClockOut: null,
        };
      }

      let workSeconds = 0;
      if (attendance.workSegments) {
        for (const segment of attendance.workSegments) {
          workSeconds += parseDurationToSeconds(
            segment.duration?.toString() || "00:00:00"
          );
        }
      }

      let breakSeconds = 0;
      if (attendance.breaks) {
        for (const brk of attendance.breaks) {
          breakSeconds += parseDurationToSeconds(
            brk.duration?.toString() || "00:00:00"
          );
        }
      }

      const clockIns =
        attendance.workSegments?.map((ws) => ws.clockIn).filter(Boolean) || [];
      const clockOuts =
        attendance.workSegments?.map((ws) => ws.clockOut).filter(Boolean) || [];

      const firstClockInTime = clockIns.length
        ? clockIns.reduce((a, b) => (a! < b! ? a : b))
        : null;
      const lastClockOutTime = clockOuts.length
        ? clockOuts.reduce((a, b) => (a! > b! ? a : b))
        : null;

      return {
        totalWorkSeconds: workSeconds,
        totalBreakSeconds: breakSeconds,
        firstClockIn: firstClockInTime,
        lastClockOut: lastClockOutTime,
      };
    }, [attendance]);

  const [liveTotalWorkSeconds, setLiveTotalWorkSeconds] =
    useState(totalWorkSeconds);

  useEffect(() => {
    setLiveTotalWorkSeconds(totalWorkSeconds);
  }, [totalWorkSeconds]);

  const handleAction = async (action: () => Promise<any>) => {
    const result = await action();
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(result.payload.message || "Action successful!");
      router.push("/");
    } else {
      toast.error(result.payload || "An error occurred.");
    }
  };

  const onClockOutAttempt = () => {
    if (!location && !locationError) {
      getLocation();
    }

    if (loadingLocation) {
      toast.info("Getting your current location...");
      return;
    }
    if (locationError) {
      toast.error(`Location Error: ${locationError}`);
      return;
    }
    if (!location) {
      toast.error("Location not available. Please try again.");
      return;
    }

    const now = dayjs();
    let totalDailyWorkSeconds = 0;
    let totalDailyProductiveSeconds = 0;

    if (attendance?.workSegments) {
      for (const segment of attendance.workSegments) {
        const segmentClockInDate = dayjs(`${report?.date}T${segment.clockIn}`);
        let segmentEndTargetDate;

        if (segment.clockOut) {
          segmentEndTargetDate = dayjs(`${report?.date}T${segment.clockOut}`);
          totalDailyWorkSeconds += parseDurationToSeconds(
            segment.duration || "00:00:00"
          );
          totalDailyProductiveSeconds += parseDurationToSeconds(
            segment.productiveDuration || "00:00:00"
          );
        } else {
          segmentEndTargetDate = now;
          totalDailyWorkSeconds += segmentEndTargetDate.diff(
            segmentClockInDate,
            "second"
          );

          let activeSegmentBreaksSeconds = 0;
          for (const brk of attendance?.breaks || []) {
            const breakStartTime = dayjs(`${report?.date}T${brk.start}`);
            const breakEndTime = brk.end
              ? dayjs(`${report?.date}T${brk.end}`)
              : now;

            const overlapStart = dayjs.max(segmentClockInDate, breakStartTime);
            const overlapEnd = dayjs.min(now, breakEndTime);

            if (overlapStart.isBefore(overlapEnd)) {
              activeSegmentBreaksSeconds += overlapEnd.diff(
                overlapStart,
                "second"
              );
            }
          }
          totalDailyProductiveSeconds += Math.max(
            0,
            totalDailyWorkSeconds - activeSegmentBreaksSeconds
          );
        }
      }
    }

    const isEarlyClockOut =
      totalDailyWorkSeconds < requiredTotalWorkSeconds ||
      totalDailyProductiveSeconds < requiredProductiveWorkSeconds;

    if (isEarlyClockOut) {
      setIsEarlyClockOutReasonDialogOpen(true);
    } else {
      handleAction(() => clockOut({ reason: "", location }));
    }
  };

  const handleEarlyClockOutWithReason = async (reason: string) => {
    if (reason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters long.");
      return;
    }

    if (!location) {
      toast.error(
        "Location not available. Please try again or refresh the page."
      );
      return;
    }

    await handleAction(() => clockOut({ reason, location }));
    setIsEarlyClockOutReasonDialogOpen(false);
    router.push("/");
  };

  const activityLog = useMemo(() => {
    if (!attendance || !report?.date) return [];

    const events: (ActivityEvent & { sortKey: number })[] = [];

    attendance.workSegments?.forEach((seg, index) => {
      if (seg.clockIn) {
        events.push({
          type: "Clock In",
          time: dayjs(`${report.date}T${seg.clockIn}`).format("hh:mm A"),
          location: seg.clockInLocation || "N/A",
          device: seg.clockInDeviceType,
          reason:
            index === 0 && attendance.lateIn
              ? attendance.lateInReason
              : undefined,
          sortKey: dayjs(`${report.date}T${seg.clockIn}`).valueOf(),
        });
      }
      if (seg.clockOut) {
        events.push({
          type: "Clock Out",
          time: dayjs(`${report.date}T${seg.clockOut}`).format("hh:mm A"),
          location: seg.clockOutLocation || "N/A",
          device: seg.clockOutDeviceType,
          reason:
            index === attendance.workSegments!.length - 1 && attendance.earlyOut
              ? attendance.earlyOutReason
              : undefined,
          sortKey: dayjs(`${report.date}T${seg.clockOut}`).valueOf(),
        });
      }
    });

    attendance.breaks?.forEach((br) => {
      if (br.start) {
        events.push({
          type: "Break In",
          time: dayjs(`${report.date}T${br.start}`).format("hh:mm A"),
          location: br.startLocation || "N/A",
          device: br.startDeviceType,
          reason: br.reason,
          sortKey: dayjs(`${report.date}T${br.start}`).valueOf(),
        });
      }
      if (br.end) {
        events.push({
          type: "Break Out",
          time: dayjs(`${report.date}T${br.end}`).format("hh:mm A"),
          location: br.endLocation || "N/A",
          device: br.endDeviceType,
          reason: br.reason,
          sortKey: dayjs(`${report.date}T${br.end}`).valueOf(),
        });
      }
    });

    return events.sort((a, b) => a.sortKey - b.sortKey);
  }, [attendance, report?.date]);

  useEffect(() => {
    setLiveTotalWorkSeconds(totalWorkSeconds);

    const isActivelyWorking = isClockedInCurrently && !isBreakActive;

    if (isActivelyWorking) {
      const interval = setInterval(() => {
        setLiveTotalWorkSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [totalWorkSeconds, isClockedInCurrently, isBreakActive]);

  const table = useReactTable({
    data: activityLog,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      handleOpenMap,
    },
  });

  return (
    <div className="flex flex-col h-full w-full ">
      <FullPageLoader show={isLoading} />
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300 text-sm font-medium px-2 py-2.5  border-b">
        <Link href={"/"} className="cursor-pointer flex items-center gap-1">
          <IoIosArrowBack className="text-lg" />
          Dashboard
        </Link>
        <span className="text-gray-400 dark:text-zinc-600">/</span>
        <span className="text-blue-600 dark:text-blue-400">
          Daily Attendance Report
        </span>
      </div>

      {/* Status Report Header */}
      <div className="flex items-center justify-between border-b p-4 bg-white dark:bg-black">
        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-zinc-300">
          <FaClipboardList className="text-blue-500" />
          <span className="font-medium">Status Report</span>
          <span className="text-gray-500 dark:text-zinc-600">|</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            <span className="text-gray-700 dark:text-zinc-300">
              {report?.date && dayjs(report.date).format("MMM DD, YYYY")}
            </span>
          </div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="px-3 border-b pb-2">
        <div className="flex items-center md:justify-between md:flex-row flex-col-reverse">
          <div className="max-md:w-full md:flex grid grid-cols-2 min-[380px]:grid-cols-4 gap-3 md:gap-6 mt-2 text-xs text-[#5e5e5e] font-normal items-center justify-evenly py-2">
            <div className="border-l-2 border-l-sidebar-primary pl-3">
              <div className="text-black dark:text-white">
                {secondsToDuration(liveTotalWorkSeconds)}
              </div>
              <div className="text-[#5e5e5e] dark:text-[#a1a1a1]">
                Total Hours
              </div>
            </div>
            <div className="border-l-2 border-l-[#ffa600] pl-2">
              <div className="text-black dark:text-white">
                {secondsToDuration(totalBreakSeconds)}
              </div>
              <div className="text-[#5e5e5e] dark:text-[#a1a1a1]">
                Total Break Time
              </div>
            </div>
            <div className="border-l-2 border-l-[#3dff2bfd] pl-2">
              <div className="text-black dark:text-white">
                {firstClockIn
                  ? dayjs(`${report?.date}T${firstClockIn}`).format("hh:mm A")
                  : "-"}
              </div>
              <div className="text-[#5e5e5e] dark:text-[#a1a1a1]">Clock In</div>
            </div>
            <div className="border-l-2 border-l-[#ff2b2bfd] pl-2">
              <div className="text-black dark:text-white">
                {lastClockOut
                  ? dayjs(`${report?.date}T${lastClockOut}`).format("hh:mm A")
                  : "-"}
              </div>
              <div className="text-[#5e5e5e] dark:text-[#a1a1a1]">
                Clock Out
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" bg-white dark:bg-black h-full">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200 px-3 py-2">
          Today's Activity
        </h3>
        <Card className="border-none rounded-none !p-0 shadow-none">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {/* {table.getRowModel().rows?.length */}
              {false
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="!p-2.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : ""}
            </TableBody>
          </Table>
        </Card>
        <div className="w-full h-full flex items-center justify-center">
          {/* {table.getRowModel().rows?.length ? ( */}
          {false ? (
            ""
          ) : (
            <>
              <Image
                src={NoActivity}
                alt="No activity recorded for today"
                className="md:w-2xs w-32 -mt-16  h-full"
              />
            </>
          )}
        </div>
      </div>
      <div className="sticky bottom-0  flex justify-end  p-2 px-5 text-xs border-t bg-white dark:bg-black z-30">
        <div className="flex flex-col gap-2 justify-center items-end w-full md:w-1/2 lg:w-1/3 ">
          <div className="flex items-center gap-2 w-full">
            <button onClick={() => router.back()} className="w-full">
              <div className="w-full text-center p-2.5  text-[#333333d5] dark:text-[#a1a1a1] font-semibold cursor-pointer flex justify-center items-center border-2 border-[#4d4d4d75]  text-sm">
                Cancel
              </div>
            </button>
            <button
              onClick={onClockOutAttempt}
              disabled={loadingLocation}
              className="cursor-pointer w-full"
            >
              <div className="w-full text-center p-2.5 bg-[#ff6961] dark:bg-[#f13b3b] text-white font-semibold hover:bg-[#ff5050] cursor-pointer flex justify-center items-center border-2 border-[#ff6961] dark:border-[#f13b3b] text-sm">
                Clock Out
              </div>
            </button>{" "}
          </div>

          <div className="w-full flex items-center justify-center gap-2 p-2.5 border rounded  text-sm text-sidebar-primary bg-white dark:bg-black border-[#4d4d4d75]">
            <MdMyLocation size={20} />
            <span className="text-gray-700 dark:text-zinc-300">
              Location Data Available
            </span>
          </div>
        </div>
      </div>
      <AttendanceReasonDialog
        open={isEarlyClockOutReasonDialogOpen}
        onOpenChange={setIsEarlyClockOutReasonDialogOpen}
        title="Reason Required for Early Clock-Out"
        label={`You are clocking out before the required work time (${secondsToDuration(
          requiredTotalWorkSeconds
        )}) or productive time (${secondsToDuration(
          requiredProductiveWorkSeconds
        )}). Please provide a reason.`}
        buttonText="Submit Reason and Clock Out"
        onSubmit={handleEarlyClockOutWithReason}
      />
      <Toaster richColors />
      <MapModalLoader
        open={mapModalOpen}
        onOpenChange={setMapModalOpen}
        lat={mapModalLat}
        lng={mapModalLng}
        label={mapModalLabel}
      />
    </div>
  );
}
