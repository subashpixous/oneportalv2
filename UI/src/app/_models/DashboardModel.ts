import { TCModel } from './user/usermodel';

export interface ApplicationCountFilterModel {
  yearList: TCModel[] | null;
  schemeList: TCModel[] | null;
  districtList: TCModel[] | null;
  statusList: TCModel[] | null;
}

export interface ApplicationCountFilterValueModel {
  year: string;
  schemeId: string;
  districtId: string;
  statusId?: string;
}

export interface ApplicationRecordCountModel {
  schemeId: string;
  districtId: string;
  year: string;
  recordCount: ApplicationCountModel[] | null;
}

export interface ApplicationCountModel {
  statusId: string;
  statusCode: string;
  status: string;
  count: number;
  order: number;
}

export interface RecordCountNew {
  schemeId: string;
  schemeCode: string;
  statusCode: string;
  count: number;
}
export interface DashboardFilterValueModel {
  year: string;
  schemeId: string;
  isDistrictWise: boolean;
  isSchemeWise: boolean;
  isDueDateWise: boolean;
}

export interface DashboardApplicationCountModel {
  cardCount: ApplicationCountCard[];
  mapCount: ApplicationCountMap[];
  statusCount: ApplicationCountModel[];
}

export interface ApplicationDistrictWiseCount {
  districtId: string;
  districtName: string;
  latitude: number;
  longitude: number;
  count: number;
}

export interface ApplicationSchemeWiseCount {
  schemeId: string;
  schemeName: string;
  count: number;
}
export interface ApplicationCountCard {
  type: string;
  typeId: string;
  label: string;
  count: number;
}

export interface ApplicationCountMap {
  type: string;
  typeId: string;
  districtName: string;
  latitude: number;
  longitude: number;
  count: number;
}
export interface ApplicationCountModel {
  statusId: string;
  statusCode: string;
  status: string;
  count: number;
  percentage: number;
  order: number;
}
