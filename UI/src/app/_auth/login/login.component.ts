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
import { first } from 'rxjs';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { ResponseModel, SuccessStatus } from 'src/app/_models/ResponseStatus';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.scss'],
  providers: [MessageService],
  styles: [
    `
      :host ::ng-deep .pi-eye,
      :host ::ng-deep .pi-eye-slash {
        transform: scale(1.6);
        margin-right: 1rem;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  msgs: Message[] = [];
  valCheck: string[] = ['remember'];
  ErrorMessage!: string;
  isError: boolean = false;
  rememberMe: boolean = false;
  password!: string;
  username!: string;
  isEmailLogin: boolean = true;
  mobile!: string;
  otp!: string;
  showotp: boolean = false;
  showCounter: boolean = false;
  showResendOtp: boolean = false;
  counter = 60;
  tick = 1000;
  breadcrumbs!: BreadcrumbModel[];
  identifier!: string;
  // NEW VARIABLES FOR SUCCESS SCREEN
  isLoginSuccess: boolean = false;
  successMessage: string = '';
  returnUrl: string = '';
  constructor(
    public layoutService: LayoutService,
    private permissionsService: NgxPermissionsService,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'TNCWWB Login',
        routing: '',
        isActionable: false,
      },
    ];
  }

  clearErrormessage(value: any) {
    this.isError = false;
    this.ErrorMessage = '';
  }
  bckClick() {
    this.router.navigate(['applicant']);
  }
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) event.preventDefault();
  }

  onSubmit() {
    if (
      this.username &&
      this.username != '' &&
      this.password &&
      this.password != ''
    ) {
      this.ErrorMessage = '';
    } else {
      this.ErrorMessage = 'Invalid username and password';
      this.isError = true;
      return;
    }
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

        // modified by indu for storing user details in session
        sessionStorage.setItem('privillage', privillage);
        sessionStorage.setItem('user', JSON.stringify(userdetails));

        this.cookieService.set('token', accessToken, 1);

        this.cookieService.set('refreshToken', refreshToken, 1);
        this.cookieService.set('accesstype', 'OFFICER', 1);
        this.permissionsService.loadPermissions(privillage);

        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('accesstype', 'OFFICER');
        sessionStorage.setItem('token', accessToken);

        // When checker navigates to user OTP login
// TRIGGER SUCCESS SCREEN INSTEAD OF IMMEDIATE NAVIGATION
const returnUrl =
            this.route.snapshot.queryParams['returnUrl'] || '/officers';
        this.successMessage = 'Login Successfully';
        this.isLoginSuccess = true;

      } else {
        this.ErrorMessage = x.message;
        this.isError = true;
      }
    });
  }

  onMobileSubmit() {
    if (!this.showotp) {
      this.authService.CheckMobileRole(this.identifier).subscribe((x) => {
        if (x.status === 'SUCCESS') {
          this.showotp = true;
          this.startOtpTimer();
        } else {
          this.ErrorMessage = x.message || 'Mobile number not found in system';
          this.isError = true;
        }
      });
    } else {
      // Second step: Validate OTP for role-based users
      this.authService
        .CheckMobileRoleValidateOtp(this.identifier, this.otp)
        .subscribe((x) => {
          console.log('RAW API RESPONSE:', x); // Debug the full response
          console.log('Response data:', x.data); // Debug the data
          console.log('Privileges type:', typeof x.data.privillage); // Debug privileges type
          console.log('Privileges value:', x.data.privillage); // Debug privileges value

          if (x.status === 'SUCCESS') {
            this.handleMobileLoginSuccess(x.data);
          } else {
            this.ErrorMessage = x.message;
            this.isError = true;
          }
        });
    }
  }

  handleMobileLoginSuccess(user: any) {
    let privillage = user.privillage;
    let accessToken: string = user.accessToken;
    let refreshToken = user.refreshToken;

    user.privillage = null;
    user.accessToken = null;
    user.refreshToken = null;

    accessToken = accessToken.replace('Bearer ', '');

    this.cookieService.set('privillage', privillage, 1);
    this.cookieService.set('user', JSON.stringify(user), 1);
    this.cookieService.set('token', accessToken, 1);
    this.cookieService.set('refreshToken', refreshToken, 1);
    this.cookieService.set('accesstype', 'OFFICER', 1);
    this.cookieService.set('privillage', privillage, 1);
    this.cookieService.set('user', JSON.stringify(user), 1);

    this.permissionsService.loadPermissions(privillage);

// TRIGGER SUCCESS SCREEN INSTEAD OF IMMEDIATE NAVIGATION
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/officers';
    this.successMessage = 'OTP Verified Successfully';
    this.isLoginSuccess = true;
  }

  startOtpTimer() {
    this.showCounter = true;
    this.showResendOtp = false;
    this.counter = 60;
    const timer = setInterval(() => {
      this.counter--;
      if (this.counter <= 0) {
        clearInterval(timer);
        this.showCounter = false;
        this.showResendOtp = true;
      }
    }, this.tick);
  }

  resendOTP() {
    this.otp = '';
    this.showotp = false;
    this.onMobileSubmit();
  }

  // Called when user clicks "Continue" on the success card
  onContinue() {
    this.router.navigateByUrl(this.returnUrl);
  }

  handleOfficerLoginSuccess(user: any) {
    let privillage = user.privillage;
    let accessToken: string = user.accessToken;
    let refreshToken = user.refreshToken;

    user.privillage = null;
    user.accessToken = null;
    user.refreshToken = null;

    accessToken = accessToken.replace('Bearer ', '');

    this.cookieService.set('privillage', privillage, 1);
    this.cookieService.set('user', JSON.stringify(user), 1);
    this.cookieService.set('token', accessToken, 1);
    this.cookieService.set('refreshToken', refreshToken, 1);
    this.cookieService.set('accesstype', 'OFFICER', 1);
    this.cookieService.set('privillage', privillage, 1);
    this.cookieService.set('user', JSON.stringify(user), 1);
    this.permissionsService.loadPermissions(privillage);

const returnUrl =
            this.route.snapshot.queryParams['returnUrl'] || '/officers';
    this.router.navigateByUrl(returnUrl);
  }

  // handleMobileRoleLoginSuccess(user: any) {
  //   let privileges = user.privileges || [];
  //   let accessToken: string = user.accessToken;
  //   let refreshToken = user.refreshToken;

  //   // Prepare user data for storage
  //   const userData = {
  //     userId: user.userId,
  //     userName: user.userName,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     email: user.email,
  //     mobile: user.userDetails?.mobile,
  //     role: user.role,
  //     roleCode: user.roleCode,
  //     userNumber: user.userNumber,
  //     isActive: user.isActive
  //   };

  //   accessToken = accessToken.replace('Bearer ', '');

  //   this.cookieService.set('privillage', JSON.stringify(privileges), 1);
  //   this.cookieService.set('user', JSON.stringify(userData), 1);
  //   this.cookieService.set('token', accessToken, 1);
  //   this.cookieService.set('refreshToken', refreshToken, 1);
  //   this.cookieService.set('accesstype', 'OFFICER', 1);

  //   this.permissionsService.loadPermissions(privileges);

  //   const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/officers';
  //   this.router.navigateByUrl(returnUrl);
  // }

  // Toggle between email and mobile login
  toggleLoginType() {
    this.isEmailLogin = !this.isEmailLogin;
    this.resetForm();
  }

  resetForm() {
    this.username = '';
    this.password = '';
    this.mobile = '';
    this.otp = '';
    this.showotp = false;
    this.showCounter = false;
    this.showResendOtp = false;
    this.isError = false;
    this.ErrorMessage = '';
    this.isLoginSuccess = false; // reset success screen
  }
}
