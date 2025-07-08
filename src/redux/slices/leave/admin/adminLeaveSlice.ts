import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface LeaveRequest {
  _id: string;
  userId: { _id: string; username: string; profileImage?: string };
  approvedBy?: { username: string };
  startDate: string;
  endDate: string;
  numberOfDays: number;
  leaveDayType: "Full Day" | "Half Day" | "Hourly";
  halfDayTime?: "First Half" | "Second Half";
  type: string;
  duration?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface LeaveBalance {
  _id: string;
  userId: string;
  casualLeave: { balance: number; booked: number };
  sickLeave: { balance: number; booked: number };
  earnedLeave: { balance: number; booked: number };
  leaveWithoutPay: { balance: number; booked: number };
}

interface AdminLeaveState {
  allLeaveRequests: LeaveRequest[];
  allUserLeaveBalances: LeaveBalance[];
  selectedUserLeaveBalance: LeaveBalance | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AdminLeaveState = {
  allLeaveRequests: [],
  allUserLeaveBalances: [],
  selectedUserLeaveBalance: null,
  status: "idle",
  error: null,
};

// Async Thunks for Admin Leave Actions
export const fetchAllLeaveRequests = createAsyncThunk(
  "adminLeave/fetchAllLeaveRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/leave/admin/request/all");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateLeaveRequestStatus = createAsyncThunk(
  "adminLeave/updateLeaveRequestStatus",
  async (
    { leaveId, status }: { leaveId: string; status: "approved" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `/api/leave/admin/request/status/${leaveId}`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSingleUserLeaveBalance = createAsyncThunk(
  "adminLeave/fetchSingleUserLeaveBalance",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/leave/admin/balance/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSingleUserLeaveBalance = createAsyncThunk(
  "adminLeave/updateSingleUserLeaveBalance",
  async (
    {
      userId,
      balanceData,
    }: { userId: string; balanceData: Partial<LeaveBalance> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `/api/leave/admin/balance/${userId}`,
        balanceData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllUserLeaveBalances = createAsyncThunk(
  "adminLeave/fetchAllUserLeaveBalances",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/leave/admin/balance/all");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAllUserLeaveBalances = createAsyncThunk(
  "adminLeave/updateAllUserLeaveBalances",
  async (balances: LeaveBalance[], { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/leave/admin/balance/all", {
        balances,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminLeaveSlice = createSlice({
  name: "adminLeave",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAllLeaveRequests
      .addCase(fetchAllLeaveRequests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllLeaveRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allLeaveRequests = action.payload.leaveRequests;
      })
      .addCase(fetchAllLeaveRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // updateLeaveRequestStatus
      .addCase(updateLeaveRequestStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateLeaveRequestStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedLeave = action.payload.updatedLeave;
        state.allLeaveRequests = state.allLeaveRequests.map((req) =>
          req._id === updatedLeave._id ? updatedLeave : req
        );
      })
      .addCase(updateLeaveRequestStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // fetchSingleUserLeaveBalance
      .addCase(fetchSingleUserLeaveBalance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSingleUserLeaveBalance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedUserLeaveBalance = action.payload.leaveBalance;
      })
      .addCase(fetchSingleUserLeaveBalance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // updateSingleUserLeaveBalance
      .addCase(updateSingleUserLeaveBalance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSingleUserLeaveBalance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedUserLeaveBalance = action.payload.leaveBalance;
        state.allUserLeaveBalances = state.allUserLeaveBalances.map((balance) =>
          balance.userId === action.payload.leaveBalance.userId
            ? action.payload.leaveBalance
            : balance
        );
      })
      .addCase(updateSingleUserLeaveBalance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // fetchAllUserLeaveBalances
      .addCase(fetchAllUserLeaveBalances.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllUserLeaveBalances.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allUserLeaveBalances = action.payload.leaveBalances;
      })
      .addCase(fetchAllUserLeaveBalances.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // updateAllUserLeaveBalances
      .addCase(updateAllUserLeaveBalances.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateAllUserLeaveBalances.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Assuming the response includes the updated list of all balances
        state.allUserLeaveBalances = action.payload.leaveBalances;
      })
      .addCase(updateAllUserLeaveBalances.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default adminLeaveSlice.reducer;
