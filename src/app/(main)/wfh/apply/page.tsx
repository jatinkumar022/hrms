"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { submitWfhRequest } from "@/redux/slices/wfh/userWfhSlice";
import { toast } from "sonner";
import { Spin } from "antd";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import FileUpload from "@/components/ui/FileUpload";
import axios from "axios";

export default function ApplyWfhPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.userWfh);

  const [dayType, setDayType] = useState<"Full Day" | "Half Day" | "Hourly">(
    "Full Day"
  );
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [halfDayTime, setHalfDayTime] = useState<"First Half" | "Second Half">(
    "First Half"
  );
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");
  const [multiDay, setMultiDay] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    if (!multiDay) return dayType === "Half Day" ? 0.5 : 1;
    if (!fromDate || !toDate) return 0;
    const start = dayjs(fromDate).startOf("day");
    const end = dayjs(toDate).startOf("day");
    if (end.isBefore(start)) return 0;
    return end.diff(start, "day") + 1;
  }, [fromDate, toDate, multiDay, dayType, isHourly]);

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

    const wfhData: any = {
      startDate: dayjs(fromDate).format("YYYY-MM-DD"),
      endDate: dayjs(multiDay && toDate ? toDate : fromDate).format(
        "YYYY-MM-DD"
      ),
      numberOfDays: numberOfDays,
      dayType: dayType,
      reason: reason,
      attachment: attachmentUrl,
    };

    if (dayType === "Half Day") {
      wfhData.halfDayTime = halfDayTime;
    }
    if (isHourly) {
      wfhData.startTime = startTime;
      wfhData.endTime = endTime;
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
    <div className="w-full rounded-lg text-sm">
      <FullPageLoader show={status === "loading"} />
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-medium">Apply Work From Home Request</h2>
        <div className="flex gap-3 text-xs">
          <button
            onClick={() => router.back()}
            className="w-24 py-[6px] border border-gray-300 rounded-xs cursor-pointer hover:bg-gray-50"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-24 py-[6px] bg-sidebar-primary text-white rounded-xs border border-sidebar-primary cursor-pointer hover:opacity-90 flex justify-center items-center"
          >
            {status === "loading" ? <Spin size="small" /> : "Save"}
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="md:w-1/3 min-w-80 w-full">
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
          <div className="md:w-1/3 min-w-80 w-full">
            <DatePickerWithLabel
              label="From Date"
              value={fromDate}
              onChange={(d) => setFromDate(d)}
            />
          </div>

          {multiDay && !isHourly && (
            <div className="md:w-1/3 min-w-80 w-full">
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

        {!isHourly && !multiDay ? (
          <div className="border border-gray-200 rounded flex justify-center items-center p-4 gap-8 w-full lg:w-1/2">
            <span className="font-medium text-gray-600">
              {dayjs(fromDate).format("ddd, DD MMM YYYY")}
            </span>
            <div className="w-1/2 -mt-6">
              <FloatingSelect
                label=""
                value={halfDayTime}
                options={[
                  { label: "First Half", value: "First Half" },
                  { label: "Second Half", value: "Second Half" },
                ]}
                onChange={(val) => setHalfDayTime(val as any)}
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

        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="lg:w-1/2 w-full">
            <textarea
              placeholder="Reason *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex-1 min-h-[120px] w-full border border-gray-300 rounded p-4 outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div className="lg:w-1/2 w-full">
            <FileUpload file={file} onChange={setFile} label="Attachment" />
          </div>
        </div>
      </div>
    </div>
  );
}
