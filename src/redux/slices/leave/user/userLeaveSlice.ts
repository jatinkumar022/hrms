import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface LeaveBalance {
  casualLeave: { balance: number; booked: number };
  sickLeave: { balance: number; booked: number };
  earnedLeave: { balance: number; booked: number };
  leaveWithoutPay: { balance: number; booked: number };
}

interface MyLeaveRequest {
  _id: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  rejectionReason?: string;
  type: string;
  leaveDayType: "Full Day" | "Half Day" | "Hourly";
  halfDayTime?: "First Half" | "Second Half";
  numberOfDays: number;
  createdAt: string;
  updatedAt: string;
}

interface UserLeaveState {
  myLeaveRequests: MyLeaveRequest[];
  myLeaveBalance: LeaveBalance | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserLeaveState = {
  myLeaveRequests: [],
  myLeaveBalance: null,
  status: "idle",
  error: null,
};

// Async Thunks for User Leave Actions
export const submitLeaveRequest = createAsyncThunk(
  "userLeave/submitLeaveRequest",
  async (
    leaveData: {
      startDate: string;
      endDate: string;
      numberOfDays: number;
      leaveDayType: string;
      type: string;
      duration?: string;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        "/api/leave/user/request/apply",
        leaveData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelLeaveRequest = createAsyncThunk(
  "userLeave/cancelLeaveRequest",
  async (leaveId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `/api/leave/user/request/cancel/${leaveId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMyLeaveRequests = createAsyncThunk(
  "userLeave/fetchMyLeaveRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/leave/user/request/my-requests");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserLeaveBalance = createAsyncThunk(
  "userLeave/fetchUserLeaveBalance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/leave/user/balance");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userLeaveSlice = createSlice({
  name: "userLeave",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // submitLeaveRequest
      .addCase(submitLeaveRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitLeaveRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myLeaveRequests.push(action.payload.leave);
      })
      .addCase(submitLeaveRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // cancelLeaveRequest
      .addCase(cancelLeaveRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(cancelLeaveRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myLeaveRequests = state.myLeaveRequests.filter(
          (req) => req._id !== action.meta.arg
        );
      })
      .addCase(cancelLeaveRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // fetchMyLeaveRequests
      .addCase(fetchMyLeaveRequests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyLeaveRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myLeaveRequests = action.payload.leaveRequests;
      })
      .addCase(fetchMyLeaveRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // fetchUserLeaveBalance
      .addCase(fetchUserLeaveBalance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserLeaveBalance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myLeaveBalance = action.payload.leaveBalance;
      })
      .addCase(fetchUserLeaveBalance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default userLeaveSlice.reducer;
