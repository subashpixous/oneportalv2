import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Message } from 'primeng/api';
import { Subscription } from 'rxjs';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { SuccessStatus } from 'src/app/_models/ResponseStatus';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss'],
})
export class LoginPopupComponent {
  @Input() isVisible = false;
  @Input() navigationpage = '';
  @Input() mobile: string = '';

  @Output() cancelPopup = new EventEmitter<boolean>();
 isUserSubmitAction = false;
  msgs: Message[] = [];
  valCheck: string[] = ['remember'];
  ErrorMessage!: string;
  isError: boolean = false;
  rememberMe: boolean = false;
  otp!: string;

  showotp: boolean = false;
  timerExpired: boolean = false;
  accessType: string = '';
  privilegess: string = '';

  showCounter: boolean = false;
  showResendOtp: boolean = false;
  countDown: Subscription = {} as Subscription;
  counter = 60;
  tick = 1000;
  breadcrumbs!: BreadcrumbModel[];

  hideOTP: boolean = false;
  userId : string = '';

  constructor(
    public layoutService: LayoutService,
    private permissionsService: NgxPermissionsService,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

   this.accessType = this.cookieService.get('accesstype');
   var privilegess = this.cookieService.get('privillage');
   var user = this.cookieService.get('user');
   if(user) {
    var userDetails = JSON.parse(user);
    this.userId = userDetails.userId;
   }
   console.log('userId', this.userId);

    if (this.accessType == 'OFFICER' || this.accessType == 'ADMIN') {
      if(!privilegess.includes('OTP_VERIFICATION')){
        this.hideOTP = true;
      }else {
        this.hideOTP = false;
      }

    }else {
      this.hideOTP = false;
    }

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
    if (this.mobile && this.mobile != '' && this.isUserSubmitAction) {
      this.onSubmit();
    }
  }
  ngOnChanges() {
    if (this.mobile && this.mobile != '' && this.isUserSubmitAction) {
      this.onSubmit();
    }
  }
  
  submit() {
  this.isUserSubmitAction = true;
  this.onSubmit();
}


  clearErrormessage(value: any) {
    this.isError = false;
    this.ErrorMessage = '';
  }

  navigatetoRegister() {}
  onSubmit() {
    if (this.mobile && this.mobile.length == 10) {
      this.ErrorMessage = '';
    } else {
      this.ErrorMessage = 'Mobile number is not valid';
      this.isError = true;
      return;
    }
  if(this.hideOTP === false) {
    console.log('hideOTP');
    if (!this.showotp) {
      this.authService.ApplicantLogin(this.mobile).subscribe((x) => {
        if (x.status == SuccessStatus) {
          this.showotp = true;
          this.showCounter = true;
          this.showResendOtp = false;
          this.counter = 60;
          this.countDown = this.authService
            .getCounter(this.tick)
            .subscribe(() => {
              if (this.counter == 0) {
                this.showCounter = false;
                this.showResendOtp = true;
                this.countDown.unsubscribe();
              }
              this.counter--;
            });
        } else {
          this.ErrorMessage = x.message;
          this.showotp = false;
          this.isError = true;
        }
      });
    } else {
      this.authService
        .ApplicantLogin_ValidateOtp(this.mobile, this.otp.toString(), this.accessType)
        .subscribe((x) => {
          if (x.status == SuccessStatus) {
            let userdetails = x.data;

            let privillage = userdetails.privillage;
            let accessToken: string = userdetails.accessToken;
            let refreshToken = userdetails.refreshToken;
            userdetails.privillage = null;
            userdetails.accessToken = null;
            userdetails.refreshToken = null;
            accessToken = accessToken.replace('Bearer ', '');
            this.cookieService.set('privillage', privillage, 1);
            this.cookieService.set('user', JSON.stringify(userdetails), 1);
            this.cookieService.set('token', accessToken, 1);
            this.cookieService.set('refreshToken', refreshToken, 1);
            this.cookieService.set('mobile', userdetails.mobile, 1);
            this.cookieService.set('name', userdetails.name, 1);
            this.cookieService.set('accesstype', 'APPLICANT', 1);
            this.permissionsService.loadPermissions(privillage);

            const returnUrl = this.navigationpage;
            this.router.navigate([returnUrl]);
          } else {
            this.ErrorMessage = x.message;
            this.isError = true;
          }
        });
    }
  }else {
    console.log('!!!!!!!!!!hideOTP');
    this.authService
        .ApplicantLogin_ValidateOtp(this.mobile, '', this.accessType)
        .subscribe((x) => {
          if (x.status == SuccessStatus) {
            let userdetails = x.data;

            let privillage = userdetails.privillage;
            let accessToken: string = userdetails.accessToken;
            let refreshToken = userdetails.refreshToken;
            userdetails.privillage = null;
            userdetails.accessToken = null;
            userdetails.refreshToken = null;
            accessToken = accessToken.replace('Bearer ', '');
            this.cookieService.set('privillage', privillage, 1);
            this.cookieService.set('user', JSON.stringify(userdetails), 1);
            this.cookieService.set('token', accessToken, 1);
            this.cookieService.set('refreshToken', refreshToken, 1);
            this.cookieService.set('mobile', userdetails.mobile, 1);
            this.cookieService.set('name', userdetails.name, 1);
            this.cookieService.set('accesstype', 'APPLICANT', 1);
            this.permissionsService.loadPermissions(privillage);

            const returnUrl = this.navigationpage;
            this.router.navigate([returnUrl]);
          } else {
            this.ErrorMessage = x.message;
            this.isError = true;
          }
        });
  }
  }

  resendOTP() {
    this.otp = '';
    this.authService.ApplicantLogin(this.mobile).subscribe((x) => {
      if (x.status == SuccessStatus) {
        this.showotp = true;
        this.showCounter = true;
        this.showResendOtp = false;
        this.counter = 60;
        this.countDown = this.authService
          .getCounter(this.tick)
          .subscribe(() => {
            if (this.counter == 0) {
              this.showCounter = false;
              this.showResendOtp = true;
              this.countDown.unsubscribe();
            }
            this.counter--;
          });
      } else {
        this.ErrorMessage = x.message;
        this.showotp = false;
        this.isError = true;
      }
    });
  }
  // cancel() {
  //   this.cancelPopup.emit(!this.isVisible);
  //   alert('cancel' + this.isVisible);
  // }

  cancel() {
  this.isUserSubmitAction = false;
this.resetForm();
  this.cancelPopup.emit(false);
}
resetForm() {
  this.mobile = '';
  this.otp = '';

  this.showotp = false;
  this.showCounter = false;
  this.showResendOtp = false;

  this.isError = false;
  this.ErrorMessage = '';
}

}
