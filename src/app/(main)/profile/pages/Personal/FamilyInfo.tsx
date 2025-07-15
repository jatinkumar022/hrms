"use client";
import { useEffect, useState } from "react";
import Input from "@/components/ui/meterialInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchFamilyInfo,
  updateFamilyInfo,
} from "@/redux/slices/familyInfoSlice";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";
import { RxCross2 } from "react-icons/rx";

interface FamilyMember {
  relation: string; // e.g., "Brother", "Sister", "Spouse"
  name: string;
  gender?: string;
  dateOfBirth?: string;
  occupation?: string;
  mobileNumber?: string;
  adharCard?: string;
}

interface FamilyInfoFormData {
  father: {
    name: string;
    gender?: string;
    dateOfBirth?: string;
    occupation?: string;
    mobileNumber?: string;
    adharCard?: string;
    isLate?: boolean;
  };
  mother: {
    name: string;
    gender?: string;
    dateOfBirth?: string;
    occupation?: string;
    mobileNumber?: string;
    adharCard?: string;
    isLate?: boolean;
  };
  others: FamilyMember[];
}

export default function FamilyInfo() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.familyInfo
  );
  const [loading, setLoading] = useState(true);
  const [removeIdx, setRemoveIdx] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { isDirty },
  } = useForm<FamilyInfoFormData>({
    defaultValues: {
      father: { name: "", isLate: false },
      mother: { name: "", isLate: false },
      others: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "others",
  });

  useEffect(() => {
    dispatch(fetchFamilyInfo());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (fetchedData && typeof fetchedData === "object") {
      reset({
        father: {
          name: fetchedData.father?.name || "",
          gender: fetchedData.father?.gender || "",
          dateOfBirth: fetchedData.father?.dateOfBirth || "",
          occupation: fetchedData.father?.occupation || "",
          mobileNumber: fetchedData.father?.mobileNumber || "",
          adharCard: fetchedData.father?.adharCard || "",
          isLate: fetchedData.father?.isLate || false,
        },
        mother: {
          name: fetchedData.mother?.name || "",
          gender: fetchedData.mother?.gender || "",
          dateOfBirth: fetchedData.mother?.dateOfBirth || "",
          occupation: fetchedData.mother?.occupation || "",
          mobileNumber: fetchedData.mother?.mobileNumber || "",
          adharCard: fetchedData.mother?.adharCard || "",
          isLate: fetchedData.mother?.isLate || false,
        },
        others: fetchedData.others || [],
      });
    }
    setLoading(false);
  }, [fetchedData, reset]);

  const onSubmit = async (formData: FamilyInfoFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updateFamilyInfo(formData)).unwrap();
      toast.success("Saved successfully", { id: toastId });
      // Refetch to get the latest data
      dispatch(fetchFamilyInfo());
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
    setLoading(false);
  };

  const fatherLate = watch("father.isLate");
  const motherLate = watch("mother.isLate");

  return (
    <div className="space-y-8  ">
      <FullPageLoader show={isLoading || loading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-3  items-center border-b font-medium flex justify-between sticky top-0 w-full">
          <div className="text-base md:text-lg font-medium">Family Details</div>
          {isDirty && (
            <button
              type="submit"
              className="bg-sidebar-primary p-1.5 px-4 !text-white !text-sm rounded-xs cursor-pointer backdrop-blur-sm   hover:shadow-[0px_0px_2px_2px_rgba(59,130,246,0.2)]  transition duration-200"
            >
              Save
            </button>
          )}
        </div>
        <div className="space-y-6 bg-white dark:bg-black max-h-screen  overflow-y-auto pb-[250px]">
          <section>
            <h2 className="p-3 bg-[#f5f6fa] font-medium ">Parents Detail</h2>

            <div className=" space-y-6 p-3">
              <div className="flex items-center gap-4 mb-6">
                <label className="font-medium">Father Detail</label>
                <div className="flex items-center gap-1 ">
                  <Controller
                    name="father.isLate"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="father-late"
                        className="!text-white "
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                      />
                    )}
                  />
                  <label
                    htmlFor="father-late"
                    className="text-sm text-muted-foreground"
                  >
                    Late
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ">
                {/* Name always shown */}
                <Input label="Name" {...register("father.name")} />

                {/* Rest hidden if 'late' is true */}
                {!fatherLate && (
                  <>
                    <Controller
                      name="father.gender"
                      control={control}
                      render={({ field }) => (
                        <div className="flex justify-center items-baseline-last">
                          <FloatingSelect
                            label="Gender"
                            value={field.value}
                            onChange={field.onChange}
                            options={[
                              { label: "Male", value: "male" },
                              { label: "Female", value: "female" },
                            ]}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name="father.dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <DatePickerWithLabel
                          label="Date of Birth"
                          value={field.value ? new Date(field.value) : null}
                          onChange={(val) =>
                            field.onChange(
                              val ? val.toISOString().split("T")[0] : ""
                            )
                          }
                        />
                      )}
                    />
                    <Input
                      label="Occupation"
                      {...register("father.occupation")}
                    />
                    <Input
                      label="Mobile Number"
                      {...register("father.mobileNumber")}
                    />
                    <Input
                      label="Aadhaar Card (UID)"
                      {...register("father.adharCard")}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Mother Detail */}
            <div className="space-y-4 p-3 ">
              <div className="flex items-center gap-4 mb-6">
                <label className="font-medium">Mother Detail</label>
                <div className="flex items-center gap-1">
                  <Controller
                    name="mother.isLate"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="mother-late"
                        checked={!!field.value}
                        className="!text-white "
                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                      />
                    )}
                  />
                  <label
                    htmlFor="mother-late"
                    className="text-sm text-muted-foreground"
                  >
                    Late
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Name always shown */}
                <Input label="Name" {...register("mother.name")} />

                {/* Rest hidden if 'late' is true */}
                {!motherLate && (
                  <>
                    <Controller
                      name="mother.gender"
                      control={control}
                      render={({ field }) => (
                        <div className="flex justify-center items-baseline-last">
                          <FloatingSelect
                            label="Gender"
                            value={field.value}
                            onChange={field.onChange}
                            options={[
                              { label: "Male", value: "male" },
                              { label: "Female", value: "female" },
                            ]}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name="mother.dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <DatePickerWithLabel
                          label="Date of Birth"
                          value={field.value ? new Date(field.value) : null}
                          onChange={(val) =>
                            field.onChange(
                              val ? val.toISOString().split("T")[0] : ""
                            )
                          }
                        />
                      )}
                    />
                    <Input
                      label="Occupation"
                      {...register("mother.occupation")}
                    />
                    <Input
                      label="Mobile Number"
                      {...register("mother.mobileNumber")}
                    />
                    <Input
                      label="Aadhaar Card (UID)"
                      {...register("mother.adharCard")}
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ─────────────── Other Members Detail ─────────────── */}
          <section className="p-3 bg-[#f5f6fa] flex justify-between items-center">
            <span className=" !font-medium !m-0">Other Members Detail</span>

            <button
              type="button"
              className="px-4 py-1.5 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] cursor-pointer !text-xs transition duration-200"
              onClick={() =>
                append({
                  relation: "",
                  name: "",
                  gender: "",
                  dateOfBirth: "",
                  occupation: "",
                  mobileNumber: "",
                  adharCard: "",
                })
              }
            >
              + Add New
            </button>
          </section>

          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="relative p-4 my-4 border m-2 rounded-sm"
            >
              <button
                type="button"
                onClick={() => {
                  setRemoveIdx(idx);
                  setShowModal(true);
                }}
                className="absolute top-2 right-2 rounded-full cursor-pointer p-2 hover:bg-red-100"
              >
                <RxCross2 className="text-red-400" />
              </button>
              <div className="flex justify-between items-center mb-4">
                <Input
                  label="Relation"
                  {...register(`others.${idx}.relation` as const)}
                  className="w-1/2"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <Input
                  label="Name"
                  {...register(`others.${idx}.name` as const)}
                />
                <Controller
                  name={`others.${idx}.gender` as const}
                  control={control}
                  render={({ field }) => (
                    <FloatingSelect
                      label="Gender"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                      ]}
                    />
                  )}
                />
                <Controller
                  name={`others.${idx}.dateOfBirth` as const}
                  control={control}
                  render={({ field }) => (
                    <DatePickerWithLabel
                      label="Date of Birth"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(val) =>
                        field.onChange(
                          val ? val.toISOString().split("T")[0] : ""
                        )
                      }
                    />
                  )}
                />
                <Input
                  label="Occupation"
                  {...register(`others.${idx}.occupation` as const)}
                />
                <Input
                  label="Mobile Number"
                  {...register(`others.${idx}.mobileNumber` as const)}
                />
                <Input
                  label="Aadhaar Card (UID)"
                  {...register(`others.${idx}.adharCard` as const)}
                />
              </div>
            </div>
          ))}
        </div>
      </form>

      {showModal && removeIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Remove Member</h3>
            <p className="mb-6">
              Are you sure you want to remove this family member?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setRemoveIdx(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  // Remove from form state only
                  remove(removeIdx);
                  setShowModal(false);
                  setRemoveIdx(null);
                }}
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
