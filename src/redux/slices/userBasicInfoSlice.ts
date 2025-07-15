import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface UserBasicInfo {
  displayName?: string;
  jobTitle?: string;
}

interface UserBasicInfoState {
  info: UserBasicInfo;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: UserBasicInfoState = {
  info: {},
  isLoading: false,
  isError: false,
  errorMessage: null,
};

export const fetchUserBasicInfo = createAsyncThunk(
  "user/fetchBasicInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/user-profile/user-basic-info");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch user basic info"
      );
    }
  }
);

const userBasicInfoSlice = createSlice({
  name: "userBasicInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBasicInfo.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchUserBasicInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.info = action.payload;
      })
      .addCase(fetchUserBasicInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default userBasicInfoSlice.reducer;
