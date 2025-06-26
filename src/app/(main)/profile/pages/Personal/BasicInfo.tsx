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
import { Controller, useFieldArray } from "react-hook-form";
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

interface LanguageSkill {
  reading: string;
  speaking: string;
  writing: string;
  understanding: string;
}

interface KnownLanguage {
  language: string;
  skill: LanguageSkill;
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
  knownLanguages: KnownLanguage[];
}

export default function BasicInfo() {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.personalInfo
  );
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [languageDraft, setLanguageDraft] = useState<KnownLanguage>({
    language: "",
    skill: { reading: "", speaking: "", writing: "", understanding: "" },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
    getValues,
    setValue,
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
      knownLanguages: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "knownLanguages",
  });

  useEffect(() => {
    dispatch(fetchPersonalInfo());
  }, []);

  useEffect(() => {
    setLoading(true);
    if (fetchedData) {
      reset(fetchedData);
    }
    setLoading(false);
  }, [fetchedData]);

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
        <div className="flex gap-4 flex-wrap">
          {fields.map((field, idx) => (
            <LanguageCard
              key={field.id}
              Title="Known Language"
              language={field.language}
              reading={field.skill.reading}
              speaking={field.skill.speaking}
              writing={field.skill.writing}
              understanding={field.skill.understanding}
              onEdit={() => {
                setEditIdx(idx);
                setLanguageDraft(field);
                setLanguageModalOpen(true);
              }}
              onDelete={() => remove(idx)}
            />
          ))}
          <button
            type="button"
            className="border border-dashed border-gray-300 w-fit px-4 py-2 rounded hover:border-black cursor-pointer group flex items-center gap-1"
            onClick={() => {
              setEditIdx(null);
              setLanguageDraft({
                language: "",
                skill: {
                  reading: "",
                  speaking: "",
                  writing: "",
                  understanding: "",
                },
              });
              setLanguageModalOpen(true);
            }}
          >
            <span className="group-hover:text-sidebar-primary">
              <FiPlus />
            </span>{" "}
            Add New
          </button>
        </div>

        {isDirty && (
          <Button type="submit" className="mt-6">
            Save Changes
          </Button>
        )}
      </form>

      {languageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editIdx === null ? "Add Language" : "Edit Language"}
            </h3>
            <div className="space-y-3">
              <Input
                label="Language"
                value={languageDraft.language}
                onChange={(e) =>
                  setLanguageDraft({
                    ...languageDraft,
                    language: e.target.value,
                  })
                }
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reading
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={languageDraft.skill.reading}
                  onChange={(e) =>
                    setLanguageDraft({
                      ...languageDraft,
                      skill: {
                        ...languageDraft.skill,
                        reading: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Speaking
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={languageDraft.skill.speaking}
                  onChange={(e) =>
                    setLanguageDraft({
                      ...languageDraft,
                      skill: {
                        ...languageDraft.skill,
                        speaking: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Writing
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={languageDraft.skill.writing}
                  onChange={(e) =>
                    setLanguageDraft({
                      ...languageDraft,
                      skill: {
                        ...languageDraft.skill,
                        writing: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Understanding
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={languageDraft.skill.understanding}
                  onChange={(e) =>
                    setLanguageDraft({
                      ...languageDraft,
                      skill: {
                        ...languageDraft.skill,
                        understanding: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLanguageModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (editIdx === null) {
                    append(languageDraft);
                  } else {
                    update(editIdx, languageDraft);
                  }
                  setLanguageModalOpen(false);
                }}
              >
                {editIdx === null ? "Add" : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const LanguageCard: React.FC<
  LanguageCardProps & {
    onEdit?: () => void;
    onDelete?: () => void;
  }
> = ({
  language,
  reading,
  speaking,
  writing,
  understanding,
  Title,
  onEdit,
  onDelete,
}) => (
  <div className="border rounded-[5px] p-4 space-y-2 relative w-fit">
    <label className="absolute left-4 top-3 text-sm text-zinc-500 -translate-y-6 scale-75">
      <span className="bg-white px-2 dark:bg-black">{Title}</span>
    </label>
    <div className="flex justify-between">
      <div className="text-[18px] font-medium">{language}</div>
      <div className="flex items-center gap-2">
        <div
          className="hover:bg-[#5096db66] text-sidebar-primary p-1.5 rounded-full cursor-pointer border"
          onClick={onEdit}
        >
          <BiSolidPencil />
        </div>
        <div
          className="hover:bg-[#5096db66] text-sidebar-primary p-1.5 rounded-full cursor-pointer border"
          onClick={onDelete}
        >
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
