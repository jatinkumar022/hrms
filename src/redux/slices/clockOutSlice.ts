import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ClockOutState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  success: boolean;
  totalHours: string | null;
  productiveHours: string | null;
  earlyOut: boolean;
  earlyOutReason: string | null;
}

const initialState: ClockOutState = {
  isLoading: false,
  isError: false,
  errorMessage: null,
  success: false,
  totalHours: null,
  productiveHours: null,
  earlyOut: false,
  earlyOutReason: null,
};

export const clockOutUser = createAsyncThunk(
  "attendance/clockOutUser",
  async (
    { reason, location }: { reason?: string; location: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/api/attendance/clock-out", {
        reason,
        location,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error || "Clock-out failed");
    }
  }
);

const clockOutSlice = createSlice({
  name: "clockOut",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(clockOutUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
        state.success = false;
      })
      .addCase(clockOutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
        state.totalHours = action.payload.totalHours;
        state.productiveHours = action.payload.productiveHours;
        state.earlyOut = action.payload.earlyOut;
        state.earlyOutReason = action.payload.earlyOutReason || null;
      })
      .addCase(clockOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
        state.success = false;
      });
  },
});

export default clockOutSlice.reducer;
