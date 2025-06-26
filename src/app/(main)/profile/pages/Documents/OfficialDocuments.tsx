"use client";
import { useState } from "react";
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
export default function OfficialDocuments({
  dialogOpen,
  setDialogOpen,
}: Props) {
  const [documents, setDocuments] = useState<
    { name: string; number: string; file: File | null }[]
  >([]);
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const docLabel: Record<string, string> = {
    offer: "Offer Letter",
    experience: "Experience Letter",
    salary: "Salary Slip",
    relieving: "Relieving Letter",
    idcard: "Employee ID Card",
  };
  const labelToKey = (label: string): string =>
    Object.entries(docLabel).find(([, val]) => val === label)?.[0] || label;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType || !docNumber) return;
    const newDoc = {
      name: docLabel[docType] ?? docType,
      number: docNumber,
      file: docFile,
    };
    if (editIndex !== null) {
      const updated = [...documents];
      updated[editIndex] = newDoc;
      setDocuments(updated);
    } else {
      setDocuments((prev) => [...prev, newDoc]);
    }
    setDocType("");
    setDocNumber("");
    setDocFile(null);
    setEditIndex(null);
    setDialogOpen?.(false);
  };
  /** Open edit dialog with values */
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
      {/* ===== Table ===== */}
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="font-normal">
            <tr className="bg-[#fafafa]">
              <th className="px-4 py-3 text-left font-medium">Document Name</th>
              <th className="px-4 py-3 text-left font-medium">Reference</th>
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
                        <a
                          href={URL.createObjectURL(d.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={URL.createObjectURL(d.file)}
                            alt={d.file.name}
                            className="w-10 h-10 rounded object-cover border"
                          />
                        </a>
                      ) : (
                        <a
                          href={URL.createObjectURL(d.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 underline text-blue-600"
                        >
                          <FaPaperclip />
                          {d.file.name}
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
      {/* ===== Dialog Form ===== */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
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
              {editIndex !== null ? "Edit Document" : "Add Official Document"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offer">Offer Letter</SelectItem>
                  <SelectItem value="experience">Experience Letter</SelectItem>
                  <SelectItem value="salary">Salary Slip</SelectItem>
                  <SelectItem value="relieving">Relieving Letter</SelectItem>
                  <SelectItem value="idcard">Employee ID Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Reference / Number</Label>
              <Input
                label="Reference"
                value={docNumber}
                required
                onChange={(e) => setDocNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Attachment</Label>
              <FileUpload file={docFile} onChange={setDocFile} />
              <p className="text-xs text-muted-foreground">
                Supported: JPG, PNG, PDF
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
