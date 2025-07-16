import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define the type for a single employee record
export interface Employee {
  id: string;
  displayName: string;
  jobTitle: string;
  department: string;
  officialEmail: string;
  mobile: string;
  currentCity: string;
  permanentCity: string;
  joiningDate: string;
  currentExperience: string;
  previousExperience: string;
  profileImage: string;
}

// Define the state structure for this slice
interface EmployeeDirectoryState {
  data: Employee[];
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: EmployeeDirectoryState = {
  data: [],
  loading: false,
  error: null,
};

// Create the async thunk for fetching data
export const fetchEmployeeDirectory = createAsyncThunk(
  "employeeDirectory/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/emp-directory");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "An unknown error occurred"
      );
    }
  }
);

// Create the slice
const employeeDirectorySlice = createSlice({
  name: "employeeDirectory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeDirectory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEmployeeDirectory.fulfilled,
        (state, action: PayloadAction<Employee[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchEmployeeDirectory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default employeeDirectorySlice.reducer;
