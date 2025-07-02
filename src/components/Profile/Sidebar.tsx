"use client";

import Image from "next/image";
import ProfileBg from "@/assets/profile-bg.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProfileImageCropper } from "./ProfileImageCropper";
import { MdInfo } from "react-icons/md";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUserProfile } from "@/redux/slices/userProfileSlice";
import { useEffect } from "react";
export const menus: Record<string, { label: string; slug: string }[] | null> = {
  Personal: [
    { label: "Basic Info", slug: "basic" },
    { label: "Family Info", slug: "family" },
    { label: "Contact & Social Links", slug: "contact" },
    { label: "Address", slug: "address" },
    { label: "Education", slug: "education" },
  ],
  Job: [{ label: "Job Information", slug: "jobinfo" }],
  "Bank Information": [{ label: "Bank Info", slug: "bankinfo" }],
  Settings: null,
  Documents: [
    { label: "Personal Documents", slug: "personaldocuments" },
    { label: "Official Documents", slug: "officialdocuments" },
  ],
};
export default function Sidebar({
  onSelectPage,
  selectedPage,
}: {
  onSelectPage: (page: string) => void;
  selectedPage: string;
}) {
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((state) => state.userProfile.profile);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
  return (
    <aside className="md:w-[280px] flex-shrink-0  bg-white dark:bg-black border-r overflow-y-auto">
      {/* Profile header */}
      <div className="p-4 border-b  sticky top-0 z-30 bg-white dark:bg-black">
        <div className="bg-[#1e2538] w-full absolute left-0 top-0">
          <Image src={ProfileBg} alt="" className="w-full h-[108px]" />
        </div>
        <div className="min-[1420px]:hidden block">
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute right-2 top-2 rounded-full p-1 bg-[#60b158] cursor-pointer">
                <MdInfo className="text-white " />
              </button>
            </DialogTrigger>
            <DialogContent className="w-96 p-0 gap-0">
              <DialogTitle className="bg-[#fafbff] border-b !m-0 border-zinc-200 p-4 rounded-t-lg">
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
        </div>
        <div className="flex flex-col items-center mt-10 ">
          <ProfileImageCropper userName="Jatin Ramani" />
          <h2 className="font-semibold text-xl text-zinc-800">Jatin Ramani</h2>
          <span className="text-xs text-zinc-500">
            Software Engineer | React Developer
          </span>
        </div>
      </div>

      {/* ------------- Dynamic Menu ------------- */}
      <Accordion type="single" collapsible className=" text-sm ">
        {Object.entries(menus).map(([label, items]) =>
          items && items.length ? (
            <AccordionItem
              key={label}
              value={label}
              className=" border-b overflow-hidden"
            >
              <AccordionTrigger
                className="px-3 py-3 rounded-none text-left hover:bg-zinc-100 
            data-[state=open]:text-blue-600 data-[state=open]:border-l-2 data-[state=open]:border-blue-600 border-l-2 border-transparent hover:border-blue-600"
              >
                {label}
              </AccordionTrigger>
              <AccordionContent className="px-2 pt-2 pb-2 border-t">
                <ul className="space-y-1">
                  {items.map((item) => {
                    const isActive = selectedPage === item.slug;

                    return (
                      <li key={item.slug}>
                        <button
                          onClick={() => onSelectPage(item.slug)}
                          className={`block text-start cursor-pointer px-3 py-2 w-full  text-zinc-700  hover:text-blue-600 border-l-2  hover:border-blue-600  ${
                            isActive
                              ? "text-blue-600 bg-zinc-100 border-blue-600 font-medium"
                              : "text-zinc-700 border-transparent hover:text-blue-600 hover:bg-zinc-100 hover:border-blue-600"
                          } `}
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
                onSelectPage(label.toLowerCase().replace(/\s+/g, "-"))
              }
              className={`block px-3 py-3  w-full text-left  hover:bg-zinc-100 text-zinc-700 border-l-transparent   border-l-2 border-b hover:border-l-blue-600
                `}
            >
              {label}
            </button>
          )
        )}
      </Accordion>
    </aside>
  );
}
