"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/meterialInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaPaperclip, FaEdit } from "react-icons/fa";
import FileUpload from "@/components/ui/FileUpload";
import Image from "next/image";

type Props = {
  dialogOpen?: boolean;
  setDialogOpen?: (open: boolean) => void;
};

export default function PersonalDocuments({
  dialogOpen,
  setDialogOpen,
}: Props) {
  /** master array */
  const [documents, setDocuments] = useState<
    { name: string; number: string; file: File | null }[]
  >([
    {
      name: "Aadhaar Card (UID)",
      number: "408677155875",
      file: null,
    },
    {
      name: "PAN Card",
      number: "FIUPR6684C",
      file: null,
    },
  ]);

  /** form state */
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  // Track if we’re editing or adding
  const [editIndex, setEditIndex] = useState<number | null>(null);

  /** log whenever documents change */
  useEffect(() => {
    console.log("Documents:", documents);
  }, [documents]);

  /* helper map */
  const docLabel: Record<string, string> = {
    voter: "Voter ID",
    passport: "Passport",
    driving: "Driving License",
  };

  const labelToKey = (label: string): string => {
    return (
      Object.entries(docLabel).find(([, val]) => val === label)?.[0] || label
    );
  };

  /** add or update doc */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType || !docNumber) return;

    const newDoc = {
      name: docLabel[docType] ?? docType,
      number: docNumber,
      file: docFile,
    };

    if (editIndex !== null) {
      // Update existing
      const updatedDocs = [...documents];
      updatedDocs[editIndex] = newDoc;
      setDocuments(updatedDocs);
    } else {
      // Add new
      setDocuments((prev) => [...prev, newDoc]);
    }

    // reset form
    setDocType("");
    setDocNumber("");
    setDocFile(null);
    setEditIndex(null);
    setDialogOpen?.(false);
  };

  /** open edit dialog with values */
  const handleEdit = (index: number) => {
    const doc = documents[index];
    setDocType(labelToKey(doc.name));
    setDocNumber(doc.number);
    setDocFile(doc.file);
    setEditIndex(index);
    setDialogOpen?.(true);
  };

  return (
    <div>
      {/* ====== table ====== */}
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="font-normal">
            <tr className="bg-[#fafafa]">
              <th className="px-4 py-3 text-left font-medium">Document Name</th>
              <th className="px-4 py-3 text-left font-medium">Number</th>
              <th className="px-4 py-3 text-left font-medium">Attachment</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{d.name}</td>
                <td className="px-4 py-3">{d.number}</td>
                <td className="px-4 py-3">
                  {d.file ? (
                    <div className="flex items-center gap-2">
                      {d.file.type.startsWith("image/") ? (
                        <a href={URL.createObjectURL(d.file)} target="_blank">
                          <Image
                            src={URL.createObjectURL(d.file)}
                            alt={d.file.name}
                            className="w-10 h-10 rounded object-cover border"
                          />
                        </a>
                      ) : (
                        <a
                          className="inline-flex items-center gap-1 underline text-blue-600"
                          href={URL.createObjectURL(d.file)}
                          target="_blank"
                        >
                          <FaPaperclip /> {d.file.name}
                        </a>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(i)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FaEdit size={14} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====== dialog ====== */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset form if closing
            setDocType("");
            setDocNumber("");
            setDocFile(null);
            setEditIndex(null);
          }
          setDialogOpen?.(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit Document" : "Add New Document"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voter">Voter ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Document Number</Label>
              <Input
                label="Document number"
                value={docNumber}
                required
                onChange={(e) => setDocNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Attachment</Label>
              <FileUpload file={docFile} onChange={setDocFile} />
              <p className="text-xs text-muted-foreground">
                Supported: JPG, JPEG, PNG, PDF
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen?.(false);
                  setEditIndex(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editIndex !== null ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
