"use client";

import Input from "@/components/ui/meterialInput";
import MobileInput from "@/components/ui/mobilenumber";
import { Button } from "@/components/ui/button";
import { FaLinkedin, FaGithub, FaTwitter, FaFacebookF } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
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
    <div className="space-y-8 p-4 bg-white dark:bg-black">
      <FullPageLoader show={isLoading || loading} />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ─────────────── Contact Info ─────────────── */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
          <h2 className="font-semibold text-lg mb-4">Address Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Input label="Current Address" {...register("currentAddress")} />
            <Input
              label="Permanent Address"
              {...register("permanentAddress")}
            />
          </div>
        </section>

        {/* ─────────────── Social Links ─────────────── */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

        {/* ─────────────── Add More Links (optional) ─────────────── */}
        <section>
          <Button
            variant="outline"
            className="border-dashed text-blue-600 flex gap-2 items-center"
            type="button"
            // You can implement dynamic add here if you want, but keeping as static for now
          >
            <IoMdAdd size={16} />
            Add Another Link
          </Button>
        </section>

        {isDirty && (
          <Button type="submit" className="mt-6" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </form>
    </div>
  );
}
