"use client";

import React, { useEffect, useState } from "react";
import { BiSolidPencil } from "react-icons/bi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import Input from "@/components/ui/meterialInput";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPersonalInfo,
  updatePersonalInfo,
} from "@/redux/slices/personalInfoSlice";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import FullPageLoader from "@/components/loaders/FullPageLoader";
interface LanguageCardProps {
  language: string;
  reading: string;
  speaking: string;
  writing: string;
  understanding: string;
  Title: string;
}
interface PersonalInfoFormData {
  companyName: string;
  legalEntityCompany: string;
  uniqueId: string;
  employeeId: string;
  joiningDate: string; // ISO string
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "male" | "female" | "other" | "";
  dateOfBirth: string; // ISO string
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "";
  bloodGroup: string;
  placeOfBirth: string;
  nationality: string;
  displayName: string;
}
export default function BasicInfo() {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.personalInfo
  );
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<PersonalInfoFormData>({
    defaultValues: {
      companyName: "",
      legalEntityCompany: "",
      uniqueId: "",
      employeeId: "",
      joiningDate: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      maritalStatus: "",
      bloodGroup: "",
      placeOfBirth: "",
      nationality: "",
      displayName: "",
    },
  });
  useEffect(() => {
    dispatch(fetchPersonalInfo());
  });

  useEffect(() => {
    setLoading(true);
    if (fetchedData) {
      reset(fetchedData);
    }
    setLoading(false);
  }, [fetchedData, reset]);
  const onSubmit = async (formData: PersonalInfoFormData) => {
    setLoading(true);

    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updatePersonalInfo(formData)).unwrap();
      toast.success("Saved successfully", { id: toastId });
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <>
      <FullPageLoader show={isLoading || loading} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 py-10 bg-white dark:bg-black px-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 space-y-2">
          <Input label="Company Name" {...register("companyName")} />
          <Input
            label="Legal Entity Company"
            {...register("legalEntityCompany")}
          />
          <Input label="Unique ID" {...register("uniqueId")} />
          <Input label="Employee ID" {...register("employeeId")} />
          <Controller
            name="joiningDate"
            control={control}
            render={({ field }) => (
              <DatePickerWithLabel
                label="Joining Date"
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) =>
                  field.onChange(date ? date.toISOString().split("T")[0] : "")
                }
              />
            )}
          />
          <Input label="First Name" {...register("firstName")} />
          <Input label="Middle Name" {...register("middleName")} />
          <Input label="Last Name" {...register("lastName")} />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FloatingSelect
                label="Gender"
                value={field.value}
                onChange={(val) => field.onChange(val || undefined)}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ]}
              />
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DatePickerWithLabel
                label="Date of Birth"
                value={field.value ? new Date(field.value) : undefined}
                onChange={(val) =>
                  field.onChange(val ? val.toISOString().split("T")[0] : "")
                }
              />
            )}
          />
          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <FloatingSelect
                label="Marital Status"
                value={field.value}
                onChange={(val) => field.onChange(val || undefined)}
                options={[
                  { label: "Single", value: "single" },
                  { label: "Married", value: "married" },
                  { label: "Divorced", value: "divorced" },
                  { label: "Widowed", value: "widowed" },
                ]}
              />
            )}
          />

          <Input label="Blood Group" {...register("bloodGroup")} />
          <Input label="Place of Birth" {...register("placeOfBirth")} />
          <Input label="Nationality" {...register("nationality")} />
          <Input label="Display Name" {...register("displayName")} />
        </div>

        {/* Languages */}
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

        {isDirty && (
          <Button type="submit" className="mt-6">
            Save Changes
          </Button>
        )}
      </form>
    </>
  );
}
const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  reading,
  speaking,
  writing,
  understanding,
  Title,
}) => {
  return (
    <div className="border rounded-[5px] p-4 space-y-2 relative w-fit">
      <label className="absolute left-4 top-3 text-sm text-zinc-500 -translate-y-6 scale-75">
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
      <div className="flex gap-8">
        <div className="flex flex-col">
          <span>Reading</span>
          <span className="text-sm text-[#4e525f]">{reading}</span>
        </div>
        <div className="flex flex-col">
          <span>Speaking</span>
          <span className="text-sm text-[#4e525f]">{speaking}</span>
        </div>
        <div className="flex flex-col">
          <span>Writing</span>
          <span className="text-sm text-[#4e525f]">{writing}</span>
        </div>
        <div className="flex flex-col">
          <span>Understanding</span>
          <span className="text-sm text-[#4e525f]">{understanding}</span>
        </div>
      </div>
    </div>
  );
};
