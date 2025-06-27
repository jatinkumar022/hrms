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
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useForm, useFieldArray } from "react-hook-form";
import {
  fetchPersonalDocuments,
  updatePersonalDocuments,
  PersonalDocumentType,
} from "@/redux/slices/personalDocumentsSlice";
import FullPageLoader from "@/components/loaders/FullPageLoader";
import { toast } from "sonner";

import Link from "next/link";
import { CgMathPlus } from "react-icons/cg";

type PersonalDocumentsFormData = {
  documents: PersonalDocumentType[];
};

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

export default function PersonalDocuments() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.personalDocuments
  );
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const {
    handleSubmit,
    reset,
    control,
    formState: { isDirty },
  } = useForm<PersonalDocumentsFormData>({
    defaultValues: {
      documents: [],
    },
  });

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "documents",
  });

  useEffect(() => {
    dispatch(fetchPersonalDocuments());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (fetchedData && Array.isArray(fetchedData)) {
      reset({ documents: fetchedData });
    }
    setLoading(false);
  }, [fetchedData, reset]);

  // File upload handler
  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  const onSubmit = async (formData: PersonalDocumentsFormData) => {
    setLoading(true);
    const toastId = toast.loading("Saving...");
    try {
      await dispatch(updatePersonalDocuments(formData.documents)).unwrap();
      toast.success("Saved successfully", { id: toastId });
      dispatch(fetchPersonalDocuments());
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
    setLoading(false);
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
    const newDoc: PersonalDocumentType = {
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
        <div>Personal Documents</div>
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
      {/* ====== dialog ====== */}
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
              {editIndex !== null ? "Edit Document" : "Add New Document"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleDialogSubmit}>
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
      {isDirty && (
        <div className="pt-4">
          <Button onClick={handleSubmit(onSubmit)}>Save All Changes</Button>
        </div>
      )}
    </div>
  );
}
