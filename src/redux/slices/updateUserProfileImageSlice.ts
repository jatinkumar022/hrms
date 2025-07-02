import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// State for updating the user's profile image
interface UpdateProfileImageState {
  profileImage: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: UpdateProfileImageState = {
  profileImage: "",
  isLoading: false,
  error: null,
};

/**
 * Async thunk to update the user's profile image.
 * @param userId - The user's ID
 * @param profileImage - The new profile image URL
 * @returns The updated profile image URL
 */
export const updateUserProfileImage = createAsyncThunk<
  string, // Return type: profileImage URL
  { profileImage: string }, // Only profileImage needed
  { rejectValue: string }
>(
  "userProfile/updateProfileImage",
  async ({ profileImage }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/api/user-profile/image`, {
        profileImage,
      });
      return res.data.profileImage;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update profile image"
      );
    }
  }
);

const updateUserProfileImageSlice = createSlice({
  name: "updateUserProfileImage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfileImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileImage = action.payload;
      })
      .addCase(updateUserProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile image";
      });
  },
});

export default updateUserProfileImageSlice.reducer;
