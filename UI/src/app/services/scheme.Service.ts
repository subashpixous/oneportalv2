import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import {
  ApplicationGeneralDetailModel,
  ApplicationPersonalDetailModel,
  ApplicationProjectDetailModel,
  ApprovalModel,
  BulkApprovalModel,
  SubsidyValueGetFormModel,
} from '../_models/schemeModel';
import {
  ApplicationFilterModel,
  MemberFilterModel,
} from '../_models/filterRequest';
import {
  ApplicationUtilizationCirtificateSaveModel,
  ApplicationUtilizationCirtificateUploadFormModel,
} from '../_models/UCModel';
import {
  ApplicationForm3SaveModel,
  ApplicationForm3UploadFormModel,
} from '../_models/ApplicationForm3Model';
import { ApplicationApprovalFileSaveModel } from '../_models/ConfigurationModel';
import { ApplicationDocumentVerificationMasterModel } from '../_models/MemberDetailsModel';

@Injectable({ providedIn: 'root' })
export class SchemeService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  Applicant_Application_Get() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Applicant/Application_Get`
    );
  }
  Application_Get(id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Get?ApplicationId=${id}`
    );
  }
  applicationFormGet(applicationId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Form_Get?ApplicationId=${applicationId}`
    );
  }
  saveGeneral(obj: ApplicationGeneralDetailModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/General_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  saveProject(obj: ApplicationProjectDetailModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Project_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  savePerosonal(obj: ApplicationPersonalDetailModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Personal_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  getDocument(appid: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Document_Get?ApplicationId=${appid}`
    );
  }
  deleteDocument(id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Document_Delete?Id=${id}`
    );
  }
  Application_Document_Get_From_Member_Doc_Table(
    MemberId: string,
    ApplicationId: string,
    SchemeId: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Document_Get_From_Member_Doc_Table?MemberId=${MemberId}&SchemeId=${SchemeId}&ApplicationId=${ApplicationId}`
    );
  }
  Member_Document_Delete_From_Application(
    MemberId: string,
    DocumentCategoryId: string,
    ApplicationId: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Member/Member_Document_Delete_From_Application?DocumentCategoryId=${DocumentCategoryId}&MemberId=${MemberId}&ApplicationId=${ApplicationId}`
    );
  }
  User_Application_Get(id?: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/Application_Get?ApplicationId=${id}`
    );
  }
  User_Application_GetList(obj: ApplicationFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Application_GetList`,
      obj,
      httpOptions
    );
  }
  Document_Verification_SaveUpdate(
    obj: ApplicationDocumentVerificationMasterModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Document_Verification_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Member_GetList(obj: MemberFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Member_GetList`,
      obj,
      httpOptions
    );
  }
    getAllForExport(obj: MemberFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Member_GetList_Export`,
      obj,
      httpOptions
    );
  }
//   exportMembers(filter: any, type: string) {
//   return this.http.post(`${environment.apiUrl}/User/Export?exportType=${type}`, filter, {
//     responseType: 'blob'
//   });
// }
// exportMembers(filter: any, type: string) {
//   const body = {
//     filter,
//     exportType: type
//   };

//   return this.http.post(`${environment.apiUrl}/User/Export`, body, {
//     responseType: 'blob'
//   });
// }
// exportMembers(filter: any, type: string): Observable<HttpEvent<Blob>> {
//   return this.http.post(`${environment.apiUrl}/User/Export`,
//     { filter, exportType: type },
//     {
//       responseType: 'blob',
//       observe: 'events',
//       reportProgress: true
//     });
// }
  // exportMembers(filter: any, type: string): Observable<HttpEvent<Blob>> {
  //   const body = { filter, exportType: type };
  //   const req = new HttpRequest('POST', `${environment.apiUrl}/User/Export`, body, {
  //     reportProgress: true,
  //     responseType: 'blob'
  //   } as any); // 'as any' because HttpRequest options typing is awkward for responseType

  //   return this.http.request(req); // returns Observable<HttpEvent<Blob>>
  // }

  // startExport(filter: any, exportType: string): Observable<{ jobId: string; message: string }> {
  //   const payload = {
  //     filter: filter,
  //     exportType: exportType
  //   };
  //   return this.http.post<{ jobId: string; message: string }>(`${environment.apiUrl}/User/Export`, payload);
  // }

  // 2️⃣ Poll job status
  getExportStatus(jobId: string): Observable<{ status: string; filePath?: string; errorMessage?: string }> {
    return this.http.get<{ status: string; filePath?: string; errorMessage?: string }>(
      `${environment.apiUrl}/User/Export/Status/${jobId}`
    );
  }
//  exportMembers(filterModel: any, exportType: string): Observable<Blob> {
//     const headers = new HttpHeaders({
//       Accept: 'application/octet-stream'
//     });

//     const payload = {
//       filter: filterModel,
//       exportType: exportType
//     };

//     return this.http.post(`${environment.apiUrl}/User/Export`, payload, {
//       headers,
//       responseType: 'blob'
//     });
//   }





// startExport(filter: any, type: string) {
//   const body = { filter, exportType: type };
//   return this.http.post(`${environment.apiUrl}/User/StartExport`, body);
// }
startExport(filterModel: any, exportType: string): Observable<any> {
  const headers = new HttpHeaders({
    Accept: 'application/json',
    'X-Skip-Loader': 'true'
  });

  const payload = {
    filter: filterModel,
    exportType: exportType
  };

  return this.http.post(`${environment.apiUrl}/User/Export`, payload, { headers });
}


//add by vijay 07-11-2025 for export excel
startDatewiseExport(filterModel: any, exportType: string): Observable<any> {
  const headers = new HttpHeaders({
    Accept: 'application/json',
    'X-Skip-Loader': 'true'
  });

  const payload = {
    filter: filterModel,
    exportType: exportType
  };

  return this.http.post(`${environment.apiUrl}/User/ExportDatewiseApprovedList`, payload, { headers });
}




downloadExport(jobId: string) {
  return this.http.get(`${environment.apiUrl}/User/DownloadExport/${jobId}`, { responseType: 'blob' });
}
// downloadExportFile(downloadUrl: string): Observable<Blob> {
//   return this.http.get(downloadUrl, {
//     responseType: 'blob'
//   });
// }
downloadExportFile(downloadUrl: string): Observable<Blob> {
  const headers = new HttpHeaders({ 'X-Skip-Loader': 'true' });
  return this.http.get(downloadUrl, { headers, responseType: 'blob' });
}
startMemberListExport(filterModel: any, exportType: string): Observable<any> {
  const headers = new HttpHeaders({
    Accept: 'application/json',
    'X-Skip-Loader': 'true'
  });

  const payload = {
    filter: filterModel,
    exportType: exportType
  };

  return this.http.post(`${environment.apiUrl}/User/ExportMemberList`, payload, { headers });
}



  User_Application_Approval(obj: ApprovalModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Application_Approve`,
      obj,
      httpOptions
    );
  }
  Application_Approve_Get_Status_List(id?: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/Application_Approve_Get_Status_List?ApplicationId=${id}`
    );
  }
  Application_Approve(obj: ApprovalModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Application_Approve`,
      obj,
      httpOptions
    );
  }
  Application_Bulk_Approve_Get_Status_List(StatusId: string, SchemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/Application_Bulk_Approve_Get_Status_List?StatusId=${StatusId}&SchemeId=${SchemeId}`
    );
  }
  Application_BulkApprove(obj: BulkApprovalModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Application_BulkApprove`,
      obj,
      httpOptions
    );
  }

  GetStatusListByScheme(SchemeId: string, IsBulkApproval: boolean) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/GetStatusListByScheme?SchemeId=${SchemeId}&IsBulkApproval=${IsBulkApproval}`
    );
  }
  Profile_Delete(id?: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Profile_Delete?ApplicationId=${id}`
    );
  }
  SubsidyValueGet(obj: SubsidyValueGetFormModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/SubsidyValueGet`,
      obj,
      httpOptions
    );
  }
  BranchGetByIFSC(id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/BranchGetByIFSC?ifsc=${id}`
    );
  }
  Application_Utilisation_Certificate_SaveUpdate(
    obj: ApplicationUtilizationCirtificateSaveModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Utilisation_Certificate_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Application_Utilisation_Certificate_Upload(
    obj: ApplicationUtilizationCirtificateUploadFormModel
  ) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Utilisation_Certificate_Upload`,
      obj,
      httpOptions
    );
  }
  Application_Utilisation_Certificate_Get(id: string, ApplicationId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Utilisation_Certificate_Get?id=${id}&ApplicationId=${ApplicationId}`
    );
  }
  Application_Form_3_SaveUpdate(obj: ApplicationForm3SaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Form_3_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Application_Form_3_Upload(obj: ApplicationForm3UploadFormModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Form_3_Upload`,
      obj,
      httpOptions
    );
  }
  Application_Form_3_Get(id: string, ApplicationId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Form_3_Get?id=${id}&ApplicationId=${ApplicationId}`
    );
  }
  Application_Approval_Doc_Category_Get(
    SchemeId: string,
    ApplicationId: string,
    StatusId: string,
    ApprovalCommentId: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Approval_Doc_Category_Get?SchemeId=${SchemeId}&ApplicationId=${ApplicationId}&StatusId=${StatusId}&ApprovalCommentId=${ApprovalCommentId}`
    );
  }
  Application_Approval_Document_Get(id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Application_Approval_Document_Get?approvalCommentId=${id}`
    );
  }
  Application_Approval_File_Upload(obj: ApplicationApprovalFileSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/User/Application_Approval_File_Upload`,
      obj,
      httpOptions
    );
  }
  Application_Approval_File_Delete(Id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/User/Application_Approval_File_Delete?Id=${Id}`
    );
  }

moveToTrash(request: TrashRequestModel): Observable<any> {
  return this.http.post<any>(
    `${environment.apiUrl}/User/MoveToTrash`,
    request,
    httpOptions
  );
}

/**
 * Restore applications from trash
 */
restoreFromTrash(request: TrashRequestModel): Observable<any> {
  return this.http.post<any>(
    `${environment.apiUrl}/User/RestoreFromTrash`,
    request,
    httpOptions
  );
}

// In SchemeService - Add these methods
deleteApplicationsPermanently(request: { applicationIds: string[] }): Observable<any> {
  return this.http.post<any>(
    `${environment.apiUrl}/Application/DeletePermanently`,
    request,
    httpOptions
  );
}

// Alternative: If you want to use the same method name as in your HTML
getTrashedApplications(
  page: number = 1,
  pageSize: number = 10,
  searchText: string = ''
): Observable<any> {

  const today = new Date();
  const currentYear = today.getFullYear();
  const month = today.getMonth() + 1;

  const financialYear = month >= 4
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;

  // Use the SAVED status ID
  const filter: ApplicationFilterModel = {
    searchString: searchText || null,
    skip: (page - 1) * pageSize,
    take: pageSize,
    sorting: {
      fieldName: 'ModifiedDate',
      sort: 'DESC'
    },
    columnSearch: [],
    where: {
      userId: '',
      schemeIds: [],
      districtIds: [],
      statusIds: ['43ea8ff6-043a-eccd-d9a0-95841bcb48e1'], // SAVED status ID
      isExpired: false,
      year: financialYear,
      isBulkApprovalGet: false,
      showInactiveOnly: false // This is CRITICAL for showing trashed apps
    }
  };

  return this.User_Application_GetList(filter);
}
}
export interface TrashRequestModel {
  applicationIds: string[];
}
