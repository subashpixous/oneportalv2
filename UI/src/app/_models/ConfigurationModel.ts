import { Form } from '@angular/forms';
import { TCModel } from './user/usermodel';
import { AuditColumnsModel } from './utils';
import { TableFilterModel } from './filterRequest';

export interface ConfigurationModel {
  id: string;
  categoryId: string;
  configurationId: string;
  schemeId: string;
  value: string;
  valueTamil: string;
  code: string | [];
  canDelete: boolean;
  isGeneral: boolean;
  isActive: boolean;
}

export interface ConfigCategoryModel {
  id: string;
  parentId: string;
  category: string;
  categoryCode: string;
  categoryType: string;
  isActive: boolean;
  isEditable: boolean;
  isDependent: boolean;
  hasCode: boolean;
}
export interface ConfigurationBranchAddressSaveModel {
  bankId: string;
  branchId: string;
  branchName: string;
  ifscCode: string;
  districtId: string;
  address: string;
  email: string;
}
export interface ConfigurationSchemeModel {
  schemeId: string;
  callLetterStatusId: string;
  groupCode: string;
  displayCode: string;
  keyFeature: string;
  amountAvail: number;
  subsidy: number;
  interest: number;
  paybackPeriod: number;
  isActive: string;
}
export interface ConfigurationDistrictSaveModel {
  districtId: string;
  latitude: string;
  longitude: string;
}
export interface BranchGetPayloadModel {
  bankIds: string[];
  districtIds: string[];
}

export interface ConfigHelpDocumentModel extends AuditColumnsModel {
  id: string;
  documentName: string;
  documentType: string;
  roleIds: string;
  schemeIds: string;
  roleString: string;
  schemeString: string;
  roleIdList: string[];
  schemeIdList: string[];
  description: string;
  category: string;
  link: string;
  isActive: boolean;
  savedFile: FileMasterModel;
}

export interface ConfigHelpDocumentSaveModel {
  id: string;
  documentName: string;
  documentType: string;
  roleIds: string[];
  schemeIds: string[];
  description: string;
  category: string;
  link: string;
  isActive: boolean;
  file: Form | null;
}

export interface ConfigHelpDocumentFormModel {
  schemeList: TCModel[];
  roleList: TCModel[];
  typeList: TCModel[];
  categoryList: TCModel[];
}
export interface FileMasterModel {
  id: string;
  type: string;
  thumbnailSavedFileName: string;
  originalFileName: string;
  savedFileName: string;
  fileType: string;
  typeId: string;
  typeName: string;
  isActive: boolean;
  createdBy: string;
  createdByUserName: string;
  createdDate: string;
  modifiedBy: string;
  modifiedByUserName: string;
  modifiedDate: string;
  deletedBy: string;
  deletedByUserName: string;
  deletedDate: string;
  savedBy: string;
  savedByUserName: string;
  savedDate: string;
}
export interface ConfigApprovalDocCategorySaveModel {
  id: string;
  schemeId: string;
  statusId: string;
  docCategoryId: string;
  docCategory?: string;
  isRequired: string;
  isRequiredStr?: string;
  isActive: boolean;
}
export interface ApplicationApprovalFileModel extends AuditColumnsModel {
  ida: string;
  approvalCommentId?: string;
  applicationId: string;
  statusId: string;
  statusName: string;
  originalFileName: string;
  savedFileName: string;
  docCategoryId: string;
  docCategory: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface ApplicationApprovalFileSaveModel {
  ida: string;
  approvalCommentId?: string;
  applicationId: string;
  statusId: string;
  docCategoryId: string;
  isActive: boolean;
  file?: File;
}
export interface FeedbackModel {
  id: string;
  name: string;
  mobileNumber: string;
  feedback: string;
  isActive: boolean;
}

export interface FeedbackViewModel extends AuditColumnsModel {
  id: string;
  name: string;
  mobileNumber: string;
  feedback: string;
}
export interface FeedbackFilterModel extends TableFilterModel {
  where: FeedbackWhereClauseProperties;
}

export interface FeedbackWhereClauseProperties {
  fromDate: string;
  toDate: string;
}
export interface GeneralConfigurationCommonModel {
  ruralDistricts: string[];
  urbanDistricts: string[];
  applicationExpiryDays: number;
  memberDocumentCategories: string[];
  memberNonMandatoryDocumentCategories: string[];
  familyMemberMandatoryDocumentCategories: string[];
  familyMemberNonMandatoryDocumentCategories: string[];
  canSendPhysicalCard: string;
  quickContactName: string;
  quickContactPhone: string;
  quickContactEmail: string;
}
export interface SchemeConfigDropdownModel {
  isSelfOrFamilyMember: TCModel[] | [];
  isAlreadyAvailed: TCModel[] | [];
  familyMemberCategorys: TCModel[] | [];
  genders: TCModel[] | [];
  community: TCModel[] | [];
  religions: TCModel[] | [];
  castes: TCModel[] | [];
  districts: TCModel[] | [];
  statusList: TCModel[] | [];
  memberEducationList: TCModel[] | [];
  familyMemberEducationList: TCModel[] | [];
  maritalStatusList: TCModel[] | [];
  organizationTypeList: TCModel[] | [];
  communityGrouped: TCModel[] | [];
  castesGrouped: TCModel[] | [];
}
