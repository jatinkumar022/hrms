import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

export interface CurrentJobType {
  joiningDate?: string;
  location?: string;
  jobTitle?: string;
  category?: string;
  department?: string;
  reportingManager?: string;
  employmentStatus?: string;
}

export interface PreviousExperienceType {
  companyName?: string;
  joiningDate?: string;
  lastDate?: string;
  department?: string;
  category?: string;
  employmentStatus?: string;
}

interface JobInfoState {
  currentJob: CurrentJobType | null;
  previousExperience: PreviousExperienceType[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: JobInfoState = {
  currentJob: null,
  previousExperience: [],
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
      return {
        currentJob: res.data.profile?.currentJob || null,
        previousExperience: res.data.profile?.previousExperience || [],
      };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/job-info
export const updateJobInfo = createAsyncThunk(
  "profile/updateJobInfo",
  async (
    data: {
      currentJob: CurrentJobType;
      previousExperience: PreviousExperienceType[];
    },
    { rejectWithValue }
  ) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/job-info",
        { data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return {
        currentJob: res.data.profile?.currentJob || null,
        previousExperience: res.data.profile?.previousExperience || [],
      };
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
        state.currentJob = action.payload.currentJob;
        state.previousExperience = action.payload.previousExperience;
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
        state.currentJob = action.payload.currentJob;
        state.previousExperience = action.payload.previousExperience;
      })
      .addCase(updateJobInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default jobInfoSlice.reducer;
