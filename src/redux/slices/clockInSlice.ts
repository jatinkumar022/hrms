import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ClockInState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  success: boolean;
  time: string | null;
  isLate: boolean;
  reasonRequired: boolean;
}

const initialState: ClockInState = {
  isLoading: false,
  isError: false,
  errorMessage: null,
  success: false,
  time: null,
  isLate: false,
  reasonRequired: false,
};

export const clockInUser = createAsyncThunk(
  "attendance/clockInUser",
  async (
    { reason, location }: { reason?: string; location: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/api/attendance/clock-in", {
        reason,
        location,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error || "Clock-in failed");
    }
  }
);

const clockInSlice = createSlice({
  name: "clockIn",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(clockInUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
        state.success = false;
      })
      .addCase(clockInUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
        state.time = action.payload.time;
        state.isLate = action.payload.isLate;
        state.reasonRequired = action.payload.reasonRequired;
      })
      .addCase(clockInUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
        state.success = false;
      });
  },
});

export default clockInSlice.reducer;
