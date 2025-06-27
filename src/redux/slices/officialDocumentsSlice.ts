import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

export interface OfficialDocumentType {
  name: string;
  number: string;
  fileUrl: string;
}

interface OfficialDocumentsState {
  data: OfficialDocumentType[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: OfficialDocumentsState = {
  data: [],
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/official-documents
export const fetchOfficialDocuments = createAsyncThunk(
  "profile/fetchOfficialDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/official-documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile?.documents?.official || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/official-documents
export const updateOfficialDocuments = createAsyncThunk(
  "profile/updateOfficialDocuments",
  async (formData: OfficialDocumentType[], { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/official-documents",
        { data: { documents: { official: formData } } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.profile?.documents?.official || [];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const officialDocumentsSlice = createSlice({
  name: "officialDocuments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfficialDocuments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchOfficialDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchOfficialDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateOfficialDocuments.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateOfficialDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateOfficialDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default officialDocumentsSlice.reducer;
