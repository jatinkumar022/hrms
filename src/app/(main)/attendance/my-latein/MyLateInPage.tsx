"use client";
import DatePreset from "@/lib/DatePreset";
import { DatePicker, Select, Alert } from "antd";
import { useState, useEffect, useMemo } from "react";
import DataSummery from "../components/DataSummery/DataSummery";
import { DataTable } from "../components/table/DataTable";
import { columns } from "../components/table/columns";
import TimesheetDrawer from "../components/TimeSheetDrawer/TimesheetDrawer";
const { RangePicker } = DatePicker;
import type { DatePresetItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchLateInRecords } from "@/redux/slices/attendance/lateInSlice";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import MapModalLoader from "../components/DataSummery/MapModalLoader";
import { SearchInput } from "@/components/ui/searchbox";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaFilter } from "react-icons/fa";
import { IoInformationCircleSharp } from "react-icons/io5";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function MyLateInPage() {
  const dispatch = useAppDispatch();
  const {
    records,
    loading: isLoading,
    error: errorMessage,
  } = useAppSelector((state) => state.lateIn);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [isActive, setIsActive] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedPerson, setSelectedPerson] = useState<string | undefined>(
    undefined
  );
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapModalLat, setMapModalLat] = useState(0);
  const [mapModalLng, setMapModalLng] = useState(0);
  const [mapModalLabel, setMapModalLabel] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const isMobileQuery = useMediaQuery("(max-width: 899px)");

  useEffect(() => {
    setIsMobile(isMobileQuery);
  }, [isMobileQuery]);

  const handleOpenMap = (lat: number, lng: number, label: string) => {
    setMapModalLat(lat);
    setMapModalLng(lng);
    setMapModalLabel(label);
    setMapModalOpen(true);
  };

  const handleViewDetails = (row: any) => {
    const fullAttendanceRecord = (records || []).find(
      (att: any) => att.date === row.original.date
    );
    setSelectedAttendance(fullAttendanceRecord);
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    dispatch(fetchLateInRecords());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    let data = records || []; // Provide a default empty array
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

  const Filters = () => (
    <div
      className={`flex   items-center gap-3 w-full  ${
        isMobile ? "flex-col" : "flex-row"
      }`}
    >
      <div className={` ${isMobile ? "!w-full" : ""}`}>
        <Select
          showSearch
          placeholder="Select a person"
          optionFilterProp="label"
          onChange={onChange}
          allowClear
          style={{ width: "100%" }}
          options={Array.from(
            new Set(
              (records || []).map((r: any) => r.user.username) // Also provide a fallback here
            )
          ).map((username) => ({
            value: username,
            label: username,
          }))}
        />
      </div>
      <div className={`  ${isMobile ? "!w-full" : ""}`}>
        <RangePicker
          className="custom-range-picker"
          format="YYYY-MM-DD"
          value={selectedRange}
          onChange={setSelectedRange}
          style={{ width: "100%" }}
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
      <div className={`  ${isMobile ? "!w-full" : ""}`}>
        <SearchInput
          placeholder="Search by name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="!text-sm !w-full h-8"
        />
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100%-109px)]">
      <FullPageLoader show={isLoading} />
      <div className="flex justify-between p-3 border-b items-center">
        <div className="font-medium ">
          {isMobile ? (
            <Dialog>
              <DialogTrigger asChild>
                <button className="border-none outline-none cursor-pointer">
                  <div className="flex items-center gap-2 rounded-xs bg-[#60b158] text-white  text-xs font-medium px-2 py-1 ">
                    <IoInformationCircleSharp size={16} /> Summary
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>My Status Report Summary</DialogTitle>
                </DialogHeader>
                <DataSummery />
              </DialogContent>
            </Dialog>
          ) : (
            " My Late-Ins"
          )}
        </div>
        <div className="flex items-center gap-3">
          {isMobile ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="border-none outline-none cursor-pointer">
                  <div className="flex items-center gap-2 rounded-xs border  text-xs font-medium px-2 py-1">
                    <FaFilter className="mr-2" /> Filters
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-2xs p-4">
                <Filters />
              </PopoverContent>
            </Popover>
          ) : (
            <Filters />
          )}
        </div>
      </div>
      {!isMobile && (
        <div>
          <DataSummery />
        </div>
      )}
      <div className="h-full">
        {errorMessage ? (
          <Alert type="error" message={errorMessage} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            meta={{
              handleView: (row: any) => handleViewDetails(row),
              handleOpenMap: handleOpenMap,
            }}
          />
        )}
      </div>
      <TimesheetDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        dailyAttendance={selectedAttendance}
      />
      <MapModalLoader
        open={mapModalOpen}
        onOpenChange={setMapModalOpen}
        lat={mapModalLat}
        lng={mapModalLng}
        label={mapModalLabel}
      />
    </div>
  );
}
