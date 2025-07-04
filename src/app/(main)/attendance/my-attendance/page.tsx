"use client";
import DatePreset from "@/lib/DatePreset";
import { DatePicker, Select, Spin, Alert, Input } from "antd";
import { useState, useEffect, useMemo } from "react";
import DataSummery from "../components/DataSummery/DataSummery";
import { DataTable } from "../components/table/DataTable";
import { columns } from "../components/table/columns";
import TimesheetDrawer from "../components/TimeSheetDrawer/TimesheetDrawer";
const { RangePicker } = DatePicker;
import type { DatePresetItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchMonthlyAttendance } from "@/redux/slices/monthlyAttendanceSlice";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import MapModal from "../components/DataSummery/MapModal";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
export default function MyAttendance() {
  const dispatch = useAppDispatch();
  const { records, isLoading, isError, errorMessage } = useAppSelector(
    (state) => state.monthlyAttendance
  );
  const [openDrawer, setOpenDrawer] = useState<any>(undefined);
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [isActive, setIsActive] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");
  // For demo, person select is not functional unless you have multi-user data
  const [selectedPerson, setSelectedPerson] = useState<string | undefined>(
    undefined
  );
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLatLng, setSelectedLatLng] = useState<[number, number] | null>(
    null
  );
  const [locationLabel, setLocationLabel] = useState<string>("");

  const handleOpenMap = (lat: number, lng: number, label: string) => {
    setSelectedLatLng([lat, lng]);
    setLocationLabel(label);
    setMapOpen(true);
  };

  // Fetch current month attendance on mount
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    dispatch(fetchMonthlyAttendance({ month, year }));
  }, [dispatch]);

  // Filter records by selected date range
  const filteredData = useMemo(() => {
    let data = records;
    // Filter by date range
    if (selectedRange && selectedRange.length === 2) {
      const [start, end] = selectedRange;
      data = data.filter((rec: any) => {
        const recDate = dayjs(rec.date, "YYYY-MM-DD");
        return (
          recDate.isSameOrAfter(dayjs(start)) &&
          recDate.isSameOrBefore(dayjs(end))
        );
      });
    }
    // Filter by search text (username)
    if (searchText) {
      data = data.filter((rec: any) =>
        rec.user.username.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    // Filter by selected person (if implemented)
    if (selectedPerson) {
      data = data.filter((rec: any) => rec.user.username === selectedPerson);
    }
    return data;
  }, [records, selectedRange, searchText, selectedPerson]);

  const handlePresetClick = (preset: DatePresetItem) => {
    setIsActive(preset.label);
    setSelectedRange(preset.value);
  };
  const onChange = (value: string) => {
    setSelectedPerson(value);
  };
  const onSearch = (value: string) => {
    setSearchText(value);
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
              allowClear
              options={Array.from(
                new Set(records.map((r: any) => r.user.username))
              ).map((username) => ({
                value: username,
                label: username,
              }))}
            />
          </div>
          <div>
            <RangePicker
              className="custom-range-picker"
              format="YYYY-MM-DD"
              value={selectedRange}
              onChange={setSelectedRange}
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
          <div>
            <Input.Search
              placeholder="Search by name"
              allowClear
              onSearch={onSearch}
              style={{ width: 180 }}
            />
          </div>
        </div>
      </div>
      <div>
        <DataSummery />
      </div>
      <div>
        {isLoading ? (
          <Spin className="my-8" />
        ) : isError ? (
          <Alert type="error" message={errorMessage} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            meta={{
              handleView: (row: any) => setOpenDrawer(row),
              handleOpenMap,
            }}
          />
        )}
      </div>
      <TimesheetDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
      {selectedLatLng && (
        <MapModal
          open={mapOpen}
          onOpenChange={setMapOpen}
          lat={selectedLatLng[0]}
          lng={selectedLatLng[1]}
          label={locationLabel}
        />
      )}
    </div>
  );
}
