// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "@/redux/slices/loginSlice";
import signupReducer from "./slices/signupSlice";
import personalReducer from "./slices/personalInfoSlice";
import familyInfoReducer from "./slices/familyInfoSlice";
import contactSocialLinksReducer from "./slices/contactSocialLinksSlice";
import addressReducer from "./slices/addressSlice";
import educationReducer from "./slices/educationSlice";
import jobInfoReducer from "./slices/jobInfoSlice";
import bankInfoReducer from "./slices/bankInfoSlice";
import officialDocumentsReducer from "./slices/officialDocumentsSlice";
import personalDocumentsReducer from "./slices/personalDocumentsSlice";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    signup: signupReducer,
    personalInfo: personalReducer,
    familyInfo: familyInfoReducer,
    contactSocialLinks: contactSocialLinksReducer,
    address: addressReducer,
    education: educationReducer,
    jobInfo: jobInfoReducer,
    bankInfo: bankInfoReducer,
    officialDocuments: officialDocumentsReducer,
    personalDocuments: personalDocumentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
