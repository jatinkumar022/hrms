"use client";

import Input from "@/components/ui/meterialInput";
import MobileInput from "@/components/ui/mobilenumber";
import { Button } from "@/components/ui/button";
import { FaLinkedin, FaGithub, FaTwitter, FaFacebookF } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";

export default function ContactSocialLinks() {
  return (
    <div className="space-y-8 p-4 bg-white dark:bg-black">
      {/* ─────────────── Contact Info ─────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <MobileInput label="Personal Mobile" />
          <MobileInput label="Emergency Contact" />
          <Input label="Personal Email" type="email" />
          <Input
            label="Official Email"
            type="email"
            value="jatin.r@dvijinfotech.com"
            disabled
          />
        </div>
      </section>

      {/* ─────────────── Address Summary ─────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Address Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Input label="Current Address" />
          <Input label="Permanent Address" />
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
          />
          <Input
            label="GitHub"
            icon={<FaGithub className="text-black" />}
            placeholder="https://github.com/username"
          />
          <Input
            label="Twitter"
            icon={<FaTwitter className="text-blue-400" />}
            placeholder="https://twitter.com/handle"
          />
          <Input
            label="Facebook"
            icon={<FaFacebookF className="text-blue-600" />}
            placeholder="https://facebook.com/username"
          />
        </div>
      </section>

      {/* ─────────────── Add More Links (optional) ─────────────── */}
      <section>
        <Button
          variant="outline"
          className="border-dashed text-blue-600 flex gap-2 items-center"
        >
          <IoMdAdd size={16} />
          Add Another Link
        </Button>
      </section>
    </div>
  );
}
