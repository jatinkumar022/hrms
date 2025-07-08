"use client";
import { Alert, DatePicker } from "antd";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { getColumns, WfhRow } from "./wfhData";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchMyWfhRequests,
  cancelWfhRequest,
} from "@/redux/slices/wfh/userWfhSlice";
import Link from "next/link";
import DatePreset from "@/lib/DatePreset";
import type { DateRange } from "react-day-picker";
import { DataTable } from "../../attendance/components/table/DataTable";
import FullPageLoader from "@/components/loaders/FullPageLoader";

const { RangePicker } = DatePicker;

export default function WfhHistoryTable() {
  const dispatch = useAppDispatch();
  const { myWfhRequests, status, error } = useAppSelector(
    (state) => state.userWfh
  );

  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [isActive, setIsActive] = useState<string | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchMyWfhRequests());
  }, [dispatch]);

  const handlePresetClick = (preset: any) => {
    if (!preset.label || !preset.value) return;
    setIsActive(preset.label);
    setSelectedRange(preset.value);
  };

  const filteredData = useMemo(() => {
    let data: WfhRow[] = myWfhRequests || [];
    if (selectedRange?.from && selectedRange?.to) {
      data = data.filter(
        (row) =>
          new Date(row.startDate) >= selectedRange.from! &&
          new Date(row.endDate) <= selectedRange.to!
      );
    }
    return data;
  }, [myWfhRequests, selectedRange]);

  const handleView = (row: WfhRow) => {
    console.log("View WFH Request:", row);
  };

  const handleCancel = (wfhId: string) => {
    dispatch(cancelWfhRequest(wfhId));
  };

  const columns = useMemo(
    () => getColumns({ onView: handleView, onCancel: handleCancel }),
    []
  );

  if (status === "failed") {
    return (
      <Alert
        message="Error"
        description={error || "Failed to load WFH history"}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <FullPageLoader show={status === "loading"} />
      <div className="flex justify-between p-3 border-b items-center">
        <div className="font-medium">My WFH History</div>
        <div className="flex items-center gap-3">
          <RangePicker
            className="custom-range-picker"
            format="M-DD-YYYY"
            renderExtraFooter={() => (
              <DatePreset
                isActive={isActive}
                setIsActive={setIsActive}
                selectedRange={selectedRange}
                setSelectedRange={setSelectedRange}
                handlePresetClick={handlePresetClick}
              />
            )}
          />
          <Link href="/wfh/apply">
            <Button>+ Apply for WFH</Button>
          </Link>
        </div>
      </div>
      <div>
        <DataTable
          columns={columns}
          data={filteredData}
          meta={{
            onView: handleView,
            onCancel: handleCancel,
          }}
        />
      </div>
    </div>
  );
}
