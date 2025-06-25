import React from "react";
import { BiSolidPencil } from "react-icons/bi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import Input from "@/components/ui/meterialInput";

export default function BasicInfo() {
  return (
    <div className="space-y-6 bg-white dark:bg-black px-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Left Column */}
        <Input
          label="Company Name"
          value="Dvij Infotech LLP"
          disabled
          required
        />
        <Input
          label="Legal Entity Company"
          value="Dvij Infotech LLP"
          disabled
        />

        <Input label="Unique ID" />
        <Input label="Employee ID" value="DVIJ097" disabled />

        <Input label="Joining Date" value="17/10/2024" type="date" />
        <Input label="First Name" value="Jatin" required />

        <Input label="Middle Name" value="Chandubhai" />
        <Input label="Last Name" value="Ramani" />

        <Input label="Gender" value="Male" />
        <Input label="Date of Birth" value="2003-05-22" type="date" />

        <Input label="Marital Status" value="Unmarried" />
        <Input label="Blood Group" value="O+" />

        <Input label="Place of Birth" value="Kukavav" />
        <Input label="Nationality" value="Indian" />

        <div className="flex items-center gap-2 mt-4 ">
          <input
            type="checkbox"
            id="handicap"
            className="h-5 w-5 cursor-pointer"
          />
          <label
            htmlFor="handicap"
            className="text-sm cursor-pointer select-none"
          >
            Physical Handicap Employee
          </label>
        </div>

        <Input label="Display Name" value="Jatin Ramani" />
      </div>

      {/* Known Languages */}
      <div className="flex gap-4">
        <LanguageCard
          Title="Known Language"
          language="English"
          reading="Excellent"
          speaking="Poor"
          writing="Excellent"
          understanding="Excellent"
        />
        <LanguageCard
          Title="Known Language"
          language="Gujarati"
          reading="Excellent"
          speaking="Excellent"
          writing="Good"
          understanding="Excellent"
        />
      </div>

      <button className="border border-dashed border-gray-300 w-fit px-4 py-2 rounded hover:border-black cursor-pointer group flex items-center gap-1">
        <span className="group-hover:text-sidebar-primary">
          <FiPlus />
        </span>{" "}
        Add New
      </button>
    </div>
  );
}

function LanguageCard({
  language,
  reading,
  speaking,
  writing,
  understanding,
  Title,
}) {
  return (
    <div className="border rounded-[5px] p-4 space-y-2 relative w-fit">
      <label
        className="absolute left-4 top-3 pointer-events-none origin-left
          transition-all duration-200 text-zinc-500 -translate-y-6 scale-75 "
      >
        <span className="bg-white px-2 dark:bg-black">{Title}</span>
      </label>
      <div className="flex justify-between">
        <div className="text-[18px] font-medium">{language}</div>
        <div className="flex items-center gap-2">
          <div className="hover:bg-[#5096db66] text-sidebar-primary p-1.5 rounded-full cursor-pointer border">
            <BiSolidPencil />
          </div>
          <div className="hover:bg-[#5096db66] text-sidebar-primary p-1.5 rounded-full cursor-pointer border">
            <RiDeleteBin6Fill />
          </div>
        </div>
      </div>
      <div className="flex  gap-8">
        <div className="flex flex-col">
          <span className="">Reading</span>
          <span className="text-sm text-[#4e525f] ">{reading}</span>
        </div>
        <div className="flex flex-col">
          <span>Speaking</span>
          <span className="text-sm text-[#4e525f] ">{speaking}</span>
        </div>
        <div className="flex flex-col">
          <span>Writing</span>
          <span className="text-sm text-[#4e525f] ">{writing}</span>
        </div>
        <div className="flex flex-col">
          <span>Understanding</span>
          <span className="text-sm text-[#4e525f] ">{understanding}</span>
        </div>
      </div>
    </div>
  );
}
