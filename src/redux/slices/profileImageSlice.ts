import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ProfileImageState {
  profileImage: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileImageState = {
  profileImage: "",
  isLoading: false,
  error: null,
};

// Update/Add profile image
export const updateProfileImage = createAsyncThunk<
  string, // returned image URL
  { profileImage: string },
  { rejectValue: string }
>(
  "profileImage/updateProfileImage",
  async ({ profileImage }, { rejectWithValue }) => {
    try {
      const res = await axios.put("/api/user-profile/image", {
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

// Delete profile image
export const deleteProfileImage = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("profileImage/deleteProfileImage", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.delete("/api/user-profile/image");
    return res.data.profileImage;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete profile image"
    );
  }
});

export const fetchProfileImage = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("profileImage/fetchProfileImage", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/user-profile/image");
    return res.data.profileImage;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch profile image"
    );
  }
});

const profileImageSlice = createSlice({
  name: "profileImage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileImage = action.payload;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile image";
      })
      .addCase(deleteProfileImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileImage = action.payload;
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete profile image";
      })
      .addCase(fetchProfileImage.fulfilled, (state, action) => {
        state.profileImage = action.payload;
      })
      .addCase(fetchProfileImage.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch profile image";
      });
  },
});

export default profileImageSlice.reducer;
