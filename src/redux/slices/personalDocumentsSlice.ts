import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

export interface PersonalDocumentType {
  name: string;
  number: string;
  fileUrl: string;
}

interface PersonalDocumentsState {
  data: PersonalDocumentType[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: PersonalDocumentsState = {
  data: [],
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/personal-documents
export const fetchPersonalDocuments = createAsyncThunk(
  "profile/fetchPersonalDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/personal-documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile?.documents?.personal || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/personal-documents
export const updatePersonalDocuments = createAsyncThunk(
  "profile/updatePersonalDocuments",
  async (formData: PersonalDocumentType[], { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/personal-documents",
        { data: { documents: { personal: formData } } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.profile?.documents?.personal || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const personalDocumentsSlice = createSlice({
  name: "personalDocuments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonalDocuments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchPersonalDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPersonalDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updatePersonalDocuments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updatePersonalDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updatePersonalDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default personalDocumentsSlice.reducer;
