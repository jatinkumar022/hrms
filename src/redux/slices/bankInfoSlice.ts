import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

export interface BankAccountType {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  accountHolder?: string;
  accountType?: string;
}

export interface UpiWalletType {
  upiId?: string;
  walletName?: string;
}

interface BankInfoState {
  data: {
    primary?: BankAccountType;
    others?: BankAccountType[];
    upiWallets?: UpiWalletType[];
  } | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: BankInfoState = {
  data: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

// GET /api/user-profile/bank
export const fetchBankInfo = createAsyncThunk(
  "profile/fetchBankInfo",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get("/api/user-profile/bank", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile?.bank || {};
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Fetch failed");
    }
  }
);

// PUT /api/user-profile/bank
export const updateBankInfo = createAsyncThunk(
  "profile/updateBankInfo",
  async (formData: any, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token");
      const res = await axios.put(
        "/api/user-profile/bank",
        { data: { bank: formData } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.profile?.bank || {};
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Update failed");
    }
  }
);

const bankInfoSlice = createSlice({
  name: "bankInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankInfo.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchBankInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchBankInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateBankInfo.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateBankInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateBankInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export default bankInfoSlice.reducer;
