"use client";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "antd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import Raxabandhan from "@/assets/Events/RaxabandhanIcon";
import Round from "@/assets/Events/RoundIcon";
import Float from "@/assets/Events/FloatIcon";
import Ganeshchaturthi from "@/assets/Events/GaneshjiIcon";
import Navratri from "@/assets/Events/NavRatriIcon";
import DiwaliIcon from "@/assets/Events/DiwaliIcon";
import DhuletiIcon from "@/assets/Events/DhuletiIcon";
import KiteIcon from "@/assets/Events/KiteIcon";
import { hexToRGBA } from "@/lib/utils";

const holidayData = [
  {
    image: "/icons/uttarayan.svg",
    name: "Uttarayana",
    optional: false,
    date: "Tue 14 Jan, 2025",
    color: "#1d873f",
    description: "Makar Sankranti",
    icon: <KiteIcon className="w-6 h-6" fill="#1d873f" />,
  },
  {
    image: "/icons/republic.svg",
    name: "Republic Day",
    optional: false,
    date: "Sun 26 Jan, 2025",
    description: "Republic Day",
    color: "#ffa801",
    icon: <Round className="w-6 h-6" fill="#1d873f" />,
  },
  {
    image: "/icons/dhuleti.svg",
    name: "Dhuleti",
    optional: false,
    date: "Fri 14 Mar, 2025",
    description: "Dhuleti",
    color: "1d873f",
    icon: <DhuletiIcon className="w-6 h-6" fill="#1d873f" />,
  },
  {
    image: "/icons/raksha.svg",
    name: "Rakshabandhan",
    optional: false,
    color: "#ffa801",
    icon: <Raxabandhan className="w-6 h-6" fill="#ffa801" />,
    date: "Sat 09 Aug, 2025",
    description: "Rakshabandhan",
  },
  {
    image: "/icons/independence.svg",
    name: "Independence Day",
    optional: false,
    date: "Fri 15 Aug, 2025",
    description: "Independence Day",
    color: "#1d873f",
    icon: <Round className="w-6 h-6" fill="#1d873f" />,
  },
  {
    image: "/icons/janmastami.svg",
    name: "Janmashtami",
    optional: false,
    date: "Sat 16 Aug, 2025",
    description: "Janmashtami",
    icon: <Float className="w-6 h-6" fill="#ffa801" />,
    color: "#ffa801",
  },
  {
    image: "/icons/ganesh.svg",
    name: "Ganesh Visarjan",
    optional: false,
    date: "Sat 06 Sep, 2025",
    description: "Ganesh Visarjan",
    color: "#1d873f",
    icon: <Ganeshchaturthi className="w-6 h-6" fill="#1d873f" />,
  },
  {
    image: "/icons/dussehra.svg",
    name: "Dussehra / Gandhi Jayanti",
    optional: false,
    date: "Thu 02 Oct, 2025",
    description: "Dussehra / Gandhi Jayanti",
    color: "#ffa801",
    icon: <Navratri className="w-6 h-6" fill="#ffa801" />,
  },
  {
    image: "/icons/diwali.svg",
    name: "Diwali",
    optional: false,
    date: "Sat 18 Oct, 2025 - Wed 22 Oct, 2025",
    description: "Diwali",
    color: "#1d873f",
    icon: <DiwaliIcon className="w-6 h-6" fill="#1d873f" />,
  },
];

export default function HolidayListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("My Holiday");
  const [year, setYear] = useState("2025");

  const filteredData = holidayData.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex p-3 justify-between items-center">
        <h2 className="font-medium text-base">
          {filteredData.length}{" "}
          <span className="text-[#585858]"> Holidays</span>
        </h2>
        <div className="flex gap-2 ">
          <Input
            placeholder="Search"
            className=" text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Holiday Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="My Holiday">My Holiday</SelectItem>
              <SelectItem value="Company Holiday">Company Holiday</SelectItem>
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded overflow-auto">
        <Table className="min-w-[900px] text-xs">
          <TableHeader className="bg-[#fafafb]">
            <TableRow>
              <TableHead className="px-2">Image</TableHead>
              <TableHead className="px-2">Holiday Name</TableHead>
              <TableHead className="px-2">Optional</TableHead>
              <TableHead className="px-2">Date</TableHead>
              <TableHead className="px-2">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, i) => (
              <TableRow key={i} className={i % 2 === 6 ? "bg-muted" : ""}>
                <TableCell className="px-2 py-2">
                  <div
                    className="p-2.5 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${hexToRGBA(row.color, 0.15)}`,
                      color: row.color,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {row.icon}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-2 whitespace-nowrap">
                  {row.name}
                </TableCell>
                <TableCell className="px-2 py-2">
                  <Switch
                    checked={row.optional}
                    disabled
                    className="scale-90"
                  />
                </TableCell>
                <TableCell className="px-2 py-2 whitespace-nowrap">
                  {row.date}
                </TableCell>
                <TableCell className="px-2 py-2 whitespace-nowrap">
                  {row.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
