"use client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { FaPen } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { FiPlus } from "react-icons/fi";
import { IoIosAlarm } from "react-icons/io";
import { MdFreeBreakfast } from "react-icons/md";
import { useState, useEffect } from "react";
import AttendanceCorrectionModal, {
  CorrectionModalData,
} from "../AttendanceCorrectionModal";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { AttendanceRequestType } from "@/models/AttendanceRequest";
import Image from "next/image";
import location from "@/assets/location.svg";
import MapModal from "../DataSummery/MapModal";

dayjs.extend(duration);

// --- Local Interfaces to avoid touching the model files ---
export interface IWorkSegment {
  clockIn: string;
  clockInLocation?: string;
  clockOut?: string | null;
  clockOutLocation?: string;
  [key: string]: any; // Allow other properties
}

export interface IBreakSegment {
  start: string;
  startLocation?: string;
  end?: string | null;
  endLocation?: string;
  reason?: string;
  [key: string]: any; // Allow other properties
}

export interface IAttendance {
  date: string;
  attendance: {
    workSegments: IWorkSegment[];
    breaks: IBreakSegment[];
    lateIn?: boolean;
    lateInReason?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow other properties
}
// ---------------------------------------------------------

type TimelineEvent = {
  type:
    | "Clock In"
    | "Clock Out"
    | "Break In"
    | "Break Out"
    | "Missing Clock Out";
  time?: string;
  location?: string;
  reason?: string;
  requestType: AttendanceRequestType;
};

const durationToSeconds = (durationStr?: string): number => {
  if (!durationStr) return 0;
  const parts = durationStr.split(":").map(Number);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
};

const formatDuration = (seconds: number) => {
  const d = dayjs.duration(seconds, "seconds");
  return `${String(Math.floor(d.asHours())).padStart(2, "0")} H : ${String(
    d.minutes()
  ).padStart(2, "0")} M`;
};

export default function TimesheetDrawer({
  open,
  onClose,
  dailyAttendance,
}: {
  open: boolean;
  onClose: () => void;
  dailyAttendance: IAttendance | null;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<CorrectionModalData | undefined>(
    undefined
  );
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const parseLocation = (
    locStr?: string
  ): { lat: number; lng: number } | undefined => {
    if (!locStr) return undefined;
    const parts = locStr.split(",").map((part) => parseFloat(part.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return undefined;
  };

  const handleLocationClick = (locationStr: string) => {
    const parsedLoc = parseLocation(locationStr);
    if (parsedLoc) {
      setSelectedLocation(parsedLoc);
      setMapModalOpen(true);
    }
  };

  useEffect(() => {
    if (dailyAttendance && dailyAttendance.attendance) {
      const events: TimelineEvent[] = [];

      dailyAttendance.attendance.workSegments?.forEach(
        (seg: IWorkSegment, index: number) => {
          if (seg.clockIn) {
            events.push({
              type: "Clock In",
              time: seg.clockIn,
              location: seg.clockInLocation,
              reason:
                index === 0 && dailyAttendance.attendance.lateIn
                  ? dailyAttendance.attendance.lateInReason
                  : undefined,
              requestType: "clock-in",
            });
          }
          if (seg.clockOut) {
            events.push({
              type: "Clock Out",
              time: seg.clockOut,
              location: seg.clockOutLocation,
              requestType: "clock-out",
            });
          } else if (seg.clockIn) {
            events.push({
              type: "Missing Clock Out",
              requestType: "clock-out",
            });
          }
        }
      );
      console.log(dailyAttendance);
      // Add break-in/break-out events
      dailyAttendance.attendance.breaks?.forEach((b: IBreakSegment) => {
        if (b.start) {
          events.push({
            type: "Break In",
            time: b.start,
            location: b.startLocation,
            reason: b.reason,
            requestType: "break-in",
          });
        }
        if (b.end) {
          events.push({
            type: "Break Out",
            time: b.end,
            location: b.endLocation,
            reason: b.reason,
            requestType: "break-out",
          });
        }
      });

      // Sort all events chronologically
      events.sort((a, b) => {
        const aIsMissing = a.type === "Missing Clock Out";
        if (aIsMissing) return 1; // Always last
        const bIsMissing = b.type === "Missing Clock Out";
        if (bIsMissing) return -1; // Always last

        if (!a.time) return 1;
        if (!b.time) return -1;

        const timeA = dayjs(`${dailyAttendance.date}T${a.time}`).valueOf();
        const timeB = dayjs(`${dailyAttendance.date}T${b.time}`).valueOf();

        return timeA - timeB;
      });

      setTimelineEvents(events);
    }
  }, [dailyAttendance]);

  const handleOpenModal = (data?: CorrectionModalData) => {
    setModalData(data);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(undefined);
  };

  if (!dailyAttendance) {
    return null; // Or a loading/empty state
  }

  const totalWorkSeconds = durationToSeconds(
    dailyAttendance.attendance?.totalDuration
  );
  const totalBreakSeconds = durationToSeconds(
    dailyAttendance.attendance?.breakDuration
  );
  const firstClockIn = dailyAttendance.attendance?.workSegments?.[0]?.clockIn;
  const lastClockOut =
    dailyAttendance.attendance?.workSegments?.[
      dailyAttendance.attendance.workSegments.length - 1
    ]?.clockOut;
  console.log(timelineEvents);
  return (
    <>
      <Drawer direction="right" open={open} onClose={onClose}>
        <DrawerContent className="z-50 lg:!max-w-fit min-w-screen md:min-w-2xl h-full">
          <div className=" flex flex-col h-full">
            {/* Header */}
            <DrawerHeader className=" flex flex-row items-center justify-between px-6  py-2 border-b">
              <DrawerTitle className="!m-0">Timesheet</DrawerTitle>
              <DrawerClose
                onClick={onClose}
                className=" bg-red-50 text-red-400 dark:bg-[#1e1e1e]  p-1.5 rounded-full cursor-pointer"
              >
                <RxCross2 size={14} />
              </DrawerClose>
            </DrawerHeader>
            <div className="px-3 ">
              <div className="flex items-center md:justify-between md:flex-row flex-col-reverse ">
                <div className="md:flex grid grid-cols-2 min-[380px]:grid-cols-4 gap-3 md:gap-6 mt-2 text-xs text-[#5e5e5e] font-normal items-center justify-evenly  py-2">
                  <div className=" border-l-2 border-l-sidebar-primary pl-3 ">
                    <div className="text-black  dark:text-white ">
                      {formatDuration(totalWorkSeconds)}
                    </div>
                    <div className=" text-[#5e5e5e] dark:text-[#a1a1a1]">
                      Total Hours
                    </div>
                  </div>
                  <div className=" border-l-2 border-l-[#ffa600] pl-2">
                    <div className="text-black dark:text-white">
                      {formatDuration(totalBreakSeconds)}
                    </div>
                    <div className="text-[#5e5e5e] dark:text-[#a1a1a1]">
                      Total Break Time
                    </div>
                  </div>
                  <div className=" border-l-2 border-l-[#3dff2bfd] pl-2">
                    <div className="text-black dark:text-white">
                      {firstClockIn
                        ? dayjs(
                            `${dailyAttendance.date}T${firstClockIn}`
                          ).format("hh:mm A")
                        : "-"}
                    </div>
                    <div className="text-[#5e5e5e] dark:text-[#a1a1a1]">
                      Clock In
                    </div>
                  </div>
                  <div className=" border-l-2 border-l-[#ff2b2bfd] pl-2">
                    <div className="text-black dark:text-white">
                      {lastClockOut
                        ? dayjs(
                            `${dailyAttendance.date}T${lastClockOut}`
                          ).format("hh:mm A")
                        : "-"}
                    </div>
                    <div className="text-[#5e5e5e] dark:text-[#a1a1a1]">
                      Clock Out
                    </div>
                  </div>
                </div>
                <div className="max-md:flex max-md:w-full justify-end max-md:mt-3">
                  <button
                    onClick={() => handleOpenModal()}
                    className="text-xs px-3 py-2 border-dashed border rounded-xs border-[#8f8f8f] hover:border-black  text-black dark:text-white dark:hover:border-white cursor-pointer flex items-center gap-1 font-medium "
                  >
                    <span className="text-sidebar-primary">
                      <FiPlus />
                    </span>{" "}
                    Add New Entry
                  </button>
                </div>
              </div>

              <div className="lg:min-w-3xl mt-4 flex flex-col gap-3 text-sm ">
                {timelineEvents.map((event, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2  gap-3 sm:gap-6 sm:flex items-center justify-between px-4 py-2 rounded-[2px] border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 dark:bg-[#1e1e1e] p-1.5 rounded-full">
                        {event.type.includes("Break") ? (
                          <MdFreeBreakfast className="text-blue-400" />
                        ) : (
                          <IoIosAlarm className="text-green-400" />
                        )}
                      </div>
                      <p
                        className={`w-32 font-medium text-xs  ${
                          event.type.includes("Missing") ? "text-red-500" : ""
                        }`}
                      >
                        {event.type}
                      </p>
                    </div>

                    <p className="w-24 text-xs  whitespace-nowrap">
                      {event.time
                        ? dayjs(`${dailyAttendance.date}T${event.time}`).format(
                            "hh:mm A"
                          )
                        : "-"}
                    </p>

                    <div className="w-24 text-xs p-1">
                      {event.location && (
                        <Image
                          src={location}
                          alt="location"
                          width={20}
                          height={20}
                          className="cursor-pointer"
                          onClick={() => handleLocationClick(event.location!)}
                        />
                      )}
                    </div>

                    <p className="w-40 text-sm italic text-gray-500 dark:text-[#c0c0c0] truncate">
                      {event.reason || "-"}
                    </p>

                    <div
                      onClick={() =>
                        handleOpenModal({
                          requestType: event.requestType,
                          time: event.time || "",
                        })
                      }
                      className="w-fit text-muted-foreground hover:text-sidebar-primary cursor-pointer p-1.5  rounded-full bg-blue-50 dark:bg-[#1e1e1e]"
                    >
                      <FaPen size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto p-4 border-t flex  justify-end">
              <DrawerClose asChild>
                <button className="border px-14 py-1">Close</button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <AttendanceCorrectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        date={dailyAttendance.date}
        initialData={modalData}
      />
      {selectedLocation && (
        <MapModal
          open={isMapModalOpen}
          onOpenChange={setMapModalOpen}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          label="Event Location"
        />
      )}
    </>
  );
}
