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
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  submitLeaveRequest,
  fetchUserLeaveBalance,
} from "@/redux/slices/leave/user/userLeaveSlice";
import { fetchProfileImage } from "@/redux/slices/profileImageSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spin } from "antd";
import FullPageLoader from "@/components/loaders/FullPageLoader";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);

const leaveCatalog = {
  lwp: {
    name: "Leave without pay",
    icon: <PiAirplaneTakeoffLight className="text-[#08a34e]" size={18} />,
    color: "#08a34e",
    balanceKey: "lwp",
  },
  el: {
    name: "Earn leave",
    icon: <FaHandshakeAngle className="text-[#1dd454]" size={18} />,
    color: "#1dd454",
    balanceKey: "el",
  },
  sl: {
    name: "Sick leave",
    icon: <PiStethoscopeFill className="text-[#ffa801]" size={18} />,
    color: "#ffa801",
    balanceKey: "sl",
  },
  cl: {
    name: "Casual leave",
    icon: <IoBriefcaseOutline className="text-[#73788b]" size={18} />,
    color: "#73788b",
    balanceKey: "cl",
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
];
export default function ApplyLeavePage() {
  const router = useRouter();
  const params = useParams();

  const dispatch = useAppDispatch();
  const { status: leaveStatus, myLeaveBalance } = useAppSelector(
    (state) => state.userLeave
  );
  const { user } = useAppSelector((state) => state.login);
  const { profileImage, isLoading: isProfileImageLoading } = useAppSelector(
    (state) => state.profileImage
  );

  useEffect(() => {
    dispatch(fetchUserLeaveBalance());
    dispatch(fetchProfileImage());
  }, [dispatch]);

  const routeLeave = (params?.type ?? "sl") as LeaveKey;

  const [leaveType, setLeaveType] = useState<LeaveKey>(routeLeave);
  const [multiDay, setMultiDay] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [halfDayTime, setHalfDayTime] = useState<"First Half" | "Second Half">(
    "First Half"
  );
  const [slotsPerDay, setSlotsPerDay] = useState<
    Record<string, "FULL" | "HALF">
  >({});

  useEffect(() => {
    if (routeLeave !== leaveType)
      router.replace(`/leave/my-leaves/${leaveType}`);
  }, [leaveType, routeLeave, router]);
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
      if (end.isBefore(start)) return out;
      while (cur.isSameOrBefore(end, "day")) {
        out.push(cur.format("YYYY-MM-DD"));
        cur = cur.add(1, "day");
      }
    }
    return out;
  }, [fromDate, toDate, multiDay]);

  const totalLeaveDays = useMemo(() => {
    return selectedDates.reduce((acc, date) => {
      const dayType = slotsPerDay[date];
      if (dayType === "FULL") return acc + 1;
      if (dayType === "HALF") return acc + 0.5;
      return acc;
    }, 0);
  }, [selectedDates, slotsPerDay]);

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

  const handleSubmit = async () => {
    if (!fromDate || !reason) {
      toast.error("From date and reason are required.");
      return;
    }

    const typeMap = {
      lwp: "LWP",
      el: "Earned Leave",
      sl: "Sick Leave",
      cl: "Casual Leave",
    } as const;

    const leaveDayType = multiDay
      ? "Full Day"
      : slotsPerDay[dayjs(fromDate).format("YYYY-MM-DD")] === "HALF"
      ? "Half Day"
      : "Full Day";

    const leaveData: any = {
      startDate: dayjs(fromDate).format("YYYY-MM-DD"),
      endDate: dayjs(multiDay && toDate ? toDate : fromDate).format(
        "YYYY-MM-DD"
      ),
      numberOfDays: totalLeaveDays,
      leaveDayType,
      type: typeMap[leaveType],
      reason,
    };

    if (leaveDayType === "Half Day") {
      leaveData.halfDayTime = halfDayTime;
    }

    try {
      await dispatch(submitLeaveRequest(leaveData)).unwrap();
      toast.success("Leave request submitted successfully!");
      router.push("/leave/my-leaves");
    } catch (err: any) {
      toast.error(err.error || "Failed to submit leave request.");
      console.error("Failed to submit leave request:", err);
    }
  };

  const dynamicLeaveCatalog = useMemo(() => {
    return Object.entries(leaveCatalog).map(([key, value]) => {
      let displayBalance: string | number = 0;
      const balanceKey = value.balanceKey;

      if (balanceKey === "lwp") {
        displayBalance = "Unlimited";
      } else if (myLeaveBalance) {
        const balanceKeyMap = {
          el: "earnedLeave",
          sl: "sickLeave",
          cl: "casualLeave",
        } as const;
        displayBalance =
          myLeaveBalance[
            balanceKeyMap[balanceKey as keyof typeof balanceKeyMap]
          ]?.balance ?? 0;
      }

      return {
        ...value,
        key: key as LeaveKey,
        displayBalance,
      };
    });
  }, [myLeaveBalance]);

  return (
    <div>
      <FullPageLoader
        show={leaveStatus === "loading" || isProfileImageLoading}
      />
      {/* =============================== LEFT FORM =============================== */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-3 items-center">
          <Image
            src={profileImage || me}
            alt="avatar"
            width={36}
            height={36}
            className="rounded-full"
          />
          <div>
            <div className="font-medium text-sm">{user?.username}</div>
            <div className="text-xs text-muted-foreground">{"Employee"}</div>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={leaveStatus === "loading"}
          >
            Discard
          </Button>
          <Button onClick={handleSubmit} disabled={leaveStatus === "loading"}>
            {leaveStatus === "loading" ? "Submitting..." : "Save"}
          </Button>
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
                onChange={(date) => setFromDate(date ?? undefined)}
                className="lg:min-w-1/2"
              />
              {multiDay && (
                <DatePickerWithLabel
                  label="To"
                  value={toDate}
                  onChange={(date) => setToDate(date ?? undefined)}
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
            {!multiDay &&
              slotsPerDay[
                dayjs(fromDate || new Date()).format("YYYY-MM-DD")
              ] === "HALF" && (
                <div className="lg:max-w-1/2">
                  <FloatingSelect
                    label="Half Day Time"
                    value={halfDayTime}
                    options={[
                      { label: "First Half", value: "First Half" },
                      { label: "Second Half", value: "Second Half" },
                    ]}
                    onChange={(v) =>
                      setHalfDayTime(v as "First Half" | "Second Half")
                    }
                  />
                </div>
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
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
                      <Image
                        src={p.avatar ? p.avatar : me}
                        alt="avatar"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium text-[13px]">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.remark}
                        </div>
                      </div>
                    </div>
                    <div>
                      <IoMdLogOut size={16} />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
        <div className=" lg:w-1/3 border-l shrink-0 ">
          <div className="p-4 border-b font-medium bg-[#f5f6fa]">
            Leave Type
          </div>
          {dynamicLeaveCatalog.map((v) => (
            <div
              key={v.key}
              className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-b ${
                v.key === leaveType ? "bg-gray-100" : ""
              }`}
              onClick={() => setLeaveType(v.key)}
            >
              <div className="flex items-center gap-2">
                {v.icon}
                {v.name}
              </div>
              <span
                className={`font-medium ${
                  v.displayBalance === 0
                    ? "text-red-500"
                    : v.displayBalance === "Unlimited"
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
              >
                {v.displayBalance}
              </span>
            </div>
          ))}
          <div className="p-4 border-b font-medium bg-[#f5f6fa]">
            As of {dayjs().format("ddd DD MMM, YYYY")}
          </div>
          <div
            className={`flex justify-between items-center px-4 py-3 text-sm`}
          >
            <div className="flex items-center gap-2">
              <IoMdLogOut className="text-[#000000]" size={18} />
              Selected Days
            </div>
            <span
              className={`font-medium ${
                totalLeaveDays > 0 ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {totalLeaveDays}
            </span>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-[27.3rem] w-[45.2rem] flex items-center justify-between px-5 py-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 shadow-lg">
        <div>
          <span className="text-xs text-muted-foreground">
            Applying for <span className="font-bold">{totalLeaveDays}</span>{" "}
            day(s)
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-40 text-center py-2 border-[#727272] text-[#727272] font-medium  cursor-pointer"
            onClick={() => router.back()}
            disabled={leaveStatus === "loading"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={leaveStatus === "loading"}
          >
            {leaveStatus === "loading" ? <Spin /> : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
