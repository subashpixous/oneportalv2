import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_models/ResponseStatus';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private profileImageSource = new BehaviorSubject<string>('assets/worker-png.png');
  currentProfileImage = this.profileImageSource.asObservable();
  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  changeProfileImage(url: string) {
    this.profileImageSource.next(url);
  }


  public get userValue() {
    if (this.cookieService.check('user')) {
      return JSON.parse(this.cookieService.get('user'));
    } else null;
  }

  login(username: string, password: string) {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/Login/ValidateUser`,
      {
        username,
        password,
      }
    );
  }

  logout() {
    // remove user from local storage and set current user to null
    this.cookieService.delete('user');
    this.cookieService.delete('token');
    this.cookieService.delete('privillage');
    this.cookieService.delete('refreshToken');
    this.cookieService.delete('accesstype');
    this.cookieService.delete('mobile');
    this.cookieService.delete('name');
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
