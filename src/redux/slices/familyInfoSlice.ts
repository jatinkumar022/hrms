import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface FamilyInfoState {
  data: any | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: FamilyInfoState = {
  data: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/family
export const fetchFamilyInfo = createAsyncThunk(
  "profile/fetchFamilyInfo",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/family", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile?.family || {};
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/family
export const updateFamilyInfo = createAsyncThunk(
  "profile/updateFamilyInfo",
  async (formData: any, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/family",
        { data: { family: formData } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.family;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const familyInfoSlice = createSlice({
  name: "familyInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamilyInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFamilyInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchFamilyInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateFamilyInfo.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default familyInfoSlice.reducer;
