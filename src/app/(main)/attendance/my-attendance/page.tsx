"use client";

import DatePreset from "@/lib/DatePreset";
import { DatePicker, Select } from "antd";
import { useState } from "react";
import DataSummery from "../components/DataSummery/DataSummery";
import { DataTable } from "../components/table/DataTable";
import { columns } from "../components/table/columns";
import { attendanceData } from "../components/data";
import TimesheetDrawer from "../components/TimeSheetDrawer/TimesheetDrawer";
const { RangePicker } = DatePicker;

const MyAttendance = () => {
  const [openDrawer, setOpenDrawer] = useState();
  const [selectedRange, setSelectedRange] = useState([]);
  const [isActive, setIsActive] = useState("");
  const handlePresetClick = (preset) => {
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
        <DataSummery />
      </div>

      <div>
        <DataTable
          columns={columns}
          data={attendanceData}
          meta={{
            handleView: (row) => setOpenDrawer(row),
          }}
        />
      </div>
      <TimesheetDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </div>
  );
};

export default MyAttendance;
