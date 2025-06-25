"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/meterialInput";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export default function JobInformation() {
  const [jobs, setJobs] = useState([
    {
      effectiveDate: "",
      location: "",
      subLocation: "",
      jobTitle: "",
      grade: "",
      band: "",
      category: "Employee",
      department: "",
      subDepartment: "",
      reportingManager: "",
      lineManager: "",
      lineManager2: "",
      employmentStatus: "Full Time",
      note: "",
    },
  ]);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...jobs];
    updated[index][field] = value;
    setJobs(updated);
  };

  const addJob = () => {
    setJobs([
      ...jobs,
      {
        effectiveDate: "",
        location: "",
        subLocation: "",
        jobTitle: "",
        grade: "",
        band: "",
        category: "Employee",
        department: "",
        subDepartment: "",
        reportingManager: "",
        lineManager: "",
        lineManager2: "",
        employmentStatus: "Full Time",
        note: "",
      },
    ]);
  };

  const removeJob = (index: number) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-black">
      {jobs.map((job, index) => (
        <section
          key={index}
          className="border p-4 rounded-md relative space-y-4 bg-muted/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePickerWithLabel
              label="Effective Date"
              onChange={(val) => handleChange(index, "effectiveDate", val)}
            />
            <Input
              label="Location"
              value={job.location}
              onChange={(e) => handleChange(index, "location", e.target.value)}
            />
            <Input
              label="Sub Location"
              value={job.subLocation}
              onChange={(e) =>
                handleChange(index, "subLocation", e.target.value)
              }
            />
            <Input
              label="Job Title"
              value={job.jobTitle}
              onChange={(e) => handleChange(index, "jobTitle", e.target.value)}
            />
            <Input
              label="Grade"
              value={job.grade}
              onChange={(e) => handleChange(index, "grade", e.target.value)}
            />
            <Input
              label="Band"
              value={job.band}
              onChange={(e) => handleChange(index, "band", e.target.value)}
            />
            <FloatingSelect
              label="Category"
              value={job.category}
              onChange={(val) => handleChange(index, "category", val)}
              options={[
                { label: "Employee", value: "Employee" },
                { label: "Contractor", value: "Contractor" },
              ]}
            />
            <Input
              label="Department"
              value={job.department}
              onChange={(e) =>
                handleChange(index, "department", e.target.value)
              }
            />
            <Input
              label="Sub Department"
              value={job.subDepartment}
              onChange={(e) =>
                handleChange(index, "subDepartment", e.target.value)
              }
            />
            <Input
              label="Reporting Manager"
              value={job.reportingManager}
              onChange={(e) =>
                handleChange(index, "reportingManager", e.target.value)
              }
            />
            <Input
              label="Line Manager"
              value={job.lineManager}
              onChange={(e) =>
                handleChange(index, "lineManager", e.target.value)
              }
            />
            <Input
              label="Line Manager 2"
              value={job.lineManager2}
              onChange={(e) =>
                handleChange(index, "lineManager2", e.target.value)
              }
            />
            <FloatingSelect
              label="Employment Status"
              value={job.employmentStatus}
              onChange={(val) => handleChange(index, "employmentStatus", val)}
              options={[
                { label: "Full Time", value: "Full Time" },
                { label: "Part Time", value: "Part Time" },
                { label: "Intern", value: "Intern" },
                { label: "Consultant", value: "Consultant" },
              ]}
            />
            <Input
              label="Note"
              value={job.note}
              onChange={(e) => handleChange(index, "note", e.target.value)}
            />
          </div>

          {jobs.length > 1 && (
            <button
              className="absolute top-1 right-2 text-sm p-2 text-red-400 hover:bg-red-50 rounded-full  cursor-pointer"
              onClick={() => removeJob(index)}
            >
              <RxCross2 />
            </button>
          )}
        </section>
      ))}

      <Button
        variant="outline"
        className="border-dashed text-blue-600 flex items-center gap-2"
        onClick={addJob}
      >
        <IoMdAdd />
        Add New Job Info
      </Button>
    </div>
  );
}
