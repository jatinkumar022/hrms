import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMonthlySummary = createAsyncThunk(
  "monthlySummary/fetchMonthlySummary",
  async (
    { month, year }: { month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/attendance/monthly-summary?month=${month}&year=${year}`
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch");
      return data.summary;
    } catch (err: any) {
      return rejectWithValue(err.message || "Unknown error");
    }
  }
);

const monthlySummarySlice = createSlice({
  name: "monthlySummary",
  initialState: {
    summary: null,
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default monthlySummarySlice.reducer;
