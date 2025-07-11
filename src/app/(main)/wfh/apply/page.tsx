"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { submitWfhRequest } from "@/redux/slices/wfh/userWfhSlice";
import { toast } from "sonner";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import axios from "axios";
import { fetchProfileImage } from "@/redux/slices/profileImageSlice";
import me from "@/assets/me.jpg";
import { X, FileText, Plus } from "lucide-react";
import { IoBriefcaseOutline } from "react-icons/io5";
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
  const { status } = useAppSelector((state) => state.userWfh);
  const { user } = useAppSelector((state) => state.login);
  const { profileImage, isLoading: isProfileImageLoading } = useAppSelector(
    (state) => state.profileImage
  );

  useEffect(() => {
    dispatch(fetchProfileImage());
  }, [dispatch]);

  const [dayType, setDayType] = useState<"Full Day" | "Half Day" | "Hourly">(
    "Full Day"
  );
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
  }, [selectedDates]);

  useEffect(() => {
    const dateStr = fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : null;
    if (!dateStr || multiDay) return;

    if (dayType === "Half Day") {
      if (slotsPerDay[dateStr] === "Full Day" || !slotsPerDay[dateStr]) {
        updateSlotForDay(dateStr, "First Half");
      }
    } else if (dayType === "Full Day") {
      if (slotsPerDay[dateStr] !== "Full Day") {
        updateSlotForDay(dateStr, "Full Day");
      }
    }
  }, [dayType, fromDate, multiDay, slotsPerDay, updateSlotForDay]);

  const isHourly = dayType === "Hourly";

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
      <div className="flex justify-between items-center p-2 px-3 border-b">
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
            <div className="text-xs text-muted-foreground">{user?.role}</div>
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
      <div className="flex w-full h-screen overflow-hidden flex-row ">
        <div className="flex-1 overflow-y-auto max-lg:max-h-[calc(100vh-167px)] lg:mb-[143px]">
          <div className="p-6 flex flex-col gap-6 ">
            <div className="md:w-1/2 min-w-80 w-full">
              <FloatingSelect
                label="Select request type"
                value={dayType}
                options={[
                  { label: "Full Day", value: "Full Day" },
                  { label: "Half Day", value: "Half Day" },
                  { label: "Hourly", value: "Hourly" },
                ]}
                onChange={(val) => setDayType(val as any)}
              />
            </div>

            <div className="flex items-end gap-4 flex-wrap">
              <div className="md:w-1/2 min-w-80 w-full">
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
                  className="text-sidebar-primary text-xs font-medium mb-3"
                  onClick={() => setMultiDay((p) => !p)}
                >
                  {multiDay ? "SINGLE DAY?" : "MORE THAN ONE DAY?"}
                </button>
              )}
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
                ) : !isHourly && !multiDay && dayType === "Half Day" ? (
                  <div className="border border-gray-200 rounded flex justify-center items-center p-4 gap-8 w-full lg:w-1/2">
                    <span className="font-medium text-gray-600">
                      {dayjs(fromDate).format("ddd, DD MMM YYYY")}
                    </span>
                    <div className="w-1/2 -mt-6">
                      <FloatingSelect
                        label=""
                        value={
                          slotsPerDay[dayjs(fromDate).format("YYYY-MM-DD")]
                        }
                        options={[
                          { label: "First Half", value: "First Half" },
                          { label: "Second Half", value: "Second Half" },
                        ]}
                        onChange={(val) =>
                          updateSlotForDay(
                            dayjs(fromDate).format("YYYY-MM-DD"),
                            val as "First Half" | "Second Half"
                          )
                        }
                      />
                    </div>
                  </div>
                ) : isHourly ? (
                  <div className="border border-gray-200 rounded flex justify-between items-center p-4 gap-2 text-sm lg:w-1/2 w-full">
                    <span className="font-medium text-gray-600 whitespace-nowrap mr-3">
                      {dayjs(fromDate).format("ddd, DD MMM YYYY")}
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
                ) : null}
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
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/3 border-l shrink-0 ">
          <RightPanelContent numberOfDays={numberOfDays} />
        </div>
      </div>
    </div>
  );
}
