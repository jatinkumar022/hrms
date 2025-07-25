"use client";
import { useEffect, useState } from "react";
import { Bell } from "@geist-ui/icons";
import { useRouter, usePathname } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { logoutUser } from "@/redux/slices/loginSlice";
import { FaLaptopHouse } from "react-icons/fa";
import clsx from "clsx";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const profileImage = useAppSelector(
    (state) => state.profileImage.profileImage
  );
  const { user } = useAppSelector((state) => state.login);
  const userName = user?.username || "";
  const router = useRouter();
  const pathname = usePathname();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProfileImage());
  }, [dispatch]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

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
    { label: "Correction Request", to: "/attendance/correction-request" },
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
    attendanceMenuItems.splice(4, 0, {
      label: "Correction Requests",
      to: "/attendance/correction-requests",
    });
  }

  const linkClasses = (path: string, exact: boolean = false) =>
    clsx(
      "text-gray-400 hover:text-sidebar-primary p-2.5 rounded-xl hover:bg-[#c9e1ff80] dark:hover:bg-[#39588080] cursor-pointer transition-colors duration-200",
      {
        "text-sidebar-primary bg-[#c9e1ff80] dark:bg-[#39588080]": exact
          ? pathname === path
          : pathname.startsWith(path),
      }
    );

  return (
    <>
      <div className="flex items-center justify-between p-4  bg-sidebar text-sidebar-foreground sticky top-0 left-0 border-b ">
        <div className="flex gap-1.5 items-center ">
          <div className="md:hidden">
            <Drawer
              direction="left"
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
            >
              <DrawerTrigger asChild>
                <span className="block md:hidden rounded-md p-1 cursor-pointer hover:bg-[#e4e4e4] dark:hover:bg-[#3f3f3f4f]">
                  <CgMenuLeft size={20} />
                </span>
              </DrawerTrigger>
              <DrawerContent className="p-0 px-5 !w-fit bg-sidebar h-full flex flex-col max-h-screen overflow-y-auto ">
                <DrawerTitle />
                <div className="flex flex-col  items-center py-4 justify-between h-full">
                  <div className="flex flex-col  items-center py-4 space-y-6">
                    <div>
                      <Image src={logo} alt="Logo" className="w-12 h-12" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href="/" className={linkClasses("/", true)}>
                        <Grid size={22} />
                      </Link>
                      <Link
                        href="/employee-directory"
                        className={linkClasses("/employee-directory")}
                      >
                        <FileText size={22} />
                      </Link>
                      <RightSideDropdown
                        items={attendanceMenuItems}
                        pathname={pathname}
                      >
                        <Calendar size={22} />
                      </RightSideDropdown>
                      <RightSideDropdown
                        items={leaveMenuItems}
                        pathname={pathname}
                      >
                        <GoSignOut size={22} />
                      </RightSideDropdown>
                      <RightSideDropdown
                        items={wfhMenuItems}
                        pathname={pathname}
                      >
                        <FaLaptopHouse size={22} />
                      </RightSideDropdown>
                      <hr className="m-2.5 border-gray-600" />
                      <Link
                        href="/my-holidays"
                        className={linkClasses("/my-holidays")}
                      >
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
                  </div>
                  <div className="mt-auto flex flex-col items-center space-y-4">
                    <Link href="#" className={linkClasses("#")}>
                      <Headphones size={22} />
                    </Link>
                    <Link href="/profile" className={linkClasses("/profile")}>
                      <Settings size={22} />
                    </Link>
                    <Dialog
                      open={showLogoutModal}
                      onOpenChange={setShowLogoutModal}
                    >
                      <DialogTrigger asChild>
                        <div className="text-[#db3125] p-2.5 pl-3 rounded-xl hover:bg-[#ffe2e280] dark:hover:bg-[#80393980] cursor-pointer transition-colors duration-200 mb-2">
                          <LogOut size={21} />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-[#1a1a1a]">
                        <DialogHeader>
                          <DialogTitle>Confirm Logout</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to log out?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <div className="flex max-sm:flex-col gap-2 min-sm:w-1/2 max-sm:w-full">
                            <button
                              onClick={() => setShowLogoutModal(false)}
                              className="w-full"
                            >
                              <div className="border border-[#dbdbdb] dark:border-[#3f3f3f] dark:text-white text-black px-4 py-2 rounded-xs cursor-pointer text-sm w-full">
                                Cancel
                              </div>
                            </button>
                            <button onClick={handleLogout} className="w-full">
                              <div className="bg-[#fc5f57] border text-white px-4 py-2 rounded-xs cursor-pointer text-sm w-full">
                                Logout
                              </div>
                            </button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
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
