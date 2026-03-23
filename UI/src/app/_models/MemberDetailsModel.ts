import { TCModel } from './user/usermodel';
import { AuditColumnsModel } from './utils';

export interface MemberDetailsModel extends AuditColumnsModel {
  id: string;
  member_ID: string;
  first_Name: string;
  last_Name: string;
  father_Name: string;
  date_Of_Birth: string;
  gender: string;
  community: string;
  caste: string;
  marital_Status: string;
  aadhaar_Number: string;
  phone_Number: string;
  education: string;
  religion: string;
  profile_Picture: string;
  dM_Status: string;
  hQ_Status: string;
  id_Card_Status: string;
  isActive: boolean;
  isSubmitted: boolean;
  genderString: string;
  communityString: string;
  casteString: string;
  marital_StatusString: string;
  educationString: string;
  religionString: string;
  ration_Card_Number: string;
  email: string;
  collectedByPhoneNumber: string;
  collectedByName: string;
  collectedOn: string;
  isApprovalPending: boolean;
  isAbleToCancelRequest?: boolean;
  aadhaarVerified: boolean;
  aadhaar_json: string;
}

export interface MemberDetailsSaveModel {
  id: string;
  member_ID: string;
  first_Name: string;
  last_Name: string;
  father_Name: string;
  email: string;
  date_Of_Birth?: string;
  gender: string;
  community: string;
  religion: string;
  caste: string;
  marital_Status: string;
  aadhaar_Number: string;
  phone_Number: string;
  education: string;
  ration_Card_Number: string;
  profile_Picture?: string;
  id_Card_Status: string;
  collectedByPhoneNumber: string;
  collectedByName: string;
  collectedOn: string;

  isActive: boolean;
  isSubmit: boolean;
  isTemp?: boolean;
}

export interface OrganizationDetailModel extends AuditColumnsModel {
  id: string;
  member_Id: string;
  type_of_Work: string;
  core_Sanitary_Worker_Type: string;
  health_Worker_Type: string;
  organization_Type: string;
  district_Id: string;
  nature_of_Job: string;
  local_Body: string;
  name_of_Local_Body: string;
  zone: string;
  organisation_Name: string;
  designation: string;
  address: string;
  block: string;
  village_Panchayat: string;
  corporation: string;
  municipality: string;
  town_Panchayat: string;
  new_Yellow_Card_Number: string;
  health_Id: string;
  private_Organisation_Name: string;
  private_Designation: string;
  private_Address: string;
  already_a_Member_of_CWWB: boolean;
  isActive: boolean;
  type_of_WorkString: string;
  core_Sanitary_Worker_TypeString: string;
  organization_TypeString: string;
  districtString: string;
  nature_of_JobString: string;
  name_of_Local_BodyString: string;
  zoneString: string;
  designationString: string;
  blockString: string;
  village_PanchayatString: string;
  corporationString: string;
  municipalityString: string;
  town_PanchayatString: string;
  isApprovalPending: boolean;
  isAbleToCancelRequest?: boolean;
  work_office: string;
  employer_Type: string;
  mlA_Constituency: string;
  mP_Constituency: string;
  work_Office_Others:string;

}

export interface OrganizationDetailSaveModel {
  id: string;
  member_Id: string;
  type_of_Work: string;
  core_Sanitary_Worker_Type: string;
  health_Worker_Type: string;
  organization_Type: string;
  district_Id: string;
  nature_of_Job: string;
  local_Body: string;
  name_of_Local_Body: string;
  zone: string;
  organisation_Name: string;
  designation: string;
  address: string;
  block: string;
  village_Panchayat: string;
  corporation: string;
  municipality: string;
  town_Panchayat: string;
  new_Yellow_Card_Number: string;
  health_Id: string;
  private_Organisation_Name: string;
  private_Designation: string;
  private_Address: string;
  already_a_Member_of_CWWB: boolean;
  isActive: boolean;
  isTemp?: boolean;
}
export interface FamilyMemberModel extends AuditColumnsModel {
  id: string;
  member_Id: string;
  f_id: string;
  name: string;
  phone_number: string;
  aadharNumber: string;
  relation: string;
  sex: string;
  age: string;
  education: string;
  standard: string;
  school_Status: string;
  emiS_No: string;
  school_Address: string;
  course: string;
  degree_Name: string;
  college_Status: string;
  year: string;
  year_Of_Completion: string;
  discontinuedYear: string;
  college_Address: string;
  occupation: string;
  disability: string;
  status: string;
  sexString: string;
  educationString: string;
  relationString: string;
  date_of_birth: string;
  isActive: boolean;
  isSaved: boolean;
  isApprovalPending: boolean;
  activeApplicationExist: boolean;
  isAbleToCancelRequest?: boolean;
}

export interface FamilyMemberSaveModel {
  id: string;
  member_Id: string;
  f_id: string;
  name: string;
  phone_number: string;
  aadharNumber: string;
  relation: string;
  sex: string;
  age: string;
  education: string;
  standard: string;
  school_Status: string;
  eMIS_No: string;
  school_Address: string;
  course: string;
  degree_Name: string;
  college_Status: string;
  year: string;
  year_Of_Completion: string;
  college_Address: string;
  date_of_birth: string;
  occupation: string;
  disability: string;
  status: string;
  isTemp?: boolean;
  isActive: boolean;
  isSaved: boolean;
}
export interface BankDetailModel extends AuditColumnsModel {
  id: string;
  application_Id: string;
  account_Holder_Name: string;
  account_Number: string;
  iFSC_Code: string;
  bank_Name: string;
  bank_Id: string;
  branch: string;
  branch_Id: string;
  isActive: boolean;
}
export interface ApplicationBankModel extends AuditColumnsModel {
  id: string;
  application_Id: string;
  account_Holder_Name: string;
  account_Number: string;
  ifsC_Code: string;
  bank_Name: string;
  bank_Id: string;
  branch: string;
  branch_Id: string;
  isActive: boolean;
}

export interface BankDetailSaveModel {
  id: string;
  member_Id: string;
  application_Id: string;
  account_Holder_Name: string;
  account_Number: string;
  ifsC_Code: string;
  bank_Name: string;
  bank_Id: string;
  branch: string;
  branch_Id: string;
  isTemp?: boolean;
  isActive: boolean;
  isApprovalPending?: boolean;
  isAbleToCancelRequest?: boolean;
}

export interface ApplicationAddressMaster extends AuditColumnsModel {
  id: string;
  memberId: string;
  addressType: string;
  doorNo: string;
  streetName: string;
  villlageTownCity: string;
  localBody: string;
  nameoflocalBody: string;
  district: string;
  taluk: string;
  block: string;
  corporation: string;
  municipality: string;
  townPanchayat: string;
  pincode: string;
  isActive: boolean;
  isSubmit: boolean;
  area: string;
  districtString: string;
  talukString: string;
  blockString: string;
  corporationString: string;
  municipalityString: string;
  townPanchayatString: string;
  isTemp?: boolean;
  isApprovalPending?: boolean;
  isAbleToCancelRequest?: boolean;
}
export interface OrganizationDetailFormModel {
  type_of_Work_SelectList: TCModel[] | undefined;
  core_Sanitary_Worker_Type_SelectList: TCModel[] | undefined;
  // Updated By Sivasankar K on 14/01/2026 for Health Worker
  health_Worker_Type_SelectList: TCModel[] | undefined;
  organization_Type_SelectList: TCModel[] | undefined;
  district_SelectList: TCModel[] | undefined;
  nature_of_Job_SelectList: TCModel[] | undefined;
  local_Body_SelectList: TCModel[] | undefined;
  name_of_Local_Body_SelectList: TCModel[] | undefined;
  zone_SelectList: TCModel[] | undefined;
  designation_SelectList: TCModel[] | undefined;
  municipality_SelectList: TCModel[] | undefined;
  block_SelectList: TCModel[] | undefined;
  corporation_SelectList: TCModel[] | undefined;
  town_Panchayat_SelectList: TCModel[] | undefined;
  village_Panchayat_SelectList: TCModel[] | undefined;
  mla_SelectList : TCModel[] | undefined;
  mp_SelectList : TCModel[] | undefined;
  employer_Type_SelectList: TCModel[] | undefined;
work_Office_SelectList: TCModel[] | undefined;

}
export interface MemberDetailsModel extends AuditColumnsModel {
  id: string;
  member_ID: string;
  first_Name: string;
  last_Name: string;
  father_Name: string;
  date_Of_Birth: string;
  gender: string;
  community: string;
  caste: string;
  marital_Status: string;
  aadhaar_Number: string;
  phone_Number: string;
  education: string;
  religion: string;
  profile_Picture: string;
  dM_Status: string;
  hQ_Status: string;
  id_Card_Status: string;
  isActive: boolean;
  isTemp: boolean;
  genderString: string;
  communityString: string;
  casteString: string;
  marital_StatusString: string;
  educationString: string;
  religionString: string;
    aadhaarVerified: boolean;

  member_json: string;
}
export interface MemberDetailsFormModel {
  religion_SelectList: TCModel[] | undefined;
  community_SelectList: TCModel[] | undefined;
  caste_SelectList: TCModel[] | undefined;
  marital_Status_SelectList: TCModel[] | undefined;
  gender_SelectList: TCModel[] | undefined;
  education_SelectList: TCModel[] | undefined;
}
export interface FamilyMemberFormModel {

  family_Member_SelectList: TCModel[] | undefined;
  gender_SelectList: TCModel[] | undefined;
  education_SelectList: TCModel[] | undefined;
  occupation_SelectList: TCModel[] | undefined;
  disability_SelectList: TCModel[] | undefined;
  education_2_SelectList: TCModel[] | undefined;
  education_Status_SelectList: TCModel[] | undefined;
  education_Year_SelectList: TCModel[] | undefined;
  education_Standard_SelectList: TCModel[] | null;
  district_SelectList: TCModel[] | undefined;
}
export interface AddressDetailFormModel {
  district_SelectList: TCModel[] | undefined;
  taluk_SelectList: TCModel[] | undefined;
  pincode_SelectList: TCModel[] | undefined;
}

export interface MemberModels {
  memberDetails: MemberDetailsModel;
  organizationDetailModel: OrganizationDetailModel;
  bankDetailModel: BankDetailModel;
  workAddressMasters: ApplicationAddressMaster;
  permanentAddressMasters: ApplicationAddressMaster;
  temprorayAddressMasters: ApplicationAddressMaster;
  familyMemberModels: FamilyMemberModel[];
}
export interface MemberEligibilityModel {
  id: string;
  name: string;
  relation: string;
  isFamilyMember: boolean;
  showApplyOption: boolean;
  existApplication: ExistApplicationIdModel;
}

export interface ExistApplicationIdModel {
  applicationId: string;
  applicationNumber: string;
  statusId: string;
  statusName: string;
  isSubmitted: boolean;
  familyMemberId: string;
  familyMemberName: string;
  lastUpdatedDate: string;
  submittedDate: string;
}

export interface ApplicationMasterSaveModel {
  id: string;
  schemeId: string;
  memberId: string;
  fromStatusId: string;
  toStatusId: string;
  memberName: string;
  applicantName: string;
  mobile: string;
  AadharNumber?: string;
  district: string;
  isSubmit: boolean;
  selectedMember: MemberEligibilityModel | undefined;
  collectedByPhoneNumber?: string;
  collectedByName?: string;
  collectedOn?: string;
}

export interface ApplicationSelectListModel {
  id: string;
  schemeId: string;
  statusId: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
}

export interface ApplicationSchemeCostDetails {
  isSingleCategorySelect: boolean;
  bankSelectList: TCModel[];
  schemeSubCategory: ApplicationCostDetails[] | undefined;
  selectedSchemeSubCategory: SelectedSchemeSubCategory[] | null;
}

export interface SelectedSchemeSubCategory {
  schemeSubCategoryId: string;
  schemeSubCategory: string;
  amount: number;
}

export interface SelectedSchemeSubCategoryGetPayload {
  applicationId: string;
  schemeId: string;
}
export interface SchemeAdditionalInformation {
  applicationId: string;
  placeOfAccident: string;
  relationshipToTheAccident: string;
  medicalInsurancePlanRegistrationNumber: string;
}
export interface ApplicationCostDetails {
  applicationId: string;
  groupId: string;
  subCategoryId: string;
  isSelected: boolean;
  subCategory: string;
  communityId: string;
  community: string;
  occurrence: string;
  recurrence: string;
  amount: number;
}
export interface ApplicationSaveSchemeCostDetails {
  applicationCostDetails: ApplicationCostDetails[];
  bankDetailSaveModel: ApplicationBankModel;
  schemeAdditionalInformation: SchemeAdditionalInformation;
  actionType: 'save' | 'submit';
}

export interface BankDetailSaveModel {
  id: string;
  application_Id: string;
  account_Holder_Name: string;
  account_Number: string;
  ifsC_Code: string;
  bank_Name: string;
  bank_Id: string;
  branch: string;
  branch_Id: string;
  isActive: boolean;
  isSubmit?: boolean;
}
export interface MemberDocumentMaster extends AuditColumnsModel {
  id: string;
  member_Id: string;
  documentCategory: string;
  acceptedDocumentType: string;
  documentCategoryId: string;
  acceptedDocumentTypeId: string;
  originalFileName: string;
  savedFileName: string;
  isActive: string;
  isApprovalPending?: boolean;
  isAbleToCancelRequest: boolean;
  acceptedDocumentTypeSelectList: TCModel[];
  isTemp: boolean;
}

export interface MemberDocumentSaveMaster {
  id: string;
  member_Id: string;
  documentCategoryId: string;
  acceptedDocumentTypeId: string;
  originalFileName: string;
  savedFileName: string;
  isActive: string;
  file: File;
  isTemp?: boolean;
}
export interface MemberGetModels {
  memberDetails: MemberDetailsModel | undefined;
  organizationDetail: OrganizationDetailModel | undefined;
  bankDetail: BankDetailSaveModel | undefined;
  workAddress: ApplicationAddressMaster | undefined;
  permanentAddress: ApplicationAddressMaster | undefined;
  temprorayAddress: ApplicationAddressMaster | undefined;
  familyMembers: FamilyMemberModel[] | undefined;
  memberDocuments: MemberDocumentMaster[] | undefined;
  memberNonMandatoryDocuments: MemberDocumentMaster[] | undefined;
  memberDetailsForm: MemberDetailsFormModel | undefined;
  organizationDetailForm: OrganizationDetailFormModel | undefined;
  familyMemberForm: FamilyMemberFormModel | undefined;
  bankDetailForm: BankDetailFormModel | undefined;
  workAddressDetailForm: AddressDetailFormModel | undefined;
  permanentAddressDetailForm: AddressDetailFormModel | undefined;
  temporaryAddressDetailForm: AddressDetailFormModel | undefined;
}
export interface BankDetailFormModel {
  bank_SelectList: TCModel[] | undefined;
  branch_SelectList: TCModel[] | undefined;
}

export interface MemberSaveAllModels {
  memberDetails: MemberDetailsSaveModel | undefined;
  organizationDetail: OrganizationDetailSaveModel | undefined;
  bankDetail: BankDetailSaveModel | undefined;
  workAddress: ApplicationAddressMaster | undefined;
  permanentAddress: ApplicationAddressMaster | undefined;
  temprorayAddress: ApplicationAddressMaster | undefined;
  isOfficerSave: boolean;
}
export interface MemberFormGeneralInfo {
  isSubmitted: boolean;
  isWaitingForApproval: boolean;
  isNewMember: boolean;
  isRejected: boolean;
  comment: string;
  reason: string;
  profile_Picture?: string;
}
export interface MemberGridViewModel {
  id: string;
  member_Id: string;
  name: string;
  phone: string;
  district: string;
  isApprovalPending: string;
  isApproved: string;
  isAbleToCancelRequest?: boolean;
  updatedBy: string;
  updatedByUserName: string;
  updatedDate: string;
}
export interface Member_Card_Approval_Master_Grid_Model
  extends AuditColumnsModel {
  id: string;
  member_Id: string;
  statusId: string;
  lastActionStatus: string;
  isActive: string;
  isCompleted: string;
  isPrinted: string;
  status: string;
  name: string;
  phoneNumber: string;
  memberCode: string;
}
export interface MemberDataApprovalGridModel {
  id: string;
  member_Id_Text: string;
  member_Id: string;
  status: string;
  changed_Detail_Record: string;
  changed_Date: string;
  changed_Time: string;
  name: string;
  phone: string;
  district: string;
  updatedBy: string;
  updatedByUserName: string;
  updatedDate: string;
  canApprove: boolean;
  cardStatus: boolean;
  canDelete: boolean;
}
export interface MemberDataApprovalFormModel {
  requestId: string;
  changeRequestCode: string;
  currentRoleName: string;
  nextRoleName: string;
  nextRoleId: string;
  currentRoleId: string;
  fromRoleId: string;
  statusList: TCModel[] | [];
  reasonList: TCModel[] | [];
  approvalHistory: MemberDataApprovalHistoryView[] | [];
}

export interface MemberDataApprovalFromSubmitModel {
  requestId: string;
  status: string;
  selectedRoleId: string;
  selectedRoleText: string;
  currentRoleId: string;
  reason: string;
  comment: string;
}
export interface MemberDataApprovalHistoryView {
  id: string;
  memberDetailApprovalMasterId: string;
  fromRoleId: string;
  fromRoleName: string;
  fromRoleCode: string;
  toRoleId: string;
  toRoleName: string;
  toRoleCode: string;
  createdOn: string;
  changedDetailRecord: string;
  changedDateString: string;
  changedTimeString: string;
  approvedBy: string;
  approvedByName: string;
  comment: string;
  reason: string;
  status: string;
}
export interface ApplicationDocumentVerificationMasterModel {
  id: string;
  applicationId: string;
  applicantId: string;
  documentCategoryId: string;
  isVerified: boolean;
}
export interface QuickContactSaveModel {
  quickContactName: string;
  quickContactPhone: string;
  quickContactEmail: string;
}

export interface Member_Card_Approval_Master_From {
  id: string;
  member_Id: string;
  statusId: string;
  status: string;
  nextStatusId: string;
  nextStatus: string;
  previousStatusId: string;
  previousStatus: string;
  isActive: string;
  isCompleted: string;
  isPrinted: string;
  selectedStatus: string;
  fromStatusId: string;
  toStatusId: string;
  createdBy: string;
  createdByUserName: string;
  createdDate: string;
  modifiedby: string;
  modifiedByUserName: string;
  modifiedDate: string;
  statusList: TCModel[];
  reasonList: TCModel[];
  approvalHistory: Member_Card_Approval_Master_History[] | [];
}
export interface Member_Card_Approval_Master_History {
  id: string;
  member_Id: string;
  name: string;
  memberCode: string;
  phone: string;
  masterId: string;
  fromStatusId: string;
  fromStatus: string;
  toStatusId: string;
  toStatus: string;
  statusCode: string;
  approvalComment: string;
  reason: string;
  createdBy: string;
  createdByUserName: string;
  createdDate: string;
}
export interface PrintModuleReportModel {
  member_Id: string;
  id: string;
  approvalId: string;
  approvalRoleId: string;
  name: string;
  nameinTamil: string;
  phone_Number: string;
  father_Name: string;
  father_NameinTamil: string;
  district: string;
  date_Of_Birth: string;
  districtinTAMIL: string;
  profile_Picture_url: string;
  profileImage: string;
  qRCodeURL: string;
  address: string;
  addressinTamil: string;
  zoneCode: string;
  zoneinEnglish: string;
  zoneinTamil: string;
  familyMembers: string;
}
