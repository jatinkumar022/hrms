"use client";
import Input from "@/components/ui/meterialInput";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useForm, useFieldArray } from "react-hook-form";
import {
  fetchBankInfo,
  updateBankInfo,
  BankAccountType,
  UpiWalletType,
} from "@/redux/slices/bankInfoSlice";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";
import { IoMdAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

interface BankFormData {
  bank: {
    primary: BankAccountType;
    others: BankAccountType[];
    upiWallets?: UpiWalletType[];
  };
}

export default function BankDetails() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.bankInfo
  );
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<BankFormData>({
    defaultValues: {
      bank: {
        primary: {},
        others: [{}],
        upiWallets: [{}],
      },
    },
  });

  const {
    fields: otherFields,
    append: appendOther,
    remove: removeOther,
  } = useFieldArray({
    control,
    name: "bank.others",
  });

  useEffect(() => {
    dispatch(fetchBankInfo());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (fetchedData) {
      reset({
        bank: {
          primary: fetchedData.primary || {},
          others: fetchedData.others?.length ? fetchedData.others : [{}],
          upiWallets: fetchedData.upiWallets?.length
            ? fetchedData.upiWallets
            : [{}],
        },
      });
    }
    setLoading(false);
  }, [fetchedData, reset]);

  const onSubmit = async (formData: BankFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updateBankInfo(formData.bank)).unwrap();
      toast.success("Saved successfully", { id: toastId });
      dispatch(fetchBankInfo());
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
          <div className="text-lg font-medium">Bank Info</div>
          {isDirty && (
            <button
              type="submit"
              className="bg-sidebar-primary p-1.5 px-4 !text-white !text-sm rounded-xs cursor-pointer backdrop-blur-sm   hover:shadow-[0px_0px_2px_2px_rgba(59,130,246,0.2)]  transition duration-200"
            >
              Save
            </button>
          )}
        </div>
        <div className=" bg-white dark:bg-black  max-h-screen  overflow-y-auto pb-[250px]">
          <h2 className=" p-2 px-3 font-semibold text-lg  bg-[#f5f6fa]">
            Primary Bank Detail
          </h2>
          <section className=" py-4 px-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              <Input label="Bank Name" {...register("bank.primary.bankName")} />
              <Input
                label="Account Number"
                {...register("bank.primary.accountNumber")}
              />
              <Input label="IFSC Code" {...register("bank.primary.ifscCode")} />
              <Input
                label="Branch Name"
                {...register("bank.primary.branchName")}
              />
              <Input
                label="Account Holder Name"
                {...register("bank.primary.accountHolder")}
              />
              <Input
                label="Account Type"
                {...register("bank.primary.accountType")}
              />
            </div>
          </section>

          {/* ──────────────── Other Bank Accounts ──────────────── */}
          <section>
            <div className="flex justify-between items-center p-2 px-3 font-semibold text-lg !mb-5 bg-[#f5f6fa] ">
              <span className="font-medium text-lg">Other Bank Accounts</span>
              <button
                className="px-4 py-1.5 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] cursor-pointer !text-xs transition duration-200 flex items-center gap-2"
                onClick={() => appendOther({})}
              >
                <IoMdAdd size={16} /> Add Other Account
              </button>
            </div>
            {otherFields.map((field, idx) => (
              <div
                key={field.id}
                className="relative border m-3 p-4 mb-4 pt-8 rounded"
              >
                {otherFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOther(idx)}
                    className="absolute top-0.5 right-0.5 rounded-full cursor-pointer p-1.5 hover:bg-red-100"
                  >
                    <RxCross2 className="text-red-400" />
                  </button>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3  gap-4">
                  <Input
                    label="Bank Name"
                    {...register(`bank.others.${idx}.bankName` as const)}
                  />
                  <Input
                    label="Account Number"
                    {...register(`bank.others.${idx}.accountNumber` as const)}
                  />
                  <Input
                    label="IFSC Code"
                    {...register(`bank.others.${idx}.ifscCode` as const)}
                  />
                  <Input
                    label="Branch Name"
                    {...register(`bank.others.${idx}.branchName` as const)}
                  />
                  <Input
                    label="Account Holder Name"
                    {...register(`bank.others.${idx}.accountHolder` as const)}
                  />
                  <Input
                    label="Account Type"
                    {...register(`bank.others.${idx}.accountType` as const)}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* ──────────────── UPI / Wallet Section ──────────────── */}
          <section>
            <h2 className=" p-2 px-3 font-semibold text-lg !mb-5 bg-[#f5f6fa]">
              UPI / Wallet
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3  gap-4 p-3">
              <Input label="UPI ID" {...register("bank.upiWallets.0.upiId")} />
              <Input
                label="Wallet Name"
                {...register("bank.upiWallets.0.walletName")}
              />
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
