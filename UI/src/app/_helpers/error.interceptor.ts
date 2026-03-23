import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ErrorStatus, ResponseModel } from '../_models/ResponseStatus';
import { Router } from '@angular/router';
import { AccountService } from '../services/account.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private messageService: MessageService,
    private router: Router,
    private accountService: AccountService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          var body: ResponseModel = event.body;
          if (body.status === ErrorStatus) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              life: 2000,
              detail: 'Unexpeted Error! Please try again',
            });
          }
        }
        return event;
      }),
      catchError((err) => {
        const error = err.error?.message || err.statusText;
        if ([401, 403].includes(err.status)) {
          // auto logout if 401 or 403 response returned from api
          this.accountService.logout();
        } else {
          console.error();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error,
          });
        }
        return throwError(() => error);
      })
    );
  }
}
