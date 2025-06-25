// ⬇️ import every page component you’ve built
import BasicInfo from "./pages/Personal/BasicInfo";
import FamilyInfo from "./pages/Personal/FamilyInfo";
import ContactSocialLinks from "./pages/Personal/ContactSocialLinks";
import Address from "./pages/Personal/Address";
import Education from "./pages/Personal/Education";

import JobInfo from "./pages/JobInformation/JobInformation";
import BankDetails from "./pages/Bank Info/BankInfo";
import PersonalDocuments from "./pages/Documents/PersonalDocuments";
import OfficialDocuments from "./pages/Documents/OfficialDocuments";

/** slug → React component */
export const pageComponents: Record<string, React.FC<any>> = {
  basic: BasicInfo,
  family: FamilyInfo,
  contact: ContactSocialLinks,
  address: Address,
  education: Education,

  /* ‑ Job group ‑ */
  jobinfo: JobInfo,

  bankinfo: BankDetails,

  personaldocuments: PersonalDocuments,
  officialdocuments: OfficialDocuments,
};
