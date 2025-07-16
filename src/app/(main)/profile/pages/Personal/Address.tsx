"use client";
import Input from "@/components/ui/meterialInput";
import { IoMdAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAddress, updateAddress } from "@/redux/slices/addressSlice";
import { useForm, useFieldArray } from "react-hook-form";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";

interface AddressType {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

interface AddressFormData {
  address: {
    current: AddressType;
    permanent: AddressType;
    others: AddressType[];
  };
}

export default function Address() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.address
  );
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<AddressFormData>({
    defaultValues: {
      address: {
        current: { country: "India" },
        permanent: { country: "India" },
        others: [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "address.others",
  });

  useEffect(() => {
    dispatch(fetchAddress());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (fetchedData) {
      reset({
        address: {
          current: {
            ...fetchedData.current,
            country: fetchedData.current?.country || "India",
          },
          permanent: {
            ...fetchedData.permanent,
            country: fetchedData.permanent?.country || "India",
          },
          others: fetchedData.others?.length ? fetchedData.others : [],
        },
      });
    }
    setLoading(false);
  }, [fetchedData, reset]);

  const onSubmit = async (formData: AddressFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updateAddress(formData.address)).unwrap();
      toast.success("Saved successfully", { id: toastId });
      dispatch(fetchAddress());
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="  ">
      <FullPageLoader show={isLoading || loading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-3  items-center border-b font-medium flex justify-between sticky top-0 w-full">
          <div className="text-base md:text-lg font-medium">Address</div>
          {isDirty && (
            <button
              type="submit"
              className="bg-sidebar-primary p-1.5 px-4 !text-white !text-sm rounded-xs cursor-pointer backdrop-blur-sm   hover:shadow-[0px_0px_2px_2px_rgba(59,130,246,0.2)]  transition duration-200"
            >
              Save
            </button>
          )}
        </div>
        {/* ─────────────── Current Address ─────────────── */}
        <div className="space-y-6  bg-white dark:bg-black max-h-[calc(100vh-197px)] max-md:h-[calc(100vh-259px)] pb-10  overflow-y-auto ">
          <section>
            <h2 className="p-3 bg-[#f5f6fa] dark:bg-[#111111] font-medium ">
              Current Address
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 p-3 xl:grid-cols-3 gap-4">
              <Input
                label="Address Line 1"
                {...register("address.current.addressLine1")}
              />
              <Input
                label="Address Line 2"
                {...register("address.current.addressLine2")}
              />
              <Input label="City" {...register("address.current.city")} />
              <Input label="State" {...register("address.current.state")} />
              <Input label="Country" {...register("address.current.country")} />
              <Input label="Pincode" {...register("address.current.pincode")} />
            </div>
          </section>

          {/* ─────────────── Permanent Address ─────────────── */}
          <section>
            <h2 className="p-3 bg-[#f5f6fa] dark:bg-[#111111] font-medium ">
              Permanent Address
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 p-3 xl:grid-cols-3 gap-4">
              <Input
                label="Address Line 1"
                {...register("address.permanent.addressLine1")}
              />
              <Input
                label="Address Line 2"
                {...register("address.permanent.addressLine2")}
              />
              <Input label="City" {...register("address.permanent.city")} />
              <Input label="State" {...register("address.permanent.state")} />
              <Input
                label="Country"
                {...register("address.permanent.country")}
              />
              <Input
                label="Pincode"
                {...register("address.permanent.pincode")}
              />
            </div>
          </section>

          {/* ─────────────── Other Address (Optional) ─────────────── */}
          <section>
            <div className="flex justify-between items-center p-2 bg-[#f5f6fa] dark:bg-[#111111] font-medium ">
              <div className="">Other Address</div>
              <button
                type="button"
                className="px-4 py-1.5 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] cursor-pointer !text-xs transition duration-200 flex gap-2 items-center"
                onClick={() => append({ country: "India" })}
              >
                <IoMdAdd size={16} /> Add Other Address
              </button>
            </div>
            <div className="p-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="relative border p-4 mb-4 rounded pt-9"
                >
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="absolute top-0.5 right-0.5 rounded-full cursor-pointer p-2 hover:bg-red-100"
                  >
                    <RxCross2 className="text-red-400" />
                  </button>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Input
                      label="Address Line 1"
                      {...register(
                        `address.others.${idx}.addressLine1` as const
                      )}
                    />
                    <Input
                      label="Address Line 2"
                      {...register(
                        `address.others.${idx}.addressLine2` as const
                      )}
                    />
                    <Input
                      label="City"
                      {...register(`address.others.${idx}.city` as const)}
                    />
                    <Input
                      label="State"
                      {...register(`address.others.${idx}.state` as const)}
                    />
                    <Input
                      label="Country"
                      {...register(`address.others.${idx}.country` as const)}
                    />
                    <Input
                      label="Pincode"
                      {...register(`address.others.${idx}.pincode` as const)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
