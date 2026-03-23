import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import {
  BranchGetPayloadModel,
  ConfigApprovalDocCategorySaveModel,
  ConfigHelpDocumentSaveModel,
  ConfigurationBranchAddressSaveModel,
  ConfigurationDistrictSaveModel,
  ConfigurationModel,
  FeedbackModel,
} from '../_models/ConfigurationModel';
import {
  ApplicationDocumentConfigurationSaveModel,
  ConfigurationGeneralModel,
  MemberDocumentSaveModel,
} from '../_models/ApplicationDocumentConfigurationSaveModel';
import { ApplicationCountFilterValueModel } from '../_models/DashboardModel';
import {
  ConfigurationSchemeSaveModel,
  SchemeSubCategoryConfigurationSaveContainerModel,
} from '../_models/schemeConfigModel';
import { map, Observable } from 'rxjs';
import { QuickContactSaveModel } from '../_models/MemberDetailsModel';

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private apiUrl = 'https://libretranslate.com/translate'; 
  constructor(private http: HttpClient) {}
    translateToTamil(text: string): Observable<string> {
    return this.http.post<any>(this.apiUrl, {
      q: text,
      source: 'en',
      target: 'ta',
      format: 'text'
    }).pipe(map(res => res.translatedText));
  }
  getAllCategory(CategoryCode: string = '') {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Configuration_Category_Get?CategoryCode=${CategoryCode}&IsGeneralCategory=true`
    );
  }
  getDistrictWiseCards() {
    return this.http.get(
      `${environment.apiUrl}/Report/DistrictWiseCardReport`
    );
  }
  getFileList(): Observable<string[]> {
    return this.http.get<string[]>('assets/file-list.json');
  }
  Configuration_GetSelectByParentConfigurationIds(obj: String[]) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Configuration_GetSelectByParentConfigurationIds`,
      obj,
      httpOptions
    );
  }
  getConfigurationDetailsbyId(data: {
    configId?: string;
    categoryId?: string;
    parentConfigId?: string;
    CategoryCode?: string;
    Code?: string;
    SchemeId?: string;
    ShowParent?: boolean;
  }) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Configuration_Get?ConfigurationId=${
        data.configId ?? ''
      }&CategoryId=${data.categoryId ?? ''}&ShowParent=${
        data.ShowParent ?? false
      }&ParentConfigurationId=${
        data.parentConfigId ?? ''
      }&IsActive=${true}&CategoryCode=${data.CategoryCode ?? ''}&SchemeId=${
        data.SchemeId ?? ''
      }`
    );
  }
  getConfigurationDetailsInSelectListbyId(data: {
    configId?: string;
    categoryId?: string;
    parentConfigId?: string;
    CategoryCode?: string;
    Code?: string;
  }) {
    return this.http.get<ResponseModel>(
      `${
        environment.apiUrl
      }/Settings/ConfigurationSelectList_Get?ConfigurationId=${
        data.configId ?? ''
      }&CategoryId=${data.categoryId ?? ''}&ParentConfigurationId=${
        data.parentConfigId ?? ''
      }&IsActive=${true}&CategoryCode=${data.CategoryCode ?? ''}`
    );
  }
  saveConfiguration(obj: ConfigurationModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Configuration_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  General_Configuration_GetAreaList_ByDistrict(districtid: string = '') {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_GetAreaList_ByDistrict?DistrictId=${districtid}`
    );
  }
  Get_Configration_MLA_MP(parentId: string, categoryCode: string) {
  return this.http.get<any>(
     `${environment.apiUrl}/Settings/ConfigurationSelectList_Get`,
    {
      params: {
        ConfigurationId: '',
        CategoryId: '',
        ParentConfigurationId: parentId,  // 🔥 dynamic
        IsActive: true,
        CategoryCode: categoryCode
      }
    }
  );
}
  
  Config_CardPrintStatusGet() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_CardPrintStatusGet`
    );
  }
  Application_NameOfTheLocalBody_Select_Get(
    MemberId: string = '',
    districtid: string = ''
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Application_NameOfTheLocalBody_Select_Get?MemberId=${MemberId}&DistrictId=${districtid}`
    );
  }
  ConfigurationPincodeSelectList_GetByDistrict(districtid: string = '') {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/ConfigurationPincodeSelectList_GetByDistrict?DistrictId=${districtid}`
    );
  }

  downloads(id: string, filename: string) {
    var fileUrl = `${environment.apiUrl}/Common/DownloadImage?fileId=${id}`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = filename;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }
  SchemeFiledownloads(id: string, filename: string) {
    var fileUrl = `${environment.apiUrl}/Scheme/Application_Document_Download?fileId=${id}`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = filename;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }
  MemberFiledownloads(id: string, filename: string) {
    var fileUrl = `${environment.apiUrl}/Member/Member_Document_Download?fileId=${id}`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = filename;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  qrmemberdownload(savedfilename: string, filename: string) {
    var fileUrl = `${environment.apiUrl}/Member/Common_File_Download_qr?SavedFileName=${savedfilename}&OriginalFileName=${filename}`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = filename;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }
  approvalFiledownloads(savedfilename: string, filename: string) {
    var fileUrl = `${environment.apiUrl}/Scheme/Application_Common_File_Download?SavedFileName=${savedfilename}&OriginalFileName=${filename}`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = filename;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  approvalStatusFiledownloads(savedfilename: string, id: string) {
    var fileUrl = `${environment.apiUrl}/User/Application_Approval_File_Download?Id=${id}`;
    this.DocumentsDownload(fileUrl).subscribe(async (event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = savedfilename;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }
  DocumentsDownload(fileUrl: string) {
    return this.http.get(fileUrl, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
  DocumentsDownloadPost(
    fileUrl: string,
    payload: { year: string; districtIds: [] }
  ) {
    return this.http.post(fileUrl, payload, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }

  RuralDistricts_SaveUpdate(obj: any) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_RuralDistricts_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  UrbanDistricts_SaveUpdate(obj: any) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_UrbanDistricts_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  UrbanDistricts_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_UrbanDistricts_Get`
    );
  }
  General_Configuration_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Get`
    );
  }

  RuralDistricts_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_RuralDistricts_Get`
    );
  }
  Application_Expiry_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Application_Expiry_Get`
    );
  }
  General_Configuration_Member_Dodument_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Member_Dodument_Get`
    );
  }
  Application_Expiry_SaveUpdate(days: number) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Application_Expiry_SaveUpdate?Days=${days}`
    );
  }
  General_Configuration_CanSend_Physical_Card_SaveUpdate(value: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_CanSend_Physical_Card_SaveUpdate?value=${value}`
    );
  }

  General_Configuration_QuickContact_SaveUpdate(obj: QuickContactSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_QuickContact_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Document_Configuration_SaveUpdate(
    obj: ApplicationDocumentConfigurationSaveModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Document_Configuration_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  General_Configuration_Member_NonMandatory_Dodument_SaveUpdate(
    obj: MemberDocumentSaveModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Member_NonMandatory_Dodument_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  General_Configuration_Member_NonMandatory_Dodument_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Member_NonMandatory_Dodument_Get`
    );
  }
  General_Configuration_Family_Member_Dodument_SaveUpdate(
    obj: MemberDocumentSaveModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Family_Member_Dodument_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  General_Configuration_Family_Member_Dodument_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Family_Member_Dodument_Get`
    );
  }

  General_Configuration_Family_Member_NonMandatory_Dodument_SaveUpdate(
    obj: MemberDocumentSaveModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/
General_Configuration_Family_Member_NonMandatory_Dodument_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  General_Configuration_Family_Member_NonMandatory_Dodument_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Family_Member_NonMandatory_Dodument_Get`
    );
  }
  General_Configuration_Member_Dodument_SaveUpdate(
    obj: MemberDocumentSaveModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/General_Configuration_Member_Dodument_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Document_Configuration_Get(
    id?: string,
    schemeId?: string,
    grpid?: string,
    isActive?: boolean
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Document_Configuration_Get?IsActive=${isActive}&schemeId=${schemeId}`
    );
  }
  Subsidy_Configuration_SaveUpdate(obj: ConfigurationSchemeSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Subsidy_Configuration_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Subsidy_Configuration_Get(
    id: string,
    schemeId: string,
    CommunityId: string,
    isActive: boolean
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Subsidy_Configuration_Get?IsActive=${isActive}`
    );
  }

  Branch_Address_Get(BankId: number, BranchId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Branch_Address_Get?BankId=${BankId}&BranchId=${BranchId}`
    );
  }
  Branch_Dropdown_Get(obj: BranchGetPayloadModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Branch_Dropdown_Get`,
      obj,
      httpOptions
    );
  }

  Branch_Address_SaveUpdate(obj: ConfigurationBranchAddressSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Branch_Address_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Config_Scheme_Get(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Get?SchemeId=${SchemeId}`
    );
  }
  Config_Scheme_Get_By_Code(SchemeCode: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Get_By_Code?SchemeCode=${SchemeCode}`
    );
  }

  Config_Scheme_SaveUpdate(obj: ConfigurationSchemeSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_SaveUpdate`,
      obj,
      httpOptions
    );
  }

  Application_GetCount(obj: ApplicationCountFilterValueModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Application_GetCount`,
      obj,
      httpOptions
    );
  }
  Configuration_Get_Scheme_SelectList() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Configuration_Get_Scheme_SelectList`
    );
  }
  Configuration_Get_Category_SelectList(SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Configuration_Get_Category_SelectList?SchemeId=${SchemeId}`
    );
  }

  Config_District_SaveUpdate(obj: ConfigurationDistrictSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_District_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Config_District_Get(districtId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_District_Get?districtId=${districtId}`
    );
  }
  Branch_Dropdown_Search(SearchString: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Branch_Dropdown_Search?SearchString=${SearchString}`
    );
  }
  Config_Help_Document_Form() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Help_Document_Form`
    );
  }
  Config_Help_Document_Get(
    Id: string,
    RoleId: string,
    SchemeId: string,
    Type: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Help_Document_Get?Id=${Id}&RoleId=${RoleId}&SchemeId=${SchemeId}&Type=${Type}`
    );
  }
  Config_Help_Document_SaveUpdate(obj: ConfigHelpDocumentSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Help_Document_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Config_Help_Document_Delete(Id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Help_Document_Delete?Id=${Id}`
    );
  }
  Config_Approval_Doc_Category_Save(obj: ConfigApprovalDocCategorySaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Approval_Doc_Category_Save`,
      obj,
      httpOptions
    );
  }
  Config_Approval_Doc_Category_Get(
    SchemeId?: string,
    StatusId?: string,
    DocCategoryId?: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Approval_Doc_Category_Get?SchemeId=${SchemeId}&StatusId=${StatusId}&DocCategoryId=${DocCategoryId}`
    );
  }

  Config_Scheme_Sub_Category_Get_List(Id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Sub_Category_Get_List?SchemeId=${Id}`
    );
  }
  Config_Scheme_Sub_Category_Form_Get(SchemeId: string, GroupId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Sub_Category_Form_Get?SchemeId=${SchemeId}&GroupId=${GroupId}`
    );
  }
  Config_Scheme_Sub_Category_Save(
    obj: SchemeSubCategoryConfigurationSaveContainerModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Sub_Category_Save`,
      obj,
      httpOptions
    );
  }
  Config_Scheme_Sub_category_Delete(GroupId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Settings/Config_Scheme_Sub_category_Delete?GroupId=${GroupId} `
    );
  }

  Feedback_Get(obj: FeedbackModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Common/Feedback_Get`,
      obj,
      httpOptions
    );
  }
  Feedback_SaveUpdate(obj: FeedbackModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Common/Feedback_SaveUpdate`,
      obj,
      httpOptions
    );
  }
}
