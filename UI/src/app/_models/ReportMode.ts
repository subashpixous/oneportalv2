import { TCModel } from './user/usermodel';

export interface ReportFilterModel {
  fromYear: number;
  toYear: number;
  schemeIds: string[] | null;
  districtIds: string[] | null;
  statusIds: string[] | null;
}

export interface ReportTopFilterModel {
  schemeSelectList: TCModel[] | null;
  districtSelectList: TCModel[] | null;
  statusSelectList: TCModel[] | null;
  financialYearSelectList: TCModel[] | null;
  reportTypeSelectList: TCModel[] | null;
  chartReportSelectList: TCModel[] | null;
  tableReportSelectList: TCModel[] | null;
}
export interface DemographicAndBenificiaryInsightsModel {
  self: number;
  dependent: DependentModel[] | null;
  schemeServedIn: ServedInModel[] | null;
  maritalStatus: MaritalStatusModel[] | null;
  ageAndGender: AgeAndGenderModel[] | null;
}

export interface DependentModel {
  name: string;
  count: number;
}

export interface ServedInModel {
  name: string;
  count: number;
}

export interface MaritalStatusModel {
  name: string;
  count: number;
}

export interface AgeAndGenderModel {
  age: string;
  maleCount: number;
  femaleCount: number;
}
export interface SchemeCountModel {
  fromYear: number;
  toYear: number;
  count: number;
  actual: number;
}

export interface SchemeCostModel {
  fromYear: number;
  toYear: number;
  cost: number;
  actual: number;
}

export interface CountModel {
  count: SchemeCountModel[];
  cost: SchemeCostModel[];
}
export interface DistrictWiseCountCost {
  count: DistrictWiseCount[];
  cost: DistrictWiseCost[];
}

export interface DistrictWiseCount {
  districtName: string;
  count: number;
}

export interface DistrictWiseCost {
  districtName: string;
  cost: number;
}
export interface ProjectSubsidyCostModel {
  fromYear: number;
  toYear: number;
  projectCost: number;
  subsidyCost: number;
}
export interface FinancialYearAnalysisModel {
  schemeName: string;
  data: FinancialYearAnalysisReadModel[] | null;
}

export interface FinancialYearAnalysisReadModel {
  schemeName: string;
  fromYear: number;
  toYear: number;
  recordCount: number;
  totalCost: number;
}
export interface ApplicationInfoReportModel {
  applicationNumber: string;
  scheme: string;
  status: string;
  projectDistrict: string;
  firstName: string;
  lastName: string;
  rank: string;
  servedInString: string;
  dob: string;
  age: number;
  dateOfEnrollment: string;
  dateOfDischarge: string;
  totalYearsinService: string;
  gender: string;
  religion: string;
  community: string;
  maritalStatus: string;
  fathersName: string;
  mobile: string;
  doorNo: string;
  district: string;
  taluk: string;
  village: string;
  area: string;
  pincode: string;
  aadharNo: string;
  email: string;
  activityLane: string;
  ventureCategory: string;
  projectOutlayCost: number;
  landCost: number;
  landCostInWords: string;
  buildingCost: number;
  equipmentCost: number;
  workingCost: number;
  preopertaiveExpense: number;
  otherExpense: number;
  totalCost: number;
  totalCostInWords: string;
  subsidyCost: number;
  beneficiaryCost: number;
  iFSC: string;
  bank: string;
  branch: string;
  address: string;
  accountNumber: string;

  declarationAccepted: boolean;
  serviceNumber: string;
  typeOfTraining: string;
  activityLaneOther: string;
  employeementType: string;

  modifiedby: string;
  modifiedByUserName: string;
  modifiedDate: string;

  declarationAcceptedstring: boolean;
}
export interface ApplicationDocumentReportModel {
  applicationNumber: string;
  scheme: string;
  status: string;
  submittedDate: string;
  documentType: string;
  documentCategory: string;
  acceptedDocument: string;
  documentMandatory: string;
  originalFileName: string;
  savedFileName: string;
}
export interface ApplicationStatusReportModel {
  applicationNumber: string;
  scheme: string;
  status: string;
  projectDistrict: string;
  submittedDate: string;
  actionStatus: string;
  fromStatus: string;
  toStatus: string;
  isDocMandatory: string;
  updatedBy: string;
  updatedDate: string;
  updatedByRole: string;
  reson: string;
  comment: string;
}
export interface ApplicationForm3ReportModel {
  id: string;
  applicationNumber: string;
  scheme: string;
  status: string;
  nameAndAddress: string;
  nameOfTrade: string;
  refNumber: string;
  subsidy: number;
  promotorContribution: number;
  bankLoan: number;
  totalUtilCost: number;
}
export interface ApplicationUCReportModel {
  applicationNumber: string;
  scheme: string;
  status: string;
  nameAndAddress: string;
  nameOfTrade: string;
  nodalNumber: string;
  subsidy: number;
  promotorContribution: number;
  bankLoan: number;
  totalAmountReleased: number;
  dateOfLoanSanction: string;
  dateOfDisbursement: string;
  dateOfAssetCreated: string;
  dateOfAssetVerified: string;
  loanAccountNumber: string;
}
export interface UserUploadViewModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
  password: string;
  designation: string;
  district: string;
  schemes: string;
  bank: string;
  branch: string;
  gender: string;
  roleCode: string;
  errorColumns: string[] | null;
  isError: boolean;
  error: string[] | null;
}
export interface ApplicationStatusReport {
  applicationAllStatusCount: ApplicationAllStatus[];
  applicationReceived: ApplicationStatusCount[];
  taskForceCommittee: ApplicationStatusCount[];
  forwardedToLendingBank: ApplicationStatusCount[];
  approvedByLendingBank: ApplicationStatusCount[];
  subsidyReleasedToLendingBank: ApplicationStatusCount[];
  subsidyReleasedByHq: ApplicationStatusCount[];
}

export interface ApplicationStatusCount {
  scheme: string;
  statusId: string;
  status: string;
  district: string;
  districtId: string;
  count: number;
}

export interface ApplicationAllStatus {
  scheme: string;
  district: string;
  districtId: string;
  totalCount: number;
  applicationReceived: number;
  taskForceCommittee: number;
  forwardedToLendingBank: number;
  approvedByLendingBank: number;
  subsidyReleasedToLendingBank: number;
  subsidyReleasedByHq: number;
}
export interface GccReport {
  sNo?: number | string;
  zoneName: string;
  zone: string;
  organization_Type: string;
  private: number;
  government: number;
  governmentandPrivate: number;
  saved: number;
  submitted: number;
  cardRejected: number;
  approvedCount: number;
  cardIssued: number;
  cardtobeIssued: number;
  beneficiaries: number;
  total: number;
    privateId: string;
      governmentId: string;
        governmentandPrivateId: string;
         clickedColumn?: string;
           [key: string]: any;
}

export interface DistrictApproveCount {
  sNo?: number | string;
  district: string;
   district_Id: string;
     privateId: string;
      governmentId: string;
       governmentandPrivateId: string;
  private: number;
  government: number;
  governmentAndPrivate: number;
  saved: number;
  submitted: number;
  approvedCount: number;
  cardIssued: number;
  cardToBeIssued: number;
  cardRejected: number;
  total: number;
    clickedColumn?: string;
    [key: string]: any;
}

export interface CoreSanitaryWorkersReport {
  sNo?: number | string;
  district: string;
  district_Id: string;
  sanitaryWorkers: number;
  sanitaryWorkersId: string;
  stpfstpMaintenance: number;
  stpfstpMaintenanceId: string;
  multiple: number;
  multipleId: string;
  septicTankDeSludging: number;
  septicTankDeSludgingId: string;
  toiletCleaning: number;
  toiletCleaningId: string;
  sewerMaintenance: number;
  sewerMaintenanceId: string;
  drainCleaning: number;
  drainCleaningId: string;
  omWastewaterTreatment: number;
  omWastewaterTreatmentId: string;
  core_Sanitary_Worker_Type: string;
  [key: string]: any; // fallback for additional dynamic fields
}

export interface ReportData {
  district: string;
  district_Id: string;
  block?: string;
  block_Id?: string;
  corporation?: string;
  corporation_Id?: string;
  villagePanchayat?: string;
  village_Panchayat_Id?: string;
  municipality?: string;
  municipality_Id?: string;
  total: number;
  [key: string]: any;
}

export interface MemberApplySchemeCountReport {
  sNo: number;
  district: string;
  schemeName: string;
  total: number;
  saved: number;
  submitted: number;
  dmApproved: number;
  hoApproved: number;
}

export interface SchemeGccReport {
  sNo: number;
  zoneName: string;
  schemeName: string;
  total: number;
  saved: number;
  submitted: number;
  dmApproved: number;
  hoApproved: number;
}

export interface SchemeCostReport {
  sNo: number;
  district: string;
  schemeName: string;
  category: string;
  community: string;
  total: number;
  notPaid: number;
  paid: number;
}
export interface MemberDetail {
  district: string;
  district_Id: string;
  name: string;
  member_id: string;
  phone_Number: string;
  townPanchayat: string;
  municipality: string;
  corporation: string;
  villagePanchayat: string;
  block: string;
  organization_Type: string;
  local_Body: string;
  cardRejected: number;
}
export interface CardCollection {
  district: string;
  collectedByPhoneNumber: string;
  district_Id: string;
  collectedByName: string;
  id: string;
  totalMembers: number;
  saved: number;
  submitted: number;
  dmApproved: number;
  hqApproved: number;
  cardRejected: number;
 
  cardIssued: number;
  cardtobeIssued: number;
  [key: string]: any;
}
export interface PrintModuleReport {
  member_Id: string;
  id: string;
  approvalId: string;
  approvalRoleId: string;
  name: string;
  status: string;
  nameinTamil: string;
  phone_Number: string;
  father_Name: string;
  father_NameinTamil: string;
  district: string;
  date_Of_Birth: string;
  districtinTAMIL: string;
  profile_Picture_url: string;
  profileImage: string;
  qrCodeURL: string;
  address: string;
  addressinTamil: string;
  zoneCode: string;
  zoneinEnglish: string;
  zoneinTamil: string;
  familyMembers: string;
  [key: string]: any;
}