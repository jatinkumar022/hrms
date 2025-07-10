import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface WfhRequest {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  dayType: string;
  type: string;
  duration?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface UserWfhState {
  myWfhRequests: WfhRequest[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserWfhState = {
  myWfhRequests: [],
  status: "idle",
  error: null,
};

// Async Thunks for User WFH Actions
export const submitWfhRequest = createAsyncThunk(
  "userWfh/submitWfhRequest",
  async (
    wfhData: {
      startDate: string;
      endDate: string;
      numberOfDays: number;
      dayType: string;
      startTime?: string;
      endTime?: string;
      reason: string;
      attachment?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post("/api/wfh/user/request/apply", wfhData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelWfhRequest = createAsyncThunk(
  "userWfh/cancelWfhRequest",
  async (wfhId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/wfh/user/request/cancel/${wfhId}`);
      return wfhId;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMyWfhRequests = createAsyncThunk(
  "userWfh/fetchMyWfhRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/wfh/user/request/my-requests");
      return response.data.wfhRequests;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userWfhSlice = createSlice({
  name: "userWfh",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // submitWfhRequest
      .addCase(submitWfhRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitWfhRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myWfhRequests.push(action.payload.request);
      })
      .addCase(submitWfhRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // cancelWfhRequest
      .addCase(cancelWfhRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(cancelWfhRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myWfhRequests = state.myWfhRequests.filter(
          (req) => req._id !== action.payload
        );
      })
      .addCase(cancelWfhRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // fetchMyWfhRequests
      .addCase(fetchMyWfhRequests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyWfhRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myWfhRequests = action.payload;
      })
      .addCase(fetchMyWfhRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default userWfhSlice.reducer;
