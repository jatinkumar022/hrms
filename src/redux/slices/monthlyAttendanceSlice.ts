import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMonthlyAttendance = createAsyncThunk(
  "monthlyAttendance/fetchMonthlyAttendance",
  async (
    { month, year }: { month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/attendance/monthly-report?month=${month}&year=${year}`
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch");
      return data.records;
    } catch (err: any) {
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

const monthlyAttendanceSlice = createSlice({
  name: "monthlyAttendance",
  initialState: {
    records: [],
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyAttendance.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchMonthlyAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload;
      })
      .addCase(fetchMonthlyAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default monthlyAttendanceSlice.reducer;
