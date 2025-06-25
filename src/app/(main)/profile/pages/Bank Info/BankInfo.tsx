"use client";

import Input from "@/components/ui/meterialInput";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function BankDetails() {
  const [hasJointAccount, setHasJointAccount] = useState(false);

  return (
    <div className="space-y-8 p-4 bg-white ">
      {/* ────────────────── Primary Bank Detail ────────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Primary Bank Detail</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Bank Name" />
          <Input label="Account Number" />
          <Input label="IFSC Code" />
          <Input label="Branch Name" />
          <Input label="Account Holder Name" />
          <Input label="Account Type" />
        </div>
      </section>

      {/* ────────────────── Joint Account Detail ────────────────── */}
      <section>
        <div className="flex items-center gap-4 mb-2">
          <Checkbox
            id="joint-account"
            checked={hasJointAccount}
            onCheckedChange={(val) => setHasJointAccount(Boolean(val))}
          />
          <label
            htmlFor="joint-account"
            className="text-sm text-muted-foreground"
          >
            Add Joint Account Holder
          </label>
        </div>

        {hasJointAccount && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Joint Holder Name" />
            <Input label="Relationship" />
            <Input label="Joint Holder Account Number" />
            <Input label="Joint Holder IFSC Code" />
          </div>
        )}
      </section>

      {/* ──────────────── UPI / Wallet Section ──────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">UPI / Wallet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="UPI ID" />
          <Input label="Wallet Name" />
        </div>
      </section>

      <div className="pt-4">
        <Button>Save Bank Details</Button>
      </div>
    </div>
  );
}
