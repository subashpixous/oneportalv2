import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfirmationService,
  ConfirmEventType,
  MessageService,
} from 'primeng/api';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { MemberInitSaveModel } from '../common.module';
import { AuthService } from 'src/app/services/auth.service';
import {
  ErrorStatus,
  FailedStatus,
  SuccessStatus,
} from 'src/app/_models/ResponseStatus';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Location } from '@angular/common';
import { TCModel } from 'src/app/_models/user/usermodel';
import { triggerValueChangesForAll } from '../../commonFunctions';

@Component({
  selector: 'app-mem-pre-req',
  templateUrl: './mem-pre-req.component.html',
  styleUrls: ['./mem-pre-req.component.scss'],
})
export class MemPreReqComponent {
  preReqForm!: FormGroup;

  showCounter: boolean = false;
  showResendOtp: boolean = false;
  countDown: Subscription = {} as Subscription;
  counter = 60;
  tick = 1000;
  districts: TCModel[] = [];
  showotp: boolean = false;
  timerExpired: boolean = false;
  ErrorMessage!: string;
  isError: boolean = false;
  constructor(
    private messageService: MessageService,
    private cookieService: CookieService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private generalService: GeneralService,
    private memberService: MemberService,
    private permissionsService: NgxPermissionsService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  combinedNameLengthValidator(maxLength: number): ValidatorFn {
    return (control: AbstractControl) => {
      const formGroup = control as FormGroup;
      const firstName = formGroup.get('first_Name')?.value || '';
      const lastName = formGroup.get('last_Name')?.value || '';
      return (firstName + lastName).length > maxLength
        ? { combinedNameTooLong: true }
        : null;
    };
  }
  ngOnInit() {
    this.preReqForm = new FormGroup(
      {
        id: new FormControl(null),
        member_Id: new FormControl(null), // TODO
        first_Name: new FormControl(null, [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern(new RegExp('^[a-zA-Z ]*$')),
        ]),
        primaryDistrict: new FormControl(null, [Validators.required]),
        last_Name: new FormControl(null, [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern(new RegExp('^[a-zA-Z ]*$')),
        ]),
        email: new FormControl(null, [
          Validators.email,
          Validators.pattern(
            new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
          ),
        ]),
        phone_Number: new FormControl(null, [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(new RegExp('^[0-9]+$')),
        ]),
        otp: new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(new RegExp('^[0-9]+$')),
        ]),
        isActive: new FormControl(true),
      },
      { validators: this.combinedNameLengthValidator(30) }
    );

    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'DISTRICT',
      })
      .subscribe((x) => {
        this.districts = x.data;
      });
  }
  save() {
    if (!this.preReqForm.valid) {
      triggerValueChangesForAll(this.preReqForm);
      return;
    }
    var initSaveModel: MemberInitSaveModel = {
      id: this.preReqForm.get('id')?.value,
      first_Name: this.preReqForm.get('first_Name')?.value,
      last_Name: this.preReqForm.get('last_Name')?.value,
      email: this.preReqForm.get('email')?.value,
      phone_Number: this.preReqForm.get('phone_Number')?.value,
      otp: this.preReqForm.get('otp')?.value,
      primaryDistrict: this.preReqForm.get('primaryDistrict')?.value,
    };
    this.memberService.Member_Init_SaveUpdate(initSaveModel).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        if (x.errorCode == 'MEMBER_EXIST') {
          this.confirmationService.confirm({
            message: `தொலைபேசி எண் ஏற்கனவே உள்ளது. வேறு எண்ணைப் பயன்படுத்தவும் / Mobile number already exists. Please use a different number`,
            header: 'Mobile Number Exists',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: x.message,
        });
        let userdetails = x.data;
        const privs = sessionStorage.getItem('privillage');

        if (!privs?.includes('FORM_CREATE')) {
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
        }
        this.router.navigate(['applicant', 'mem-detail', userdetails.id, '0']);
      }
    });
  }
  sendOtp() {
    if (
      this.preReqForm.get('phone_Number')?.value &&
      this.preReqForm.get('phone_Number')?.value.length == 10
    ) {
      this.memberService
        .SendAnonymousOtp(this.preReqForm.get('phone_Number')?.value)
        .subscribe((x) => {
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
  }
  resendOTP() {
    if (
      this.preReqForm.get('phone_Number')?.value &&
      this.preReqForm.get('phone_Number')?.value.length == 10
    ) {
      this.preReqForm.get('otp')?.patchValue('');
      this.memberService
        .SendAnonymousOtp(this.preReqForm.get('phone_Number')?.value)
        .subscribe((x) => {
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
  }
}
