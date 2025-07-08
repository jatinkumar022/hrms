import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface WfhRequest {
  _id: string;
  userId: { _id: string; username: string; profileImage?: string };
  startDate: string;
  endDate: string;
  numberOfDays: number;
  dayType: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface AdminWfhState {
  allWfhRequests: WfhRequest[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AdminWfhState = {
  allWfhRequests: [],
  status: "idle",
  error: null,
};

export const fetchAllWfhRequests = createAsyncThunk(
  "adminWfh/fetchAllWfhRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/wfh/admin/request/all");
      return response.data.wfhRequests;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateWfhRequestStatus = createAsyncThunk(
  "adminWfh/updateWfhRequestStatus",
  async (
    { wfhId, status }: { wfhId: string; status: "approved" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `/api/wfh/admin/request/status/${wfhId}`,
        { status }
      );
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminWfhSlice = createSlice({
  name: "adminWfh",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWfhRequests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllWfhRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allWfhRequests = action.payload;
      })
      .addCase(fetchAllWfhRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateWfhRequestStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateWfhRequestStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.allWfhRequests.findIndex(
          (req) => req._id === action.payload._id
        );
        if (index !== -1) {
          state.allWfhRequests[index] = action.payload;
        }
      })
      .addCase(updateWfhRequestStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default adminWfhSlice.reducer;
