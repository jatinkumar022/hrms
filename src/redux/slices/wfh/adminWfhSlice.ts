import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface WfhDay {
  date: string;
  dayType: "Full Day" | "First Half" | "Second Half";
  _id: string;
}
export interface WfhRequest {
  _id: string;
  user: {
    _id: string;
    username: string;
    employeeId: string;
    profilePhoto?: string | null;
  };
  startDate: string;
  endDate: string;
  dayType: "Full Day" | "Half Day" | "Hourly";
  numberOfDays: number;
  days: WfhDay[];
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  attachment?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: { username: string };
}

interface AdminWfhState {
  allWfhRequests: WfhRequest[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AdminWfhState = {
  allWfhRequests: [],
  status: "idle",
  error: null,
};

export const fetchAllWfhRequests = createAsyncThunk(
  "adminWfh/fetchAllWfhRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<WfhRequest[]>(
        "/api/wfh/admin/request/all"
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserWfhRequests = createAsyncThunk<
  WfhRequest[],
  string,
  { rejectValue: any }
>("adminWfh/fetchUserWfhRequests", async (userId, { rejectWithValue }) => {
  try {
    const response = await axios.get<WfhRequest[]>(
      `/api/wfh/admin/request/${userId}`
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data);
  }
});

export const updateWfhRequestStatus = createAsyncThunk<
  WfhRequest,
  { wfhId: string; status: "approved" | "rejected" | "cancelled" },
  { rejectValue: any }
>(
  "adminWfh/updateWfhRequestStatus",
  async ({ wfhId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put<{ request: WfhRequest }>(
        `/api/wfh/admin/request/status/${wfhId}`,
        { status }
      );
      return response.data.request;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminWfhSlice = createSlice({
  name: "adminWfh",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWfhRequests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchAllWfhRequests.fulfilled,
        (state, action: PayloadAction<WfhRequest[]>) => {
          state.status = "succeeded";
          state.allWfhRequests = action.payload;
        }
      )
      .addCase(fetchAllWfhRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(
        fetchUserWfhRequests.fulfilled,
        (state, action: PayloadAction<WfhRequest[]>) => {
          state.status = "succeeded";
          // Assuming you want to replace or update the list with the fetched user requests
          state.allWfhRequests = action.payload;
        }
      )
      .addCase(fetchUserWfhRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateWfhRequestStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateWfhRequestStatus.fulfilled,
        (state, action: PayloadAction<WfhRequest>) => {
          state.status = "succeeded";
          const index = state.allWfhRequests.findIndex(
            (req) => req._id === action.payload._id
          );
          if (index !== -1) {
            // Preserve the existing user object while updating the rest of the request data
            state.allWfhRequests[index] = {
              ...state.allWfhRequests[index],
              ...action.payload,
            };
          }
        }
      )
      .addCase(updateWfhRequestStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default adminWfhSlice.reducer;
