import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface StatusReportState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  report: any | null;
}

const initialState: StatusReportState = {
  isLoading: false,
  isError: false,
  errorMessage: null,
  report: null,
};

export const fetchStatusReport = createAsyncThunk(
  "attendance/fetchStatusReport",
  async (
    params: { date?: string; userId?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      let url = "/api/attendance/daily-report";
      if (params) {
        const search = new URLSearchParams();
        if (params.date) search.append("date", params.date);
        if (params.userId) search.append("userId", params.userId);
        url += `?${search.toString()}`;
      }
      const res = await axios.get(url);
      return res.data.report;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.error || "Failed to fetch status report"
      );
    }
  }
);

const statusReportSlice = createSlice({
  name: "statusReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatusReport.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchStatusReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.report = action.payload;
      })
      .addCase(fetchStatusReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default statusReportSlice.reducer;
