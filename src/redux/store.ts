// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "@/redux/slices/loginSlice";
import signupReducer from "./slices/signupSlice";
import personalReducer from "./slices/personalInfoSlice";
export const store = configureStore({
  reducer: {
    login: loginReducer,
    signup: signupReducer,
    personalInfo: personalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
