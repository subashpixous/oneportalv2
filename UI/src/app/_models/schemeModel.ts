import { Form } from '@angular/forms';
import { ApplicationForm3Model } from './ApplicationForm3Model';
import { ConfigurationSchemeCostFieldModel } from './schemeConfigModel';
import { ApplicationUtilizationCirtificateModel } from './UCModel';
import { TCModel } from './user/usermodel';
import { AuditColumnsModel } from './utils';
import {
  ApplicationBankModel,
  SchemeAdditionalInformation,
} from './MemberDetailsModel';

export interface ApplicationGeneralDetailModel {
  id: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  projectDistrict: string;
  rank: string;
  servedIn: string;
  age: string;
  dateOfEnrollment: string;
  dateOfDischarge: string;
  totalYearsinService: number;
  isSelf: boolean;
  idCardNo: string;
  dependentName: string;
  dependentDob: string;
  ppoNo: string;
  sex: string;
  community: string;
  religion: string;
  maritalStatus: string;
  dob: string;
  fathersName: string;
  dependentId: string;
  isSubmit: boolean;
  declarationAccepted: boolean;
  serviceNumber: string;
  isNativeTamilNadu: boolean;
  isFirstEntrepreneur: boolean;
}
export interface ApplicationPersonalDetailModel {
  id: string;
  applicationId: string;
  isCorrespondenceSameAsResident: boolean;
  aadharNo: string;
  email: string;
  isReEmployed: boolean;
  residinginSameArea: boolean;
  isTrainingUndergone: boolean;
  institutionName?: string;
  trainingDurationFrom?: string;
  trainingDurationTo?: string;
  isEmployed: boolean;
  employmentDetails: string;
  employeementType: string;
  employementOthers: string;
  isRegistered: boolean;
  registrationNo: string;
  registrationDate: string;
  hasPreviousExp: boolean;
  previousExperience: string;
  typeOfTraining?: string;
  residentialAddress: ApplicationAddressMaster;
  correspondenceAddress: ApplicationAddressMaster;
  typeOfTrainingList: ApplicationTypeOfTrainingModel[];
  educationalQualification: ApplicantQualificationMasterViewModel[];
}

export interface ApplicationTypeOfTrainingModel {
  id: string;
  applicationId: string;
  typeOfTraining: string;
  nameOfTheInstitution: string;
  fromDate: Date;
  toDate: Date;
  isActive: boolean;
}
export interface ApplicationAddressMaster {
  id: string;
  applicationId: string;
  addressType?: string;
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
  area?: string;
  districtString?: string;
  talukString?: string;
  blockString?: string;
  corporationString?: string;
  municipalityString?: string;
  townPanchayatString?: string;
}
export interface ApplicationProjectDetailModel {
  id: string;
  applicationId: string;
  activityLane: string;
  activityLaneOther: string;
  ventureCategory: string;
  projectOutlayCost: number;
  landCost: number;
  buildingCost: number;
  equipmentCost: number;
  workingCost: number;
  preopertaiveExpense: number;
  otherExpense: number;
  totalCost: number;
  subsidyCost: number;
  beneficiaryCost: number;
  loanCost: number;
  subsidyPercentage_Config: number;
  subsidyCost_Config: number;

  accountNumber: string;
  iFSC: string;
  bank: string;
  branch: string;
  address: string;
  projectAddress: ApplicationAddressMaster;
}

export interface ApplicationDropdownModel {
  services: TCModel[] | null;
  sexes: TCModel[] | null;
  maritalstatuses: TCModel[] | null;
  ventures: TCModel[] | null;
  religions: TCModel[] | null;
  communities: TCModel[] | null;
  dependents: TCModel[] | null;
  rank: TCModel[] | null;
  activites: TCModel[] | null;
  districts: TCModel[] | null;
  taluks: TCModel[] | null;
  areas: TCModel[] | null;
  nameOfLocalbody: TCModel[] | null;
  blocks: TCModel[] | null;
  corporations: TCModel[] | null;
  municipalities: TCModel[] | null;
  townpanchayat: TCModel[] | null;
  villagepanchayat: TCModel[] | null;
  residence_Districts: TCModel[] | null;
  residence_Taluks: TCModel[] | null;
  residence_Areas: TCModel[] | null;
  residence_NameOfLocalbody: TCModel[] | null;
  residence_Blocks: TCModel[] | null;
  residence_Corporations: TCModel[] | null;
  residence_Municipalities: TCModel[] | null;
  residence_Townpanchayat: TCModel[] | null;
  residence_Villagepanchayat: TCModel[] | null;
  corres_Districts: TCModel[] | null;
  corres_Taluks: TCModel[] | null;
  corres_Areas: TCModel[] | null;
  corres_NameOfLocalbody: TCModel[] | null;
  corres_Blocks: TCModel[] | null;
  corres_Corporations: TCModel[] | null;
  corres_Municipalities: TCModel[] | null;
  corres_Townpanchayat: TCModel[] | null;
  corres_Villagepanchayat: TCModel[] | null;

  banks: TCModel[] | null;
  branches: TCModel[] | null;
  costFieldModels: ConfigurationSchemeCostFieldModel[] | null;
}
export interface ApplicationDetailViewModel1 extends AuditColumnsModel {
  id: string;
  memberId: string;
  showBankFields: boolean;
  showAdditionalFields: boolean;
  applicationId: string;
  name: string;
  applicantId: string;
  mobile: string;
  applicantAadharNumber?: string;
  isSubmitted: boolean;
  schemeId: string;
  scheme: string;
  schemeGroupName: string;
  statusId: string;
  status: string;
  // Updated By Sivasankar on 21-01-2026 for Mem Scheme View changes
  memberName: string;
  beneficiaryName: string;
  relationship: string;
  temporaryPrefix: string;
  temporarySuffix: string;
  temporaryRunningNumber: string;
  temporaryNumber: string;
  prefix: string;
  suffix: string;
  applicationRunningNumber: string;
  applicationNumber: string;
  thumbnailSavedFileName: string;
  originalFileName: string;
  savedFileName: string;
  districtId: string;
  bulkApprovedby: string;
  bulkApprovedByUserName: string;
  bulkApprovedDate: string;
  submittedDate: string;
  approvalComments: ApprovalViewModel[] | null;
  applicationDocument: ApplicationDocumentFormModel[] | null;
  statusFlow: StatusFlowModel[] | null;
  ucDocument: ApplicationUtilizationCirtificateModel[] | null;
  form3: ApplicationForm3Model[] | null;
  privileges: ApplicationUCForm3PrivilegeModel | null;
  applicationBank: ApplicationBankModel | undefined;
  schemeAdditionalInformation: SchemeAdditionalInformation | undefined;
}

export interface ApplicationDetailViewModel extends AuditColumnsModel {
  id: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  rank: string;
  servedIn: string;
  dateOfEnrollment: string | null;
  dateOfDischarge: string | null;
  totalYearsinService: number;
  isSelf: boolean;
  idCardNo: string;
  ppoNo: string;
  sex: string;
  community: string;
  religion: string;
  maritalStatus: string;
  dob: string | null;
  fathersName: string;
  dependentId: string;
  accountNumber: string;
  ifsc: string;
  bank: string;
  branch: string;
  address: string;
  bankName: string;
  branchName: string;
  dependentName: string;
  dependentDob: string | null;
  dependentType: string;
  residinginSameAreaName: string;
  activityLane: string;
  activityLaneOther: string;
  ventureCategory: string;
  projectOutlayCost: number;
  landCost: number;
  buildingCost: number;
  equipmentCost: number;
  workingCost: number;
  preopertaiveExpense: number;
  otherExpense: number;
  totalCost: number;
  projectDistrict: string;
  subsidyCost: number;
  beneficiaryCost: number;
  loanCost: number;
  subsidyPercentage_Config: number;
  subsidyCost_Config: number;
  isCorrespondenceSameAsResident: boolean;
  aadharNo: string;
  mobile: string;
  email: string;
  residinginSameArea: boolean;
  isTrainingUndergone: boolean;
  institutionName: string;
  trainingDurationFrom: string | null;
  trainingDurationTo: string | null;
  isEmployed: boolean;
  employmentDetails: string;
  employeementType: string;
  isNativeTamilNadu: boolean;
  isFirstEntrepreneur: boolean;
  isReEmployed: boolean;
  employementOthers: string;
  isRegistered: boolean;
  registrationNo: string;
  registrationDate: string | null;
  hasPreviousExp: boolean;
  previousExperience: string;
  typeOfTraining: string;
  schemeId: string;
  scheme: string;
  statusId: string;
  status: string;
  temporaryPrefix: string;
  temporarySuffix: string;
  temporaryRunningNumber: string;
  temporaryNumber: string;
  prefix: string;
  suffix: string;
  applicationRunningNumber: string;
  applicationNumber: string;
  thumbnailSavedFileName: string;
  originalFileName: string;
  savedFileName: string;
  servedInString: string;
  rank_String: string;
  activityLaneString: string;
  ventureCategoryString: string;
  sexString: string;
  communityString: string;
  religionString: string;
  maritalStatusString: string;
  bulkApprovedby: string;
  bulkApprovedByUserName: string;
  bulkApprovedDate: string;
  submittedDate: string;
  declarationAccepted: boolean;
  serviceNumber: string;
  isSubmitted: boolean;
  residentialAddress: ApplicationAddressMaster | null;
  correspondenceAddress: ApplicationAddressMaster | null;
  projectAddress: ApplicationAddressMaster | null;
  educationalQualification: ApplicantQualificationMasterModel[] | [];
  approvalComments: ApprovalViewModel[] | [];
  applicationDocument: ApplicationDocumentFormModel[] | [];
  statusFlow: StatusFlowModel[] | [];
  ucDocument: ApplicationUtilizationCirtificateModel[] | [];
  form3: ApplicationForm3Model[] | [];
  privileges: ApplicationUCForm3PrivilegeModel | null;
  typeOfTrainingList: ApplicationTypeOfTrainingModel[] | [];
}
export interface ApplicationUCForm3PrivilegeModel {
  ucView: boolean;
  ucUpload: boolean;
  form3View: boolean;
  form3Upload: boolean;
}
export interface ApplicantQualificationMasterModel extends AuditColumnsModel {
  id: string;
  applicationId: string;
  educationalQualificationId: string;
  courseDetails: string;
  institution: string;
  yearOfPassing: string;
  educationalQualification: string;
  isActive: boolean;
}
export interface ApplicationDocumentFormModel {
  documentGroupName: string;
  documents: ApplicationDocumentModel[] | null;
}

export interface ApplicationDocumentModel {
  id: string;
  applicationId: string;
  documentGroupName: string;
  documentConfigId: string;
  documentCategoryId: string;
  acceptedDocumentTypeId: string;
  acceptedDocumentType: string;
  documentCategory: string;
  originalFileName: string;
  savedFileName: string;
  isRequired: string;
  isActive: boolean;
  isVerified: boolean;
  acceptedDocumentList: TCModel[] | null;
}
export interface ApplicantQualificationMasterViewModel {
  id: string;
  applicationId: string;
  educationalQualificationId: string;
  educationalQualification: string;
  courseDetails: string;
  institution: string;
  yearOfPassing: string;
}
export interface ApplicationMainGridModel {
  applicationId: string;
  applicationNumber: string;
  approvedByRole: string;
  observation: string;
  scheme: string;
  status: string;
  date: string;
  firstName: string;
  lastName: string;
  lastAction: string;
  districtId: string;
  districtName: string;
  schemeId: string;
  schemeCode: string;
  isExpired: boolean;
  statusCode: string;
  bulkApprovedBy: string;
  isBulkApprovedDate: string;
  isBulkApproval: boolean;
  isBulkApprovedByName: string;
  submittedDate: string;

  canUpdate: boolean;
  canView: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export interface ApprovalModel {
  id: string;
  applicationId: string;
  schemeId: string;
  status: string;
  statusIdFrom: string;
  statusIdTo: string;
  approvalComment: string;
  assertVerificationDate: string;
  assertVerificationVenue: string;
  assertVerificationDeclaration: boolean;
  verifiedby: string;
  reason: string;
  originalFileName?: string;
  savedFileName?: string;
  file: File;
}
export interface BulkApprovalModel {
  applicationIds: string;
  schemeId: string;
  status: string;
  statusIdFrom: string;
  statusIdTo: string;
  approvalComment: string;
  reason: string;
  originalFileName: string;
  savedFileName: string;
  file?: Form | null;
}
export interface ApproveStatusItemModel {
  schemeId: string;
  status: string;
  statusId: string;
  statusName: string;
  statusCode: string;
  currentStatus: string;
  currentStatusName: string;
}

export interface ApproveStatusViewModel {
  currentStatus: string;
  currentStatusName: string;
  showCheckMeetingTimePopup: boolean;
  showAssertVerfication: boolean;
  isDocumentRequired: boolean;
  isForm3Required: boolean;
  isUcRequired: boolean;
  documentFieldLabel: string;
  reason: TCModel[];
  statusList: ApproveStatusItemModel[];
}
export interface ApprovalViewModel {
  id: string;
  applicationId: string;
  schemeId: string;
  status: string;
  approvalComment: string;
  statusIdFrom: string;
  statusIdTo: string;
  statusFrom: string;
  statusTo: string;
  reason: string;
  assertVerificationDate: string;
  assertVerificationVenue: string;
  originalFileName: string;
  savedFileName: string;
  isBulkApproval: boolean;
  createdBy: string;
  createdByUserName: string;
  createdDate: string;
}
export interface StatusFlowModel {
  order: number;
  number: number;
  status: string;
  statusCode: string;
  isPassed: boolean;
}
export interface SubsidyValueGetFormModel {
  schemeId?: string;
  cost: number;
}

export interface SubsidyValueGetResponseModel {
  subsidyCost: number;
  subsidyPercentage_Config: number;
  maxProjectCost: number;
  subsidyCost_Config: number;
}
