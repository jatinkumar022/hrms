"use client";
import { useEffect } from "react";
import { Bell } from "@geist-ui/icons";

import { ThemeToggle } from "../ui/darkmode";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProfileImage } from "@/redux/slices/profileImageSlice";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { CgMenuLeft } from "react-icons/cg";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import logo from "@/assets/logo.png";
import HolidayIcon from "@/assets/Holiday";
import { GoSignOut } from "react-icons/go";
import RightSideDropdown from "@/components/ui/sidebarMenu";
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

export default function Navbar() {
  const dispatch = useAppDispatch();
  const profileImage = useAppSelector(
    (state) => state.profileImage.profileImage
  );
  const userName = "Jatin ramani";

  useEffect(() => {
    dispatch(fetchProfileImage());
  }, [dispatch]);

  return (
    <>
      <div className="flex items-center justify-between p-4  bg-sidebar text-sidebar-foreground sticky top-0 left-0 border">
        <div className="flex gap-1.5 items-center ">
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <span className="block md:hidden rounded-md p-1 cursor-pointer hover:bg-[#e4e4e4]">
                <CgMenuLeft size={20} />
              </span>
            </DrawerTrigger>
            <DrawerContent className="p-0 px-5 !w-fit bg-sidebar h-full flex flex-col">
              <DrawerTitle />
              <div className="flex flex-col  items-center py-4 justify-between h-full">
                <div className="flex flex-col  items-center py-4 space-y-6">
                  <div>
                    <Image src={logo} alt="Logo" className="w-12 h-12" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/"
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
                        {
                          label: "My Attendance",
                          to: "/attendance/my-attendance",
                        },
                        {
                          label: "My Status Report",
                          to: "/attendance/my-status-report",
                        },
                        {
                          label: "My Attendance Requests",
                          to: "/attendance/my-attendance",
                        },
                        {
                          label: "My OD & Remote Work",
                          to: "/attendance/my-od-remotework",
                        },
                        { label: "My Late In", to: "/attendance/my-latein" },
                        {
                          label: "My Early Out",
                          to: "/attendance/my-earlyout",
                        },
                        "divider",
                        { label: "Shift Calendar", to: "/" },
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
                      href="/my-holidays"
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
              </div>
            </DrawerContent>
          </Drawer>
          <span className="md:text-xl  text-lg font-medium cursor-pointer">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="md:p-[10px] p-1.5 rounded-full bg-[#9e9e9e33] hover:bg-[#81818133] cursor-pointer relative">
            <Bell size={20} />
            <div className="absolute bg-[#c84320] text-[10px] flex items-center justify-center text-white -top-1  rounded-full  w-5 h-4 -right-2 md:-right-1 ">
              1
            </div>
          </div>
          <Link
            href={"/profile"}
            className="relative md:w-10 md:h-10 w-8 h-8 rounded-full bg-green-500 p-[2px] cursor-pointer"
          >
            <div className="w-full h-full dark:bg-black bg-white rounded-full p-[2px]">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <InitialsAvatar name={userName} className="w-full h-full" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 dark:border-black border-white  rounded-full"></span>
          </Link>
        </div>
      </div>
    </>
  );
}
