import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';
import { httpOptions } from '../_models/utils';
import { CallletterMasterSaveModel } from '../_models/CallletterApplicationModel';
import { CallletterFilterModel } from '../_models/filterRequest';

@Injectable({ providedIn: 'root' })
export class CallLetterService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  Callletter_Application_SelectList_Get(
    District: string,
    SchemeId: string,
    StatusId: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Application_SelectList_Get?District=${District}&SchemeId=${SchemeId}&StatusId=${StatusId}`
    );
  }
  Callletter_GetById(Id: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_GetById?Id=${Id}`
    );
  }
  Callletter_Application_Get(
    Id: string,
    CallletterId: string,
    ApplicationId: string,
    IsActive: boolean
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Application_Get?Id=${Id}&CallletterId=${CallletterId}&ApplicationId=${ApplicationId}&IsActive=${IsActive}`
    );
  }
  Callletter_Application_SaveUpdate(obj: CallletterMasterSaveModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Application_SaveUpdate`,
      obj,
      httpOptions
    );
  }
  Callletter_Get(obj: CallletterFilterModel) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Get`,
      obj,
      httpOptions
    );
  }

  Callletter_Delete(CallletterId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Delete?CallletterId=${CallletterId}`
    );
  }
  Callletter_Cancel_Meeting(CallletterId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Cancel_Meeting?CallletterId=${CallletterId}`
    );
  }
  Callletter_Send_Meeting_Invite(CallletterId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Send_Meeting_Invite?CallletterId=${CallletterId}`
    );
  }
  Callletter_Send_Meeting_Invite_Application(
    CallletterId: string,
    ApplicationId: string
  ) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Send_Meeting_Invite_Application?CallletterId=${CallletterId}&ApplicationId=${ApplicationId}`
    );
  }
  Callletter_Reschedule_Meeting(CallletterId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Reschedule_Meeting?CallletterId=${CallletterId}`
    );
  }
  Callletter_Status_SelectList(schemeId: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Scheme/Callletter_Status_SelectList?schemeId=${schemeId}`
    );
  }
}
