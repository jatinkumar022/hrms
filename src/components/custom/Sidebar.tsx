"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { FaLaptopHouse } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/loginSlice";
import { useAppSelector } from "@/lib/hooks";
import clsx from "clsx";
import { DropdownItem } from "@/components/ui/sidebarMenu";

export default function Sidebar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.login);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser() as any).unwrap();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setShowLogoutModal(false);
  };

  const leaveMenuItems = [
    { label: "My Leaves", to: "/leave/my-leaves" },
    { label: "Leave History", to: "/leave/leaves-history" },
  ];
  const wfhMenuItems = [
    { label: "Apply for WFH", to: "/wfh/apply" },
    { label: "WFH History", to: "/wfh/history" },
  ];
  const attendanceMenuItems = [
    { label: "My Attendance", to: "/attendance/my-attendance" },
    { label: "My Late In", to: "/attendance/my-latein" },
    { label: "My Early Out", to: "/attendance/my-earlyout" },
    "divider",
    { label: "Shift Calendar", to: "/" },
  ];

  if (user?.role === "admin") {
    leaveMenuItems.push({
      label: "Admin Leave Requests",
      to: "/leave/requests",
    });
    wfhMenuItems.push({
      label: "Admin WFH Requests",
      to: "/wfh/requests",
    });
  }

  const linkClasses = (path: string, exact: boolean = false) =>
    clsx(
      "text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#39588080] cursor-pointer transition-colors duration-200",
      {
        "text-sidebar-primary bg-[#39588080]":
          (exact ? pathname === path : pathname.startsWith(path)) &&
          path !== "#",
      }
    );

  return (
    <>
      <aside className="w-20 bg-sidebar flex flex-col items-center py-4 space-y-6 border-r border-zinc-00 fixed left-0 top-0 h-screen z-30">
        <div className="">
          <Image src={logo} alt="Logo" className="w-12 h-12 " />
        </div>
        <div className="flex flex-col gap-2">
          <Link href={"/"} className={linkClasses("/", true)}>
            <Grid size={22} />
          </Link>
          <Link
            href={"/employee-directory"}
            className={linkClasses("/employee-directory")}
          >
            <FileText size={22} />
          </Link>

          <RightSideDropdown
            items={attendanceMenuItems as DropdownItem[]}
            pathname={pathname}
          >
            <Calendar size={22} />
          </RightSideDropdown>
          <RightSideDropdown
            items={leaveMenuItems as DropdownItem[]}
            pathname={pathname}
          >
            <GoSignOut size={22} />
          </RightSideDropdown>
          <RightSideDropdown
            items={wfhMenuItems as DropdownItem[]}
            pathname={pathname}
          >
            <FaLaptopHouse size={22} />
          </RightSideDropdown>

          <hr className="m-2.5 border-gray-600" />
          <Link href={"/my-holidays"} className={linkClasses("/my-holidays")}>
            <HolidayIcon size={22} />
          </Link>
          <Link href="#" className={linkClasses("#")}>
            <Share2 size={22} />
          </Link>
          <Link href="#" className={linkClasses("#")}>
            <Clock size={22} />
          </Link>
          <Link href="#" className={"relative " + linkClasses("#")}>
            <MessageCircle size={22} />
            <div className="absolute bg-[#c84320] text-[9px] flex items-center justify-center text-white top-1 rounded-full  w-4 h-4 right-1.5 ">
              1
            </div>
          </Link>
        </div>
        <div className="mt-auto flex flex-col items-center space-y-4">
          <Link href="#" className={linkClasses("#")}>
            <Headphones size={22} />
          </Link>
          <Link href="/profile" className={linkClasses("/profile")}>
            <Settings size={22} />
          </Link>

          <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
            <DialogTrigger asChild>
              <div className="text-[#db3125] p-2.5 pl-3 rounded-xl hover:bg-[#80393980] cursor-pointer transition-colors duration-200 mb-2">
                <LogOut size={21} />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to log out?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleLogout}>Logout</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>
    </>
  );
}
