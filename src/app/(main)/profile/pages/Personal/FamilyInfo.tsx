"use client";
import { useState } from "react";
import Input from "@/components/ui/meterialInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import MobileInput from "@/components/ui/mobilenumber";
import { DatePickerWithLabel } from "@/components/ui/datepicker";
import { FloatingSelect } from "@/components/ui/floatingSelect";

export default function FamilyInfo() {
  // state that tracks whether parents are marked “late”
  const [fatherLate, setFatherLate] = useState(false);
  const [motherLate, setMotherLate] = useState(false);

  return (
    <div className="space-y-8 p-4 bg-white rounded-md shadow-sm">
      {/* ───────────────── Parents Detail ───────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Parents Detail</h2>

        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-4">
            <label className="font-medium">Father Detail</label>
            <div className="flex items-center gap-1">
              <Checkbox
                id="father-late"
                checked={fatherLate}
                // shadcn/ui checkboxes emit boolean | "indeterminate"
                onCheckedChange={(v) => setFatherLate(Boolean(v))}
              />
              <label
                htmlFor="father-late"
                className="text-sm text-muted-foreground"
              >
                Late
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name always shown */}
            <Input label="Name" defaultValue="Chandhubhai" />

            {/* Rest hidden if 'late' is true */}
            {!fatherLate && (
              <>
                <div className="flex justify-center items-baseline-last">
                  <FloatingSelect
                    label="Gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                    ]}
                  />
                </div>

                <DatePickerWithLabel
                  label="Date of Birth"
                  onChange={(val) => console.log(val)}
                />

                <Input label="Occupation" defaultValue="Farming" />
                <MobileInput label="Mobile Number" id="mobile" />
                <Input label="Aadhaar Card (UID)" />
              </>
            )}
          </div>
        </div>

        {/* Mother Detail */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="font-medium">Mother Detail</label>
            <div className="flex items-center gap-1">
              <Checkbox
                id="mother-late"
                checked={motherLate}
                onCheckedChange={(v) => setMotherLate(Boolean(v))}
              />
              <label
                htmlFor="mother-late"
                className="text-sm text-muted-foreground"
              >
                Late
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name always shown */}
            <Input label="Name" />

            {/* Rest hidden if 'late' is true */}
            {!motherLate && (
              <>
                <div className="flex justify-center items-baseline-last">
                  <FloatingSelect
                    label="Gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                    ]}
                  />
                </div>

                <DatePickerWithLabel
                  label="Date of Birth"
                  onChange={(val) => console.log(val)}
                />
                <Input label="Occupation" />
                <MobileInput label="Mobile Number" id="mobile" />
                <Input label="Aadhaar Card (UID)" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────── Other Members Detail ─────────────── */}
      <section>
        <h2 className="font-semibold text-lg mb-4">Other Members Detail</h2>
        <Button variant="outline" className="border-dashed text-blue-600">
          + Add New Member
        </Button>
      </section>

      {/* ─────────────────── Nominee ──────────────────── */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Nominee</h2>
          <span className="text-muted-foreground text-sm">🔄</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Nominee Name</th>
                <th className="p-2">Nominee For</th>
                <th className="p-2">Nominee Relation</th>
                <th className="p-2">Percentage Share(%)</th>
                <th className="p-2">Minor</th>
                <th className="p-2">Note</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-4 text-muted-foreground"
                >
                  <Button
                    variant="outline"
                    className="border-dashed text-blue-600"
                  >
                    + Add New
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ────────────────── Dependent ────────────────── */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Dependent</h2>
          <span className="text-muted-foreground text-sm">🔄</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Dependent Name</th>
                <th className="p-2">Dependent Relation</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  <Button
                    variant="outline"
                    className="border-dashed text-blue-600"
                  >
                    + Add New
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
