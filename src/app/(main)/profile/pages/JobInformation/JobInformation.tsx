"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/meterialInput";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { IoMdAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  fetchJobInfo,
  updateJobInfo,
  CurrentJobType,
  PreviousExperienceType,
} from "@/redux/slices/jobInfoSlice";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";

type JobInfoFormData = {
  currentJob: CurrentJobType;
  previousExperience: PreviousExperienceType[];
};

export default function JobInformation() {
  const dispatch = useAppDispatch();
  const { currentJob, previousExperience, isLoading } = useAppSelector(
    (state) => state.jobInfo
  );
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
    setValue,
  } = useForm<JobInfoFormData>({
    defaultValues: {
      currentJob: {
        joiningDate: "",
        location: "",
        jobTitle: "",
        category: "Employee",
        department: "",
        reportingManager: "",
        employmentStatus: "Full Time",
      },
      previousExperience: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "previousExperience",
  });

  useEffect(() => {
    dispatch(fetchJobInfo());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (currentJob || previousExperience) {
      reset({
        currentJob: currentJob || {
          joiningDate: "",
          location: "",
          jobTitle: "",
          category: "Employee",
          department: "",
          reportingManager: "",
          employmentStatus: "Full Time",
        },
        previousExperience: previousExperience.length ? previousExperience : [],
      });
    }
    setLoading(false);
  }, [currentJob, previousExperience, reset]);

  const onSubmit = async (formData: JobInfoFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updateJobInfo(formData)).unwrap();
      toast.success("Saved successfully", { id: toastId });
      dispatch(fetchJobInfo());
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="">
      <FullPageLoader show={isLoading || loading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-3 px-5 items-center border-b font-medium flex justify-between sticky top-0 w-full">
          <div className="text-base md:text-lg font-medium">
            Job Information
          </div>
          {isDirty && (
            <button
              type="submit"
              className="bg-sidebar-primary p-1.5 px-4 !text-white !text-sm rounded-xs cursor-pointer backdrop-blur-sm   hover:shadow-[0px_0px_2px_2px_rgba(59,130,246,0.2)]  transition duration-200"
            >
              Save
            </button>
          )}
        </div>
        <div className="space-y-6 py-4 bg-white dark:bg-black px-3 max-h-screen  overflow-y-auto pb-[250px]">
          {/* Current Job Section */}
          <section className="border p-4 rounded-md relative mb-8">
            <div className="text-base font-semibold mb-2">Current Job</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3   gap-5 pt-5">
              <Controller
                name={`currentJob.joiningDate` as const}
                control={control}
                render={({ field }) => (
                  <DatePickerWithLabel
                    label="Joining Date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(val) =>
                      field.onChange(val ? val.toISOString() : "")
                    }
                  />
                )}
              />
              <Input
                label="Location"
                {...register(`currentJob.location` as const)}
              />
              <Input
                label="Job Title"
                {...register(`currentJob.jobTitle` as const)}
              />
              <FloatingSelect
                label="Category"
                value={control._formValues.currentJob?.category || "Employee"}
                onChange={(val) => setValue("currentJob.category", val)}
                options={[
                  { label: "Employee", value: "Employee" },
                  { label: "Contractor", value: "Contractor" },
                ]}
              />
              <Input
                label="Department"
                {...register(`currentJob.department` as const)}
              />
              <Input
                label="Reporting Manager"
                {...register(`currentJob.reportingManager` as const)}
              />
              <FloatingSelect
                label="Employment Status"
                value={
                  control._formValues.currentJob?.employmentStatus ||
                  "Full Time"
                }
                onChange={(val) => setValue("currentJob.employmentStatus", val)}
                options={[
                  { label: "Full Time", value: "Full Time" },
                  { label: "Part Time", value: "Part Time" },
                  { label: "Intern", value: "Intern" },
                  { label: "Consultant", value: "Consultant" },
                ]}
              />
            </div>
          </section>
          {/* Previous Experience Section */}
          <div className="text-base font-semibold mb-2">
            Previous Experience
          </div>
          {fields.map((exp, index) => (
            <section
              key={exp.id}
              className="border p-4 rounded-md relative mb-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 pt-5">
                <Input
                  label="Company Name"
                  {...register(
                    `previousExperience.${index}.companyName` as const
                  )}
                />
                <Controller
                  name={`previousExperience.${index}.joiningDate` as const}
                  control={control}
                  render={({ field }) => (
                    <DatePickerWithLabel
                      label="Joining Date"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(val) =>
                        field.onChange(val ? val.toISOString() : "")
                      }
                    />
                  )}
                />
                <Controller
                  name={`previousExperience.${index}.lastDate` as const}
                  control={control}
                  render={({ field }) => (
                    <DatePickerWithLabel
                      label="Last Date"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(val) =>
                        field.onChange(val ? val.toISOString() : "")
                      }
                    />
                  )}
                />
                <Input
                  label="Department"
                  {...register(
                    `previousExperience.${index}.department` as const
                  )}
                />
                <FloatingSelect
                  label="Category"
                  value={
                    control._formValues.previousExperience?.[index]?.category ||
                    "Employee"
                  }
                  onChange={(val) =>
                    setValue(`previousExperience.${index}.category`, val)
                  }
                  options={[
                    { label: "Employee", value: "Employee" },
                    { label: "Contractor", value: "Contractor" },
                  ]}
                />
                <FloatingSelect
                  label="Employment Status"
                  value={
                    control._formValues.previousExperience?.[index]
                      ?.employmentStatus || "Full Time"
                  }
                  onChange={(val) =>
                    setValue(
                      `previousExperience.${index}.employmentStatus`,
                      val
                    )
                  }
                  options={[
                    { label: "Full Time", value: "Full Time" },
                    { label: "Part Time", value: "Part Time" },
                    { label: "Intern", value: "Intern" },
                    { label: "Consultant", value: "Consultant" },
                  ]}
                />
              </div>
              {fields.length > 1 && (
                <button
                  className="absolute top-0.5 right-0.5 text-sm p-2 text-red-400 hover:bg-red-50 rounded-full  cursor-pointer"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <RxCross2 />
                </button>
              )}
            </section>
          ))}
          <button
            type="button"
            className="px-4 py-1.5 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] cursor-pointer !text-xs transition duration-200 flex gap-1 items-center"
            onClick={() =>
              append({
                companyName: "",
                joiningDate: "",
                lastDate: "",
                department: "",
                category: "",
                employmentStatus: "Full Time",
              })
            }
          >
            <IoMdAdd />
            Add Previous Experience
          </button>
        </div>
      </form>
    </div>
  );
}
