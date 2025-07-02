"use client";

import Input from "@/components/ui/meterialInput";
import MobileInput from "@/components/ui/mobilenumber";
import { FaLinkedin, FaGithub, FaTwitter, FaFacebookF } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchContactSocialLinks,
  updateContactSocialLinks,
} from "@/redux/slices/contactSocialLinksSlice";
import { useEffect, useState } from "react";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";

interface ContactFormData {
  personalMobile: string;
  emergencyContact: string;
  personalEmail: string;
  officialEmail: string;
  currentAddress: string;
  permanentAddress: string;
  linkedin: string;
  github: string;
  twitter: string;
  facebook: string;
}

export default function ContactSocialLinks() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.contactSocialLinks
  );
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ContactFormData>({
    defaultValues: {
      personalMobile: "",
      emergencyContact: "",
      personalEmail: "",
      officialEmail: "",
      currentAddress: "",
      permanentAddress: "",
      linkedin: "",
      github: "",
      twitter: "",
      facebook: "",
    },
  });

  useEffect(() => {
    dispatch(fetchContactSocialLinks());
  }, [dispatch]);

  useEffect(() => {
    if (fetchedData && typeof fetchedData === "object") {
      reset({
        personalMobile: fetchedData.personalMobile || "",
        emergencyContact: fetchedData.emergencyContact || "",
        personalEmail: fetchedData.personalEmail || "",
        officialEmail: fetchedData.officialEmail || "",
        currentAddress: fetchedData.currentAddress || "",
        permanentAddress: fetchedData.permanentAddress || "",
        linkedin: fetchedData.linkedin || "",
        github: fetchedData.github || "",
        twitter: fetchedData.twitter || "",
        facebook: fetchedData.facebook || "",
      });
    }
  }, [fetchedData, reset]);

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updateContactSocialLinks(data)).unwrap();
      toast.success("Saved successfully", { id: toastId });
      dispatch(fetchContactSocialLinks());
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="">
      <FullPageLoader show={isLoading || loading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-3 items-center border-b font-medium flex justify-between sticky top-0 w-full">
          <div className="text-base md:text-lg font-medium">
            Contact & Social Links
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
        <div className="font-medium bg-white dark:bg-black  max-h-screen  overflow-y-auto pb-[250px]">
          {/* ─────────────── Contact Info ─────────────── */}
          <section>
            <h2 className=" p-3 bg-[#f5f6fa] font-medium ">
              Contact Information
            </h2>
            <div className="p-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              <MobileInput
                label="Personal Mobile"
                id="personal"
                {...register("personalMobile")}
              />
              <MobileInput
                label="Emergency Contact"
                id="emergency"
                {...register("emergencyContact")}
              />
              <Input
                label="Personal Email"
                type="email"
                {...register("personalEmail")}
              />
              <Input
                label="Official Email"
                type="email"
                {...register("officialEmail")}
              />
            </div>
          </section>

          {/* ─────────────── Address Summary ─────────────── */}
          <section>
            <h2 className="!mt-5  p-3 bg-[#f5f6fa] font-medium">
              Address Summary
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 p-3 xl:grid-cols-3 gap-5">
              <Input label="Current Address" {...register("currentAddress")} />
              <Input
                label="Permanent Address"
                {...register("permanentAddress")}
              />
            </div>
          </section>

          {/* ─────────────── Social Links ─────────────── */}
          <section>
            <h2 className="!mt-5 p-3 bg-[#f5f6fa] font-medium">
              Social Media Links
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 p-3 xl:grid-cols-3 gap-5">
              <Input
                label="LinkedIn"
                icon={<FaLinkedin className="text-blue-600" />}
                placeholder="https://linkedin.com/in/your-profile"
                {...register("linkedin")}
              />
              <Input
                label="GitHub"
                icon={<FaGithub className="text-black" />}
                placeholder="https://github.com/username"
                {...register("github")}
              />
              <Input
                label="Twitter"
                icon={<FaTwitter className="text-blue-400" />}
                placeholder="https://twitter.com/handle"
                {...register("twitter")}
              />
              <Input
                label="Facebook"
                icon={<FaFacebookF className="text-blue-600" />}
                placeholder="https://facebook.com/username"
                {...register("facebook")}
              />
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
