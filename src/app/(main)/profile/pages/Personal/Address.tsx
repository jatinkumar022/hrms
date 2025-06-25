"use client";

import Input from "@/components/ui/meterialInput";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import { useState } from "react";

export default function Address() {
  const [showOther, setShowOther] = useState(false);

  return (
    <div className="space-y-8 p-4 bg-white dark:bg-black ">
      {/* ─────────────── Current Address ─────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Current Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Input label="Address Line 1" />
          <Input label="Address Line 2" />
          <Input label="City" />
          <Input label="State" />
          <Input label="Country" value="India" />
          <Input label="Pincode" />
        </div>
      </section>

      {/* ─────────────── Permanent Address ─────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Permanent Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Input label="Address Line 1" />
          <Input label="Address Line 2" />
          <Input label="City" />
          <Input label="State" />
          <Input label="Country" value="India" />
          <Input label="Pincode" />
        </div>
      </section>

      {/* ─────────────── Other Address (Optional) ─────────────── */}
      {showOther ? (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Other Address</h2>
            <span
              onClick={() => setShowOther(false)}
              className="text-sm text-red-500 cursor-pointer"
            >
              ✕ Remove
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Input label="Address Line 1" />
            <Input label="Address Line 2" />
            <Input label="City" />
            <Input label="State" />
            <Input label="Country" value="India" />
            <Input label="Pincode" />
          </div>
        </section>
      ) : (
        <Button
          variant="outline"
          className="border-dashed text-blue-600 flex gap-2 items-center"
          onClick={() => setShowOther(true)}
        >
          <IoMdAdd size={16} />
          Add Other Address
        </Button>
      )}
    </div>
  );
}
