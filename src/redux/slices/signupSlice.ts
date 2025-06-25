import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface SignupState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
}

const initialState: SignupState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMessage: null,
};

// Async thunk for signup
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (
    {
      username,
      email,
      password,
    }: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/api/users/signup", {
        username,
        email,
        password,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Signup failed");
    }
  }
);

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    resetSignup(state) {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorMessage = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { resetSignup } = signupSlice.actions;
export default signupSlice.reducer;
