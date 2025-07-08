// redux/slices/loginSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface LoginState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: LoginState = {
  user: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/api/users/login", { email, password });
      return res.data.user; // Assuming your login API returns user data directly
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Login failed");
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/auth/me");
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/logout");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Logout failed");
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export default loginSlice.reducer;
