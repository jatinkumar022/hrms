"use client";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchInput } from "@/components/ui/searchbox";
import { useState, useMemo, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaFilter } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchEmployeeDirectory,
  Employee,
} from "@/redux/slices/users/employeeDirectorySlice";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { Alert } from "antd";
import { InitialsAvatar } from "@/lib/InitialsAvatar";

export default function EmployeeDirectory() {
  const dispatch = useAppDispatch();
  const {
    data: employees,
    loading,
    error,
  } = useAppSelector((state) => state.employeeDirectory);

  useEffect(() => {
    dispatch(fetchEmployeeDirectory());
  }, [dispatch]);

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
    const jobTitles = [...new Set(employees.map((e) => e.jobTitle))].sort();
    const locations = [...new Set(employees.map((e) => e.currentCity))].sort();
    return { departments, jobTitles, locations };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const employeesToFilter = employees.filter((emp) => {
      const searchMatch =
        !filters.search ||
        emp.displayName.toLowerCase().includes(filters.search.toLowerCase());
      const departmentMatch =
        !filters.department || emp.department === filters.department;
      const jobTitleMatch =
        !filters.jobTitle || emp.jobTitle === filters.jobTitle;
      const locationMatch =
        !filters.location || emp.currentCity === filters.location;
      return searchMatch && departmentMatch && jobTitleMatch && locationMatch;
    });

    if (filters.sort === "asc") {
      employeesToFilter.sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    } else if (filters.sort === "desc") {
      employeesToFilter.sort((a, b) =>
        b.displayName.localeCompare(a.displayName)
      );
    }

    return employeesToFilter;
  }, [employees, filters]);

  const groupedEmployees = useMemo(() => {
    return filteredEmployees.reduce((acc, emp) => {
      const firstLetter = emp.displayName.charAt(0).toUpperCase();
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
  if (loading) return <FullPageLoader />;
  if (error)
    return (
      <div className="p-4">
        <Alert message={error} type="error" />
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

      <ScrollArea className="h-[calc(100vh-107px)] md:h-[calc(100vh-116px)] dark:bg-[#141414] pb-2 dark:text-white">
        {Object.entries(groupedEmployees)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([letter, group]) => (
            <div key={letter} className="">
              <h3 className="font-semibold  p-2 px-5 bg-[#fafafa] dark:bg-[#0c0c0c] dark:text-white">
                {letter}
              </h3>
              <div className="py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                {group.map((emp: Employee) => (
                  <Card
                    key={emp.id}
                    className="p-4 space-y-2 text-xs rounded-[5px] shadow-none bg-white dark:bg-[#0c0c0c]"
                  >
                    <div className="flex items-center gap-3">
                      {emp.profileImage ? (
                        <Image
                          src={emp.profileImage}
                          alt={emp.displayName}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <InitialsAvatar
                          name={emp.displayName}
                          className="h-10 w-10"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-base">
                          {emp.displayName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {emp.jobTitle}
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
                          <span className="truncate">{emp.officialEmail}</span>
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
                          <span className="truncate">{emp.currentCity}</span>
                        </div>
                      </div>
                      {/* Row 2 */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center w-[50%] truncate">
                          <IoLocationSharp size={16} />
                          <span className="truncate">{emp.permanentCity}</span>
                        </div>
                      </div>
                      {/* Row 4 - with Popover */}
                      <div className="flex gap-2 items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2  cursor-pointer truncate">
                              <RiUserLocationFill size={16} />
                              <span className="truncate">
                                Previous Experience: {emp.previousExperience}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-sm bg-[#616161]  dark:bg-[#292929] dark:text-white">
                            <div className="space-y-2">
                              <div>Joining Date: {emp.joiningDate}</div>
                              <div>
                                Current Experience: {emp.currentExperience}
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
