"use client";
import Sidebar from "@/components/Profile/Sidebar";
import { FaEye } from "react-icons/fa";
import ProfileBg from "@/assets/profile-bg.png";

import { IoMdMail } from "react-icons/io";
import { IoIosCall } from "react-icons/io";
import { FaBriefcase } from "react-icons/fa6";
import { MdInfo, MdOutlineCalendarMonth } from "react-icons/md";
import { HiMiniUsers } from "react-icons/hi2";
import { LuFileUp } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import BasicInfo from "./pages/Personal/BasicInfo";
import { useState, useEffect } from "react";
import { pageComponents } from "./pageComponents";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUserProfile } from "@/redux/slices/userProfileSlice";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ProfileImageCropper } from "@/components/Profile/ProfileImageCropper";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { menus } from "@/components/Profile/Sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RxCross2 } from "react-icons/rx";

export default function ProfilePage() {
  const [selectedPage, setSelectedPage] = useState("basic");
  const SelectedComponent = pageComponents[selectedPage] ?? BasicInfo;

  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((state) => state.userProfile.profile);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
  return (
    <div className="md:flex h-screen overflow-hidden ">
      <div className="hidden md:block">
        <Sidebar onSelectPage={setSelectedPage} selectedPage={selectedPage} />
      </div>
      <div className="md:hidden">
        {" "}
        <div className="  bg-white dark:bg-black border-r overflow-y-auto">
          {/* Profile header */}
          <div className=" border-b  sticky top-0 z-30 bg-white dark:bg-black">
            <div className="bg-[#1e2538] w-full absolute left-0 top-0">
              <Image src={ProfileBg} alt="" className="w-full h-[108px]" />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <button className="absolute right-2 top-2 rounded-full p-1 bg-[#60b158] cursor-pointer z-50">
                  <MdInfo className="text-white " />
                </button>
              </DialogTrigger>
              <DialogContent className="w-96 p-0 gap-0">
                <DialogTitle className="bg-[#fafbff] dark:bg-[#111111] border-b !m-0 border-zinc-200 p-4 rounded-t-lg">
                  {userProfile?.displayName || "User Info"}
                </DialogTitle>
                <ul className=" p-4 !m-0 flex flex-col gap-2  text-sm">
                  <li>
                    <span className="font-medium mr-3 text-base">Email:</span>{" "}
                    {userProfile?.officialEmail || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium mr-3 text-base">Contact:</span>{" "}
                    {userProfile?.mobile || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium mr-3 text-base">
                      Experience:
                    </span>{" "}
                    {userProfile?.experience || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium mr-3 text-base">
                      Joining Date:
                    </span>{" "}
                    {userProfile?.joiningDate
                      ? new Date(userProfile.joiningDate).toLocaleDateString()
                      : "No joining date"}
                  </li>
                  <li>
                    <span className="font-medium mr-3 text-base">
                      Reporting Manager:
                    </span>{" "}
                    {userProfile?.reportingManager || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium mr-3 text-base">
                      Previous Employer:
                    </span>{" "}
                    {userProfile?.previousEmployer || "N/A"}
                  </li>
                </ul>
              </DialogContent>
            </Dialog>

            <Popover>
              <PopoverTrigger asChild>
                <button className="absolute right-2 top-10 rounded-full p-1 bg-[#d1d1d1] cursor-pointer z-50">
                  <BsThreeDots className="text-[#7e7e7e] " />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-fit mr-2 p-0">
                <ul className="!m-0 flex p-0.5 flex-col  text-sm text-[#4b4b4b]">
                  <li className=" px-3 py-2 rounded-md hover:bg-[#ececec] cursor-pointer">
                    Change Password
                  </li>
                  <li className=" px-3 py-2 rounded-md hover:bg-[#ececec] cursor-pointer">
                    Reset Password
                  </li>
                  <li className=" px-3 py-2 rounded-md hover:bg-[#ececec] cursor-pointer">
                    Change PIN
                  </li>
                  <li className=" px-3 py-2 rounded-md hover:bg-[#ececec] cursor-pointer">
                    Request for Feedback
                  </li>
                </ul>
              </PopoverContent>
            </Popover>

            <div
              className="relative h-[108px] flex items-center z-10 px-1"
              style={{ minHeight: "108px" }}
            >
              <ProfileImageCropper userName="Jatin Ramani" />
              <div className="ml-3 flex flex-col justify-center ">
                <h2 className="font-semibold text-base text-zinc-200 leading-tight">
                  Jatin Ramani
                </h2>
                <span className="text-xs text-zinc-400 leading-tight">
                  Software Engineer | React Developer
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="  bg-white dark:bg-black border-b p-2 flex justify-end ">
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <div className="p-1 border rounded-sm w-fit cursor-pointer">
                <AiOutlineMenuUnfold size={18} />
              </div>
            </DrawerTrigger>
            <DrawerContent className="!w-fit">
              <DrawerTitle></DrawerTitle>

              <div className="p-2 pt-12">
                <Accordion type="single" collapsible className="text-sm">
                  {Object.entries(menus).map(([label, items]) =>
                    items && items.length ? (
                      <AccordionItem
                        key={label}
                        value={label}
                        className="border-b overflow-hidden"
                      >
                        <AccordionTrigger className="px-3 py-3 rounded-none text-left hover:bg-zinc-100 data-[state=open]:text-blue-600 data-[state=open]:border-l-2 data-[state=open]:border-blue-600 border-l-2 border-transparent hover:border-blue-600">
                          {label}
                        </AccordionTrigger>
                        <AccordionContent className="px-2 pt-2 pb-2 border-t">
                          <ul className="space-y-1">
                            {items.map((item) => {
                              const isActive = selectedPage === item.slug;
                              return (
                                <li key={item.slug}>
                                  <button
                                    onClick={() => setSelectedPage(item.slug)}
                                    className={`block text-start cursor-pointer px-3 py-2 w-full text-zinc-700 hover:text-blue-600 border-l-2 hover:border-blue-600 ${
                                      isActive
                                        ? "text-blue-600 bg-zinc-100 border-blue-600 font-medium"
                                        : "text-zinc-700 border-transparent hover:text-blue-600 hover:bg-zinc-100 hover:border-blue-600"
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <button
                        key={label}
                        onClick={() =>
                          setSelectedPage(
                            label.toLowerCase().replace(/\s+/g, "-")
                          )
                        }
                        className="block px-3 py-3 w-full text-left hover:bg-zinc-100 text-zinc-700 border-l-transparent border-l-2 border-b hover:border-l-blue-600"
                      >
                        {label}
                      </button>
                    )
                  )}
                </Accordion>
              </div>
              <DrawerClose className="absolute top-3 right-3 border rounded-md p-1 cursor-pointer  hover:bg-red-50 ">
                <RxCross2 className="text-red-400" />
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <main className="w-full pb-10 ">
        <div className="hidden md:block sticky top-0 bg-white dark:bg-black z-20 ">
          <div className="flex min-[1420px]:justify-between max-[1420px]:justify-end items-center p-5 border ">
            <div className="hidden min-[1420px]:flex items-center  gap-3 ">
              <div className="hover:bg-[#5096db66] text-sidebar-primary p-1.5 rounded-full cursor-pointer">
                <FaEye />
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <IoMdMail size={18} />
                {userProfile?.officialEmail || "No email"}
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <IoIosCall size={18} />
                <span>+91 {userProfile?.mobile || "No phone"}</span>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <FaBriefcase size={15} />
                {userProfile?.experience || "No experience"}
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <MdOutlineCalendarMonth size={18} />
                {userProfile?.joiningDate
                  ? new Date(userProfile.joiningDate).toLocaleDateString()
                  : "No joining date"}
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <HiMiniUsers size={18} />
                {userProfile?.reportingManager || "No Reporting Manager"}
              </div>
            </div>

            <div className="flex items-center gap-2 mr-2 ">
              <div className="p-1.5 hover:bg-[#4e525f1c] text-[#4e525f] rounded-full cursor-pointer">
                <LuFileUp />
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1" />

              <div className="p-1.5 hover:bg-[#4e525f1c] text-[#4e525f] rounded-full cursor-pointer">
                <HiDotsHorizontal />
              </div>
            </div>
          </div>
        </div>
        <SelectedComponent />
      </main>
    </div>
  );
}
