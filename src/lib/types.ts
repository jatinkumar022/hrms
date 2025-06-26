import type { DateRange } from "react-day-picker";

export interface DatePresetItem {
  label?: string;
  value?: DateRange;
}

export interface DatePresetProps {
  isActive: string | undefined;
  setIsActive: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedRange: any;
  setSelectedRange: React.Dispatch<React.SetStateAction<any>>;
  handlePresetClick: (preset: DatePresetItem) => void;
}
export interface DateRangePreset {
  label: string;
  value: DateRange;
}

export interface PresetValue {
  label: string;
  value: DateRange;
}

export interface RemoteRequest {
  id: string;
  name: string;
  image: string;
  type: string;
  country: string;
  state: string;
  from: string;
  to: string;
  nuOfDaysHours: string;
  status: string;
  requestedOn: string;
  reason: string;
  actionBy: string;
}
export type RemoteTableMeta = {
  onView: (row: RemoteRequest) => void;
  onApprove: (row: RemoteRequest) => void;
  onReject: (row: RemoteRequest) => void;
};

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late-in"
  | "early-out"
  | "remote-work"
  | "holiday"
  | "leave"
  | "missing-clock-out"
  | "weekend";

export type ChartEntry = {
  date: string;
  beforeBreak: number;
  break: number;
  afterBreak: number;
  missing: number;
};

export interface DashboardData {
  lateArrivals: { duration: string; date: string }[];
  attendance: { label: string; value: number }[];
  leaves: { label: string; balance: number | string; booked: number }[];
  upcomingHolidays: string[];
  attendanceRecords: { date: string; statuses: AttendanceStatus[] }[];
  chartData: ChartEntry[]; // ✅ Make sure this is included
}
