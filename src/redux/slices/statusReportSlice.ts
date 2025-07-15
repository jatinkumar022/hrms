import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AttendanceReport } from "@/hooks/useAttendance";
interface StatusReportState {
  report: AttendanceReport | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}
const initialState: StatusReportState = {
  report: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};
export const fetchStatusReport = createAsyncThunk(
  "statusReport/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/attendance/daily-report");
      return data.report;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch status report"
      );
    }
  }
);
const statusReportSlice = createSlice({
  name: "statusReport",
  initialState,
  reducers: {
    updateAttendance: (state, action) => {
      if (state.report) {
        state.report.attendance = action.payload;
      }
    },
    setReport: (state, action: PayloadAction<AttendanceReport | null>) => {
      state.report = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatusReport.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(
        fetchStatusReport.fulfilled,
        (state, action: PayloadAction<AttendanceReport>) => {
          state.isLoading = false;
          state.report = action.payload;
        }
      )
      .addCase(fetchStatusReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});
export const { updateAttendance, setReport } = statusReportSlice.actions;
export default statusReportSlice.reducer;
