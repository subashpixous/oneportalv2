import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserModel } from '../_models/user';
import { CookieService } from 'ngx-cookie-service';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector,
    private accountService: AccountService,
    private auth: AuthService,
    private cookieService: CookieService
  ) {}

  jwtHelper: JwtHelperService = new JwtHelperService();
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const token = this.auth.getToken();
    const refreshToken = this.auth.getRefreshToken();

    if (token && refreshToken) {
      if (this.jwtHelper.isTokenExpired(token)) {
        this.auth.refreshTokens().pipe(
          tap(() => {
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            });
          })
        );
      } else {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }
    return next.handle(request);
  }
}
