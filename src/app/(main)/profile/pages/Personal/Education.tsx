"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/meterialInput";
import { IoMdAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useForm, useFieldArray } from "react-hook-form";
import {
  fetchEducation,
  updateEducation,
  EducationType,
} from "@/redux/slices/educationSlice";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";

type EducationFormData = {
  education: EducationType[];
};

export default function EducationInfo() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.education
  );
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<EducationFormData>({
    defaultValues: {
      education: [
        {
          degree: "",
          university: "",
          board: "",
          passingYear: "",
          grade: "",
          remarks: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    dispatch(fetchEducation());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (fetchedData && Array.isArray(fetchedData)) {
      reset({
        education: fetchedData.length
          ? fetchedData
          : [
              {
                degree: "",
                university: "",
                board: "",
                passingYear: "",
                grade: "",
                remarks: "",
              },
            ],
      });
    }
    setLoading(false);
  }, [fetchedData, reset]);

  const onSubmit = async (formData: EducationFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updateEducation(formData.education)).unwrap();
      toast.success("Saved successfully", { id: toastId });
      dispatch(fetchEducation());
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className=" ">
      <FullPageLoader show={isLoading || loading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-3  items-center border-b font-medium flex justify-between sticky top-0 w-full">
          <div className="text-base md:text-lg font-medium">Education</div>
          {isDirty && (
            <button
              type="submit"
              className="bg-sidebar-primary p-1.5 px-4 !text-white !text-sm rounded-xs cursor-pointer backdrop-blur-sm   hover:shadow-[0px_0px_2px_2px_rgba(59,130,246,0.2)]  transition duration-200"
            >
              Save
            </button>
          )}
        </div>
        <div className="space-y-6 py-4 bg-white dark:bg-black  max-h-[calc(100vh-197px)] max-md:h-[calc(100vh-259px)] pb-10  overflow-y-auto px-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Education Details</h2>
            <button
              type="button"
              className="px-4 py-1.5 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] cursor-pointer !text-xs transition duration-200 flex gap-1 items-center "
              onClick={() =>
                append({
                  degree: "",
                  university: "",
                  board: "",
                  passingYear: "",
                  grade: "",
                  remarks: "",
                })
              }
            >
              <IoMdAdd />
              Add New Education
            </button>
          </div>
          {fields.map((edu, index) => (
            <section
              key={edu.id}
              className="border rounded-md p-4 space-y-4 relative"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 pt-5 xl:grid-cols-3 gap-4">
                <Input
                  label="Degree / Qualification"
                  {...register(`education.${index}.degree` as const)}
                  required
                />
                <Input
                  label="University / Institute"
                  {...register(`education.${index}.university` as const)}
                />
                <Input
                  label="Board"
                  {...register(`education.${index}.board` as const)}
                />
                <Input
                  label="Passing Year"
                  {...register(`education.${index}.passingYear` as const)}
                  type="number"
                />
                <Input
                  label="Percentage / Grade"
                  {...register(`education.${index}.grade` as const)}
                />
                <Input
                  label="Remarks"
                  {...register(`education.${index}.remarks` as const)}
                />
              </div>
              {fields.length > 1 && (
                <button
                  className="absolute top-0.5 right-0.5 text-sm p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-full  cursor-pointer"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <RxCross2 />
                </button>
              )}
            </section>
          ))}
        </div>
      </form>
    </div>
  );
}
