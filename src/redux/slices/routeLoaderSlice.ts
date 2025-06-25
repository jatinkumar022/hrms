// redux/slices/routeLoaderSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface RouteLoaderState {
  loading: boolean;
}

const initialState: RouteLoaderState = {
  loading: false,
};

const routeLoaderSlice = createSlice({
  name: "routeLoader",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { startLoading, stopLoading } = routeLoaderSlice.actions;
export default routeLoaderSlice.reducer;
