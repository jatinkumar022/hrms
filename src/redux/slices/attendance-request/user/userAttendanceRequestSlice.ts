import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AttendanceRequestType } from "@/models/AttendanceRequest";

// Local interface to avoid Mongoose type issues with Redux Toolkit/Immer
export interface AttendanceRequest {
  _id: string;
  userId: string;
  date: string;
  requestType: AttendanceRequestType;
  requestedTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserAttendanceRequestState {
  requests: AttendanceRequest[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: UserAttendanceRequestState = {
  requests: [],
  loading: false,
  success: false,
  error: null,
};

interface RequestPayload {
  date: string;
  requestType: AttendanceRequestType;
  requestedTime: string;
  reason: string;
}

// Async thunk for fetching user's requests
export const fetchUserAttendanceRequests = createAsyncThunk(
  "userAttendanceRequest/fetchMyRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "/api/attendance/attendance-request/my-requests"
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.error || "Failed to fetch requests"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Async thunk for submitting a request
export const submitAttendanceRequest = createAsyncThunk(
  "userAttendanceRequest/submit",
  async (payload: RequestPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/attendance/attendance-request/request",
        payload
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.error || "An error occurred"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const userAttendanceRequestSlice = createSlice({
  name: "userAttendanceRequest",
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Request
      .addCase(submitAttendanceRequest.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitAttendanceRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(
        submitAttendanceRequest.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.success = false;
          state.error = action.payload;
        }
      )
      // Fetch User Requests
      .addCase(fetchUserAttendanceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserAttendanceRequests.fulfilled,
        (state, action: PayloadAction<AttendanceRequest[]>) => {
          state.loading = false;
          state.requests = action.payload;
        }
      )
      .addCase(
        fetchUserAttendanceRequests.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetState } = userAttendanceRequestSlice.actions;
export default userAttendanceRequestSlice.reducer;
