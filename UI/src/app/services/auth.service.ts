import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { ResponseModel } from '../_models/ResponseStatus';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}
  authenticate() {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Login/ValidateUser`
    );
  }
  login(username: string, password: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers };
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Account/Login`,
      {
        username,
        password,
      },
      options
    );
  }
  ApplicantLogin(mobileNumber: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Account/ApplicantLogin?MobileNumber=${mobileNumber}`
    );
  }
  SendOtp(mobileNumber: string) {
    return this.http.get<ResponseModel>(
      `${environment.apiUrl}/Account/SendOtp?MobileNumber=${mobileNumber}`
    );
  }

  ValidateOtp(mobileNumber: string, otp: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers };
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Account/ValidateOtp`,
      {
        mobileNumber: mobileNumber,
        otp: otp,
      },
      options
    );
  }

  ApplicantLogin_ValidateOtp(mobileNumber: string, otp: string, accessType: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers };
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Account/ApplicantLogin_ValidateOtp`,
      {
        mobileNumber: mobileNumber,
        otp: otp,
        accessType: accessType
      },
      options
    );
  }

  savePasword(token: string, otp: string, password: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers };
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Account/SaveNewPassword`,
      {
        token: token,
        oTP: otp,
        password: password,
      },
      options
    );
  }

  getCounter(tick: number) {
    return timer(0, tick);
  }

  private authToken: string | null = null;
  private refreshToken: string | null = null;

  setToken(authToken: string) {
    this.authToken = authToken;
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  getToken(): string | null {
    this.authToken = this.cookieService.get('token');
    return this.authToken;
  }

  getRefreshToken(): string | null {
    this.refreshToken = this.cookieService.get('refreshToken');
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  isRefreshToken(): boolean {
    return !!this.refreshToken;
  }

  refreshTokens(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.getRefreshToken(),
      }),
    };

    return this.http.post('/api2/Login/refresh', {}, httpOptions).pipe(
      tap((tokens: any) => {
        this.cookieService.set('token', tokens.access_token);
        this.cookieService.set('refreshToken', tokens.refresh_token);
        this.setToken(tokens.access_token);
        this.setRefreshToken(tokens.refresh_token);
      })
    );
  }

CheckMobileRole(identifier: string): Observable<ResponseModel> {
  identifier = identifier.trim();
  const params = new HttpParams().set('input', identifier);
  return this.http.get<ResponseModel>(
    `${environment.apiUrl}/Account/CheckMobileRole`,
    { params }
  );
}


CheckMobileRoleValidateOtp(identifier: string, otp: string) {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  const options = { headers };
  return this.http.post<ResponseModel>(
    `${environment.apiUrl}/Account/CheckMobileRoleValidateOtp`,
    {
      mobileNumber: identifier,
      otp: otp,
    },
    options
  );
}

  getMemberByParam(id?: string, memberId?: string, aadhar?: string, phone?: string) {
  let params = new HttpParams();
  if (id) params = params.set('id', id);
  if (memberId) params = params.set('memberId', memberId);
  if (aadhar) params = params.set('aadhar', aadhar);
  if (phone) params = params.set('phone', phone);

  return this.http.get<any>(`${environment.apiUrl}/Account/GetMemberByParam`, { params });
}

}
