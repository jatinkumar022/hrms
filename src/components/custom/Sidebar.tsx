import React from "react";
import {
  Grid,
  FileText,
  Calendar,
  MessageCircle,
  Share2,
  Clock,
  Settings,
  Headphones,
  LogOut,
} from "@geist-ui/icons";
import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import RightSideDropdown from "@/components/ui/sidebarMenu";
import { GoSignOut } from "react-icons/go";
import HolidayIcon from "@/assets/Holiday";
export default function Sidebar() {
  return (
    <>
      <aside className="w-20 bg-sidebar flex flex-col items-center py-4 space-y-6 border-r border-zinc-00 fixed left-0 top-0 h-screen z-30">
        <div className="">
          <Image src={logo} alt="Logo" className="w-12 h-12 " />
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href={"/"}
            className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200"
          >
            <Grid size={22} />
          </Link>
          <div className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200">
            <FileText size={22} />
          </div>

          <RightSideDropdown
            className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200"
            items={[
              { label: "My Attendance", to: "/attendance/my-attendance" },
              { label: "My Status Report", to: "/attendance/my-status-report" },
              {
                label: "My Attendance Requests",
                to: "/attendance/my-attendance",
              },
              {
                label: "My OD & Remote Work",
                to: "/attendance/my-od-remotework",
              },
              { label: "My Late In", to: "/attendance/my-latein" },
              { label: "My Early Out", to: "/attendance/my-earlyout" },
              "divider",
              {
                label: "Shift Calendar",
                to: "/",
              },
            ]}
          >
            <Calendar size={22} />
          </RightSideDropdown>
          <RightSideDropdown
            className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200"
            items={[
              { label: "My Leaves", to: "/leave/my-leaves" },
              { label: "Leave History", to: "/leave/leaves-history" },
            ]}
          >
            <GoSignOut size={22} />
          </RightSideDropdown>

          <hr className="m-2.5 border-gray-600" />
          <Link
            href={"/my-holidays"}
            className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200 group"
          >
            <HolidayIcon size={22} />
          </Link>
          <div className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200">
            <Share2 size={22} />
          </div>
          <div className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200">
            <Clock size={22} />
          </div>
          <div className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200 relative">
            <MessageCircle size={22} />
            <div className="absolute bg-[#c84320] text-[9px] flex items-center justify-center text-white top-1 rounded-full  w-4 h-4 right-1.5 ">
              1
            </div>
          </div>
        </div>
        <div className="mt-auto flex flex-col items-center space-y-4">
          <div className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200">
            <Headphones size={22} />
          </div>
          <div className="text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200">
            <Settings size={22} />
          </div>

          <div className="text-[#db3125] p-2.5 pl-3 rounded-xl hover:bg-[#80393980] cursor-pointer transition-colors duration-200 mb-2">
            <LogOut size={21} />
          </div>
        </div>
      </aside>
    </>
  );
}
