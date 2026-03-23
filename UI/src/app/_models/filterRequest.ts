import { TCModel } from './user/usermodel';

export interface TableFilterModel {
  skip: number;
  take: number;
  searchString: string | null;
  sorting: ColumnSortingModel | null;
  columnSearch: ColumnSearchModel[] | null;
}

export interface ColumnSortingModel {
  fieldName: string;
  sort: string;
}

export interface ColumnSearchModel {
  fieldName: string;
  searchString: string;
}
export interface ColumnSearchModel {
  fieldName: string;
  searchString: string;
}
export interface TenderFilterModel extends TableFilterModel {
  where: TenderWhereClauseProperties | null;
  divisionList: string[] | null;
  districtList: string[] | null;
  workType: string[] | null;
  fromDate: string | null;
  toDate: string | null;
  selectionType: string | null;
  year: string[] | null;
}
export interface TenderWhereClauseProperties {
  isActive: boolean;
  id: string;
  tenderNumber: string;
  localTenderNumber: string;
}
export interface GOWhereClauseProperties {
  isActive: boolean;
}

export interface CallletterFilterModel extends TableFilterModel {
  where: CallletterWhereClauseProperties | null;
}

export interface CallletterWhereClauseProperties {
  isActive: boolean;
  schemeIds: string[];
  districtIds: string[];
  meetingDate: string;
  status: string;
}
export interface UserFilterModel extends TableFilterModel {
  where: UserWhereClauseProperties | null;
}

export interface UserWhereClauseProperties {
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}
export interface MemberFilterModel extends TableFilterModel {
  where: MemberWhereClauseProperties;
}
export interface MemberWhereClauseProperties {
  districtIds: string[] | null;
  cardstatusId: string[] | null;
  type_of_Work: string | null;
  type_of_Works?: string[] | null;
  core_Sanitary_Worker_Type: string | null;
  organization_Type: string | null;
  organization_Types?: string[] | null;
  nature_of_Job: string | null;
  local_Body: string | null;
  local_Bodys?: string[] | null;
  Application_Status?: string[] | null;
  name_of_Local_Body: string | null;
  name_of_Local_Bodys?: string[] | null;
  Changed_Detail_Records?: string[] | null;
  zone: string | null;
  block: string | null;
  village_Panchayat: string | null;
  corporation: string | null;
  municipality: string | null;
  town_Panchayat: string | null;
  district_Id: string | null;
  isApprovalPending: boolean;
  isActive: boolean;
  year: string;
  collectedByPhoneNumber: string;
  collectedByName: string;
  fromDate: string | null;
  toDate: string | null;
  Collected_FromDate?: Date | null;
  Collected_ToDate?: Date | null;
  ApplicationSatus?: string[] | null;
  Approval_application_Status?: string | null;
}
export interface ApplicationFilterModel extends TableFilterModel {
  where: ApplicationWhereClauseProperties;
}

export interface ApplicationWhereClauseProperties {
  userId: string;
  schemeIds: string[] | [];
  districtIds: string[] | [];
  cardstatusId?: string[] | [];
  statusIds: string[] | [];
  isExpired: boolean;
  year: string;
  isBulkApprovalGet: boolean;
  showInactiveOnly?: boolean;
}
export interface GoWhereClauseProperties {
  isActive: boolean;
  id: string;
  gONumber: string;
  localGONumber: string;
  departmentId: string;
}

export interface CommentFilterModel extends TableFilterModel {
  where: CommentWhereClauseProperties | null;
}
export interface CommentWhereClauseProperties {
  id?: string | null;
  type: string | null;
  typeId: string | null;
  commentsFrom?: string | null;
  commentsText?: string | null;
  subjectText?: string | null;
  commentNumber?: string | null;
  createdByUserName?: string | null;
  commentDate?: string | null;
}

export interface ReportBreadcrumbModel {
  orderNumber: number;
  fieldName: string;
  value: string;
  labelName: string;
  label: string;
  ismook?: boolean;
  ismilestone?: boolean;
}

export interface ActivityFilterModel extends TableFilterModel {
  where: ActivityWhereClauseProperties | null;
  ids: string[] | null;
  types: string[] | null;
}

export interface ActivityWhereClauseProperties {
  type: string | null;
  typeId: string | null;
}

export interface AlertFilterModel extends TableFilterModel {
  roleId: string | null;
  divisionIds: string[] | null;
  types: string[] | null;
  typeIds: string[] | null;
}

export interface WorkWhereClauseProperties {
  isActive: boolean;
  id: string;
  tenderId: string;
  workNumber: string;
}

export interface NavigationModel {
  schemeId?: string | null;
  districtId?: string | null;
  statusId?: string | null;
  cardstatusId?: string | null;
  recordType?: string | null;
}
export interface ApplicationInfoFilterModel extends TableFilterModel {
  fromYear: number;
  toYear: number;
  schemeIds: string[] | null;
  districtIds: string[] | null;
  statusIds: string[] | null;
}

export interface MemberDataApprovalFilterModel {
  changed_Detail_Record_Types: TCModel[];
  statusList: TCModel[];
  approvedStatusList: TCModel[];
  districtList: TCModel[];
  divisionList: TCModel[];
  roleList: TCModel[];
  typeOfWorkList: TCModel[];
  organizationTypeList: TCModel[];
  locaBodyList: TCModel[];
  nameofLocalBodyList: TCModel[];
}
export interface MemberDataApprovalGridFilterModel extends TableFilterModel {
  where: MemberDataApprovalGridWhereClauseProperties;
}
export interface DatewiseApprovalModel extends TableFilterModel {
  Member_Id: string;
  District: string;
  Name: string;
  MemberAadhaarNumber: string;
  Phone: string;
  Status: string;
  ApprovedBy: string;
  ApprovedDate: string;
  LocalBody: string;
  Type_of_Work: string;
  OrganizationType: string;
  NameOfLocalBody: string;
  CreatedBy: string;
  CreatedByUserName: string;
  CreatedDate: string;

  where: MemberDataApprovalGridWhereClauseProperties;
}
export interface MemberCardApprovalFilterModel {
  districtList: TCModel[];
  statusList: TCModel[];
}
export interface MemberDataApprovalGridWhereClauseProperties {
  districtIds: string[] | [];
 divisionIds?: string[] | [];
  statusIds: string[] | [];
  Local_Bodys?: string[] | [];
  name_of_Local_Bodys?: string[] | [];
  organization_Types?: string[] | [];
  type_of_Works?: string[] | [];
  approvaldateRange?: Date[] | null;
  memberDataChangeRequestTypes: string[] | [];
  roleId: string | [];
  memberId: string | [];


  // ✅ ALLOW NULL EXPLICITLY
  Aadhaar_Number?: string | null;
  Phone_Number?: string | null;
  reportFormat?: string | null;
  
  isActive: boolean;
  year: string;
  getAll: boolean;
}
export interface MemberCardApprovalGridFilterModel extends TableFilterModel {
  where: MemberCardApprovalGridWhereClauseProperties;
}

export interface MemberCardApprovalGridWhereClauseProperties {
  districtIds: string[] | [];
  statusIds: string[] | [];
  isActive: boolean;
  year: string;
}
