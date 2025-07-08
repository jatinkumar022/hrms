"use client";
import { Alert, DatePicker } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getColumns, WfhRequestRow } from "./requestsData";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAllWfhRequests,
  updateWfhRequestStatus,
} from "@/redux/slices/wfh/adminWfhSlice";
import { fetchAllUsers } from "@/redux/slices/users/allUsersSlice";
import DatePreset from "@/lib/DatePreset";
import type { DateRange } from "react-day-picker";
import { DataTable } from "../../attendance/components/table/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { getInitials } from "@/lib/getInitials";
import FullPageLoader from "@/components/loaders/FullPageLoader";

const { RangePicker } = DatePicker;

export default function WfhRequestsTable() {
  const dispatch = useAppDispatch();
  const { allWfhRequests, status, error } = useAppSelector(
    (state) => state.adminWfh
  );
  const { users: allUsers } = useAppSelector((state) => state.allUsers);

  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [isActive, setIsActive] = useState<string | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    dispatch(fetchAllWfhRequests());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handlePresetClick = (preset: any) => {
    if (!preset.label || !preset.value) return;
    setIsActive(preset.label);
    setSelectedRange(preset.value);
  };

  const filteredRequests = useMemo(() => {
    if (selectedUser) {
      return allWfhRequests.filter(
        (request) => request.userId._id === selectedUser
      );
    }
    return allWfhRequests;
  }, [allWfhRequests, selectedUser]);
  console.log(filteredRequests);

  const handleApprove = (wfhId: string) => {
    dispatch(updateWfhRequestStatus({ wfhId, status: "approved" }));
  };

  const handleReject = (wfhId: string) => {
    dispatch(updateWfhRequestStatus({ wfhId, status: "rejected" }));
  };

  const handleView = (row: WfhRequestRow) => {
    console.log("View WFH Request:", row);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onApprove: handleApprove,
        onReject: handleReject,
        onView: handleView,
      }),
    []
  );

  if (status === "failed") {
    return (
      <Alert
        message="Error"
        description={error || "Failed to load WFH requests"}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <FullPageLoader show={status === "loading"} />
      <div className="flex justify-between p-3 border-b items-center">
        <div className="font-medium">WFH Requests</div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedUser || "all"}
            onValueChange={(value) =>
              setSelectedUser(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-8 w-48 text-xs">
              <SelectValue placeholder="Filter by User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {allUsers.map((user) => {
                const fullName = [user.firstName, user.lastName]
                  .filter(Boolean)
                  .join(" ");
                const fallbackName = fullName || user.username;

                return (
                  <SelectItem key={user._id} value={user._id}>
                    <div className="flex items-center gap-2">
                      {user.profileImage ? (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback>
                            {getInitials(fallbackName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <InitialsAvatar
                          name={fallbackName}
                          size={20}
                          className="text-xs"
                        />
                      )}
                      <span>{user.username}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <RangePicker
            className="custom-range-picker"
            format="M-DD-YYYY"
            renderExtraFooter={() => (
              <DatePreset
                isActive={isActive}
                setIsActive={setIsActive}
                selectedRange={selectedRange}
                setSelectedRange={setSelectedRange}
                handlePresetClick={handlePresetClick}
              />
            )}
          />
        </div>
      </div>
      <div>
        <DataTable
          columns={columns}
          data={filteredRequests}
          meta={{
            onApprove: handleApprove,
            onReject: handleReject,
            onView: handleView,
          }}
        />
      </div>
    </div>
  );
}
