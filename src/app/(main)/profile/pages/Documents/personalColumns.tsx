"use client";
import { ColumnDef } from "@tanstack/react-table";
import { PersonalDocumentType } from "@/redux/slices/personalDocumentsSlice";
import Link from "next/link";
import { FaEdit, FaPaperclip } from "react-icons/fa";

type PersonalDocumentsTableProps = {
  handleEdit: (index: number) => void;
  handleDelete: (index: number) => void;
};

export const getColumns = ({
  handleEdit,
  handleDelete,
}: PersonalDocumentsTableProps): ColumnDef<
  PersonalDocumentType & { index: number }
>[] => [
  {
    accessorKey: "name",
    header: "Document Name",
  },
  {
    accessorKey: "number",
    header: "Number",
  },
  {
    accessorKey: "fileUrl",
    header: "Attachment",
    cell: ({ row }) => {
      const { fileUrl, name } = row.original;
      if (!fileUrl) return "-";
      return fileUrl.match(/\.(jpg|jpeg|png)$/i) ? (
        <Link
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 p-1 border rounded-sm inline-block"
        >
          <img
            src={fileUrl}
            alt={name}
            className="object-cover h-full w-full hover:scale-105 transition-transform duration-200"
          />
        </Link>
      ) : (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline text-blue-600"
        >
          <FaPaperclip />
          {fileUrl.split("/").pop()}
        </a>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { index } = row.original;
      return (
        <div className="flex items-center gap-3">
          <div
            onClick={() => handleEdit(index)}
            className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FaEdit size={14} />
            Edit
          </div>
          <div
            onClick={() => handleDelete(index)}
            className="ml-2 text-red-500 hover:underline cursor-pointer"
          >
            Delete
          </div>
        </div>
      );
    },
  },
];
