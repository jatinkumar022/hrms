"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import DatePreset from "@/lib/DatePreset";
import { DatePicker } from "antd";
import React, { useMemo, useState } from "react";
import { LuDownload } from "react-icons/lu";
import dayjs from "dayjs";

// adjust this import path to match YOUR folder structure
import { lateInColumns, LateIn } from "../components/table/lateInColumns";
import { lateInData } from "../components/data";

const { RangePicker } = DatePicker;

interface LateInTableProps {
  data?: LateIn[]; // defaults to `lateInData` if not provided
  onView?: (row: LateIn) => void;
}

/**
 * Safely converts an array of LateIn objects to CSV.
 */
const convertToCSV = (rows: LateIn[]): string => {
  if (!rows?.length) return "";
  const header = Object.keys(rows[0]).join(",");
  const lines = rows.map((r) => Object.values(r).join(","));
  return [header, ...lines].join("\n");
};

const MyLateIn: React.FC<LateInTableProps> = ({
  data = lateInData,
  onView = () => {},
}) => {
  const [selectedRange, setSelectedRange] = useState<any[]>([]);
  const [isActive, setIsActive] = useState<string>("");

  const handlePresetClick = (preset: any) => {
    setIsActive(preset.label);
    setSelectedRange(preset.value);
  };

  const exportToCSV = () => {
    const csv = convertToCSV(filteredData);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "late-in.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredData = useMemo(() => {
    if (!selectedRange?.[0] || !selectedRange?.[1]) return data;

    const start = dayjs(selectedRange[0]);
    const end = dayjs(selectedRange[1]);

    return data.filter((d) => {
      const itemDate = dayjs(d.date, "ddd DD MMM, YYYY");
      return (
        itemDate.isSame(start, "day") ||
        itemDate.isSame(end, "day") ||
        (itemDate.isAfter(start, "day") && itemDate.isBefore(end, "day"))
      );
    });
  }, [data, selectedRange]);

  const totalLate = useMemo(() => {
    const minutes = filteredData.reduce((sum, r) => {
      const m = r.lateInTime.match(/(\d{2}) H : (\d{2}) M/);
      if (!m) return sum;
      return sum + parseInt(m[1]) * 60 + parseInt(m[2]);
    }, 0);
    const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hrs} H : ${mins} M`;
  }, [filteredData]);

  const table = useReactTable({
    data: filteredData,
    columns: lateInColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: { handleView: onView },
  });

  return (
    <div className="">
      <div className="flex justify-between items-center p-5 py-2 border-b">
        <div className="flex items-center gap-6 text-sm">
          <div>My Late IN</div>
          <div>
            <div>{totalLate}</div>
            <div className="text-[#7c7c7c]">Total Hours</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="border-r border-[#bdbdbd] h-5" />
          <button
            onClick={exportToCSV}
            className="p-1 border border-[#bdbdbd] text-[#7c7c7c] rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <LuDownload size={19} />
          </button>
        </div>
      </div>

      <div className="w-full overflow-auto  border border-gray-200 bg-white ">
        <Table className="min-w-[1000px] text-xs border-b">
          <TableHeader className="bg-[#fafafb]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`whitespace-nowrap px-2 py-2 text-[11px] font-semibold text-gray-600 tracking-wide uppercase text-left ${
                      header.column.id === "actions"
                        ? "sticky right-0 bg-white z-20 shadow"
                        : ""
                    }`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-white group">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`whitespace-nowrap px-2 py-2 text-[#868686] text-[12px] ${
                      cell.column.id === "actions"
                        ? "sticky right-0 bg-white shadow-md z-10"
                        : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyLateIn;
