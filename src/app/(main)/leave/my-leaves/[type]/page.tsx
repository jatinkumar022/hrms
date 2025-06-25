"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { PiAirplaneTakeoffLight, PiStethoscopeFill } from "react-icons/pi";
import me from "@/assets/me.jpg";
import { FaHandshakeAngle } from "react-icons/fa6";
import { IoBriefcaseOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // 👈 add
import weekday from "dayjs/plugin/weekday";
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore); // 👈 add
dayjs.extend(weekday);
const leaveCatalog = {
  lwp: {
    name: "Leave without pay",
    icon: <PiAirplaneTakeoffLight className="text-[#08a34e]" size={18} />,
    balance: "Unlimited",
    color: "#08a34e",
  },
  el: {
    name: "Earn leave",
    icon: <FaHandshakeAngle className="text-[#1dd454]" size={18} />,
    balance: 0,
    color: "#1dd454",
  },
  sl: {
    name: "Sick leave",
    icon: <PiStethoscopeFill className="text-[#ffa801]" size={18} />,
    balance: 0.5,
    color: "#ffa801",
  },
  cl: {
    name: "Casual leave",
    icon: <IoBriefcaseOutline className="text-[#73788b]" size={18} />,
    balance: 0.5,
    color: "#73788b",
  },
} as const;
type LeaveKey = keyof typeof leaveCatalog;
const teamOutToday = [
  {
    name: "Jagdish Koladiya",
    avatar: me,
    remark: "Jun 16 – Jun 25 (10 Days)",
    color: "#ffeccb",
  },
  {
    name: "Prince Ratanpara",
    avatar: me,
    remark: "Jun 23 – Jun 24 (1.5 Days)",
    color: "#e8f9ff",
  },
  {
    name: "Harit Makwana",
    avatar: "",
    remark: "Jun 23 (First Half)",
    color: "#fff5f5",
  },
  // ...
];
export default function ApplyLeavePage() {
  const router = useRouter();
  const params = useParams();
  const routeLeave = (params?.type ?? "sl") as LeaveKey;
  const [leaveType, setLeaveType] = useState<LeaveKey>(routeLeave);
  const [multiDay, setMultiDay] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<"FULL" | "HALF">("FULL");
  const [slotsPerDay, setSlotsPerDay] = useState<
    Record<string, "FULL" | "HALF">
  >({});

  useEffect(() => {
    if (routeLeave !== leaveType) router.replace(`/apply-leave/${leaveType}`);
  }, [leaveType]);
  const leaveOpts = Object.entries(leaveCatalog).map(([key, v]) => ({
    label: v.name,
    value: key,
  }));

  const selectedDates = useMemo(() => {
    if (!fromDate) return [];

    const start = dayjs(fromDate);
    const out: string[] = [start.format("YYYY-MM-DD")];

    // multi-day range only when both flags are set
    if (multiDay && toDate) {
      let cur = start.add(1, "day");
      const end = dayjs(toDate);
      while (cur.isSameOrBefore(end)) {
        out.push(cur.format("YYYY-MM-DD"));
        cur = cur.add(1, "day");
      }
    }
    return out;
  }, [fromDate, toDate, multiDay]);
  useEffect(() => {
    if (!selectedDates.length) return;
    setSlotsPerDay((prev) => {
      const copy = { ...prev };
      selectedDates.forEach((d) => {
        if (!copy[d]) copy[d] = "FULL";
      });
      return copy;
    });
  }, [selectedDates]);

  // Handler for changing individual day selection
  const updateSlotForDay = (date: string, slot: "FULL" | "HALF") => {
    setSlotsPerDay((prev) => ({
      ...prev,
      [date]: slot,
    }));
  };
  const currentLeave = leaveCatalog[leaveType];
  return (
    <div>
      {/* =============================== LEFT FORM =============================== */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-3 items-center">
          <Image
            src={me}
            alt="avatar"
            width={36}
            height={36}
            className="rounded-full"
          />
          <div>
            <div className="font-medium text-sm">Jatin Ramani</div>
            <div className="text-xs text-muted-foreground">
              Software Engineer | React Developer
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <button className="w-24 py-[6px] border border-gray-300 rounded-xs hover:bg-gray-50">
            Discard
          </button>
          <button className="w-24 py-[6px] bg-blue-600 text-white rounded-xs hover:opacity-90">
            Save
          </button>
        </div>
      </div>
      <div className="flex w-full h-screen overflow-hidden flex-col  lg:flex-row ">
        <div className="flex-1 overflow-y-auto mb-[143px]">
          <div className="p-6 space-y-6 ">
            {/* Leave type */}
            <FloatingSelect
              label="Leave Type *"
              value={leaveType}
              className="lg:max-w-1/2 "
              options={leaveOpts}
              onChange={(v) => setLeaveType(v as LeaveKey)}
            />
            <div className="flex gap-4 flex-col lg:flex-row">
              <DatePickerWithLabel
                label="From *"
                value={fromDate}
                onChange={setFromDate}
                className="lg:min-w-1/2"
              />
              {multiDay && (
                <DatePickerWithLabel
                  label="To"
                  value={toDate}
                  onChange={setToDate}
                  className="lg:max-w-1/2"
                />
              )}
              {!multiDay && (
                <button
                  type="button"
                  className="text-blue-600 text-xs font-medium mb-3 cursor-pointer"
                  onClick={() => setMultiDay(true)}
                >
                  MORE THAN ONE DAY?
                </button>
              )}
            </div>
            {multiDay && (
              <button
                type="button"
                className="text-blue-600 text-xs font-medium mb-3 w-full text-center lg:text-start cursor-pointer"
                onClick={() => setMultiDay(false)}
              >
                FOR ONE DAY?
              </button>
            )}
            <Card className="rounded-sm shadow-none w-full mt-4 p-4">
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDates.map((dateStr) => (
                  <div key={dateStr} className="flex items-center gap-3">
                    <div className="w-28 text-sm">
                      {dayjs(dateStr).format("ddd, DD MMM")}
                    </div>

                    <FloatingSelect
                      label=""
                      className="flex-1"
                      value={slotsPerDay[dateStr] /* always defined now */}
                      options={[
                        { label: "Full Day", value: "FULL" },
                        { label: "Half Day", value: "HALF" },
                      ]}
                      onChange={(val) =>
                        updateSlotForDay(dateStr, val as "FULL" | "HALF")
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <textarea
                placeholder="Reason For Leave *"
                className="w-full lg:w-1/2 h-28 border border-gray-300 rounded p-4 outline-none resize-none focus:ring-1 focus:ring-blue-500"
              />
              {/* Attachment */}
              <button
                type="button"
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500"
              >
                +
              </button>
            </div>
            {/* Team-mates on leave */}
            <div className="space-y-2 lg:w-1/2">
              <div className="text-sm font-medium ">
                {teamOutToday.length} Employees of Research and Development are
                on Leave{" "}
                <button type="button" className="text-blue-600">
                  View All
                </button>
              </div>
              <Card className="p-0 rounded-none shadow-none border-none">
                {teamOutToday.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2 text-sm rounded-sm"
                    style={{ background: p.color }}
                  >
                    <div className="flex items-center gap-3">
                      {p.avatar ? ( // ✅ render <Image> only if URL
                        <Image
                          src={p.avatar}
                          alt={p.name}
                          width={22}
                          height={22}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[11px] uppercase">
                          {p.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <span>{p.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {p.remark}
                    </span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
        {/* =========================== RIGHT SIDEBAR ============================== */}
        <div className=" lg:w-1/3 border-l shrink-0 ">
          <div className="p-4 border-b font-medium bg-[#f5f6fa]">
            Leave Type
          </div>
          {Object.entries(leaveCatalog).map(([key, v]) => (
            <div
              key={key}
              className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-b ${
                key === leaveType ? "bg-gray-100" : ""
              }`}
              onClick={() => setLeaveType(key as LeaveKey)}
            >
              <div className="flex items-center gap-2">
                {v.icon}
                {v.name}
              </div>
              <span
                className={`font-medium ${
                  v.balance === 0
                    ? "text-red-500"
                    : v.balance === "Unlimited"
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
              >
                {v.balance}
              </span>
            </div>
          ))}
          <div className="p-4 border-b font-medium bg-[#f5f6fa]">
            As of Mon 23 Jun, 2025
          </div>
          <div
            className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-b `}
          >
            <div className="flex items-center gap-2">
              <FaHandshakeAngle className="text-[#1dd454]" size={18} />
              Earn leave
            </div>
            <span
              className={`font-medium ${
                0 === 0 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {0}
            </span>
          </div>
          <div
            className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-b `}
          >
            <div className="flex items-center gap-2">
              <IoMdLogOut className="text-[#000000]" size={18} />
              Selected Days
            </div>
            <span
              className={`font-medium ${
                0 === 0 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {0}
            </span>
          </div>
          <div
            className={`flex justify-between items-center p-4 border-b font-medium bg-[#f5f6fa] text-sidebar-primary `}
          >
            <div className="flex items-center gap-2">Selected Days</div>
            <span
              className={`font-medium ${
                0 === 0 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
