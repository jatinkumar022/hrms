import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface ContactSocialLinksState {
  data: any | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: ContactSocialLinksState = {
  data: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/contact-social-links
export const fetchContactSocialLinks = createAsyncThunk(
  "profile/fetchContactSocialLinks",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/contact-social-links", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile?.contactSocialLinks || {};
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/contact-social-links
export const updateContactSocialLinks = createAsyncThunk(
  "profile/updateContactSocialLinks",
  async (formData: any, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/contact-social-links",
        { data: { contactSocialLinks: formData } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.contactSocialLinks || {};
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const contactSocialLinksSlice = createSlice({
  name: "contactSocialLinks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactSocialLinks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchContactSocialLinks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchContactSocialLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateContactSocialLinks.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default contactSocialLinksSlice.reducer;
