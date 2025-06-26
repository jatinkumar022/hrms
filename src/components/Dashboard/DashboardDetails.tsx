import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import NoIncrement from "@/assets/no-increment.svg";
import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";

interface SectionProps {
  title: string;
  count?: number;
  children: ReactNode;
  rightControl?: ReactNode;
}

const onLeave = [
  {
    name: "Jagdish Koladiya",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    range: "Jun 16 – Jun 25, 2025",
    leave: "full",
  },
  {
    name: "Jagdish Koladiya",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    range: "Jun 16 – Jun 25, 2025",
    leave: "1st half",
  },
  {
    name: "Jagdish Koladiya",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    range: "Jun 16 – Jun 25, 2025",
    leave: "2nd half ",
  },
  {
    name: "Jagdish Koladiya",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    range: "Jun 16 – Jun 25, 2025",
    leave: "full",
  },
  {
    name: "Jagdish Koladiya",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    range: "Jun 16 – Jun 25, 2025",
    leave: "1st half",
  },
  {
    name: "Jagdish Koladiya",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    range: "Jun 16 – Jun 25, 2025",
    leave: "2nd half ",
  },
];

const absentToday = [
  {
    name: "Dhruvik",
    role: "Software Engineer | Trainee",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    name: "Hasmukh Mevada",
    role: "Project Manager",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Piyush Dabhi",
    role: "Senior Software Engineer | Node Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Trushali Thummar",
    role: "Software Engineer | React Developer",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    name: "Dhruvik",
    role: "Software Engineer | Trainee",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    name: "Hasmukh Mevada",
    role: "Project Manager",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Piyush Dabhi",
    role: "Senior Software Engineer | Node Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Trushali Thummar",
    role: "Software Engineer | React Developer",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
];

const upcomingBirthdays = [
  {
    name: "Tushar Kyada",
    role: "Software Engineer | Designer",
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
    date: "Mon 23 Jun",
  },
  {
    name: "Piyush Dabhi",
    role: "Senior Software Engineer | Node Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "Sat 28 Jun",
  },
  {
    name: "Ankit Vasita",
    role: "Senior Software Engineer | React Developer",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    date: "Sun 29 Jun",
  },
  {
    name: "Yash Singhvi",
    role: "Team Lead",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    date: "Sun 29 Jun",
  },
  {
    name: "Rushita Sanghani",
    role: "BDM",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    date: "Fri 04 Jul",
  },
];

const quickLinks = [
  "Leave Policy",
  "Statutory compliances circular",
  "Employee Referral Policy",
  "Flexible Working Hours and Work From Home …",
  "Code of conduct policy",
  "Resignation Policy",
];

const workAnniversary = [
  { name: "Gopal Sakhiya", label: "Today", years: "1 Year" },
  { name: "Nitin Ukani", label: "Sat, 21 June", years: "7 Years" },
  { name: "Tushar Kyada", label: "Sun, 22 June", years: "3 Years" },
  { name: "Dikshita Domadiya", label: "Fri, 27 June", years: "2 Years" },
  { name: "Rudrika Fichadiya", label: "Tue, 01 July", years: "1 Year" },
];

const recentSocial = [
  { name: "Gopal Sakhiya", type: "Work Anniversary", date: "Tue 17 Jun, 2025" },
  { name: "Deep Hanani", type: "Birthday", date: "Tue 03 Jun, 2025" },
  { name: "Jatin Ramani", type: "Birthday", date: "Thu 22 May, 2025" },
  { name: "Aayushi Talaviya", type: "New Joinee", date: "Fri 16 May, 2025" },
  { name: "Gautam Bhesaniya", type: "Birthday", date: "Fri 16 May, 2025" },
];

const remoteWork = [
  {
    name: "Ashav Suthar",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/men/88.jpg",
    range: "Jun 17 – Jun 17, 2025",
  },
  {
    name: "Zarana Savaliya",
    role: "Research and Development",
    avatar: "https://randomuser.me/api/portraits/women/18.jpg",
    range: "Jun 17 – Jun 17, 2025",
  },
];
const getLeaveBadge = (type: string) => {
  const t = type.toLowerCase();

  const OUTER =
    "w-[16px] h-[16px] rounded-full border border-purple-500 grid place-items-center";
  const INNER = "w-[10px] h-[10px] rounded-full relative overflow-hidden";

  if (t.includes("full")) {
    return (
      <div className={OUTER} title="Full Leave">
        <div className={`${INNER} bg-purple-500`} />
      </div>
    );
  }

  if (t.includes("1st")) {
    return (
      <div className={OUTER} title="1st-Half Leave">
        <div className={INNER}>
          <div className="absolute inset-y-0 left-0 w-1/2 bg-purple-500" />
        </div>
      </div>
    );
  }

  if (t.includes("2nd")) {
    return (
      <div className={OUTER} title="2nd-Half Leave">
        <div className={INNER}>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-purple-500" />
        </div>
      </div>
    );
  }

  return null;
};

const Section = ({ title, count, children, rightControl }: SectionProps) => (
  <Card className="rounded-xl  dark:bg-[#070707] bg-white group">
    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 ">
      <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-white flex items-center gap-1">
        {title}
        {count !== undefined ? (
          <span className="font-normal">({count})</span>
        ) : (
          ""
        )}
      </CardTitle>
      {rightControl}
    </CardHeader>
    <CardContent className=" text-sm text-zinc-700 dark:text-zinc-300 space-y-1  max-h-64 overflow-y-auto h-full">
      {children}
    </CardContent>
  </Card>
);

const ListRow = ({
  avatar,
  initials,
  name,
  meta,
  right,
  leave,
}: {
  avatar?: string;
  initials?: string;
  name: string;
  meta?: string;
  right?: string;
  leave?: string;
}) => (
  <div className="flex items-center justify-between dark:hover:bg-[#0f0f0f] hover:bg-[#f3f3f3] p-1.5 rounded-md cursor-pointer ">
    <div className="flex items-center gap-3 ">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-zinc-200 text-xs flex items-center justify-center font-medium text-zinc-600">
          {initials}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-medium text-zinc-800 dark:text-white leading-4 flex items-center gap-2">
          {name} {leave ? getLeaveBadge(leave) : ""}
        </p>
        {meta && (
          <p className="text-xs text-muted-foreground leading-3">{meta}</p>
        )}
      </div>
    </div>
    {right && (
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {right}
      </div>
    )}
  </div>
);

export default function DashboardDetails() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 p-4 ">
      <Section
        title="On Leave"
        count={onLeave.length}
        rightControl={
          <Select defaultValue="today">
            <SelectTrigger className=" px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-md">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="thisweek">This Week</SelectItem>
              <SelectItem value="nextweek">Next Week</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {onLeave.length > 0 ? (
          onLeave.map((p, index) => (
            <ListRow
              key={index}
              leave={p.leave}
              avatar={p.avatar}
              name={p.name}
              meta={p.role}
              right={p.range}
            />
          ))
        ) : (
          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <Image
              src={NoIncrement}
              alt="No One is on Leave"
              className="w-40"
            />
            <p className="text-sm font-medium">No One is on Leave</p>
          </div>
        )}
      </Section>

      <Section
        rightControl={
          <Link
            href="#"
            className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
          >
            View <MdKeyboardArrowRight size={22} className="mt-0.5" />
          </Link>
        }
        title="Absent Today"
        count={absentToday.length}
      >
        {absentToday.length > 0 ? (
          absentToday.map((p, index) => (
            <ListRow
              key={index}
              avatar={p.avatar}
              name={p.name}
              meta={p.role}
            />
          ))
        ) : (
          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <Image
              src={NoIncrement}
              alt="No One is Absent Today"
              className="w-40"
            />
            <p className="text-sm font-medium">No One is Absent Today</p>
          </div>
        )}
      </Section>

      <Section
        rightControl={
          <Link
            href="#"
            className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
          >
            View <MdKeyboardArrowRight size={22} className="mt-0.5" />
          </Link>
        }
        title="Upcoming Birthday"
        count={upcomingBirthdays.length}
      >
        {upcomingBirthdays.length > 0 ? (
          upcomingBirthdays.map((p, index) => (
            <ListRow
              key={index}
              avatar={p.avatar}
              name={p.name}
              meta={p.role}
              right={p.date}
            />
          ))
        ) : (
          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <Image
              src={NoIncrement}
              alt="No Upcoming Birthdays"
              className="w-40"
            />
            <p className="text-sm font-medium">No Upcoming Birthdays</p>
          </div>
        )}
      </Section>

      <Section
        rightControl={
          <Link
            href="#"
            className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
          >
            View <MdKeyboardArrowRight size={22} className="mt-0.5" />
          </Link>
        }
        title="Quick Links"
        count={quickLinks.length}
      >
        <ul className="space-y-1 pl-1 h-full">
          {quickLinks.length > 0 ? (
            quickLinks.map((link) => (
              <li
                key={link}
                className="flex items-center gap-2 text-sm cursor-pointer  p-1 rounded-md dark:hover:bg-[#0f0f0f] hover:bg-[#f3f3f3] "
              >
                <div className=" p-2 rounded-full bg-[#fff0ef] dark:bg-[#1a0d0c] text-center">
                  <BsFillFileEarmarkPdfFill
                    className=" text-red-500 dark:text-red-400"
                    size={20}
                  />
                </div>
                {link}
              </li>
            ))
          ) : (
            <div className="flex flex-col gap-3 items-center justify-center h-full">
              <Image src={NoIncrement} alt="No Quick Links" className="w-40" />
              <p className="text-sm font-medium">No Quick Links</p>
            </div>
          )}
        </ul>
      </Section>

      <Section
        rightControl={
          <Link
            href="#"
            className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
          >
            View <MdKeyboardArrowRight size={22} className="mt-0.5" />
          </Link>
        }
        title="Work Anniversary"
        count={workAnniversary.length}
      >
        {workAnniversary.length > 0 ? (
          workAnniversary.map((p, index) => (
            <ListRow
              key={index}
              avatar={undefined}
              initials={p.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
              name={p.name}
              meta={p.label}
              right={p.years}
            />
          ))
        ) : (
          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <Image
              src={NoIncrement}
              alt="No Upcomming Work Anniversary"
              className="w-40"
            />
            <p className="text-sm font-medium">No Upcomming Work Anniversary</p>
          </div>
        )}
      </Section>

      <Section
        rightControl={
          <Link
            href="#"
            className="text-base font-medium  text-sidebar-primary dark:hover:text-blue-400 hover:text-blue-600  items-center gap-1 flex 
  opacity-0 group-hover:opacity-100
  transition-opacity delay-100 duration-150 ease-in"
          >
            View <MdKeyboardArrowRight size={22} className="mt-0.5" />
          </Link>
        }
        title="Recent Social Post"
        count={recentSocial.length}
      >
        {recentSocial.length > 0 ? (
          recentSocial.map((p) => (
            <ListRow
              key={p.name + p.date}
              avatar={undefined}
              initials={p.type[0]}
              name={p.name}
              meta={`${p.type} | ${p.date}`}
            />
          ))
        ) : (
          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <Image
              src={NoIncrement}
              alt="No Recent Social Post"
              className="w-40"
            />
            <p className="text-sm font-medium">No Recent Social Post</p>
          </div>
        )}
      </Section>

      <Section
        title="On Remote Work"
        count={remoteWork.length}
        rightControl={
          <Select defaultValue="today">
            <SelectTrigger className=" px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-md">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="thisweek">This Week</SelectItem>
              <SelectItem value="nextweek">Next Week</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {remoteWork.length > 0 ? (
          remoteWork.map((p, index) => (
            <ListRow
              key={index}
              avatar={p.avatar}
              name={p.name}
              meta={p.role}
              right={p.range}
            />
          ))
        ) : (
          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <Image src={NoIncrement} alt="No RemoteWork" className="w-40" />
            <p className="text-sm font-medium">No One is on RemoteWork</p>
          </div>
        )}
      </Section>
    </div>
  );
}
