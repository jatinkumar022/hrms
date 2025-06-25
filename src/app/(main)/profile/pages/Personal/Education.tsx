"use client";

import { useState } from "react";
import Input from "@/components/ui/meterialInput";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
export default function EducationInfo() {
  const [educations, setEducations] = useState([
    {
      degree: "",
      university: "",
      board: "",
      passingYear: "",
      percentage: "",
      remarks: "",
    },
  ]);

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        degree: "",
        university: "",
        board: "",
        passingYear: "",
        percentage: "",
        remarks: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: string, value: string) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  return (
    <div className="space-y-8 p-4 bg-white dark:bg-black">
      <h2 className="font-semibold text-lg">Education Details</h2>

      {educations.map((edu, index) => (
        <section
          key={index}
          className="border rounded-md p-4 space-y-4 relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Input
              label="Degree / Qualification"
              value={edu.degree}
              onChange={(e) => updateField(index, "degree", e.target.value)}
              required
            />
            <Input
              label="University / Institute"
              value={edu.university}
              onChange={(e) => updateField(index, "university", e.target.value)}
            />
            <Input
              label="Board"
              value={edu.board}
              onChange={(e) => updateField(index, "board", e.target.value)}
            />
            <Input
              label="Passing Year"
              value={edu.passingYear}
              onChange={(e) =>
                updateField(index, "passingYear", e.target.value)
              }
              type="number"
            />
            <Input
              label="Percentage / Grade"
              value={edu.percentage}
              onChange={(e) => updateField(index, "percentage", e.target.value)}
            />
            <Input
              label="Remarks"
              value={edu.remarks}
              onChange={(e) => updateField(index, "remarks", e.target.value)}
            />
          </div>
          {educations.length > 1 && (
            <button
              className="absolute top-1 right-2 text-sm p-2 text-red-400 hover:bg-red-50 rounded-full  cursor-pointer"
              onClick={() => removeEducation(index)}
            >
              <RxCross2 />
            </button>
          )}
        </section>
      ))}

      <Button
        variant="outline"
        className="border-dashed text-blue-600 flex items-center gap-2"
        onClick={addEducation}
      >
        <IoMdAdd />
        Add New Education
      </Button>
    </div>
  );
}
