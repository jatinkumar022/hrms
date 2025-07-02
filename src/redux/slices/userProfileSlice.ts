import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface UserProfile {
  officialEmail: string;
  mobile: string;
  experience: string;
  joiningDate: string;
  reportingManager: string;
  previousEmployer: string;
  displayName: string;
}

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>("userProfile/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/user-profile");
    const profile = res.data.profile;

    return {
      officialEmail: profile.officialEmail || "",
      mobile: profile.mobile || "",
      experience: profile.experience || "",
      joiningDate: profile.joiningDate || "",
      reportingManager: profile.reportingManager || "",
      previousEmployer: profile.previousEmployer || "",
      displayName: profile.displayName || "",
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch user profile"
    );
  }
});

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch user profile";
      });
  },
});

export default userProfileSlice.reducer;
