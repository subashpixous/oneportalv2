import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import {
  ApplicationAddressMaster,
  BankDetailSaveModel,
  FamilyMemberSaveModel,
  MemberDataApprovalFromSubmitModel,
  MemberDetailsSaveModel,
  MemberDocumentSaveMaster,
  MemberSaveAllModels,
  OrganizationDetailSaveModel,
} from '../_models/MemberDetailsModel';
import { MemberInitSaveModel } from '../shared/common/common.module';
import { MemberDataApprovalGridFilterModel } from '../_models/filterRequest';
import { Member_Card_Approval_Save_Model } from '../_models/MemberViewModelExsisting';
import { Observable } from 'rxjs';
import { AadharGetOtpModel } from '../_models/aadharmodel';

@Injectable({ providedIn: 'root' })
export class MemberService {
  constructor(private http: HttpClient) {}
  Member_Form_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Form_Get?MemberId=${MemberId}`
    );
  }

  Member_Init_SaveUpdate(obj: MemberInitSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Init_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Member_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Get?MemberId=${MemberId}`
    );
  }
  SendAnonymousOtp(MobileNumber: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Account/SendAnonymousOtp?MobileNumber=${MobileNumber}`
    );
  }

ValidateAnonymousOtp(body: any) {
  return this.http.post<ResponseModel>(
    `${environment.apiUrl}/Account/ValidateAnonymousOtp`,
    body
  );
}

ValidateFormOtp(body: any) {
  return this.http.post<ResponseModel>(
    `${environment.apiUrl}/Account/ValidateFormOtp`,
    body
  );
}

ValidateAadhaarOtp(body: any) {
  return this.http.post<ResponseModel>(
    `${environment.apiUrl}/Account/Aadhar_VerifyOtp`,
    body
  );
}
  SendAadhaarOtp(aadharGetOtpmodel: AadharGetOtpModel): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Account/Aadhar_GetOtp`,
      aadharGetOtpmodel
    );

  }
  Organization_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Organization_Get?MemberId=${MemberId}`
    );
  }
  Member_SaveUpdate(obj: MemberDetailsSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Member_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Member_Get_All(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Get_All?MemberId=${MemberId}`
    );
  }
  PartialChangeRequest_Cancel(MemberId: string, Changed_Detail_Type: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/PartialChangeRequest_Cancel?MemberId=${MemberId}&Changed_Detail_Type=${Changed_Detail_Type}`
    );
  }
  Member_Eligibilty_Get(MemberId: string, SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Eligibilty_Get?MemberId=${MemberId}&SchemeId=${SchemeId}`
    );
  }
  Member_Eligible_FamilyMembers_Get_By_SchemeGroup(MemberId: string, SchemeGroupId: string) {
  return this.http.get<ResponseModel>(
    `${environment.apiUrl}/Member/Member_Eligible_FamilyMembers_Get_By_SchemeGroup?MemberId=${MemberId}&SchemeGroupId=${SchemeGroupId}`
  );
}
  Organization_Form_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Organization_Form_Get?MemberId=${MemberId}`
    );
  }
  Get_Member_All_Details_By_MemberId(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Get_Member_All_Details_By_MemberId?MemberId=${MemberId}`
    );
  }
  Get_Member_All_Details_Diff_By_MemberId(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Get_Member_All_Details_Diff_By_MemberId?MemberId=${MemberId}`
    );
  }
  Get_Member_Detail_View(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Get_Member_Detail_View?MemberId=${MemberId}`
    );
  }
  Organization_SaveUpdate(obj: OrganizationDetailSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Organization_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  MemberData_Approve(obj: MemberDataApprovalFromSubmitModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/MemberData_Approve`,
      obj,
      httpOptions
    );
  }

  MemberDataApprovalForm(RequestId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/MemberDataApprovalForm?RequestId=${RequestId}`
    );
  }
  MemberDataBulkApprovalForm(RequestId: string[]) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/MemberDataApprovalForm?RequestId=${RequestId}`
    );
  }
  Family_Form_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Family_Form_Get?MemberId=${MemberId}`
    );
  }
  Family_Master_Get(MemberId: string, isTemp: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Family_Master_Get?MemberId=${MemberId}&isTemp=${isTemp}`
    );
  }
  Family_SaveUpdate(obj: FamilyMemberSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Family_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Member_New_Family_Member_Save(MemberId: string, MemberName: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_New_Family_Member_Save?MemberId=${MemberId}&MemberName=${MemberName}`
    );
  }

  Bank_SaveUpdate(obj: BankDetailSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Bank_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Member_Bank_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Bank_Get?MemberId=${MemberId}`
    );
  }

  Member_Document_SaveUpdate(obj: MemberDocumentSaveMaster) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Document_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Member_Document_Get(MemberId: string, isTemp: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Document_Get?MemberId=${MemberId}&isTemp=${isTemp}`
    );
  }

  Member_NonMandatory_Document_Get(MemberId: string, isTemp: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_NonMandatory_Document_Get?MemberId=${MemberId}&isTemp=${isTemp}`
    );
  }

  Family_Member_Document_Get(MemberId: string, isTemp: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Family_Member_Document_Get?MemberId=${MemberId}&isTemp=${isTemp}`
    );
  }

  Family_Member_NonMandatory_Document_Get(MemberId: string, isTemp: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Family_Member_NonMandatory_Document_Get?MemberId=${MemberId}&isTemp=${isTemp}`
    );
  }

  Member_Save_All(obj: any) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Save_All`,
      obj,
      httpOptions
    );
  }
  Bank_Form_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Address_Master_Get?MemberId=${MemberId}`
    );
  }
  Member_Document_Delete(Id: string, IsTemp: boolean = false) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Document_Delete?Id=${Id}&IsTemp=${IsTemp}`
    );
  }
  MemberFormGeneralInfo_Get(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/MemberFormGeneralInfo_Get?MemberId=${MemberId}`
    );
  }

  Address_Form_Get(MemberId: string, AddressType: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Address_Form_Get?MemberId=${MemberId}&AddressType=${AddressType}`
    );
  }
  Address_Master_SaveUpdate(obj: ApplicationAddressMaster) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Member/Address_Master_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Address_Master_Get(MemberId: string, AddressType: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Address_Master_Get?MemberId=${MemberId}&AddressType=${AddressType}`
    );
  }

  Search_Member(SearchText: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Search_Member?SearchText=${SearchText}`
    );
  }

  MemberDataApprovalGridGet(obj: MemberDataApprovalGridFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Applicant/MemberDataApprovalGridGet
          `,
      obj,
      httpOptions
    );
  }

  Get_Member_Id_Card(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Get_Member_Id_Card?MemberId=${MemberId}`
    );
  }

  Get_Member_detail_byqr(MemberId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Qr_View?MemberId=${MemberId}`
    );
  }
}
