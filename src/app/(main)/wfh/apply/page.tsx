"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  submitWfhRequest,
  fetchUpcomingWfh,
} from "@/redux/slices/wfh/userWfhSlice";
import { toast } from "sonner";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import axios from "axios";
import { fetchProfileImage } from "@/redux/slices/profileImageSlice";
import { fetchUserBasicInfo } from "@/redux/slices/userBasicInfoSlice";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import me from "@/assets/me.jpg";
import { X, FileText, Plus } from "lucide-react";
import { IoBriefcaseOutline, IoLogOut } from "react-icons/io5";
import { RiMenuFold2Line } from "react-icons/ri";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import MaterialTextArea from "@/components/ui/materialTextArea";
import { Card, CardContent } from "@/components/ui/card";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);

const bgColors = ["#ffeccb", "#e8f9ff", "#fff5f5", "#e6fffa", "#f0eaff"];

const RightPanelContent = ({ numberOfDays }: { numberOfDays: number }) => (
  <>
    <div className="p-4 border-b font-medium bg-[#f5f6fa] dark:bg-[#1f1f1f3a]">
      Request Summary
    </div>
    <div className="p-4 border-b font-medium bg-[#f5f6fa] dark:bg-[#1f1f1f3a]">
      As of {dayjs().format("ddd DD MMM, YYYY")}
    </div>
    <div className={`flex justify-between items-center px-4 py-3 text-sm`}>
      <div className="flex items-center gap-2">
        <IoBriefcaseOutline className="text-[#838383]" size={18} />
        Selected Days
      </div>
      <span
        className={`font-medium ${
          numberOfDays > 0 ? "text-blue-600" : "text-gray-700"
        }`}
      >
        {numberOfDays}
      </span>
    </div>
  </>
);

export default function ApplyWfhPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, upcomingWfh } = useAppSelector((state) => state.userWfh);
  const { user } = useAppSelector((state) => state.login);
  const { profileImage, isLoading: isProfileImageLoading } = useAppSelector(
    (state) => state.profileImage
  );
  const { info: userBasicInfo } = useAppSelector(
    (state) => state.userBasicInfo
  );
  const userName = user?.username || "";

  useEffect(() => {
    dispatch(fetchProfileImage());
    dispatch(fetchUserBasicInfo());
    dispatch(fetchUpcomingWfh());
  }, [dispatch]);

  const [isHourly, setIsHourly] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [slotsPerDay, setSlotsPerDay] = useState<
    Record<string, "Full Day" | "First Half" | "Second Half">
  >({});
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");
  const [multiDay, setMultiDay] = useState(false);
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
    if (isHourly) {
      setMultiDay(false);
    }
  }, [isHourly]);

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

  const colleaguesOnWfh = useMemo(() => {
    if (!selectedDates.length || !upcomingWfh?.length) {
      return [];
    }
    const selectedDateSet = new Set(selectedDates);

    return upcomingWfh.filter((wfh) => {
      if (wfh.user?._id === user?._id) {
        return false;
      }
      // This logic assumes wfh.days exists and is an array of {date: string}
      // You might need to adjust this based on the actual structure of upcomingWfh items
      return wfh.days?.some((day: any) => selectedDateSet.has(day.date));
    });
  }, [selectedDates, upcomingWfh, user?._id]);

  const updateSlotForDay = useCallback(
    (date: string, slot: "Full Day" | "First Half" | "Second Half") => {
      setSlotsPerDay((prev) => ({
        ...prev,
        [date]: slot,
      }));
    },
    []
  );

  useEffect(() => {
    if (isHourly) return; // Do not modify slots if it's an hourly request.

    setSlotsPerDay((prev) => {
      const newSlots: Record<
        string,
        "Full Day" | "First Half" | "Second Half"
      > = {};

      for (const date of selectedDates) {
        newSlots[date] = prev[date] || "Full Day";
      }

      const newKeys = Object.keys(newSlots);
      const oldKeys = Object.keys(prev);

      if (newKeys.length !== oldKeys.length) {
        return newSlots;
      }

      for (const key of newKeys) {
        if (newSlots[key] !== prev[key]) {
          return newSlots;
        }
      }

      return prev;
    });
  }, [selectedDates, isHourly]);

  const diffLabel = useMemo(() => {
    if (!isHourly || !startTime || !endTime) return "";
    const start = dayjs(`1970-01-01T${startTime}`);
    const end = dayjs(`1970-01-01T${endTime}`);
    const diffMin = end.diff(start, "minute");
    if (diffMin <= 0) return "";
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hrs.toString().padStart(2, "0")} Hrs ${mins
      .toString()
      .padStart(2, "0")} Mins`;
  }, [isHourly, startTime, endTime]);

  const numberOfDays = useMemo(() => {
    if (isHourly) return 0;

    return selectedDates.reduce((acc, date) => {
      const dayType = slotsPerDay[date];
      if (dayType === "Full Day") return acc + 1;
      if (dayType === "First Half" || dayType === "Second Half")
        return acc + 0.5;
      return acc;
    }, 0);
  }, [selectedDates, slotsPerDay, isHourly]);

  const handleSubmit = async () => {
    if (!fromDate || !reason) {
      toast.error("From date and reason are required.");
      return;
    }
    if (isHourly && (!startTime || !endTime)) {
      toast.error("Start time and end time are required for hourly requests.");
      return;
    }

    const dayType = isHourly
      ? "Hourly"
      : Object.values(slotsPerDay).every((slot) => slot === "Full Day")
      ? "Full Day"
      : "Half Day";

    let attachmentUrl: string | undefined;
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "wfh-attachments");

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

    const days = selectedDates.map((date) => ({
      date,
      dayType: slotsPerDay[date],
    }));

    const wfhData: any = {
      startDate: dayjs(fromDate).format("YYYY-MM-DD"),
      endDate: dayjs(multiDay && toDate ? toDate : fromDate).format(
        "YYYY-MM-DD"
      ),
      numberOfDays: numberOfDays,
      days: days,
      dayType: dayType,
      reason: reason,
      attachment: attachmentUrl,
    };

    if (isHourly) {
      wfhData.startTime = startTime;
      wfhData.endTime = endTime;
      delete wfhData.days;
    }

    try {
      await dispatch(submitWfhRequest(wfhData)).unwrap();
      toast.success("Work from home request submitted successfully!");
      router.push("/wfh/history");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit WFH request.");
    }
  };

  return (
    <div>
      <FullPageLoader show={status === "loading" || isProfileImageLoading} />
      <div className="flex justify-between items-center p-2 px-3 border-b dark:bg-[#0e0e0e] bg-white sticky top-0 z-20">
        <div className="flex gap-3 items-center">
          <div className="relative min-w-10 min-h-10 w-10 h-10 rounded-full bg-green-500 p-[2px] cursor-pointer">
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
          <div className="max-w-[81px] min-[400px]:max-w-full">
            <div className="font-medium text-sm max-[400px]:truncate ">
              {userBasicInfo?.displayName || user?.username}
            </div>
            <div className="text-xs text-muted-foreground max-[400px]:truncate">
              {userBasicInfo?.jobTitle || user?.role || "Employee"}
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <button
            className=" cursor-pointer"
            onClick={() => router.back()}
            disabled={status === "loading"}
          >
            <div className=" px-4 py-1.5 font-medium border-[1.5px]">
              Discard
            </div>
          </button>
          <button
            className=" cursor-pointer"
            onClick={handleSubmit}
            disabled={status === "loading" || isUploading}
          >
            <div className=" px-4 py-1.5 font-medium border-[1.5px] bg-sidebar-primary border-sidebar-primary text-white hover:bg-sidebar-primary/80">
              {isUploading
                ? "Uploading..."
                : status === "loading"
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
                <DrawerTitle>Apply WFH</DrawerTitle>
                <DrawerClose>
                  <div className="cursor-pointer">
                    <X size={18} />
                  </div>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <RightPanelContent numberOfDays={numberOfDays} />
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex w-full h-full overflow-hidden flex-row ">
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-179px)]">
          <div className="p-3 py-4 md:p-6 flex flex-col gap-6 ">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="md:w-1/2 sm:min-w-80 w-full">
                <DatePickerWithLabel
                  label="From Date"
                  value={fromDate}
                  onChange={(d) => setFromDate(d)}
                />
              </div>

              {multiDay && !isHourly && (
                <div className="md:w-1/2 min-w-80 w-full">
                  <DatePickerWithLabel
                    label="To Date"
                    value={toDate}
                    onChange={(d) => setToDate(d || undefined)}
                  />
                </div>
              )}

              {!isHourly && (
                <button
                  type="button"
                  className="text-sidebar-primary text-xs font-medium mb-3 cursor-pointer"
                  onClick={() => setMultiDay((p) => !p)}
                >
                  {multiDay ? "SINGLE DAY?" : "MORE THAN ONE DAY?"}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hourly-request"
                checked={isHourly}
                onCheckedChange={(checked) => setIsHourly(Boolean(checked))}
              />
              <Label
                htmlFor="hourly-request"
                className="text-sm ml-1.5 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Request for specific hours only?
              </Label>
            </div>

            <Card className="rounded-sm shadow-none w-full dark:!bg-[#1f1f1f3a] mt-4 p-4">
              <CardContent>
                {!isHourly ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                ) : (
                  <div className=" flex justify-between items-center p-4 gap-2 text-sm flex-col md:flex-row w-full xl:w-2/3">
                    <span className="font-medium text-gray-600 whitespace-nowrap mr-3">
                      {fromDate && dayjs(fromDate).format("ddd, DD MMM YYYY")}
                    </span>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="startTime"
                        className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500"
                      >
                        Start Time
                      </Label>
                      <input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="h-10 border border-gray-300 rounded px-3 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <Label
                        htmlFor="endTime"
                        className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500"
                      >
                        End Time
                      </Label>
                      <input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="h-10 border border-gray-300 rounded px-3 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    {diffLabel && (
                      <span className="ml-auto pr-2 font-medium whitespace-nowrap text-gray-600">
                        {diffLabel}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col lg:flex-row gap-3 lg:items-start">
              <MaterialTextArea
                value={reason}
                label="Reason For WFH *"
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

            {/* Colleagues on WFH */}
            <div className="space-y-2 lg:w-1/2">
              <div className="text-sm font-medium ">
                {colleaguesOnWfh.length > 0
                  ? `${colleaguesOnWfh.length} colleague${
                      colleaguesOnWfh.length > 1 ? "s are" : " is"
                    } working from home`
                  : ""}
              </div>
              {colleaguesOnWfh.length > 0 && (
                <Card className="p-0 rounded-none shadow-none border-none">
                  {colleaguesOnWfh.map((wfh, idx) => (
                    <div
                      key={wfh._id}
                      className="flex items-center justify-between px-4 py-2 text-sm rounded-sm"
                      style={{ background: bgColors[idx % bgColors.length] }}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={wfh.user?.profileImage || me}
                          alt={wfh.user?.username || "user"}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium text-[13px]">
                            {wfh.user?.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {`${dayjs(wfh.startDate).format("MMM D")} - ${dayjs(
                              wfh.endDate
                            ).format("MMM D")}`}
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
          <RightPanelContent numberOfDays={numberOfDays} />
        </div>
      </div>
    </div>
  );
}
