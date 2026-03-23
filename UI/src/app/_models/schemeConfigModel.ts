import { FileMasterModel } from './ConfigurationModel';
import { TCModel } from './user/usermodel';
import { AuditColumnsModel } from './utils';

export interface ConfigurationSchemeModel extends AuditColumnsModel {
  schemeId: string;
  callLetterStatusIds: string[] | null;
  callLetterStatusId: string;
  docRequiredStatusIds: string[] | null;
  docRequiredStatusId: string;
  groupCode: string;
  displayCode: string;
  keyFeature: string;
  amountAvail: number;
  subsidy: number;
  interest: number;
  paybackPeriod: number;
  isActive: boolean;
}
export interface ConfigurationSchemeViewModel {
  schemeId: string;
  schemeName: string;
  schemeNameEnglish: string;
  schemeNameTamil: string;
  description: string;
  isApplicable: boolean;
}

export interface ConfigurationSchemeSaveModel {
  schemeId: string;
  schemeName: string;
  schemeNameTamil: string;
  schemeNameEnglish: string;
  description: string;
  showBankFields: boolean;
  showAdditionalFields: boolean;
  sortOrder: number;
  callLetterStatusIdsList: string[] | null;
  callLetterStatusId: string;
  callLetterStatusNames: string;
  callLetterStatusNamesList: string[] | null;
  docRequiredStatusIdsList: string[] | null;
  docRequiredStatusId: string;
  docRequiredStatusListNames: string;
  docRequiredStatusNamesList: string[] | null;
  religionsList: string[];
  religions: string;
  religionsListNames: string;
  religionsNamesList: string[];
  communityList: string[];
  community: string;
  communityListNames: string;
  communityNamesList: string[];
  casteList: string[];
  caste: string;
  casteListNames: string;
  casteNamesList: string[];
  gendersList: string[];
  genders: string;
  gendersListNames: string;
  gendersNamesList: string[];
  districtsList: string[];
  districts: string;
  districtsListNames: string;
  districtsNamesList: string[];
  familyMemberCategorysList: string[] | null;
  familyMemberCategorys: string;
  familyMemberCategorysListNames: string;
  familyMemberCategorysNamesList: string[] | null;
  memberEducationList: string[] | null;
  memberEducation: string;
  memberEducationListNames: string;
  memberEducationNamesList: string[] | null;
  familyMemberEducationList: string[] | null;
  familyMemberEducation: string;
  familyMemberEducationListNames: string;
  familyMemberEducationNamesList: string[] | null;
  maritalStatusList: string[] | null;
  maritalStatus: string;
  maritalStatusListNames: string;
  maritalStatusNamesList: string[] | null;
  organizationTypeList: string[] | null;
  organizationType: string;
  organizationTypeListNames: string;
  organizationTypeNamesList: string[] | null;
  isSelfOrFamilyMember: string;
  isAlreadyAvailed: boolean;
  isSingleCategorySelect: boolean;
  minimumAge: number;
  maximumAge: number;
  isActive: boolean;
  fromDate: string;
  fromDateString: string;
  toDate: string;
  toDateString: string;
  documents: SchemRequiredDocumentGroups[] | null;
}
export interface ConfigurationSchemeCostFieldModel {
  id: string;
  schemeId: string;
  fieldId: string;
  isRequired: boolean;
  isVisible: boolean;
  isRequiredStr?: string;
  isVisibleStr?: string;
  tooltip: string;
  isActive: boolean;
  field?: string;
}

export interface ConfigurationSchemeCostValidationModel {
  id: string;
  schemeId: string;
  checkFieldIds: string[];
  baseFieldIds: string[];
  conditionId: string;
  value: string;
  unitId: string;
  isActive: boolean;
  checkFields?: string | null;
  baseFields?: string | null;
  condition?: string | null;
  unit?: string | null;
}
export interface SchemeConfigDropdownModel {
  targetGroups: TCModel[] | null;
  dependents: TCModel[] | null;
  statuses: TCModel[] | null;
  costFields: TCModel[] | null;
  costFieldsWithTotal: TCModel[] | null;
  conditions: TCModel[] | null;
  units: TCModel[] | null;
}

export interface ConfigurationSchemeSubsidyModel extends AuditColumnsModel {
  id: string;
  schemeId: string;
  totalSubsidyCost: number;
  totalProjectCost: number;
  subsidyPercentage: number;
  subsidyCost: number;
  maxProjectCost: number;
  maxApplicationCount: number;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  districtsWiseSubsidyModels: ConfigurationdDistrictsWiseSubsidyModel[] | null;
}

export interface ConfigurationdDistrictsWiseSubsidyModel
  extends AuditColumnsModel {
  id: string;
  configurationSchemeSubsidyId: string;
  districtId: string;
  maxPojectCost: number;
  maxSubsidyCost: number;
  maxApplicationCount: number;
  district: string;
}

export interface SchemeSubCategoryConfigurationModel {
  schemeId: string;
  subCategoryId: string;
  subCategory: string;
  communityId: string;
  community: string;
  occurrence: string;
  recurrence: string;
  amount: number;
  occurrenceList: TCModel[] | null;
  recurrenceList: TCModel[] | null;
}

export interface SchemeSubCategoryConfigurationSaveModel {
  schemeId: string;
  subCategoryId: string;
  subCategory: string;
  communityId: string;
  community: string;
  occurrence: string;
  recurrence: string;
  amount: number;
}
export interface ConfigSchemeGroupModel {
  id: string;
  groupName: string;
  groupNameTamil: string;
  description: string;
  groupImage: string;
  schemeIds: string;
  schemeIdsList: string[];
  isActive: boolean;
}

export interface ConfigSchemeGroupSaveModel {
  id: string;
  groupName: string;
  groupNameTamil: string;
  description: string;
  groupImage: string;
  schemeIds: string | undefined;
  schemeIdsList: string[];
  isActive: boolean;
}
export interface SchemeSubCategoryConfigurationModel {
  groupId: string;
  schemeId: string;
  subCategoryId: string;
  subCategory: string;
  communityId: string;
  community: string;
  occurrence: string;
  recurrence: string;
  amount: number;
  occurrenceList: TCModel[] | null;
  recurrenceList: TCModel[] | null;
}

export interface SchemeSubCategoryConfigurationSaveContainerModel {
  congurationList: SchemeSubCategoryConfigurationSaveModel[];
  fromDate: string;
  fromDateString: string;
  toDate: string;
  toDateString: string;
  groupId: string;
  schemeId: string;
}

export interface SchemeSubCategoryConfigurationFormContainerModel {
  congurationList: SchemeSubCategoryConfigurationModel[];
  fromDate: string;
  fromDateString: string;
  toDate: string;
  toDateString: string;
  groupId: string;
  schemeId: string;
}

export interface SchemeSubCategoryConfigurationDateWiseModel
  extends AuditColumnsModel {
  groupId: string;
  fromDate: string;
  fromDateString: string;
  toDate: string;
  toDateString: string;
}

export interface SchemeSubCategoryConfigurationSaveModel {
  groupId: string;
  schemeId: string;
  subCategoryId: string;
  subCategory: string;
  communityId: string;
  community: string;
  occurrence: string;
  recurrence: string;
  amount: number;
}

export interface SchemRequiredDocumentGroups {
  groupName: string;
  requiredDocumentCategory: SchemRequiredCategoryDocuments[] | null;
}

export interface SchemRequiredCategoryDocuments {
  categoryName: string;
  applicableDocuments: string[];
}
