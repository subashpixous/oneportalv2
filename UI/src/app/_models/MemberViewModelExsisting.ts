import { MemberDocumentMaster } from './MemberDetailsModel';
import { TCModel } from './user/usermodel';

export interface MemberViewModelExisting {
  organizationalDetail: OrganizationalViewModelExisting;
  memberDetail: MemberDetailsViewModelExisting;
  permanentAddress: AddressViewModelExisting;
  memberDocuments: MemberDocumentMaster[];
  memberNonMandatoryDocuments: MemberDocumentMaster[];
  temproraryAddress: AddressViewModelExisting;
  familyMembers: FamilyMemberViewModelExisting[];
  bankDetails: BankViewModelExisting;
}
export interface MemberDocumentMasterModelExisting {
  id: string;
  member_Id: string;
  documentCategory: string;
  acceptedDocumentType: string;
  documentCategoryId: string;
  acceptedDocumentTypeId: string;
  originalFileName: string;
  savedFileName: string;
  isActive: boolean;
  acceptedDocumentTypeSelectList: TCModel[] | undefined;
  isApprovalPending: boolean;
  isTemp: boolean;
}
export interface OrganizationalViewModelExisting {
  typeOfWork: string;
  employer_type: string;
  typeOfCoreSanitoryWorker: string;
  healthWorkerType: string;
  organizationType: string;
  natureOfJob: string;
  distritName: string;
  localBody: string;
  block: string;
  villagePanchayat: string;
  nameoftheLocalBody: string;
  corporation: string;
  municipality: string;
  townPanchayat: string;
  zone: string;
  yellowCardNumber: string;
  healthId: string;
  workOrganisationName: string;
  workDesignation: string;
  workAddress: string;
  organisation_Name: string;
  designation: string;
  address: string;
  private_Organisation_Name: string;
  private_Designation: string;
  private_Address: string;
  mpConstituency: string;
  mlaConstituency: string;
  workOffice: string;
   isTemp: boolean;
}

export interface MemberDetailsViewModelExisting {
  profileImageName: string;
  community: string;
  caste: string;
  caste_String: string;
  firstName: string;
  lastName: string;
  fathersName: string;
  gender: string;
  email: string;
  maritalStatus: string;
  education: string;
  phoneNumber: string;
  rationCard: string;
  aadharNumber: string;
  dob: string;
  healthId: string;
  isAlreadyMember: boolean;
  yellowCardNumber: string;
  memberId: string;
  workOrganisationName: string;
  workDesignation: string;
  profile_Picture: string;
  workAddress: string;
  collectedByPhoneNumber: string;
  collectedByName: string;
  collectedOn: string;
   isTemp: boolean;
}

export interface AddressViewModelExisting {
  doorNo: string;
  district: string;
  streetName: string;
  talukName: string;
  villageorCity: string;
  pincode: string;
   isTemp: boolean;
}

export interface FamilyMemberViewModelExisting {
  name: string;
  relationShip: string;
  gender: string;
  age: string;
  education: string;
  aadharNumber: string;
  phone_number: string;
  school: EduDetailSchoolViewModelExisting;
  college: EduDetailCollegeViewModelExisting;
  occupation: string;
  date_of_birth: string;
  differentlyAbled: string;
  mandatoryDocuments: MemberDocumentMasterModelExisting[];
  nonMandatoryDocuments: MemberDocumentMasterModelExisting[];
   isTemp: boolean;
}

export interface EduDetailSchoolViewModelExisting {
  standard: string;
  educationalStatus: string;
  eMISNo: string;
  completedYear: string;
  discontinuedYear: string;
  nameandAddressofSchool: string;
  school_Name: string;
}

export interface EduDetailCollegeViewModelExisting {
  course: string;
  degreName: string;
  educationalStatus: string;
  educationalYear: string;
  completedYear: string;
  discontinuedYear: string;
  nameandAddressofCollege: string;
  college_Address: string;
  college_Name: string;
}

export interface BankViewModelExisting {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branchName: string;
   isTemp: boolean;
}
export interface MemberDiffViewModel {
  organizationalDetail: OrganizationalViewModelExisting;
  organizationalDetail_Temp: OrganizationalViewModelExisting;
  memberDetail: MemberDetailsViewModelExisting;
  memberDetail_Temp: MemberDetailsViewModelExisting;
  permanentAddress: AddressViewModelExisting;
  permanentAddress_Temp: AddressViewModelExisting;
  temproraryAddress: AddressViewModelExisting;
  temproraryAddress_Temp: AddressViewModelExisting;
  familyMembers: FamilyMemberViewModelExisting[];
  familyMembers_Temp: FamilyMemberViewModelExisting[];
  familyMembersWithEducation: FamilyMemberEducation[];
  familyMembersWithEducation_Temp: FamilyMemberEducation[];
  bankDetails: BankViewModelExisting;
  bankDetails_Temp: BankViewModelExisting;
  memberDocuments: MemberDocumentMaster[];
  memberDocuments_Temp: MemberDocumentMaster[];
  memberNonMandatoryDocuments: MemberDocumentMaster[];
  memberNonMandatoryDocuments_Temp: MemberDocumentMaster[];
}
export interface FamilyMemberEducation {
  name: string;
  relationShip: string;
  gender: string;
  age: string;
  education: string;
  occupation: string;
  differentlyAbled: string;
  standard: string;
  educationalStatus: string;
  eMISNo: string;
  aadharNumber: string;
  phone_number: string;
  completedYear: string;
  discontinuedYear: string;
  nameandAddressofSchool: string;
  course: string;
  degreName: string;
  educationalYear: string;
  nameandAddressofCollege: string;
  isTemp: boolean;
}

export interface Member_Card_Approval_Save_Model {
  id: string;
  member_Id: string;
  approvalComment: string;
  reason: string;
  selectedStatus: string;
}
