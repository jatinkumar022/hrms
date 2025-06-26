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
    getValues,
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
    <div className="space-y-8 p-4 bg-white ">
      <FullPageLoader show={isLoading || loading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ───────────────── Parents Detail ───────────────── */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Parents Detail</h2>

          <div className="mb-6 space-y-6">
            <div className="flex items-center gap-4">
              <label className="font-medium">Father Detail</label>
              <div className="flex items-center gap-1">
                <Controller
                  name="father.isLate"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="father-late"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium">Mother Detail</label>
              <div className="flex items-center gap-1">
                <Controller
                  name="mother.isLate"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="mother-late"
                      checked={!!field.value}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <section>
          <h2 className="font-semibold text-lg mb-4">Other Members Detail</h2>
          <Button
            type="button"
            variant="outline"
            className="border-dashed text-blue-600"
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
            + Add New Member
          </Button>
        </section>

        {fields.map((field, idx) => (
          <div key={field.id} className="bg-gray-50 rounded-lg p-4 my-4 border">
            <div className="flex gap-2 items-center mb-2">
              <Input
                label="Relation"
                {...register(`others.${idx}.relation` as const)}
                className="w-1/2"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRemoveIdx(idx);
                  setShowModal(true);
                }}
                className="text-red-500"
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      field.onChange(val ? val.toISOString().split("T")[0] : "")
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

        {isDirty && (
          <Button type="submit" className="mt-6">
            Save Changes
          </Button>
        )}
      </form>

      {showModal && removeIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
                onClick={async () => {
                  // Remove from form state
                  remove(removeIdx);

                  // Remove from DB: submit the updated form
                  const currentValues = getValues();
                  currentValues.others.splice(removeIdx, 1);
                  setShowModal(false);
                  setRemoveIdx(null);
                  setLoading(true);
                  const toastId = toast.loading("Removing...");
                  try {
                    await dispatch(updateFamilyInfo(currentValues)).unwrap();
                    toast.success("Removed successfully", { id: toastId });
                    dispatch(fetchFamilyInfo());
                  } catch {
                    toast.error("Failed to remove", { id: toastId });
                  }
                  setLoading(false);
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
