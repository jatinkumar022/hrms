"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FaPen } from "react-icons/fa";
import { BsClock } from "react-icons/bs";
import { CalendarIcon } from "lucide-react";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { RxCross2 } from "react-icons/rx";
import Input from "@/components/ui/meterialInput";
import Image from "next/image";
import dayjs from "dayjs";
import { FiPlus } from "react-icons/fi";
import { IoIosAlarm } from "react-icons/io";
import { MdFreeBreakfast } from "react-icons/md";
type TimesheetRow = {
  clockIn: string;
  clockOut: string;
  totalTime: string;
  type: "clock" | "break";
};

const timesheetData: TimesheetRow[] = [
  {
    clockIn: "10:04 AM",
    clockOut: "01:12 PM",
    totalTime: "03 H : 07 M",
    type: "clock",
  },
  {
    clockIn: "01:12 PM",
    clockOut: "01:57 PM",
    totalTime: "00 H : 44 M",
    type: "break",
  },
  {
    clockIn: "01:57 PM",
    clockOut: "-",
    totalTime: "-",
    type: "clock",
  },
];

const earlyOut = "05 H : 07 M"; // optional

export default function TimesheetDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer direction="right" open={open} onClose={onClose}>
      <DrawerContent className="z-50 !max-w-fit h-full">
        <div className=" flex flex-col h-full">
          {/* Header */}
          <DrawerHeader className=" flex flex-row items-center justify-between px-6  py-2 border-b">
            <DrawerTitle className="text-xs ">Timesheet</DrawerTitle>
            <DrawerClose
              onClick={onClose}
              className="text-sidebar-primary bg-blue-50 p-1.5 rounded-full cursor-pointer"
            >
              <RxCross2 size={14} />
            </DrawerClose>
          </DrawerHeader>
          <div className="px-3 ">
            <div className=" grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <Input
                  label="Employee"
                  value="Jatin Ramani"
                  icon={
                    <img
                      src="https://office.dvijinfotech.com/uploads/staff_profile_images/67/small_WhatsApp%20Image%202024-09-02%20at%2021.15.52_0a414dd2.jpg"
                      className="w-6 rounded-full -ml-1 "
                    />
                  }
                  readOnly={true}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <DatePickerWithLabel
                    value={new Date()}
                    label="Date"
                    readOnly={true}
                  />
                  <CalendarIcon
                    className="absolute right-2 top-10 text-gray-400"
                    size={17}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-6 mt-2 text-xs text-[#5e5e5e] font-normal items-center justify-evenly py-2">
                <div className=" border-l-2 border-l-sidebar-primary pl-3 ">
                  <div className="text-black">03:52:33</div>
                  <div>Total Hours</div>
                </div>
                <div className=" border-l-2 border-l-[#ffa600] pl-2">
                  <div className="text-black">00:44:43</div>
                  <div>Total Break Time</div>
                </div>
                <div className=" border-l-2 border-l-[#3dff2bfd] pl-2">
                  <div>10:04 AM</div>
                  <div>Clock In</div>
                </div>
                <div className=" border-l-2 border-l-[#ff2b2bfd] pl-2">
                  <div>01:57 PM</div>
                  <div>Clock Out</div>
                </div>
              </div>
              <div className="">
                <button className="text-xs px-3 py-2 border-dashed border rounded-xs border-[#8f8f8f] hover:border-black text-black cursor-pointer flex items-center gap-1 font-medium ">
                  <span className="text-sidebar-primary">
                    <FiPlus />
                  </span>{" "}
                  Add Break In/Out
                </button>
              </div>
            </div>

            <div className="min-w-3xl mt-4 flex flex-col gap-3 text-sm ">
              {timesheetData.map((entry, index) => (
                <div key={index} className={`px-4 py-2 rounded-[2px]  border `}>
                  <div className="flex justify-between gap-3  items-center ">
                    <div>
                      {entry.type === "break" ? (
                        <div className="bg-orange-50 text-orange-400 p-1 rounded-full">
                          <MdFreeBreakfast />
                        </div>
                      ) : (
                        <div className="bg-blue-50 text-blue-400  p-1 rounded-full">
                          <IoIosAlarm />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="text-[#1d1d1d] w-24">
                        {entry.type === "break" ? "Break In" : "Clock In"}
                      </div>
                      <div>{entry.clockIn}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="text-[#1d1d1d] w-24">
                        {entry.type === "break" ? "Break Out" : "Clock Out"}
                      </div>
                      <div>{entry.clockOut}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="text-[#1d1d1d] w-24">Total Time</div>
                      <div>{entry.totalTime}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="text-[#1d1d1d] w-24">
                        {entry.type === "break"
                          ? "Reason for Break"
                          : "Comment"}
                      </div>
                      <div>{entry.totalTime}</div>
                    </div>
                    <button>
                      <FaPen size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}

              {earlyOut && (
                <div className="flex items-center gap-2 text-xs text-blue-500 font-medium mt-1">
                  <BsClock className="text-blue-500" /> Early Out: {earlyOut}
                </div>
              )}
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
  );
}
