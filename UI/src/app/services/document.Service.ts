import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  Application_Get(username: string, password: string) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Applicant/Application_Get`,
      {
        username,
        password,
      }
    );
  }
}
