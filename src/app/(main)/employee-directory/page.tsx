"use client";
import { Input } from "antd";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaBriefcase } from "react-icons/fa6";
import { IoIosCall } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { RiUserLocationFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";

import { calculateCompanyExperience } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchInput } from "@/components/ui/searchbox";
import { useState, useMemo } from "react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaFilter } from "react-icons/fa";

const employees = [
  {
    id: 21,
    name: "Vaibhav Bhatia",
    title: "Cloud Engineer",
    department: "Engineering",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "3 Years 9 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    email: "vaibhav.bhatia@example.com",
    mobile: "9876504321",
  },
  {
    id: 22,
    name: "Wamiqa Deshmukh",
    title: "Talent Acquisition Specialist",
    department: "Human Resources",
    workLocation: "Surat",
    location: "-",
    prevExperience: "2 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/67.jpg",
    email: "wamiqa.deshmukh@example.com",
    mobile: "9111223344",
  },
  {
    id: 23,
    name: "Xavier Fernandes",
    title: "Tech Support Engineer",
    department: "IT Support",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "4 Years 2 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/23.jpg",
    email: "xavier.fernandes@example.com",
    mobile: "9321456780",
  },
  {
    id: 24,
    name: "Yamini Kapadia",
    title: "Digital Marketing Strategist",
    department: "Marketing",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "3 Years 1 Month",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    email: "yamini.k@example.com",
    mobile: "9123004455",
  },
  {
    id: 25,
    name: "Zaid Khan",
    title: "Product Owner",
    department: "Product",
    workLocation: "Surat",
    location: "-",
    prevExperience: "6 Years 5 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
    email: "zaid.khan@example.com",
    mobile: "9887766554",
  },
  {
    id: 26,
    name: "Aarav Raval",
    title: "Security Analyst",
    department: "IT Security",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "2 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/31.jpg",
    email: "aarav.raval@example.com",
    mobile: "9012123434",
  },
  {
    id: 27,
    name: "Bela Joshi",
    title: "Instructional Designer",
    department: "Learning & Dev.",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "1 Year 10 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/73.jpg",
    email: "bela.j@example.com",
    mobile: "9344556677",
  },
  {
    id: 28,
    name: "Chetan Patel",
    title: "Data Engineer",
    department: "Engineering",
    workLocation: "Surat",
    location: "-",
    prevExperience: "3 Years 4 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/49.jpg",
    email: "chetan.patel@example.com",
    mobile: "9877654321",
  },
  {
    id: 29,
    name: "Deepika Sinha",
    title: "Scrum Master",
    department: "Project Management",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "5 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/31.jpg",
    email: "deepika.sinha@example.com",
    mobile: "9001122334",
  },
  {
    id: 30,
    name: "Eklavya Rawat",
    title: "Site Reliability Engineer",
    department: "Engineering",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "4 Years 7 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    email: "eklavya.rawat@example.com",
    mobile: "9191919191",
  },
  {
    id: 31,
    name: "Falguni Dave",
    title: "Payroll Specialist",
    department: "Finance",
    workLocation: "Surat",
    location: "-",
    prevExperience: "3 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    email: "falguni.dave@example.com",
    mobile: "9321123344",
  },
  {
    id: 32,
    name: "Girish Kumar",
    title: "Power BI Developer",
    department: "Business Intelligence",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "2 Years 11 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/60.jpg",
    email: "girish.k@example.com",
    mobile: "9888877665",
  },
  {
    id: 33,
    name: "Hiral Patel",
    title: "Instructional Coach",
    department: "Learning & Dev.",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "4 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/38.jpg",
    email: "hiral.patel@example.com",
    mobile: "9445566778",
  },
  {
    id: 34,
    name: "Indrajit Singh",
    title: "Network Engineer",
    department: "IT Support",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "3 Years 6 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/29.jpg",
    email: "indrajit.singh@example.com",
    mobile: "9090909090",
  },
  {
    id: 35,
    name: "Jasmin Chauhan",
    title: "SEO Specialist",
    department: "Marketing",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "2 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/34.jpg",
    email: "jasmin.c@example.com",
    mobile: "9312345678",
  },
  {
    id: 36,
    name: "Karan Thakkar",
    title: "Embedded Systems Engineer",
    department: "Engineering",
    workLocation: "Surat",
    location: "-",
    prevExperience: "3 Years 3 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/18.jpg",
    email: "karan.t@example.com",
    mobile: "9123456799",
  },
  {
    id: 37,
    name: "Lavanya Shah",
    title: "Legal Advisor",
    department: "Legal",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "6 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/36.jpg",
    email: "lavanya.shah@example.com",
    mobile: "9898989898",
  },
  {
    id: 38,
    name: "Mehul Vyas",
    title: "AR/VR Developer",
    department: "Innovation Lab",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "2 Years 5 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    email: "mehul.vyas@example.com",
    mobile: "9222233344",
  },
  {
    id: 39,
    name: "Nandini Raj",
    title: "Event Coordinator",
    department: "Operations",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "1 Year 4 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/66.jpg",
    email: "nandini.raj@example.com",
    mobile: "9334455667",
  },
  {
    id: 40,
    name: "Om Trivedi",
    title: "Database Architect",
    department: "Engineering",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "7 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/63.jpg",
    email: "om.trivedi@example.com",
    mobile: "9446677885",
  },
  {
    id: 41,
    name: "Pallavi Sengupta",
    title: "Copywriter",
    department: "Marketing",
    workLocation: "Surat",
    location: "-",
    prevExperience: "2 Years 2 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/41.jpg",
    email: "pallavi.s@example.com",
    mobile: "9223344556",
  },
  {
    id: 42,
    name: "Qadir Khan",
    title: "IT Auditor",
    department: "Compliance",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "4 Years 9 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/79.jpg",
    email: "qadir.khan@example.com",
    mobile: "9557788990",
  },
  {
    id: 43,
    name: "Radhika Parikh",
    title: "Knowledge Manager",
    department: "Knowledge Mgmt.",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "3 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    email: "radhika.parikh@example.com",
    mobile: "9011223344",
  },
  {
    id: 44,
    name: "Samarth Solanki",
    title: "Chief Architect",
    department: "Engineering",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "9 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/27.jpg",
    email: "samarth.s@example.com",
    mobile: "9335566778",
  },
  {
    id: 45,
    name: "Tanya Desai",
    title: "Business Development Executive",
    department: "Sales",
    workLocation: "Surat",
    location: "-",
    prevExperience: "2 Years 7 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/58.jpg",
    email: "tanya.desai@example.com",
    mobile: "9447788990",
  },
  {
    id: 46,
    name: "Umesh Chauhan",
    title: "Mechanical Engineer",
    department: "R&D",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "3 Years 3 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
    email: "umesh.chauhan@example.com",
    mobile: "9123445566",
  },
  {
    id: 47,
    name: "Vidhi Patel",
    title: "Analytics Manager",
    department: "Analytics",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "5 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/13.jpg",
    email: "vidhi.patel@example.com",
    mobile: "9224466677",
  },
  {
    id: 48,
    name: "Wasim Sheikh",
    title: "Automation Tester",
    department: "Quality Assurance",
    workLocation: "Surat",
    location: "-",
    prevExperience: "2 Years 4 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/71.jpg",
    email: "wasim.s@example.com",
    mobile: "9886655443",
  },
  {
    id: 49,
    name: "Yashvi Gohil",
    title: "CSR Executive",
    department: "Operations",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "1 Year 2 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/29.jpg",
    email: "yashvi.g@example.com",
    mobile: "9009988776",
  },
  {
    id: 50,
    name: "Zubin Doshi",
    title: "Chief Information Officer",
    department: "Executive",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "12 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/99.jpg",
    email: "zubin.doshi@example.com",
    mobile: "9448887776",
  },

  {
    id: 51,
    name: "Akshay Bhatt",
    title: "GIS Specialist",
    department: "Engineering",
    workLocation: "Surat",
    location: "-",
    prevExperience: "4 Years 2 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/64.jpg",
    email: "akshay.bhatt@example.com",
    mobile: "9556677889",
  },
  {
    id: 52,
    name: "Bhumi Rana",
    title: "Strategic Planner",
    department: "Business",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "3 Years 8 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/70.jpg",
    email: "bhumi.rana@example.com",
    mobile: "9336677889",
  },
  {
    id: 53,
    name: "Chintan Modi",
    title: "Video Producer",
    department: "Marketing",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "2 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/58.jpg",
    email: "chintan.modi@example.com",
    mobile: "9667788990",
  },
  {
    id: 54,
    name: "Disha Shah",
    title: "UI Engineer",
    department: "Design",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "1 Year 9 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/80.jpg",
    email: "disha.shah@example.com",
    mobile: "9111233344",
  },
  {
    id: 55,
    name: "Eshan Gajjar",
    title: "Robotics Engineer",
    department: "Innovation Lab",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "3 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
    email: "eshan.gajjar@example.com",
    mobile: "9225566778",
  },
  {
    id: 56,
    name: "Firoza Khan",
    title: "Customer Success Lead",
    department: "Sales",
    workLocation: "Surat",
    location: "-",
    prevExperience: "4 Years 6 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/81.jpg",
    email: "firoza.khan@example.com",
    mobile: "9337788990",
  },
  {
    id: 57,
    name: "Gautam Shukla",
    title: "Blockchain Developer",
    department: "Engineering",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "2 Years 4 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/72.jpg",
    email: "gautam.shukla@example.com",
    mobile: "9226677889",
  },
  {
    id: 58,
    name: "Harini Desai",
    title: "Risk Analyst",
    department: "Finance",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "3 Years 2 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/98.jpg",
    email: "harini.desai@example.com",
    mobile: "9445566779",
  },
  {
    id: 59,
    name: "Iqbal Sheikh",
    title: "Systems Analyst",
    department: "IT Support",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "4 Years 3 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/94.jpg",
    email: "iqbal.sheikh@example.com",
    mobile: "9556677990",
  },
  {
    id: 60,
    name: "Jinali Shah",
    title: "Creative Director",
    department: "Design",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "6 Years 8 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/85.jpg",
    email: "jinali.shah@example.com",
    mobile: "9667788991",
  },
  {
    id: 61,
    name: "Kuldeep Rathod",
    title: "Energy Analyst",
    department: "Research",
    workLocation: "Surat",
    location: "-",
    prevExperience: "2 Years 5 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/83.jpg",
    email: "kuldeep.rathod@example.com",
    mobile: "9012349900",
  },
  {
    id: 62,
    name: "Lipi Trivedi",
    title: "Knowledge Analyst",
    department: "Knowledge Mgmt.",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "1 Year 11 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/87.jpg",
    email: "lipi.trivedi@example.com",
    mobile: "9323445566",
  },
  {
    id: 63,
    name: "Manan Shah",
    title: "IT Procurement Specialist",
    department: "Purchasing",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "3 Years 9 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/73.jpg",
    email: "manan.shah@example.com",
    mobile: "9223344566",
  },
  {
    id: 64,
    name: "Nidhi Patel",
    title: "Scrum Coach",
    department: "Project Management",
    workLocation: "Surat",
    location: "-",
    prevExperience: "4 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/10.jpg",
    email: "nidhi.patel@example.com",
    mobile: "9335678991",
  },
  {
    id: 65,
    name: "Omkar Shah",
    title: "Digital Illustrator",
    department: "Design",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "2 Years 3 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    email: "omkar.shah@example.com",
    mobile: "9225566889",
  },
  {
    id: 66,
    name: "Prisha Desai",
    title: "Data Privacy Officer",
    department: "Compliance",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "5 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/97.jpg",
    email: "prisha.desai@example.com",
    mobile: "9776655443",
  },
  {
    id: 67,
    name: "Rajat Mehta",
    title: "AI Researcher",
    department: "Innovation Lab",
    workLocation: "Ahmedabad",
    location: "-",
    prevExperience: "3 Years 7 Months",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/35.jpg",
    email: "rajat.mehta@example.com",
    mobile: "9112309876",
  },
  {
    id: 68,
    name: "Sneha Roy",
    title: "Localization Specialist",
    department: "Marketing",
    workLocation: "Surat",
    location: "-",
    prevExperience: "2 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/40.jpg",
    email: "sneha.roy@example.com",
    mobile: "9445566889",
  },
  {
    id: 69,
    name: "Tirth Shah",
    title: "IT Asset Manager",
    department: "IT Support",
    workLocation: "Rajkot",
    location: "-",
    prevExperience: "4 Years",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/men/93.jpg",
    email: "tirth.shah@example.com",
    mobile: "9011227788",
  },
  {
    id: 70,
    name: "Urvi Patel",
    title: "Media Planner",
    department: "Marketing",
    workLocation: "Vadodara",
    location: "-",
    prevExperience: "3 Years 1 Month",
    curExperience: "14 May 2025",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    email: "urvi.patel@example.com",
    mobile: "9224455667",
  },
];

export default function EmployeeDirectory() {
  const isMobile = useMediaQuery("(max-width: 1045px)");
  const [filters, setFilters] = useState({
    search: "",
    sort: "",
    department: "",
    jobTitle: "",
    location: "",
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const { departments, jobTitles, locations } = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department))].sort();
    const jobTitles = [...new Set(employees.map((e) => e.title))].sort();
    const locations = [...new Set(employees.map((e) => e.workLocation))].sort();
    return { departments, jobTitles, locations };
  }, []);

  const filteredEmployees = useMemo(() => {
    let employeesToFilter = employees.filter((emp) => {
      const searchMatch =
        !filters.search ||
        emp.name.toLowerCase().includes(filters.search.toLowerCase());
      const departmentMatch =
        !filters.department || emp.department === filters.department;
      const jobTitleMatch = !filters.jobTitle || emp.title === filters.jobTitle;
      const locationMatch =
        !filters.location || emp.workLocation === filters.location;
      return searchMatch && departmentMatch && jobTitleMatch && locationMatch;
    });

    if (filters.sort === "asc") {
      employeesToFilter.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "desc") {
      employeesToFilter.sort((a, b) => b.name.localeCompare(a.name));
    }

    return employeesToFilter;
  }, [filters]);

  const groupedEmployees = useMemo(() => {
    return filteredEmployees.reduce((acc, emp) => {
      const firstLetter = emp.name.charAt(0).toUpperCase();
      acc[firstLetter] = acc[firstLetter] || [];
      acc[firstLetter].push(emp);
      return acc;
    }, {} as Record<string, typeof employees>);
  }, [filteredEmployees]);

  const Filters = () => (
    <div className="flex flex-col md:flex-row items-center gap-2">
      <SearchInput
        placeholder="Search"
        className="md:w-56 !h-8"
        value={filters.search}
        onChange={(e) => handleFilterChange("search", e.target.value)}
      />
      <Select
        value={filters.sort}
        onValueChange={(value) => handleFilterChange("sort", value)}
      >
        <SelectTrigger className="!h-8 w-full md:w-32 text-sm !text-[#8d8d8d] !dark:text-[#c9c7c7]">
          <SelectValue placeholder="Name" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">A-Z</SelectItem>
          <SelectItem value="desc">Z-A</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.department}
        onValueChange={(value) => handleFilterChange("department", value)}
      >
        <SelectTrigger className="!h-8 w-full md:w-32 text-sm !text-[#8d8d8d] !dark:text-[#c9c7c7]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dep) => (
            <SelectItem key={dep} value={dep}>
              {dep}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.jobTitle}
        onValueChange={(value) => handleFilterChange("jobTitle", value)}
      >
        <SelectTrigger className="!h-8 w-full md:w-32 text-sm !text-[#8d8d8d] !dark:text-[#c9c7c7]">
          <SelectValue placeholder="Job Title" />
        </SelectTrigger>
        <SelectContent>
          {jobTitles.map((title) => (
            <SelectItem key={title} value={title}>
              {title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.location}
        onValueChange={(value) => handleFilterChange("location", value)}
      >
        <SelectTrigger className="!h-8 w-full md:w-32 text-sm !text-[#8d8d8d] !dark:text-[#c9c7c7]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  return (
    <div className="">
      <div className="flex flex-wrap gap-2 justify-between items-center border-b px-5 py-2">
        <h2 className="font-medium text-sm whitespace-nowrap">
          {filteredEmployees.length} Employees
        </h2>
        {isMobile ? (
          <Popover>
            <PopoverTrigger asChild>
              <PopoverTrigger asChild>
                <button className="border-none outline-none cursor-pointer">
                  <div className="flex items-center gap-2 rounded-xs border  text-xs font-medium px-2 py-1">
                    <FaFilter className="mr-2" /> Filters
                  </div>
                </button>
              </PopoverTrigger>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <Filters />
            </PopoverContent>
          </Popover>
        ) : (
          <Filters />
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-140px)] dark:bg-[#141414]  dark:text-white">
        {Object.entries(groupedEmployees)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([letter, group]) => (
            <div key={letter} className="">
              <h3 className="font-semibold  p-2 px-5 bg-[#fafafa] dark:bg-[#0c0c0c] dark:text-white">
                {letter}
              </h3>
              <div className="py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                {group.map((emp) => (
                  <Card
                    key={emp.id}
                    className="p-4 space-y-2 text-xs rounded-[5px] shadow-none bg-white dark:bg-[#0c0c0c]"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={emp.image}
                        alt={emp.name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-base">
                          {emp.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {emp.title}
                        </div>
                      </div>
                    </div>
                    <div className="w-full border-t pt-2 text-sm text-[#53575fcc] dark:text-[#b3b3b3] font-medium space-y-4">
                      {/* Row 1 */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center w-[50%] truncate">
                          <FaBriefcase size={16} />
                          <span className="truncate">{emp.department}</span>
                        </div>
                        <div className="flex gap-2 items-center w-[50%] truncate">
                          <MdEmail size={16} />
                          <span className="truncate">{emp.email}</span>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center w-[50%] truncate">
                          <IoIosCall size={16} />
                          <span className="truncate">{emp.mobile}</span>
                        </div>
                        <div className="flex gap-2 items-center w-[50%] truncate">
                          <RiUserLocationFill size={16} />
                          <span className="truncate">{emp.workLocation}</span>
                        </div>
                      </div>
                      {/* Row 2 */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center w-[50%] truncate">
                          <IoLocationSharp size={16} />
                          <span className="truncate">{emp.location}</span>
                        </div>
                      </div>
                      {/* Row 4 - with Popover */}
                      <div className="flex gap-2 items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2  cursor-pointer truncate">
                              <RiUserLocationFill size={16} />
                              <span className="truncate">
                                Previous Experience: {emp.prevExperience}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-sm bg-[#616161]  dark:bg-[#292929] dark:text-white">
                            <div className="space-y-2">
                              <div>Joining Date: {emp.curExperience}</div>
                              <div>
                                Current Experience:{" "}
                                {calculateCompanyExperience(emp.curExperience)}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
      </ScrollArea>
    </div>
  );
}
