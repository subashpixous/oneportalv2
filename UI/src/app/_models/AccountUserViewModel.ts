import { TCModel } from './user/usermodel';
export interface AccountUserViewModel {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  telephone: string;
  isActive: boolean;
  roleId: string;
  userGroup: string;
  dOB: string;
  genderId: string;
  address: string;
  pofileImageId: string;
  pofileThumbnileImageId: string;
  jobTitle: string;
  forgotPasswordOTP: string;
  isSuperAdmin: boolean;
  prefix: string;
  suffix: string;
  runningNumber: number;
  userNumber: string;
  districtIds: string;
  schemesIds: string;
  bankIds: string;
  branchIds: string;
  schemes: string;
  districts: string;
  banks: string;
  branches: string;
  schemeIdList: string[] | null;
  localBodyIdList: string[] | null;
  nameOfLocalBodyIdList: string[] | null;
  blockIdList: string[] | null;
  corporationIdList: string[] | null;
  districtIdList: string[] | null;
  municipalityIdList: string[] | null;
  townPanchayatIdList: string[] | null;
  villagePanchayatIdList: string[] | null;
  zoneIdList: string[] | null;
  bankIdList: string[] | null;
  branchIdList: string[] | null;
  cardPrintStatusIdList: string[] | null;
  userGroupName: string;
  userGroupCode: string;
  roleCode: string;
  roleName: string;
  password: string;
  userName: string;
  loginId: string;
  lastUpdatedBy: string;
  lastUpdatedUserName: string;
  lastUpdatedDate: string | null;
}

export interface UserSaveModel {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  isActive: boolean;
  roleId: string;
  userGroup: string;
  dOB: string;
  genderId: string;
  address: string;
  jobTitle: string;
  password: string;
  userName: string;
  isSuperAdmin: boolean;
  telephone: string;
  districtIdss?: string[];

  localbodyIdss?: string[];
  nameoflocalbodyIdss?: string[];
  blockIdss?: string[];
  corporationIdss?: string[];
  municipalityIdss?: string[];
  village_PanchayatIdss?: string[];
  zoneIdss?: string[];
  town_PanchayatIdss?: string[];
  schemesIdss?: string[];

  bankIdss: string[];
  branchIdss?: string[];
  cardPrintStatusIdss?: string[];
}

export interface AccountUserFormDetailModel {
  roleList: TCModel[];
  genderList: TCModel[];
  userGroupList: TCModel[];
  districtList: TCModel[];
  districtIdList: TCModel[];
  nameOfTheLocalBodyList: TCModel[];
  bankList: TCModel[];
  branchList: TCModel[];
  schemeList: TCModel[];
  cardPrintStatusList: TCModel[];
}

export interface UserProfileImageSaveModel {
  userId: string;
  pofileImageId: string;
  pofileThumbnileImageId: string;
  savedBy: string;
  savedByUserName: string;
  savedDate: string;
}
