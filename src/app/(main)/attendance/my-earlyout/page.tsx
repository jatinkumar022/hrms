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
import { EarlyOut, earlyOutColumns } from "../components/table/earlyOutColumns";
import { earlyOutData } from "../components/data";

// ———————————————————————————— Types & sample data ————————————————————————————

// ———————————————————————————— Helper ————————————————————————————
const convertToCSV = (rows: EarlyOut[]): string => {
  if (!rows.length) return "";
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map((r) => Object.values(r).join(","));
  return [header, ...body].join("\n");
};

const { RangePicker } = DatePicker;

interface EarlyOutTableProps {
  data?: EarlyOut[];
  onView?: (row: EarlyOut) => void;
}

// ———————————————————————————— Component ————————————————————————————
const MyEarlyOut: React.FC<EarlyOutTableProps> = ({
  data = earlyOutData,
  onView = () => {},
}) => {
  const [selectedRange, setSelectedRange] = useState<any[]>([]);
  const [isActive, setIsActive] = useState<string | undefined>(undefined);
  const handlePresetClick = (preset: any) => {
    setIsActive(preset.label);
    setSelectedRange(preset.value);
  };

  // Filter rows by date
  const filteredData = useMemo(() => {
    if (!selectedRange[0] || !selectedRange[1]) return data;
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

  // Total early‑out count (rows) – you can change to time diff if needed
  const totalEarlyOuts = filteredData.length;

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns: earlyOutColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: { handleView: onView },
  });

  const exportToCSV = () => {
    const csv = convertToCSV(filteredData);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "early-out.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center p-5 py-2 border-b">
        <div className="flex items-center gap-6 text-sm">
          <div>My Early Out</div>
          <div>
            <div>{totalEarlyOuts} Times</div>
            <div className="text-[#7c7c7c]">Total Early Outs</div>
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

      {/* Table */}
      <div className="w-full overflow-auto  border-b border-gray-200 bg-white">
        <Table className="min-w-[1000px] text-xs border-b">
          <TableHeader className="bg-[#fafafb]">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`whitespace-nowrap px-2 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wide text-left ${
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

export default function Page() {
  return <MyEarlyOut />;
}
