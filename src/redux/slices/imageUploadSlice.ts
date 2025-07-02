import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface UploadState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  imageUrl: string | null;
}

const initialState: UploadState = {
  isLoading: false,
  isError: false,
  errorMessage: null,
  imageUrl: null,
};

export const uploadImage = createAsyncThunk<
  string, // returned image URL
  File, // argument (file)
  { rejectValue: string }
>("image/uploadImage", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Upload failed");
    }

    return data.url as string;
  } catch (error: any) {
    return rejectWithValue(error.message || "Something went wrong");
  }
});

const imageUploadSlice = createSlice({
  name: "imageUpload",
  initialState,
  reducers: {
    resetUploadState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
        state.imageUrl = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.imageUrl = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "Upload failed";
      });
  },
});

export const { resetUploadState } = imageUploadSlice.actions;
export default imageUploadSlice.reducer;
