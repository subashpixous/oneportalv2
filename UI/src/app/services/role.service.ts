import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import { ConfigurationModel } from '../_models/ConfigurationModel';
import {
  AccountRolePrivilegeViewModel,
  AccountRoleViewModel,
} from '../_models/AccountRoleViewModel';
import {
  ApprovalFlowAddRoleModel,
  ApprovalFlowNewViewMaster,
  CardPrintStatusOrderModel,
  ConfigSchemeStatusMappingModel,
  DocumentGroupConfigurationOrderModel,
  SchemeGroupOrderingModel,
  SchemeOrderingModel,
  SchemeStatusMappingSaveModel,
} from '../_models/ApprovalFlowViewMaster';
import { AccountPrivilegeSaveViewModel } from '../_models/AccountPrivilegeFormModel';
import { RolePrivilegeModel } from '../_models/Application.PrivelegeModel';

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private http: HttpClient) {}
  Role_Get(roleid?: string, isActive: boolean = true) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Role_Get?RoleId=${roleid}&IsActive=${isActive}`
    );
  }
  saveRole(obj: AccountRoleViewModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Role_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  getRolePrivileges(roleid?: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Role_Privilege_Get?RoleId=${roleid}`
    );
  }
  saveRolePrivilege(obj: AccountPrivilegeSaveViewModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Role_Privilege_Save`,
      obj,
      httpOptions
    );
  }
  GetApprovalFlowRoleList(val: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/ApprovalFlow_GetRoleList?SchemeId=${val}`
    );
  }
  GetApprovalFlow(val: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/ApprovalFlow_Get?SchemeId=${val}`
    );
  }
  RemoveRoleApprovalFlow(id: string, roleid?: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/ApprovalFlow_Remove_Role?Id=${roleid}&RoleId=${roleid}`
    );
  }
  AddApprovalFlow_Role(obj: ApprovalFlowAddRoleModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/ApprovalFlow_Add_Role`,
      obj,
      httpOptions
    );
  }
  SaveUpdateApprovalFlow(obj: ApprovalFlowNewViewMaster[]) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/ApprovalFlow_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  ApplicationPrivilegeFormGet(id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/ApplicationPrivilegeFormGet?SchemeId=${id}`
    );
  }
  ApplicationPrivilegeForm_Save(obj: RolePrivilegeModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/ApplicationPrivilegeForm_Save`,
      obj,
      httpOptions
    );
  }

  Scheme_Status_Mapping_By_Scheme(val: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Scheme_Status_Mapping_Get_Status_List_By_Scheme?SchemeId=${val}`
    );
  }
  Scheme_Status_Mapping_Get(val: string[]) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Scheme_Status_Mapping_Get?SchemeId=${val}`
    );
  }
  Scheme_Status_Mapping_Generate_Status(obj: SchemeStatusMappingSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Scheme_Status_Mapping_Generate_Status`,
      obj,
      httpOptions
    );
  }
  Scheme_Status_Mapping_Save(obj: ConfigSchemeStatusMappingModel[]) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Scheme_Status_Mapping_Save`,
      obj,
      httpOptions
    );
  }
  Get_Status_Select_List_By_Scheme(val: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Get_Status_Select_List_By_Scheme?SchemeId=${val}`
    );
  }

  Document_Configuration_Group_Order_Save(
    obj: DocumentGroupConfigurationOrderModel[]
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Document_Configuration_Group_Order_Save`,
      obj,
      httpOptions
    );
  }
  Config_UpdateCardPrintStatusSortOrder(obj: CardPrintStatusOrderModel[]) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_UpdateCardPrintStatusSortOrder`,
      obj,
      httpOptions
    );
  }
  Document_Configuration_Group_Get(val: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Document_Configuration_Group_Get?SchemeId=${val}`
    );
  }

  Config_Scheme_Group_Get_SortOrder() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Group_Get_SortOrder`
    );
  }
  Config_Scheme_Group_Save_SortOrder(obj: SchemeGroupOrderingModel[]) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Group_Save_SortOrder`,
      obj,
      httpOptions
    );
  }
  Config_Scheme_Get_SortOrder(GroupId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Get_SortOrder?GroupId=${GroupId}`
    );
  }
  Config_Scheme_Save_SortOrder(obj: SchemeOrderingModel[]) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Save_SortOrder`,
      obj,
      httpOptions
    );
  }
}
