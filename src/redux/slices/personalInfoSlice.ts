// redux/slices/personalInfoSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface PersonalInfoState {
  data: any | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: PersonalInfoState = {
  data: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/personal-info
export const fetchPersonalInfo = createAsyncThunk(
  "profile/fetchPersonalInfo",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/personal-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/personal-info
export const updatePersonalInfo = createAsyncThunk(
  "profile/updatePersonalInfo",
  async (formData: any, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/personal-info",
        { data: formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.profile;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const personalInfoSlice = createSlice({
  name: "personalInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonalInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPersonalInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPersonalInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updatePersonalInfo.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default personalInfoSlice.reducer;
