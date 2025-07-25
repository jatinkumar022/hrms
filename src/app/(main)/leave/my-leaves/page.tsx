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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchUserLeaveBalance,
  fetchMyLeaveRequests,
} from "@/redux/slices/leave/user/userLeaveSlice";
import { useEffect, useMemo } from "react";
import { Alert } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import FullPageLoader from "@/components/loaders/FullPageLoader";

dayjs.extend(isSameOrAfter);

const LeaveCard = ({
  title,
  id,
  balance,
  booked,
  icon,
  description,
  used,
}: {
  title: string;
  balance: string | number;
  id: string;
  booked: string | number;
  icon: any;
  description: string;
  used: number;
}) => (
  <Card className="w-full dark:bg-[#141414] p-4 rounded-sm shadow-none font-medium flex flex-col gap-2 text-sm sm:max-w-80 ">
    {" "}
    <div className="flex justify-between items-center ">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-sm border">{icon}</div>
        <span>{title}</span>

        <div>
          <Tooltip>
            <TooltipTrigger>
              <GiWallet
                size={17}
                className={`${
                  id === "lwp" ? "text-[#ff6961]" : "text-[#08a34e]"
                }`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{id === "lwp" ? "Unpaid Leave" : "Paid Leave"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none cursor-pointer">
              <RxDotsHorizontal size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Leave Information</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-muted-foreground dark:text-[#cbd5e1]">
              {description}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
              : "text-[#73788b] dark:text-[#cbd5e1]"
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
              : "text-[#73788b] dark:text-[#cbd5e1]"
          }`}
        >
          {booked}
          <Tooltip>
            <TooltipTrigger>
              <MdInfo className="text-[#73788b]" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Used: {used}</p>
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

const LeaveSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myLeaveRequests, myLeaveBalance, status, error } = useAppSelector(
    (state) => state.userLeave
  );

  useEffect(() => {
    dispatch(fetchUserLeaveBalance());
    dispatch(fetchMyLeaveRequests());
  }, [dispatch]);

  const formattedLeaveCards = useMemo(() => {
    if (!myLeaveBalance) return [];

    const getTitle = (
      name: string,
      leaveInfo: { balance: number; booked: number; used: number }
    ) => {
      const total = leaveInfo.balance + leaveInfo.booked + leaveInfo.used;
      return `${name}(${total})`;
    };

    return [
      {
        id: "lwp",
        title: "Leave without pay",
        balance: "Unlimited",
        booked: myLeaveBalance.leaveWithoutPay.booked,
        used: myLeaveBalance.leaveWithoutPay.used,
        icon: <PiAirplaneTakeoffLight className="text-[#009e60]" size={20} />,
        description:
          "Leave taken without pay when an employee has exhausted their paid leave balance. This type of leave is unpaid.",
      },
      {
        id: "el",
        title: getTitle("Earned leave", myLeaveBalance.earnedLeave),
        balance: myLeaveBalance.earnedLeave.balance,
        booked: myLeaveBalance.earnedLeave.booked,
        used: myLeaveBalance.earnedLeave.used,
        icon: <FaHandshakeAngle className="text-[#1dd454]" size={20} />,
        description:
          "Also known as vacation leave, this is paid time off that an employee earns over a period of service. It can be used for personal reasons, travel, or vacation.",
      },
      {
        id: "sl",
        title: getTitle("Sick leave", myLeaveBalance.sickLeave),
        balance: myLeaveBalance.sickLeave.balance,
        booked: myLeaveBalance.sickLeave.booked,
        used: myLeaveBalance.sickLeave.used,
        icon: <PiStethoscopeFill className="text-[#ffa801]" size={20} />,
        description:
          "Paid leave provided to an employee when they are unable to work due to illness or injury. A medical certificate may be required for extended periods.",
      },
      {
        id: "cl",
        title: getTitle("Casual leave", myLeaveBalance.casualLeave),
        balance: myLeaveBalance.casualLeave.balance,
        booked: myLeaveBalance.casualLeave.booked,
        used: myLeaveBalance.casualLeave.used,
        icon: <IoBriefcaseOutline className="text-[#73788b]" size={20} />,
        description:
          "Paid leave for short-term, unforeseen personal needs or emergencies. It's typically used for situations that require immediate attention.",
      },
    ];
  }, [myLeaveBalance]);

  const upcomingLeaves = useMemo(() => {
    if (!myLeaveRequests) return [];
    const now = dayjs();
    return myLeaveRequests
      .filter(
        (req) =>
          dayjs(req.startDate).isSameOrAfter(now, "day") &&
          req.status === "approved"
      )
      .sort(
        (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
      );
  }, [myLeaveRequests]);

  const onChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  if (status === "failed") {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div className=" bg-white dark:bg-black h-[calc(100vh-73px)]  w-screen   md:w-[calc(100vw-80px)] ">
      <FullPageLoader show={status === "loading"} />
      <div className="flex justify-between items-center px-4 md:px-6 py-3  border-b">
        <div className="text-lg font-medium  dark:text-white ">My Leaves</div>
        <div className="flex items-center gap-2">
          <DatePicker
            onChange={onChange}
            picker="year"
            className="dark:bg-black dark:text-white"
          />
          <Link
            href={"/leave/my-leaves/lwp"}
            className="bg-sidebar-primary p-2 rounded-sm text-white cursor-pointer border-sidebar-primary border hover:bg-transparent hover:text-sidebar-primary"
          >
            <PlusIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="flex-1 p-4 md:p-6 overflow-y-auto h-full  dark:bg-black  pb-[73px] ">
        <div className=" overflow-x-hidden">
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {formattedLeaveCards.map((card) => (
                <CarouselItem
                  className="pl-1 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 "
                  key={card.id}
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

        <div className="grid md:grid-cols-2 gap-4  ">
          <div>
            <div className="font-semibold text-lg py-4">Upcoming Leaves</div>

            {upcomingLeaves && upcomingLeaves.length > 0 ? (
              <Card className="h-full flex rounded-sm flex-col py-4 px-6 shadow-none dark:bg-[#141414]">
                {upcomingLeaves.map((leave, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{
                          backgroundColor: hexToRGBA(holidays[0].color, 0.2),
                          color: holidays[0].color,
                        }}
                      >
                        {dayjs(leave.startDate).format("DD")}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {leave.type} ({leave.numberOfDays} days)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dayjs(leave.startDate).format("MMM DD, YYYY")}
                          {leave.startDate !== leave.endDate &&
                            ` - ${dayjs(leave.endDate).format("MMM DD, YYYY")}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {leave.status}
                    </div>
                  </div>
                ))}
              </Card>
            ) : (
              <Card className="h-full flex rounded-sm flex-col items-center justify-center dark:bg-[#141414] py-10 shadow-none">
                <CardContent className="text-center">
                  <Image
                    src={NoLeave}
                    alt="No Upcoming Leaves"
                    className="w-24 h-24 mx-auto mb-2"
                  />
                  <div className="text-sm font-medium ">No Upcoming Leaves</div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-2 mt-10 md:mt-0">
            <div className="font-semibold text-lg py-4 m-0">
              Upcoming Holiday
            </div>
            {holidays.map((h, i) => (
              <div
                key={i}
                className="border p-2 rounded-sm flex items-center justify-between text-sm border-l-4 dark:bg-[#141414]"
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
                    <div className="text-xs text-muted-foreground dark:text-[#a0a0a0]">
                      {h.date}
                    </div>
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
    </div>
  );
};

export default LeaveSection;
