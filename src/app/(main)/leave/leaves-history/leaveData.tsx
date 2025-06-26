// leave-data.ts
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { FaEye, FaPen, FaClockRotateLeft } from "react-icons/fa6";

// 1. Type
export interface LeaveRow {
  id: number;
  type: string;
  from: string;
  to: string;
  days: string;
  added: string;
  reason: string;
  actionBy: string;
  status: "Approved" | "Pending" | "Rejected";
}

// 2. Sample Data
export const leaveRows: LeaveRow[] = [
  {
    id: 1,
    type: "Casual Leave",
    from: "Mon 13 Jan, 2025",
    to: "Mon 13 Jan, 2025",
    days: "1",
    added: "Wed 08 Jan, 2025",
    reason: "I am writing to request casual leave for personal work.",
    actionBy: "Payal Parmar\nJan 09, 2025, 09:46 AM",
    status: "Approved",
  },
  // ...rest of the entries...
];

// 3. Column Definitions
export const leaveColumns: ColumnDef<LeaveRow>[] = [
  {
    header: "Leave Type",
    accessorKey: "type",
  },
  {
    header: "From",
    accessorKey: "from",
  },
  {
    header: "To",
    accessorKey: "to",
  },
  {
    header: "No. Of Days/Hours",
    accessorKey: "days",
    cell: ({ getValue }) => (
      <span className="text-blue-600 cursor-pointer">
        {getValue() as string}
      </span>
    ),
  },
  {
    header: "Added Date",
    accessorKey: "added",
  },
  {
    header: "Reason",
    accessorKey: "reason",
    cell: ({ getValue }) => {
      const txt = getValue() as string;
      return (
        <span>
          {txt.slice(0, 45)}
          {txt.length > 45 && (
            <span className="text-blue-600 pl-1">...More</span>
          )}
        </span>
      );
    },
  },
  {
    header: "Action By",
    accessorKey: "actionBy",
    cell: ({ getValue }) => {
      const [name, dt] = (getValue() as string).split("\n");
      return (
        <div>
          <div>{name}</div>
          <div className="text-muted-foreground text-[10px]">{dt}</div>
        </div>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => (
      <Badge variant="default" className="capitalize">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex gap-2 justify-end">
        <FaClockRotateLeft className="text-blue-500 cursor-pointer" />
        <FaPen className="text-blue-500 cursor-pointer" />
        <FaEye className="text-gray-600 cursor-pointer" />
      </div>
    ),
  },
];
