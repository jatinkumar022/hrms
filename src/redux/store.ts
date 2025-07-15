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
import imageUploadReducer from "./slices/imageUploadSlice";
import profileImageReducer from "./slices/profileImageSlice";
import userProfileReducer from "./slices/userProfileSlice";
import clockInReducer from "./slices/clockInSlice";
import clockOutReducer from "./slices/clockOutSlice";
import breakReducer from "./slices/breakSlice";
import statusReportReducer from "./slices/statusReportSlice";
import monthlyAttendanceReducer from "./slices/monthlyAttendanceSlice";
import monthlySummaryReducer from "./slices/monthlySummarySlice";
import userLeaveReducer from "./slices/leave/user/userLeaveSlice";
import adminLeaveReducer from "./slices/leave/admin/adminLeaveSlice";
import allUsersReducer from "./slices/users/allUsersSlice";
import userWfhReducer from "./slices/wfh/userWfhSlice";
import adminWfhReducer from "./slices/wfh/adminWfhSlice";
import updateUserProfileImage from "./slices/updateUserProfileImageSlice";
import userAttendanceRequestSlice from "./slices/attendance-request/user/userAttendanceRequestSlice";
import adminAttendanceRequestSlice from "./slices/attendance-request/admin/adminAttendanceRequestSlice";
import userBasicInfoReducer from "./slices/userBasicInfoSlice";
import lateInSlice from "./slices/attendance/lateInSlice";
import earlyOutSlice from "./slices/attendance/earlyOutSlice";

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
    imageUpload: imageUploadReducer,
    profileImage: profileImageReducer,
    userProfile: userProfileReducer,
    clockIn: clockInReducer,
    clockOut: clockOutReducer,
    break: breakReducer,
    statusReport: statusReportReducer,
    monthlyAttendance: monthlyAttendanceReducer,
    monthlySummary: monthlySummaryReducer,
    userLeave: userLeaveReducer,
    adminLeave: adminLeaveReducer,
    allUsers: allUsersReducer,
    userWfh: userWfhReducer,
    adminWfh: adminWfhReducer,
    updateUserProfileImage: updateUserProfileImage,
    userAttendanceRequest: userAttendanceRequestSlice,
    adminAttendanceRequest: adminAttendanceRequestSlice,
    userBasicInfo: userBasicInfoReducer,
    lateIn: lateInSlice,
    earlyOut: earlyOutSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
