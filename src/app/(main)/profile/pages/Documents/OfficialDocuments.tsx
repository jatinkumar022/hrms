"use client";
import { useEffect, useState } from "react";
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
import { CgMathPlus } from "react-icons/cg";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useForm, useFieldArray } from "react-hook-form";
import {
  fetchOfficialDocuments,
  OfficialDocumentType,
} from "@/redux/slices/officialDocumentsSlice";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import Link from "next/link";

type OfficialDocumentsFormData = {
  documents: OfficialDocumentType[];
};

const docLabel: Record<string, string> = {
  offer: "Offer Letter",
  experience: "Experience Letter",
  salary: "Salary Slip",
  relieving: "Relieving Letter",
  idcard: "Employee ID Card",
};

const labelToKey = (label: string): string =>
  Object.entries(docLabel).find(([, val]) => val === label)?.[0] || label;

export default function OfficialDocuments() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.officialDocuments
  );
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const {
    reset,
    control,
    formState: { isDirty },
  } = useForm<OfficialDocumentsFormData>({
    defaultValues: {
      documents: [],
    },
  });

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "documents",
  });

  useEffect(() => {
    dispatch(fetchOfficialDocuments());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (fetchedData && Array.isArray(fetchedData)) {
      reset({ documents: fetchedData });
    }
    setLoading(false);
  }, [fetchedData, reset]);

  // File upload handler (mock, replace with real upload logic)
  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url; // The public URL returned by your backend
  };

  // Dialog state for add/edit
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: "add" as "add" | "edit",
  });
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  // Open dialog for add
  const openAddDialog = () => {
    setDocType("");
    setDocNumber("");
    setDocFile(null);
    setEditIndex(null);
    setDialogState({ open: true, mode: "add" });
  };

  // Open dialog for edit
  const handleEdit = (index: number) => {
    const doc = fields[index];
    setDocType(labelToKey(doc.name));
    setDocNumber(doc.number);
    setDocFile(null); // No file re-upload for edit
    setEditIndex(index);
    setDialogState({ open: true, mode: "edit" });
  };

  // Handle dialog form submit
  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docType || !docNumber) return;
    let fileUrl = "";
    if (docFile) {
      setFileUploading(true);
      fileUrl = await handleFileUpload(docFile);
      setFileUploading(false);
    }
    const newDoc: OfficialDocumentType = {
      name: docLabel[docType] ?? docType,
      number: docNumber,
      fileUrl,
    };
    if (editIndex !== null) {
      update(editIndex, newDoc);
    } else {
      append(newDoc);
    }
    setDocType("");
    setDocNumber("");
    setDocFile(null);
    setEditIndex(null);
    setDialogState({ open: false, mode: "add" });
  };

  return (
    <div>
      <FullPageLoader show={isLoading || loading || fileUploading} />
      <div className="p-4 border font-medium flex justify-between items-center">
        <div>Official Documents</div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="submit"
              className="bg-sidebar-primary p-1.5 px-4 !text-white !text-sm rounded-xs cursor-pointer backdrop-blur-sm   hover:shadow-[0px_0px_2px_2px_rgba(59,130,246,0.2)]  transition duration-200"
            >
              Save
            </button>
          )}
          <button
            className="bg-sidebar-primary p-1.5  !text-white !text-sm rounded-xs cursor-pointer backdrop-blur-sm   hover:shadow-[0px_0px_2px_2px_rgba(59,130,246,0.2)]  transition duration-200"
            type="button"
            onClick={openAddDialog}
          >
            <CgMathPlus size={20} />
          </button>
        </div>
      </div>
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
            {fields.map((d, i) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-3">{d.name}</td>
                <td className="px-4 py-3">{d.number}</td>
                <td className="px-4 py-3">
                  {d.fileUrl ? (
                    <div className="flex items-center gap-2">
                      {d.fileUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                        <Link
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={d.fileUrl}
                            alt={d.name}
                            className="w-20 h-20 rounded object-cover border hover:scale-150 transition-transform duration-200"
                          />
                        </Link>
                      ) : (
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 underline text-blue-600"
                        >
                          <FaPaperclip />
                          {d.fileUrl.split("/").pop()}
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
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ===== Dialog Form ===== */}
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setDocType("");
            setDocNumber("");
            setDocFile(null);
            setEditIndex(null);
          }
          setDialogState((prev) => ({ ...prev, open }));
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit Document" : "Add Official Document"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDialogSubmit} className="space-y-4">
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
                  setDialogState((prev) => ({ ...prev, open: false }));
                  setEditIndex(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={fileUploading}>
                {editIndex !== null ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
