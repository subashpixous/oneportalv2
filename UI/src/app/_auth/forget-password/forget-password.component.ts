import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'src/app/services/auth.service';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';

@UntilDestroy()
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password-style.scss'],
})
export class ForgetPasswordComponent implements OnInit, OnDestroy {
  isError: boolean = false;
  ErrorMessage: string = '';
  mobileNumber: string = '';
  otp: string = '';
  showOTPField: boolean = false;
  token: string = '';
  disableMobileField: boolean = false;

  buttonLabel: string = 'Send OTP';

  showPassword: boolean = false;
  password: string = '';
  confirmPassword: string = '';

  showCounter: boolean = false;
  showResendOtp: boolean = false;
  countDown: Subscription = {} as Subscription;
  counter = 60;
  tick = 1000;

  disableButton: boolean = false;

  actionCode: string = 'SendOTP';

  breadcrumbs!: BreadcrumbModel[];
  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnDestroy() {
    if (this.countDown) {
    }
  }

  ngOnInit(): void {
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'TNCWWB Forgot Password',
        routing: '',
        isActionable: false,
      },
    ];
  }
  bckClick() {
    this.router.navigate(['/auth/login']);
  }
  clearErrormessage(value: any) {
    this.isError = false;
    this.ErrorMessage = '';
  }

  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  sendotp() {
    this.authService.SendOtp(this.mobileNumber).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.showOTPField = true;
        this.buttonLabel = 'Verify OTP';
        this.actionCode = 'VerifyOTP';

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

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: x?.message,
        });
      }
    });
  }
  resendOTP() {
    if (this.mobileNumber.length == 10) {
      this.sendotp();
    } else {
      this.isError = true;
      this.ErrorMessage = 'Please enter valid mobile number.';
    }
  }

  navigateToLogin() {
    this.router.navigate(['/applicant']);
  }
  validateotp() {
    this.authService.ValidateOtp(this.mobileNumber, this.otp).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
        this.token = '';
      } else if (x) {
        this.token = x.data;
        this.showOTPField = false;
        this.showPassword = true;
        this.disableMobileField = true;
        this.buttonLabel = 'Save Password';
        this.actionCode = 'SavePassword';

        this.showCounter = false;
        this.showResendOtp = false;
        this.countDown.unsubscribe();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: x?.message,
        });
      }
    });
  }
  savenewpass() {
    this.authService
      .savePasword(this.token, this.otp, this.password)
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.disableButton = true;

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: x?.message,
          });

          setTimeout(() => {
            this.navigateToLogin();
          }, 1000);
        }
      });
  }
  onSubmit() {
    if (this.actionCode == 'SendOTP') {
      if (this.mobileNumber.length == 10) {
        this.sendotp();
      } else {
        this.isError = true;
        this.ErrorMessage = 'Please enter valid mobile number.';
      }
    } else if (this.actionCode == 'VerifyOTP') {
      if (this.otp == '') {
        this.isError = true;
        this.ErrorMessage = 'Please enter OTP.';
      } else if (this.otp.length != 6) {
        this.isError = true;
        this.ErrorMessage = 'Please enter valid OTP.';
      } else if (this.otp.length == 6) {
        this.validateotp();
      }
    } else if (this.actionCode == 'SavePassword') {
      if (this.password == '') {
        this.isError = true;
        this.ErrorMessage = 'Please enter password';
      } else if (this.confirmPassword == '') {
        this.isError = true;
        this.ErrorMessage = 'Please enter confirm password';
      } else if (this.password != this.confirmPassword) {
        this.isError = true;
        this.ErrorMessage = 'Password is not matched';
      } else {
        this.savenewpass();
      }
    }
  }
}
