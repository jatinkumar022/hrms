import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface LeaveBalance {
  casualLeave: { balance: number; booked: number; used: number };
  sickLeave: { balance: number; booked: number; used: number };
  earnedLeave: { balance: number; booked: number; used: number };
  leaveWithoutPay: { balance: number; booked: number; used: number };
}

interface MyLeaveRequest {
  _id: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  rejectionReason?: string;
  type: string;
  days: {
    date: string;
    dayType: "Full Day" | "First Half" | "Second Half";
  }[];
  numberOfDays: number;
  createdAt: string;
  updatedAt: string;
}

interface UpcomingLeave {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  startDate: string;
  endDate: string;
  numberOfDays: number;
  days: {
    date: string;
    dayType: "Full Day" | "First Half" | "Second Half";
  }[];
  type: "LWP" | "Earned Leave" | "Sick Leave" | "Casual Leave";
  reason: string;
  status: "pending" | "approved" | "rejected";
  attachment?: string;
}
interface UserLeaveState {
  myLeaveRequests: MyLeaveRequest[];
  myLeaveBalance: LeaveBalance | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  upcomingLeaves: UpcomingLeave[];
  upcomingLeavesStatus: "idle" | "loading" | "succeeded" | "failed";
  upcomingLeavesError: string | null;
}

const initialState: UserLeaveState = {
  myLeaveRequests: [],
  myLeaveBalance: null,
  status: "idle",
  error: null,
  upcomingLeaves: [],
  upcomingLeavesStatus: "idle",
  upcomingLeavesError: null,
};

// Define the type for the leave request payload
export interface SubmitLeaveRequestPayload {
  startDate: string;
  endDate: string;
  numberOfDays: number;
  days: {
    date: string;
    dayType: "Full Day" | "First Half" | "Second Half";
  }[];
  type: string;
  reason: string;
  attachment?: string;
}

// Async Thunks for User Leave Actions
export const submitLeaveRequest = createAsyncThunk(
  "userLeave/submitLeaveRequest",
  async (leaveData: SubmitLeaveRequestPayload, { rejectWithValue }) => {
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

export const fetchUpcomingLeaves = createAsyncThunk(
  "userLeave/fetchUpcomingLeaves",
  async () => {
    const response = await axios.get("/api/leave/upcoming");
    return response.data;
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
      })
      .addCase(fetchUpcomingLeaves.pending, (state) => {
        state.upcomingLeavesStatus = "loading";
      })
      .addCase(fetchUpcomingLeaves.fulfilled, (state, action) => {
        state.upcomingLeavesStatus = "succeeded";
        state.upcomingLeaves = action.payload;
      })
      .addCase(fetchUpcomingLeaves.rejected, (state, action) => {
        state.upcomingLeavesStatus = "failed";
        state.upcomingLeavesError =
          action.error.message || "Failed to fetch upcoming leaves";
      });
  },
});

export default userLeaveSlice.reducer;
