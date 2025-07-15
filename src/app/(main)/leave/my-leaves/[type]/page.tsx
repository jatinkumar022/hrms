"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { PiAirplaneTakeoffLight, PiStethoscopeFill } from "react-icons/pi";
import me from "@/assets/me.jpg";
import { FaHandshakeAngle } from "react-icons/fa6";
import { IoBriefcaseOutline, IoLogOut } from "react-icons/io5";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  submitLeaveRequest,
  fetchUserLeaveBalance,
  fetchUpcomingLeaves,
  SubmitLeaveRequestPayload,
} from "@/redux/slices/leave/user/userLeaveSlice";
import { fetchProfileImage } from "@/redux/slices/profileImageSlice";
import { fetchUserBasicInfo } from "@/redux/slices/userBasicInfoSlice";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { toast } from "sonner";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import axios from "axios";
import { X, FileText, Plus } from "lucide-react";
import { RiMenuFold2Line } from "react-icons/ri";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import MaterialTextArea from "@/components/ui/materialTextArea";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);

const bgColors = ["#ffeccb", "#e8f9ff", "#fff5f5", "#e6fffa", "#f0eaff"];

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

const RightPanelContent = ({
  dynamicLeaveCatalog,
  leaveType,
  setLeaveType,
  totalLeaveDays,
}: {
  dynamicLeaveCatalog: any[];
  leaveType: LeaveKey;
  setLeaveType: (key: LeaveKey) => void;
  totalLeaveDays: number;
}) => (
  <>
    <div className="p-4 border-b font-medium bg-[#f5f6fa] dark:bg-[#1f1f1f3a]">
      Leave Type
    </div>
    {dynamicLeaveCatalog.map((v) => (
      <div
        key={v.key}
        className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1f1f1f3a] border-b ${
          v.key === leaveType ? "bg-gray-100 dark:!bg-[#1f1f1f3a]" : ""
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
              : "text-gray-700 dark:text-[#838383]"
          }`}
        >
          {v.displayBalance}
        </span>
      </div>
    ))}
    <div className="p-4 border-b font-medium bg-[#f5f6fa] dark:bg-[#1f1f1f3a]">
      As of {dayjs().format("ddd DD MMM, YYYY")}
    </div>
    <div className={`flex justify-between items-center px-4 py-3 text-sm`}>
      <div className="flex items-center gap-2">
        <IoLogOut className="text-[#838383]" size={18} />
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
  </>
);

export default function ApplyLeavePage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const {
    status: leaveStatus,
    myLeaveBalance,
    upcomingLeaves,
  } = useAppSelector((state) => state.userLeave);
  const { user } = useAppSelector((state) => state.login);
  const { profileImage, isLoading: isProfileImageLoading } = useAppSelector(
    (state) => state.profileImage
  );
  const { info: userBasicInfo } = useAppSelector(
    (state) => state.userBasicInfo
  );
  const userName = user?.username || "";

  useEffect(() => {
    dispatch(fetchUserLeaveBalance());
    dispatch(fetchProfileImage());
    dispatch(fetchUserBasicInfo());
    dispatch(fetchUpcomingLeaves());
  }, [dispatch]);

  const routeLeave = (params?.type ?? "sl") as LeaveKey;

  const [leaveType, setLeaveType] = useState<LeaveKey>(routeLeave);
  const [multiDay, setMultiDay] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");

  const [slotsPerDay, setSlotsPerDay] = useState<
    Record<string, "Full Day" | "First Half" | "Second Half">
  >({});
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    // Cleanup object URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
      if (dayType === "Full Day") return acc + 1;
      if (dayType === "First Half" || dayType === "Second Half")
        return acc + 0.5;
      return acc;
    }, 0);
  }, [selectedDates, slotsPerDay]);

  useEffect(() => {
    if (!selectedDates.length) return;
    setSlotsPerDay((prev) => {
      const copy = { ...prev };
      selectedDates.forEach((d) => {
        if (!copy[d]) copy[d] = "Full Day";
      });
      return copy;
    });
  }, [selectedDates]);

  const colleaguesOnLeave = useMemo(() => {
    if (!selectedDates.length || !upcomingLeaves?.length) {
      return [];
    }
    const selectedDateSet = new Set(selectedDates);

    return upcomingLeaves.filter((leave) => {
      if (leave.user._id === user?._id) {
        return false;
      }
      return leave.days.some((day) => selectedDateSet.has(day.date));
    });
  }, [selectedDates, upcomingLeaves, user?._id]);

  // Handler for changing individual day selection
  const updateSlotForDay = (
    date: string,
    slot: "Full Day" | "First Half" | "Second Half"
  ) => {
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

    let attachmentUrl: string | undefined;

    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "leave-attachments");

      try {
        const response = await axios.post("/api/upload", formData);
        attachmentUrl = response.data.url;
      } catch (error) {
        toast.error("File upload failed. Please try again.");
        console.error(error);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const typeMap = {
      lwp: "LWP",
      el: "Earned Leave",
      sl: "Sick Leave",
      cl: "Casual Leave",
    } as const;

    const days = selectedDates.map((date) => ({
      date,
      dayType: slotsPerDay[date],
    }));

    const leaveData: SubmitLeaveRequestPayload = {
      startDate: dayjs(fromDate).format("YYYY-MM-DD"),
      endDate: dayjs(multiDay && toDate ? toDate : fromDate).format(
        "YYYY-MM-DD"
      ),
      numberOfDays: totalLeaveDays,
      days,
      type: typeMap[leaveType],
      reason,
      attachment: attachmentUrl,
    };

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
      <div className="flex justify-between items-center p-2 px-3 border-b dark:bg-[#0e0e0e] bg-white sticky top-0 z-20">
        <div className="flex gap-3 items-center">
          <div className="relative w-10 h-10 rounded-full bg-green-500 p-[2px] cursor-pointer">
            <div className="w-full h-full dark:bg-black bg-white rounded-full p-[2px]">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <InitialsAvatar name={userName} className="w-full h-full" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 dark:border-black border-white  rounded-full"></span>
          </div>
          <div>
            <div className="font-medium text-sm">
              {userBasicInfo?.displayName || user?.username}
            </div>
            <div className="text-xs text-muted-foreground">
              {userBasicInfo?.jobTitle || user?.role || "Employee"}
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <button
            className=" cursor-pointer"
            onClick={() => router.back()}
            disabled={leaveStatus === "loading"}
          >
            <div className=" px-4 py-1.5 font-medium border-[1.5px]">
              Discard
            </div>
          </button>
          <button
            className=" cursor-pointer"
            onClick={handleSubmit}
            disabled={leaveStatus === "loading" || isUploading}
          >
            <div className=" px-4 py-1.5 font-medium border-[1.5px] bg-sidebar-primary border-sidebar-primary text-white hover:bg-sidebar-primary/80">
              {isUploading
                ? "Uploading..."
                : leaveStatus === "loading"
                ? "Submitting..."
                : "Save"}
            </div>
          </button>
        </div>
      </div>
      <div className="lg:hidden flex justify-end p-2 px-3 border-b">
        <Drawer direction="right">
          <DrawerTrigger>
            <div className="rounded-sm border p-1.5 w-fit cursor-pointer">
              <RiMenuFold2Line size={18} />
            </div>
          </DrawerTrigger>

          <DrawerContent>
            <DrawerHeader>
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium">Apply Leave</div>
                <DrawerClose>
                  <div className="cursor-pointer">
                    <X size={18} />
                  </div>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <RightPanelContent
              dynamicLeaveCatalog={dynamicLeaveCatalog}
              leaveType={leaveType}
              setLeaveType={setLeaveType}
              totalLeaveDays={totalLeaveDays}
            />
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex w-full h-full overflow-hidden flex-row ">
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-179px)]">
          <div className="p-6 flex flex-col gap-6 h-full">
            {/* Leave type */}
            <FloatingSelect
              label="Leave Type *"
              value={leaveType}
              className="lg:max-w-1/2 "
              options={leaveOpts}
              onChange={(v) => setLeaveType(v as LeaveKey)}
            />
            <div className="flex gap-4 flex-col lg:flex-row items-center">
              <DatePickerWithLabel
                label="From *"
                value={fromDate}
                onChange={(date) => setFromDate(date ?? undefined)}
                className="lg:max-w-1/2 min-w-1/2"
                showFooter={false}
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
                <span
                  className="text-blue-600  font-medium  cursor-pointer"
                  onClick={() => setMultiDay(true)}
                >
                  MORE THAN ONE DAY?
                </span>
              )}
            </div>
            {multiDay && (
              <span
                className="text-blue-600 font-medium  w-full text-center lg:text-start cursor-pointer"
                onClick={() => setMultiDay(false)}
              >
                FOR ONE DAY?
              </span>
            )}

            <Card className="rounded-sm shadow-none w-full dark:!bg-[#1f1f1f3a] mt-4 p-4">
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDates.map((dateStr) => (
                  <div key={dateStr} className="flex items-center gap-3">
                    <div className="w-28 text-sm">
                      {dayjs(dateStr).format("ddd, DD MMM")}
                    </div>

                    <FloatingSelect
                      label=""
                      className="flex-1"
                      value={slotsPerDay[dateStr]}
                      options={[
                        { label: "Full Day", value: "Full Day" },
                        { label: "First Half", value: "First Half" },
                        { label: "Second Half", value: "Second Half" },
                      ]}
                      onChange={(val) =>
                        updateSlotForDay(
                          dateStr,
                          val as "Full Day" | "First Half" | "Second Half"
                        )
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex flex-col lg:flex-row gap-3 lg:items-start">
              <MaterialTextArea
                value={reason}
                label="Reason For Leave *"
                rows={5}
                className="w-full lg:w-1/2 h-28 border  border-gray-300 rounded p-4 outline-none resize-none "
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex-col">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {/* Attachment */}
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-28 w-28 border-2 border-dashed  border-zinc-400 hover:border-zinc-500 hover:text-zinc-500  dark:border-[#838383] rounded  text-zinc-400 dark:text-[#838383] dark:hover:border-[#b1b1b1] dark:hover:text-[#b1b1b1] text-sm "
                  >
                    <button
                      type="button"
                      className="flex items-center gap-2 justify-center h-full w-full cursor-pointer"
                    >
                      <Plus size={18} /> Attach File
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="preview"
                        width={112}
                        height={112}
                        className="object-cover rounded-md w-28 h-28"
                      />
                    ) : (
                      <div className="w-28 h-28 border rounded-md flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                        <FileText size={32} />
                        <span className="text-xs mt-2 text-center break-words px-1">
                          {file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Team-mates on leave */}
            <div className="space-y-2 lg:w-1/2">
              <div className="text-sm font-medium ">
                {colleaguesOnLeave.length > 0
                  ? `${colleaguesOnLeave.length} colleague${
                      colleaguesOnLeave.length > 1 ? "s are" : " is"
                    } on leave`
                  : ""}
                {colleaguesOnLeave.length > 0 && (
                  <button type="button" className="text-blue-600 ml-2">
                    View All
                  </button>
                )}
              </div>
              {colleaguesOnLeave.length > 0 && (
                <Card className="p-0 rounded-none shadow-none border-none">
                  {colleaguesOnLeave.map((leave, idx) => (
                    <div
                      key={leave._id}
                      className="flex items-center justify-between px-4 py-2 text-sm rounded-sm"
                      style={{ background: bgColors[idx % bgColors.length] }}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={leave.user.profileImage || me}
                          alt={leave.user.username}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium text-[13px]">
                            {leave.user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {`${dayjs(leave.startDate).format(
                              "MMM D"
                            )} - ${dayjs(leave.endDate).format("MMM D")}`}
                          </div>
                        </div>
                      </div>
                      <div>
                        <IoLogOut size={16} />
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/3 border-l shrink-0 h-[calc(100vh-130px)]">
          <RightPanelContent
            dynamicLeaveCatalog={dynamicLeaveCatalog}
            leaveType={leaveType}
            setLeaveType={setLeaveType}
            totalLeaveDays={totalLeaveDays}
          />
        </div>
      </div>
    </div>
  );
}
