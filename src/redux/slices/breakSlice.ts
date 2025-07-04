import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface BreakState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  success: boolean;
  start: string | null;
  end: string | null;
  duration: number | null;
  reasonRequired: boolean;
  totalBreakTime: number | null;
}

const initialState: BreakState = {
  isLoading: false,
  isError: false,
  errorMessage: null,
  success: false,
  start: null,
  end: null,
  duration: null,
  reasonRequired: false,
  totalBreakTime: null,
};

export const startBreak = createAsyncThunk(
  "attendance/startBreak",
  async (
    { reason, location }: { reason?: string; location: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/api/attendance/start-break", {
        reason,
        location,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.error || "Start break failed"
      );
    }
  }
);

export const endBreak = createAsyncThunk(
  "attendance/endBreak",
  async (
    { reason, location }: { reason?: string; location: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/api/attendance/end-break", {
        reason,
        location,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error || "End break failed");
    }
  }
);

const breakSlice = createSlice({
  name: "break",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startBreak.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
        state.success = false;
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
        state.start = action.payload.start;
        state.reasonRequired = action.payload.reasonRequired;
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
        state.success = false;
      })
      .addCase(endBreak.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
        state.success = false;
      })
      .addCase(endBreak.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
        state.end = action.payload.end;
        state.duration = action.payload.duration;
        state.totalBreakTime = action.payload.totalBreakTime;
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
        state.success = false;
      });
  },
});

export default breakSlice.reducer;
