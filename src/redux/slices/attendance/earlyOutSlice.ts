import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface EarlyOutState {
  records: any[];
  loading: boolean;
  error: string | null;
}

const initialState: EarlyOutState = {
  records: [],
  loading: false,
  error: null,
};

export const fetchEarlyOutRecords = createAsyncThunk(
  "earlyOut/fetchEarlyOutRecords",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/attendance/my-early-out");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch early out records");
    }
  }
);

const earlyOutSlice = createSlice({
  name: "earlyOut",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEarlyOutRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarlyOutRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchEarlyOutRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default earlyOutSlice.reducer;
