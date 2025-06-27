import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

export interface JobInfoType {
  effectiveDate?: string;
  location?: string;
  subLocation?: string;
  jobTitle?: string;
  grade?: string;
  band?: string;
  category?: string;
  department?: string;
  subDepartment?: string;
  reportingManager?: string;
  lineManager?: string;
  lineManager2?: string;
  employmentStatus?: string;
  note?: string;
}

interface JobInfoState {
  data: JobInfoType[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: JobInfoState = {
  data: [],
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/job-info
export const fetchJobInfo = createAsyncThunk(
  "profile/fetchJobInfo",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/job-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile?.jobInfo || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/job-info
export const updateJobInfo = createAsyncThunk(
  "profile/updateJobInfo",
  async (formData: JobInfoType[], { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/job-info",
        { data: { jobInfo: formData } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.profile?.jobInfo || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const jobInfoSlice = createSlice({
  name: "jobInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobInfo.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchJobInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchJobInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateJobInfo.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateJobInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateJobInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default jobInfoSlice.reducer;
