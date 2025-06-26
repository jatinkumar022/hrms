"use client";
import Sidebar, { menus } from "@/components/Profile/Sidebar";
import { FaEye } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { IoIosCall } from "react-icons/io";
import { FaBriefcase } from "react-icons/fa6";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { HiMiniUsers } from "react-icons/hi2";
import { LuFileUp } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import BasicInfo from "./pages/Personal/BasicInfo";
import { useState } from "react";
import { pageComponents } from "./pageComponents";
import { CgMathPlus } from "react-icons/cg";

interface SharedProps {
  dialogOpen?: boolean;
  setDialogOpen?: (open: boolean) => void;
}

export default function ProfilePage() {
  const [selectedPage, setSelectedPage] = useState("basic");
  const [dialogOpen, setDialogOpen] = useState<Record<string, boolean>>({
    personaldocuments: false,
    officialdocuments: false,
  });

  const pageTitles = Object.values(menus)
    .flatMap((group) => group ?? []) // skip null groups
    .reduce<Record<string, string>>((acc, { slug, label }) => {
      acc[slug] = label;
      return acc;
    }, {});

  const SelectedComponent = pageComponents[selectedPage] ?? BasicInfo;
  const sharedProps: SharedProps = {};
  const pagesWithAdd = ["personaldocuments", "officialdocuments"];
  const showAddButton = pagesWithAdd.includes(selectedPage);

  if (pagesWithAdd.includes(selectedPage)) {
    sharedProps.dialogOpen = !!dialogOpen[selectedPage];
    sharedProps.setDialogOpen = (open: boolean) =>
      setDialogOpen((prev) => ({ ...prev, [selectedPage]: open }));
  }
  return (
    <div className="flex h-screen overflow-hidden ">
      <Sidebar onSelectPage={setSelectedPage} selectedPage={selectedPage} />
      <main className="flex-1 overflow-y-auto mb-[74px] pb-10">
        <div className=" sticky top-0 bg-white dark:bg-black z-20">
          <div className="flex justify-between items-center p-5 border ">
            <div className="flex items-center gap-3 ">
              <div className="hover:bg-[#5096db66] text-sidebar-primary p-1.5 rounded-full cursor-pointer">
                <FaEye />
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <IoMdMail size={18} />
                jatin.r@dvijinfotech.com
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <IoIosCall size={18} />
                +91-7861035002
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <FaBriefcase size={15} />8 Months 2 Days
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <MdOutlineCalendarMonth size={18} />
                Thu 17 Oct, 2024
              </div>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              <div className="flex items-center gap-1.5 text-sm text-[#4e525f] dark:text-[#aaaaaa]">
                <HiMiniUsers size={18} />
                Jatin Ramani
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
          <div className="p-4 border font-medium flex justify-between">
            {pageTitles[selectedPage] ?? "Profile"}
            {showAddButton ? (
              <button
                className="bg-sidebar-primary p-1 text-white rounded-md cursor-pointer"
                onClick={() =>
                  setDialogOpen((prev) => ({ ...prev, [selectedPage]: true }))
                }
              >
                <CgMathPlus size={18} />
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        <SelectedComponent {...sharedProps} />
      </main>
    </div>
  );
}
