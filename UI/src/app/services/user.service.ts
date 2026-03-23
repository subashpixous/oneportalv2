import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserSaveModel } from '../_models/AccountUserViewModel';
import { TableFilterModelApp } from '../_models/CommonModel';
import { ResponseModel } from '../_models/ResponseStatus';
import { NewResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import { DashboardFilterValueModel } from '../_models/DashboardModel';
import {
  UserBankModel,
  UserBankBranchMappingModel,
  KeyContactPayloadModel,
} from '../_models/user/usermodel';
import {
  MemberCardApprovalGridFilterModel,
  MemberDataApprovalGridFilterModel,
} from '../_models/filterRequest';
import { Member_Card_Approval_Master_From } from '../_models/MemberDetailsModel';
import { Member_Card_Approval_Save_Model } from '../_models/MemberViewModelExsisting';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  GetUserList(filter: TableFilterModelApp) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/User_GetList
        `,
      filter,
      httpOptions,
    );
  }
  Member_Import_Status_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Import_Status_Get`,
    );
  }
  GetUserbyId(Id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/User_Get?UserId=${Id}`,
    );
  }
  GetUserFormDD(Id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/User_Form_Get?UserId=${Id}`,
    );
  }
  Roleget() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/User_Form_Get?UserId=${''}`,
    );
  }
  User_Activate(Id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/User_Activate?UserId=${Id}`,
    );
  }
  SaveUser(model: UserSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/User_SaveUpdate
        `,
      model,
      httpOptions,
    );
  }
  getPDSDetails(rationCardNo: string) {
    return this.http.post<any>(
      `${environment.apiUrl}/Account/PDS_Details?RationCardNo=${rationCardNo}`,
      {},
    );
  }

  getEMISDetails(emis: string) {
    return this.http.post<any>(
      `${environment.apiUrl}/Account/EMIS_Details?EMIS=${emis}`,
      {},
    );
  }
  getUMISDetails(umis: string) {
    return this.http.post<any>(
      `${environment.apiUrl}/Account/UMIS_Details?UMIS=${umis}`,
      {},
    );
  }

  User_Filter_Dropdowns() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/User_Filter_Dropdowns`,
    );
  }
  User_Filter_DropdownswithUserId(Userid: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/User_Filter_DropdownswithUserId?UserId=${Userid}`,
    );
  }
  User_DetailsGet() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Account/LoginUserDetails`,
    );
  }

  MemberDataApprovalGridFilter() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/MemberDataApprovalGridFilter`,
    );
  }

  MemberDataApprovalGridGet(obj: MemberDataApprovalGridFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/MemberDataApprovalGridGet
        `,
      obj,
      httpOptions,
    );
  }
  DatewiseAprovedList(obj: MemberDataApprovalGridFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/DatewiseAprovedList
        `,
      obj,
      httpOptions,
    );
  }
  MemberCardApprovalHistoryGet(obj: MemberCardApprovalGridFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/MemberCardApprovalHistoryGet
        `,
      obj,
      httpOptions,
    );
  }
  MemberCardApprovalGridFilter() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/MemberCardApprovalGridFilter`,
    );
  }
  getUserActivityLogs(filter: any): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Account/getLogs`,
      filter,
      httpOptions,
    );
  }
  MemberCardApprovalGridGet(obj: MemberCardApprovalGridFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/MemberCardApprovalGridGet
        `,
      obj,
      httpOptions,
    );
  }
  // [06-11-2025] Updated by Sivasankar K: Modified To Export All Data
  startMemberCardApprovalExport(
    filterModel: any,
    exportType: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'X-Skip-Loader': 'true',
    });

    const payload = {
      filter: filterModel,
      exportType: exportType,
    };

    return this.http.post(
      `${environment.apiUrl}/User/ExportMemberCardApprovalGrid`,
      payload,
      { headers },
    );
  }
  // [08-11-2025] Updated by Sivasankar K: Modified To Export All Data
  startMemberListExport(filterModel: any, exportType: string): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'X-Skip-Loader': 'true',
    });
    const payload = { filter: filterModel, exportType };
    return this.http.post(
      `${environment.apiUrl}/User/ExportMemberListByAnimator`,
      payload,
      { headers },
    );
  }

  startApplicationListExport(
    filterModel: any,
    exportType: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'X-Skip-Loader': 'true',
    });
    const payload = { filter: filterModel, exportType };
    return this.http.post(
      `${environment.apiUrl}/User/ExportApplicationListByAnimator`,
      payload,
      { headers },
    );
  }

  MemberCardApprovalForm(Id: string, MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/MemberCardApprovalForm?Id=${Id}&MemberId=${MemberId}`,
    );
  }
  MemberCardApproval(obj: Member_Card_Approval_Save_Model) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/MemberCardApproval
        `,
      obj,
      httpOptions,
    );
  }
  Application_GetCount(obj: DashboardFilterValueModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Dashboard/Application_GetCount
        `,
      obj,
      httpOptions,
    );
  }
  Member_GetCount(obj: DashboardFilterValueModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Dashboard/Dashboard_GetCount
        `,
      obj,
      httpOptions,
    );
  }
  Dashboard_GetCount(obj: DashboardFilterValueModel) {
  return this.http.post<ResponseModel>(
    `${environment.apiUrl}/Dashboard/Dashboard_GetCount`,
    obj,
    httpOptions
  );
}
  Key_Contacts(obj: KeyContactPayloadModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Key_Contacts
        `,
      obj,
      httpOptions,
    );
  }
  Role_Get_Select_List() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Role_Get_Select_List`,
    );
  }
  User_GetBranchByBanks(obj: UserBankModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/User_GetBranchByBanks
        `,
      obj,
      httpOptions,
    );
  }
  User_SaveBankBranchMapping(obj: UserBankBranchMappingModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/User_SaveBankBranchMapping
        `,
      obj,
      httpOptions,
    );
  }

  GeneralConfigureQuickContact() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_QuickContact_Get`,
    );
  }

  MemberCard_BulkApprove(payload: any) {
    return this.http.post<NewResponseModel>(
      `${environment.apiUrl}/User/MemberCard_BulkApprove`,
      payload,
    );
  }

  GetApplicationListByAnimator(filter: any): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/GetApplicationListByAnimator`,
      filter,
      httpOptions,
    );
  }

  GetMemberListByAnimator(filter: any): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Report/GetMemberListByAnimator`,
      filter,
      httpOptions,
    );
  }

  DuplicateMemberGridGet(
    filter: DuplicateMemberFilterModel,
  ): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/DuplicateMemberGet`,
      filter, // send your filter model here
      httpOptions,
    );
  }
  RemoveDuplicateMembers(
    model: RemoveDuplicateMembersModel,
  ): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/RemoveDuplicateMembers`,
      model,
      httpOptions,
    );
  }

  // 🆕 Start background export for Member Approval data
  startMemberApprovalExport(
    filterModel: any,
    exportType: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'X-Skip-Loader': 'true', // prevent global spinner
    });

    const payload = {
      filter: filterModel,
      exportType: exportType,
    };

    // Calls your new backend endpoint
    return this.http.post(
      `${environment.apiUrl}/User/ExportMemberApprovalData`,
      payload,
      { headers },
    );
  }
  startMemberCardApprovalHistoryExport(
    filterModel: any,
    exportType: string,
  ): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'X-Skip-Loader': 'true',
    });

    const payload = {
      filter: filterModel,
      exportType: exportType,
    };

    return this.http.post(
      `${environment.apiUrl}/User/ExportMemberCardApprovalHistory`,
      payload,
      { headers },
    );
  }

  downloadExport(jobId: string) {
    return this.http.get(`${environment.apiUrl}/User/DownloadExport/${jobId}`, {
      responseType: 'blob',
    });
  }
}

export interface DuplicateMemberWhereClause {
  districtIds: string[];
  memberId?: string;
  phoneNumber?: string;
  memberCode?: string;
  fullName?: string;
  aadhaarNumber?: string;
  district?: string;
  organizationType?: string;
}

export interface SortingModel {
  fieldName: string;
  sort: 'ASC' | 'DESC';
}

export interface DuplicateMemberFilterModel {
  where: DuplicateMemberWhereClause;
  searchString?: string;
  sorting: SortingModel;
  take: number;
  skip: number;
}
export interface RemoveDuplicateMembersModel {
  MemberIds: string[];
}
// Response wrapper
