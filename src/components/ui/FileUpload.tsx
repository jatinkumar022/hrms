"use client";
import { useRef, useEffect, useMemo } from "react";
import { Button } from "./button";
import { FaFileUpload } from "react-icons/fa";
import { X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  label?: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

export default function FileUpload({ label, file, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-1">
      {label ? <span className="font-medium text-sm">{label}</span> : ""}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <FaFileUpload />
          {file ? "Change File" : "Upload File"}
        </Button>

        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {file && previewUrl && (
        <div className="text-sm text-muted-foreground truncate mt-1">
          <span className="block mb-1">{file.name}</span>
          {file.type.startsWith("image/") ? (
            <Image
              key={previewUrl}
              src={previewUrl}
              alt="Preview"
              className="w-16 h-auto rounded-md border"
            />
          ) : (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Preview Document
            </a>
          )}
        </div>
      )}
    </div>
  );
}
