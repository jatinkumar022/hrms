import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface LateInState {
  records: any[];
  loading: boolean;
  error: string | null;
}

const initialState: LateInState = {
  records: [],
  loading: false,
  error: null,
};

export const fetchLateInRecords = createAsyncThunk(
  "lateIn/fetchLateInRecords",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/attendance/my-late-in");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "An error occurred"
      );
    }
  }
);

const lateInSlice = createSlice({
  name: "lateIn",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLateInRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLateInRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchLateInRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default lateInSlice.reducer;
