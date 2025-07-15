import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// A simplified interface for the request data to avoid Mongoose type issues in Redux
export interface SimpleAttendanceRequest {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  date: string;
  requestType: "clock-in" | "clock-out" | "break-in" | "break-out";
  requestedTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface AdminAttendanceRequestState {
  requests: SimpleAttendanceRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminAttendanceRequestState = {
  requests: [],
  loading: false,
  error: null,
};

// Async thunk for fetching pending requests
export const fetchPendingRequests = createAsyncThunk<SimpleAttendanceRequest[]>(
  "adminAttendanceRequest/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "/api/attendance/attendance-request/requests"
      );
      return response.data.requests;
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

interface ProcessRequestPayload {
  requestId: string;
  action: "approve" | "reject";
}

// Async thunk for processing a request
export const processAttendanceRequest = createAsyncThunk(
  "adminAttendanceRequest/process",
  async (payload: ProcessRequestPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/attendance/attendance-request/action",
        payload
      );
      return { ...response.data, requestId: payload.requestId };
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

const adminAttendanceRequestSlice = createSlice({
  name: "adminAttendanceRequest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching requests
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPendingRequests.fulfilled,
        (state, action: PayloadAction<SimpleAttendanceRequest[]>) => {
          state.loading = false;
          state.requests = action.payload;
        }
      )
      .addCase(
        fetchPendingRequests.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      // Processing a request
      .addCase(processAttendanceRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        processAttendanceRequest.fulfilled,
        (state, action: PayloadAction<{ requestId: string }>) => {
          state.loading = false;
          state.requests = state.requests.filter(
            (req) => req._id !== action.payload.requestId
          );
        }
      )
      .addCase(
        processAttendanceRequest.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default adminAttendanceRequestSlice.reducer;
