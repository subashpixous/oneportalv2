import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Message, MessageService } from 'primeng/api';
import { first, finalize } from 'rxjs';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { ResponseModel, SuccessStatus } from 'src/app/_models/ResponseStatus';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-datachecker-login',
  templateUrl: './datachecker-login.component.html',
  styleUrls: ['./datachecker-login.component.scss'],
})
export class DatacheckerLoginComponent {
  ErrorMessage!: string;
  ErrorUsernameMessage!: string;
  isError: boolean = false;
  password!: string;
  username!: string;
  isEmailLogin: boolean = true;

  showPassword: boolean = false;
  constructor(
    public layoutService: LayoutService,
    private permissionsService: NgxPermissionsService,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // onSubmit() {
  // this.ErrorUsernameMessage = '';
  //   this.ErrorMessage = '';
  //   this.isError = false;

  //   let isValid = true;

  //   // Username validation
  //   if (!this.username || this.username.trim() === '') {
  //     this.ErrorUsernameMessage = 'Username / Email is required';
  //     isValid = false;
  //   }
  //   else {
  //     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //     if (this.username.includes('@') && !emailPattern.test(this.username)) {
  //       this.ErrorUsernameMessage = 'Enter a valid email address';
  //       isValid = false;
  //     }
  //   }

  //   // Password validation
  //   if (!this.password || this.password.trim() === '') {
  //     this.ErrorMessage = 'Password is required';
  //     isValid = false;
  //   }
  //       if (
  //         this.username &&
  //         this.username != '' &&
  //         this.password &&
  //         this.password != ''
  //       ) {
  //         this.ErrorMessage = '';
  //       } else {
  //         this.ErrorMessage = 'Invalid username and password';
  //         this.isError = true;
  //         return;
  //       }
  //       this.authService.login(this.username, this.password).subscribe((x) => {
  //         if (x.status == SuccessStatus) {
  //           let userdetails = x.data;
  //           let privillage = userdetails.privillage;
  //           let accessToken: string = userdetails.accessToken;
  //           let refreshToken = userdetails.refreshToken;

  //           sessionStorage.setItem('privillage', privillage);
  //           sessionStorage.setItem('user', JSON.stringify(userdetails));

  //           userdetails.privillage = null;
  //           userdetails.accessToken = null;
  //           userdetails.refreshToken = null;
  //           accessToken = accessToken.replace('Bearer ', '');
  //           this.cookieService.set('privillage', privillage, 1);
  //           this.cookieService.set('user', JSON.stringify(userdetails), 1);
  //           this.cookieService.set('token', accessToken, 1);

  //           this.cookieService.set('refreshToken', refreshToken, 1);
  //           this.cookieService.set('accesstype', 'OFFICER', 1);
  //           this.permissionsService.loadPermissions(privillage);

  //           sessionStorage.setItem('refreshToken', refreshToken);
  //           sessionStorage.setItem('accesstype', 'OFFICER');
  //           sessionStorage.setItem('token', accessToken);

  //           // When checker navigates to user OTP login

  //           const returnUrl =
  //             this.route.snapshot.queryParams['returnUrl'] || '/officers';
  //           this.router.navigateByUrl(returnUrl);
  //         } else {
  //             this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           life: 2000,
  //           detail: x.message,
  //         });
  //         }
  //       });
  //     }

  onSubmit() {
    // reset errors
    this.ErrorUsernameMessage = '';
    this.ErrorMessage = '';
    this.isError = false;

    let isValid = true;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // USERNAME VALIDATION
    if (!this.username || this.username.trim() === '') {
      this.ErrorUsernameMessage = 'Username / Email is required';
      isValid = false;
    } else if (
      this.username.includes('@') &&
      !emailPattern.test(this.username)
    ) {
      this.ErrorUsernameMessage = 'Enter a valid email address';
      isValid = false;
    } else if (!this.username.includes('@')) {
      this.ErrorUsernameMessage = 'Enter a valid email address';
      isValid = false;
    }

    // PASSWORD VALIDATION
    if (!this.password || this.password.trim() === '') {
      this.ErrorMessage = 'Password is required';
      isValid = false;
    }

    // STOP if validation fails
    if (!isValid) {
      this.isError = true;
      return;
    }

    // API CALL
    this.authService.login(this.username, this.password).subscribe((x) => {
      if (x.status == SuccessStatus) {
        let userdetails = x.data;
        let privillage = userdetails.privillage;
        let accessToken: string = userdetails.accessToken;
        let refreshToken = userdetails.refreshToken;

        sessionStorage.setItem('privillage', privillage);
        sessionStorage.setItem('user', JSON.stringify(userdetails));

        userdetails.privillage = null;
        userdetails.accessToken = null;
        userdetails.refreshToken = null;

        accessToken = accessToken.replace('Bearer ', '');

        this.cookieService.set('privillage', privillage, 1);
        this.cookieService.set('user', JSON.stringify(userdetails), 1);
        this.cookieService.set('token', accessToken, 1);
        this.cookieService.set('refreshToken', refreshToken, 1);
        this.cookieService.set('accesstype', 'OFFICER', 1);

        this.permissionsService.loadPermissions(privillage);

        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('accesstype', 'OFFICER');
        sessionStorage.setItem('token', accessToken);

        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/officers/applications';

        this.router.navigateByUrl(returnUrl);
      } else {
        // API error message
        this.ErrorMessage = 'Invalid username and password';
        this.isError = true;
      }
    });
  }

  goBack() {
    this.router.navigate(['applicant']);
  }
}
