import mongoose from "mongoose";
const { Schema } = mongoose;

// Reusable Sub-Schemas
const languageSkillSchema = new Schema({
  reading: Boolean,
  speaking: Boolean,
  writing: Boolean,
  understanding: Boolean,
}, { _id: false });

const knownLanguageSchema = new Schema({
  language: String,
  skill: languageSkillSchema,
}, { _id: false });

const familyMemberSchema = new Schema({
  relation: String,
  name: String,
  gender: String,
  adharCard: String,
  occupation: String,
  mobileNumber: String,
  dateOfBirth: Date,
  isLate: { type: Boolean, default: false },
}, { _id: false });

const socialMediaSchema = new Schema({
  linkedin: String,
  github: String,
  facebook: String,
  other: String,
}, { _id: false });

const addressSchema = new Schema({
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
}, { _id: false });

const educationSchema = new Schema({
  degree: String,
  university: String,
  board: String,
  passingYear: Number,
  grade: String,
  remarks: String,
}, { _id: false });

const jobInfoSchema = new Schema({
  effectiveDate: Date,
  location: String,
  subLocation: String,
  jobTitle: String,
  grade: String,
  brand: String,
  category: String,
  department: String,
  subDepartment: String,
  reportingManager: String,
  lineManager: String,
  lineManager2: String,
  employmentStatus: { type: String, enum: ['fulltime', 'part'] },
  note: String,
}, { _id: false });

const bankAccountSchema = new Schema({
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  branchName: String,
  accountHolder: String,
  accountType: String,
}, { _id: false });

const upiWalletSchema = new Schema({
  upiId: String,
  walletName: String,
}, { _id: false });

const documentSchema = new Schema({
  name: String,
  url: String,
  type: String,
}, { _id: false });

const socialLinkSchema = new Schema({
  label: String,
  url: String,
}, { _id: false });

const userProfileSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // Basic Info
  companyName: String,
  legalEntityCompany: String,
  uniqueId: String,
  employeeId: String,
  joiningDate: Date,
  firstName: String,
  middleName: String,
  lastName: String,
  gender: { type: String, enum: ["male", "female", "other"] },
  dateOfBirth: Date,
  maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"] },
  bloodGroup: String,
  placeOfBirth: String,
  nationality: String,
  displayName: String,
  knownLanguages: [knownLanguageSchema],

  // Family Info
  family: {
    father: familyMemberSchema,
    mother: familyMemberSchema,
    others: [familyMemberSchema],
  },

  // Contact Info
  contact: {
    mobile: String,
    officialEmail: String,
    personalEmail: String,
    socialMedia: socialMediaSchema,
  },

  // Address
  address: {
    current: addressSchema,
    permanent: addressSchema,
    others: [addressSchema],
  },

  // Education
  education: [educationSchema],

  // Job Info
  jobInfo: jobInfoSchema,

  // Bank Info
  bank: {
    primary: bankAccountSchema,
    others: [bankAccountSchema],
    upiWallets: [upiWalletSchema],
  },

  // Documents
  documents: {
    personal: [documentSchema],
    official: [documentSchema],
  },

  contactSocialLinks: {
    personalMobile: String,
    emergencyContact: String,
    personalEmail: String,
    officialEmail: String,
    currentAddress: String,
    permanentAddress: String,
    linkedin: String,
    github: String,
    twitter: String,
    facebook: String,
    socialLinks: [socialLinkSchema],
  },

}, {
  timestamps: true,
});

delete mongoose.connection.models['UserProfile'];
const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
