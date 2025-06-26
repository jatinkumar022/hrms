"use client";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { DatePicker } from "antd";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PiAirplaneTakeoffLight, PiStethoscopeFill } from "react-icons/pi";
import { GiWallet } from "react-icons/gi";
import { FaHandshakeAngle } from "react-icons/fa6";
import { IoBriefcaseOutline } from "react-icons/io5";
import { RxDotsHorizontal } from "react-icons/rx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdInfo } from "react-icons/md";
import NoLeave from "@/assets/no-leave.svg";
import Image from "next/image";
import Raxabandhan from "@/assets/Events/RaxabandhanIcon";
import Round from "@/assets/Events/RoundIcon";
import Float from "@/assets/Events/FloatIcon";
import Ganeshchaturthi from "@/assets/Events/GaneshjiIcon";
import Navratri from "@/assets/Events/NavRatriIcon";
import DiwaliIcon from "@/assets/Events/DiwaliIcon";
import Link from "next/link";
import { hexToRGBA } from "@/lib/utils";

const LeaveCard = ({
  title,
  id,
  balance,
  booked,
  icon,
}: {
  title: string;
  balance: string | number;
  id: string;
  booked: string | number;
  icon: any;
}) => (
  <Card className="w-full p-4 rounded-sm shadow-none font-medium flex flex-col gap-2 text-sm max-w-80 ">
    {" "}
    <div className="flex justify-between items-center ">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-sm border">{icon}</div>
        <h2>{title}</h2>

        <div>
          <GiWallet
            className={`${id === "lwp" ? "text-[#ff6961]" : "text-[#08a34e]"}`}
          />
        </div>
      </div>
      <div>
        <RxDotsHorizontal size={20} />
      </div>
    </div>
    <div className="flex w-full justify-between items-center mt-1">
      <div className="w-full text-center">
        <div>Balance</div>
        <div
          className={`
          ${
            id === "lwp"
              ? "text-[#009e60]"
              : id === "el"
              ? "text-[#1dd454]"
              : id === "sl"
              ? "text-[#ffa801]"
              : "text-[#73788b]"
          }
          `}
        >
          {balance}
        </div>
      </div>
      <div className="h-10  border" />
      <div className="w-full text-center">
        <div>Booked</div>
        <div
          className={`flex items-center gap-2 justify-center ${
            id === "lwp"
              ? "text-[#009e60]"
              : id === "el"
              ? "text-[#1dd454]"
              : id === "sl"
              ? "text-[#ffa801]"
              : "text-[#73788b]"
          }`}
        >
          {booked}
          <Tooltip>
            <TooltipTrigger>
              <MdInfo className="text-[#73788b]" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
    <Link
      href={`/leave/my-leaves/${id}`}
      className="text-center text-sidebar-primary text-sm cursor-pointer"
    >
      Apply Leave
    </Link>
  </Card>
);

const holidays = [
  {
    name: "Rakshabandhan",
    date: "Sat, Aug 09, 2025",
    color: "#ffa801",
    count: 1,
    icon: <Raxabandhan className="w-6 h-6" fill="#ffa801" />,
  },
  {
    name: "Independence Day",
    date: "Fri, Aug 15, 2025",
    color: "#1d873f",
    count: 1,
    icon: <Round className="w-6 h-6" fill="#1d873f" />,
  },

  {
    name: "Janmashtami",
    date: "Sat, Aug 16, 2025",
    color: "#ffa801",
    count: 1,
    icon: <Float className="w-6 h-6" fill="#ffa801" />,
  },

  {
    name: "Ganesh Visarjan",
    date: "Sat, Sep 06, 2025",
    color: "#1d873f",
    count: 1,
    icon: <Ganeshchaturthi className="w-6 h-6" fill="#1d873f" />,
  },
  {
    name: "Dussehra / Gandhi Jayanti",
    date: "Thu, Oct 02, 2025",
    color: "#ffa801",
    count: 1,
    icon: <Navratri className="w-6 h-6" fill="#ffa801" />,
  },
  {
    name: "Diwali",
    date: "Sat, Oct 18, 2025 - Wed, Oct 22, 2025",
    color: "#1d873f",
    count: 5,
    icon: <DiwaliIcon className="w-6 h-6" fill="#1d873f" />,
  },
];

const leaveCards = [
  {
    id: "lwp",
    title: "Leave without pay",
    balance: "Unlimited",
    booked: 0,
    icon: <PiAirplaneTakeoffLight className="text-[#009e60]" size={20} />,
  },
  {
    id: "el",
    title: "Earn leave(0)",
    balance: 0,
    booked: 0,
    icon: <FaHandshakeAngle className="text-[#1dd454]" size={20} />,
  },
  {
    id: "sl",
    title: "Sick leave(3)",
    balance: 0.5,
    booked: 2.5,
    icon: <PiStethoscopeFill className="text-[#ffa801]" size={20} />,
  },
  {
    id: "cl",
    title: "Casual leave(4.5)",
    balance: 0.5,
    booked: 4,
    icon: <IoBriefcaseOutline className="text-[#73788b]" size={20} />,
  },
];

const ApplyLeavePage = () => {
  const onChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  return (
    <div className="space-y-6 w-full overflow-x-auto h-screen">
      {/* Header */}
      <div className="flex justify-between p-3 px-4 items-center border-b">
        <div className="flex gap-2">
          <div className="min-w-9">
            <img
              src="https://thumbor.superworks.com/unsafe/48x48/filters:quality(80)/https://files.superworks.com/profileImages/8lFl0kUNHz.jpeg"
              alt=""
              className="rounded-full w-9"
            />
          </div>
          <div>
            <div className="font-semibold text-sm">Jatin Ramani</div>
            <div className="text-xs text-muted-foreground">
              Software Engineer | React Developer
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DatePicker onChange={onChange} picker="year" />
          <div className="bg-sidebar-primary p-2 rounded-sm text-white cursor-pointer border-sidebar-primary border hover:bg-transparent hover:text-sidebar-primary">
            <PlusIcon className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div className="w-[calc(100vw-80px)] overflow-hidden px-4 m-0">
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-1">
            {leaveCards.map((card, idx) => (
              <CarouselItem
                className="pl-1 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 "
                key={idx}
              >
                <div className="p-1">
                  <LeaveCard {...card} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 lg:hidden" />
          <CarouselNext className="right-0 lg:hidden" />
        </Carousel>
      </div>

      <div className="grid md:grid-cols-2 gap-4  px-4">
        <div>
          <div className="font-semibold text-lg py-4">Upcoming Leaves</div>

          <Card className="h-full flex rounded-sm flex-col items-center justify-center py-10">
            <CardContent className="text-center">
              <Image
                src={NoLeave}
                alt="No Upcoming Leaves"
                className="w-24 h-24 mx-auto mb-2"
              ></Image>
              <div className="text-sm font-medium ">No Upcoming Leaves</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 mt-10 md:mt-0">
          <div className="font-semibold text-lg py-4 m-0">Upcoming Holiday</div>
          {holidays.map((h, i) => (
            <div
              key={i}
              className="border p-2 rounded-sm flex items-center justify-between text-sm border-l-[${h.color}] border-l-3"
              style={{ borderLeftColor: h.color }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="p-2.5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${hexToRGBA(h.color, 0.15)}`,
                    color: h.color,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {h.icon}
                </div>
                <div>
                  <div className="font-medium text-[13px]">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.date}</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                ({h.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplyLeavePage;
