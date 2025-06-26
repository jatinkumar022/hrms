import { Bell } from "@geist-ui/icons";

import { ThemeToggle } from "../ui/darkmode";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/assets/AVATAR.jpg";
export default function Navbar() {
  return (
    <>
      <div className="flex items-center justify-between p-4  bg-sidebar text-sidebar-foreground sticky top-0 left-0 border">
        <h1 className="text-3xl font-normal cursor-pointer">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="p-[10px] rounded-full bg-[#9e9e9e33] hover:bg-[#81818133] cursor-pointer relative">
            <Bell size={20} />
            <div className="absolute bg-[#c84320] text-[10px] flex items-center justify-center text-white -top-1  rounded-full  w-5 h-4 -right-1 ">
              1
            </div>
          </div>
          <Link
            href={"/profile"}
            className="relative w-10 h-10 rounded-full bg-green-500 p-[1px] cursor-pointer"
          >
            <div className="w-full h-full dark:bg-black bg-white rounded-full p-[2px]">
              <Image
                src={Avatar}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 dark:border-black border-white  rounded-full"></span>
          </Link>
        </div>
      </div>
    </>
  );
}
