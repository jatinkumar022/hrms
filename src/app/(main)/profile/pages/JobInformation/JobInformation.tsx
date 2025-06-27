"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  JobInfoType,
} from "@/redux/slices/jobInfoSlice";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";

type JobInfoFormData = {
  jobInfo: JobInfoType[];
};

export default function JobInformation() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.jobInfo
  );
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<JobInfoFormData>({
    defaultValues: {
      jobInfo: [
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
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "jobInfo",
  });

  useEffect(() => {
    dispatch(fetchJobInfo());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (fetchedData && Array.isArray(fetchedData)) {
      reset({
        jobInfo: fetchedData.length
          ? fetchedData
          : [
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
            ],
      });
    }
    setLoading(false);
  }, [fetchedData, reset]);

  const onSubmit = async (formData: JobInfoFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updateJobInfo(formData.jobInfo)).unwrap();
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
          <div>Profile Page</div>
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
          {fields.map((job, index) => (
            <section
              key={job.id}
              className="border p-4 rounded-md relative space-y-4 bg-muted/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name={`jobInfo.${index}.effectiveDate` as const}
                  control={control}
                  render={({ field }) => (
                    <DatePickerWithLabel
                      label="Effective Date"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(val) =>
                        field.onChange(val ? val.toISOString() : "")
                      }
                    />
                  )}
                />
                <Input
                  label="Location"
                  {...register(`jobInfo.${index}.location` as const)}
                />
                <Input
                  label="Sub Location"
                  {...register(`jobInfo.${index}.subLocation` as const)}
                />
                <Input
                  label="Job Title"
                  {...register(`jobInfo.${index}.jobTitle` as const)}
                />
                <Input
                  label="Grade"
                  {...register(`jobInfo.${index}.grade` as const)}
                />
                <Input
                  label="Band"
                  {...register(`jobInfo.${index}.band` as const)}
                />
                <Controller
                  name={`jobInfo.${index}.category` as const}
                  control={control}
                  render={({ field }) => (
                    <FloatingSelect
                      label="Category"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { label: "Employee", value: "Employee" },
                        { label: "Contractor", value: "Contractor" },
                      ]}
                    />
                  )}
                />
                <Input
                  label="Department"
                  {...register(`jobInfo.${index}.department` as const)}
                />
                <Input
                  label="Sub Department"
                  {...register(`jobInfo.${index}.subDepartment` as const)}
                />
                <Input
                  label="Reporting Manager"
                  {...register(`jobInfo.${index}.reportingManager` as const)}
                />
                <Input
                  label="Line Manager"
                  {...register(`jobInfo.${index}.lineManager` as const)}
                />
                <Input
                  label="Line Manager 2"
                  {...register(`jobInfo.${index}.lineManager2` as const)}
                />
                <Controller
                  name={`jobInfo.${index}.employmentStatus` as const}
                  control={control}
                  render={({ field }) => (
                    <FloatingSelect
                      label="Employment Status"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { label: "Full Time", value: "Full Time" },
                        { label: "Part Time", value: "Part Time" },
                        { label: "Intern", value: "Intern" },
                        { label: "Consultant", value: "Consultant" },
                      ]}
                    />
                  )}
                />
                <Input
                  label="Note"
                  {...register(`jobInfo.${index}.note` as const)}
                />
              </div>
              {fields.length > 1 && (
                <button
                  className="absolute top-1 right-2 text-sm p-2 text-red-400 hover:bg-red-50 rounded-full  cursor-pointer"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <RxCross2 />
                </button>
              )}
            </section>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-dashed text-blue-600 flex items-center gap-2"
            onClick={() =>
              append({
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
              })
            }
          >
            <IoMdAdd />
            Add New Job Info
          </Button>
        </div>
      </form>
    </div>
  );
}
