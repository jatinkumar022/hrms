"use client";
import DatePreset from "@/lib/DatePreset";
import { DatePicker, Select } from "antd";
import React, { useState } from "react";
import { DataTable } from "../components/table/DataTable";
import { RemoteData } from "../components/data";
import { remoteColumns } from "../components/table/RemoteWorkColumns";
import { useRouter } from "next/navigation";
import { DatePresetItem, RemoteRequest } from "@/lib/types";
import type { DateRange } from "react-day-picker";
const { RangePicker } = DatePicker;

export default function MyRemoteWork() {
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [isActive, setIsActive] = useState<string | undefined>(undefined);
  const route = useRouter();
  const handlePresetClick = (preset: DatePresetItem) => {
    if (!preset.label || !preset.value) return;
    setIsActive(preset.label);
    setSelectedRange(preset.value);
  };
  const onChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value: string) => {
    console.log("search:", value);
  };
  return (
    <div>
      <div className="flex justify-between p-3 border-b items-center">
        <div className="font-medium ">My Attendance</div>
        <div className="flex items-center gap-3">
          <div>
            <Select
              showSearch
              placeholder="Select a person"
              optionFilterProp="label"
              onChange={onChange}
              onSearch={onSearch}
              allowClear
              options={[
                {
                  value: "jack",
                  label: "Jack",
                },
                {
                  value: "lucy",
                  label: "Lucy",
                },
                {
                  value: "tom",
                  label: "Tom",
                },
              ]}
            />
          </div>
          <div>
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
          </div>
          <div></div>
          <div></div>
        </div>
      </div>

      <div>
        <DataTable<RemoteRequest, unknown>
          columns={remoteColumns}
          data={RemoteData}
          meta={{
            onView: (row: any) =>
              route.push(`/attendance/my-od-remotework/${row.id}`),
            onApprove: (row: any) => console.log("Approve", row),
            onReject: (row: any) => console.log("Reject", row),
          }}
        />
      </div>
    </div>
  );
}
