import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import {
  ConfigSchemeGroupSaveModel,
  ConfigurationSchemeCostFieldModel,
  ConfigurationSchemeCostValidationModel,
  ConfigurationSchemeSaveModel,
  ConfigurationSchemeSubsidyModel,
  SchemeSubCategoryConfigurationSaveModel,
} from '../_models/schemeConfigModel';
import { ApprovalDocConfigViewModel } from '../_features/configuration/approval-status-config/approval-status-config.component';
import {
  ApplicationCostDetails,
  ApplicationMasterSaveModel,
  ApplicationSaveSchemeCostDetails,
  SelectedSchemeSubCategoryGetPayload,
} from '../_models/MemberDetailsModel';
@Injectable({ providedIn: 'root' })
export class SchemeConfigService {
  constructor(private http: HttpClient) {}

  Scheme_Config_Form_Get(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Scheme_Config_Form_Get?SchemeId=${SchemeId}`
    );
  }
  Config_Scheme_Get(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Get?SchemeId=${SchemeId}`
    );
  }
  Config_Scheme_GetBy_GroupId(GroupId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_GetBy_GroupId?GroupId=${GroupId}`
    );
  }
  Member_Eligibilty_Get_By_Scheme(GroupId: string, MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Eligibilty_Get_By_Scheme?MemberId=${MemberId}&SchemeGroupId=${GroupId}`
    );
  }
  Config_Scheme_View_Get(GroupId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_View_Get?GroupId=${GroupId}`
    );
  }
  Config_Scheme_SaveUpdate(obj: ConfigurationSchemeSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Config_Scheme_Cost_Fields_Get(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Cost_Fields_Get?SchemeId=${SchemeId}`
    );
  }
  Config_Scheme_Cost_Fields_SaveUpdate(obj: ConfigurationSchemeCostFieldModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Cost_Fields_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Config_Scheme_Cost_Validation_Get(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Cost_Validation_Get?SchemeId=${SchemeId}`
    );
  }
  Config_Scheme_Cost_Validation_SaveUpdate(
    obj: ConfigurationSchemeCostValidationModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Cost_Validation_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Subsidy_Configuration_SaveUpdate(obj: ConfigurationSchemeSubsidyModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Subsidy_Configuration_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Subsidy_Configuration_Get(id: string, SchemeId: string, isActive: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Subsidy_Configuration_Get?IsActive=${isActive}&SchemeId=${SchemeId}`
    );
  }
  Configuration_Scheme_District_Subsidy_Get(
    ConfigurationSchemeSubsidyId: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Configuration_Scheme_District_Subsidy_Get?ConfigurationSchemeSubsidyId=${ConfigurationSchemeSubsidyId}`
    );
  }
  Config_Scheme_Approval_Doc_Config_Get(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Approval_Doc_Config_Get?SchemeId=${SchemeId}`
    );
  }
  Config_Scheme_Approval_Doc_Config_Save(obj: ApprovalDocConfigViewModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Approval_Doc_Config_Save`,
      obj,
      httpOptions
    );
  }

  Config_Scheme_Sub_Category_Form_Get(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Sub_Category_Form_Get?SchemeId=${SchemeId}`
    );
  }
  Config_Scheme_Sub_Category_Save(
    obj: SchemeSubCategoryConfigurationSaveModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Sub_Category_Save`,
      obj,
      httpOptions
    );
  }

  Config_Scheme_Group_Get(IsActive: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Group_Get?IsActive=${IsActive}`
    );
  }
  Config_Scheme_Group_Save(obj: ConfigSchemeGroupSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Group_Save`,
      obj,
      httpOptions
    );
  }
  Application_Get(ApplicationId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Get?ApplicationId=${ApplicationId}`
    );
  }
  Application_Init(obj: ApplicationMasterSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Init`,
      obj,
      httpOptions
    );
  }
  Application_Scheme_Form(obj: SelectedSchemeSubCategoryGetPayload) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Scheme_Form`,
      obj,
      httpOptions
    );
  }
  Application_Save_Scheme_Cost_Details(obj: ApplicationSaveSchemeCostDetails) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Save_Scheme_Cost_Details`,
      obj,
      httpOptions
    );
  }

  getRequiredDocumentsByGroupId(groupId: string) {
  return this.http.get<any>(
    `${environment.apiUrl}/Settings/Document_Configuration_GetByGroupId?GroupId=${groupId}`
  );
}
getRequiredDocumentsByGroupIds(groupIds: string[]) {
  return this.http.post<any>(
    `${environment.apiUrl}/Settings/Document_Configuration_GetByGroupIds`,
    groupIds
  );
}
}
