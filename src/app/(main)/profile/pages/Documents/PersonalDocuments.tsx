"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/meterialInput";
import { Label } from "@/components/ui/label";
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
import { CgMathPlus } from "react-icons/cg";
import ButtonLoader from "@/components/loaders/ButtonLoader";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { DataTable } from "@/components/custom/DataTable";
import { getColumns } from "./personalColumns";
import { useUploader } from "@/hooks/useUploader";

type PersonalDocumentsFormData = {
  documents: PersonalDocumentType[];
};

const docLabel: Record<string, string> = {
  voter: "Voter ID",
  passport: "Passport",
  driving: "Driving License",
};

const labelToKey = (label: string): string =>
  Object.entries(docLabel).find(([, val]) => val === label)?.[0] || label;

export default function PersonalDocuments() {
  const dispatch = useAppDispatch();
  const { data: fetchedData, isLoading } = useAppSelector(
    (state) => state.personalDocuments
  );
  const { isUploading, uploadFile } = useUploader();
  const [loading, setLoading] = useState(true);
  const [dialogErrors, setDialogErrors] = useState<{
    docType?: string;
    docNumber?: string;
    docFile?: string;
  }>({});
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: "add" as "add" | "edit",
  });
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const {
    reset,
    control,
    handleSubmit,
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

  const openAddDialog = () => {
    setDocType("");
    setDocNumber("");
    setDocFile(null);
    setEditIndex(null);
    setDialogErrors({});
    setDialogState({ open: true, mode: "add" });
  };

  const handleEdit = (index: number) => {
    const doc = fields[index];
    setDocType(labelToKey(doc.name));
    setDocNumber(doc.number);
    setDocFile(null);
    setEditIndex(index);
    setDialogErrors({});
    setDialogState({ open: true, mode: "edit" });
  };

  const handleDocTypeChange = (value: string | undefined) => {
    setDocType(value ?? "");
    setDialogErrors((prev) => ({ ...prev, docType: undefined }));
  };
  const handleDocNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocNumber(e.target.value);
    setDialogErrors((prev) => ({ ...prev, docNumber: undefined }));
  };
  const handleDocFileChange = (file: File | null) => {
    setDocFile(file);
    setDialogErrors((prev) => ({ ...prev, docFile: undefined }));
  };

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof dialogErrors = {};
    if (!docType) errors.docType = "Document type is required";
    if (!docNumber) errors.docNumber = "Document number is required";
    if (!docFile) errors.docFile = "Attachment is required";

    setDialogErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let fileUrl = "";
    if (docFile) {
      const uploadResult = await uploadFile(docFile, "personal-documents");
      if (!uploadResult) {
        return; // Hook handles error toasts
      }
      fileUrl = uploadResult.secure_url;
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
    setDialogErrors({});
    setDialogState({ open: false, mode: "add" });
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

  const tableData = useMemo(
    () => fields.map((field, index) => ({ ...field, index })),
    [fields]
  );

  const columns = useMemo(
    () =>
      getColumns({
        handleEdit,
        handleDelete: (index) => remove(index),
      }),
    [handleEdit, remove]
  );

  return (
    <div>
      <FullPageLoader show={isLoading || loading || isUploading} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4 border-b font-medium flex justify-between items-center">
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
        <DataTable columns={columns} data={tableData} />
      </form>
      {/* ====== dialog ====== */}
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setDocType("");
            setDocNumber("");
            setDocFile(null);
            setEditIndex(null);
            setDialogErrors({});
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

          <form className="space-y-6" onSubmit={handleDialogSubmit}>
            <div className="space-y-1">
              <FloatingSelect
                label="Document Type"
                options={[
                  { label: "Voter ID", value: "voter" },
                  { label: "Passport", value: "passport" },
                  { label: "Driving License", value: "driving" },
                ]}
                value={docType}
                onChange={handleDocTypeChange}
              />
              {dialogErrors.docType && (
                <div className="text-xs text-red-500">
                  {dialogErrors.docType}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Input
                label="Document number"
                value={docNumber}
                onChange={handleDocNumberChange}
              />
              {dialogErrors.docNumber && (
                <div className="text-xs text-red-500">
                  {dialogErrors.docNumber}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Attachment</Label>
              <FileUpload file={docFile} onChange={handleDocFileChange} />
              <p className="text-xs text-muted-foreground">
                Supported: JPG, JPEG, PNG, PDF
              </p>
              {dialogErrors.docFile && (
                <div className="text-xs text-red-500">
                  {dialogErrors.docFile}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer !font-normal"
                onClick={() => {
                  setDialogState((prev) => ({ ...prev, open: false }));
                  setEditIndex(null);
                  setDialogErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                variant={"default"}
                type="submit"
                className="bg-sidebar-primary !text-white border border-transparent  hover:!text-sidebar-primary cursor-pointer hover:bg-transparent hover:border-sidebar-primary !font-normal"
                disabled={isUploading}
              >
                {isUploading ? (
                  <ButtonLoader />
                ) : editIndex !== null ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
