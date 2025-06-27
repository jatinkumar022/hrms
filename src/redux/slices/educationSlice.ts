import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

export interface EducationType {
  degree?: string;
  university?: string;
  board?: string;
  passingYear?: string;
  grade?: string;
  remarks?: string;
}

interface EducationState {
  data: EducationType[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: EducationState = {
  data: [],
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/education
export const fetchEducation = createAsyncThunk(
  "profile/fetchEducation",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/education", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile?.education || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/education
export const updateEducation = createAsyncThunk(
  "profile/updateEducation",
  async (formData: EducationType[], { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/education",
        { data: { education: formData } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.profile?.education || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const educationSlice = createSlice({
  name: "education",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEducation.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchEducation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchEducation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateEducation.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateEducation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateEducation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default educationSlice.reducer;
