import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { OrganizationDetailFormModel } from 'src/app/_models/MemberDetailsModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberService } from 'src/app/services/member.sevice';
import {
  AadharGetOtpModel,
  AadharverifyOtpModel,
} from 'src/app/_models/aadharmodel';
import { ResponseModel } from 'src/app/_models/ResponseStatus';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/services/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
@Component({
  selector: 'app-workerlogin',
  templateUrl: './workerlogin.component.html',
  styleUrls: ['./workerlogin.component.scss'],
})
export class WorkerloginComponent implements OnInit {
  organizationForm!: FormGroup;
  inputValue: string = '';
  errorMessage: string = '';
  otperrormessage:string = '';
  errormessageforinput: string = '';
  typeOfWork: TCModel[] = [];
  selectedWorkType: string = '';
  aadhaarTxn: string = '';
  RAG_PICKER_ID = 'cca616a6-3ed6-11f0-bc5e-fa163eb36ec8';
  isWorkTypeLocked: boolean = false;
  mobileRegex = /^[6-9]\d{9}$/;

  @Input() formDetail?: OrganizationDetailFormModel;
  workerCategories = [
    { label: 'Sanitary Worker', value: 1 },
    { label: 'Hospital Worker', value: 2 },
    { label: 'Municipal Worker', value: 3 },
  ];
  usePhoneNumber: boolean = false;
  showOtpScreen: boolean = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  maskedValue: string = '';
  otpTimer: number = 60;
  timerInterval: any;
  showSuccessPopup: boolean = false;
  showErrorPopup: boolean = false;

  constructor(
    private location: Location,
    private generalService: GeneralService,
    private router: Router,
    private memberService: MemberService,
    private cookieService: CookieService,
    private authService: AuthService,
    private permissionsService: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.loadworktype();
  }


//   validateMobile(number: string): string {

//   if (!number) return "Mobile number is required";

//   if (!/^\d+$/.test(number))
//     return "Only digits are allowed";

//   if (number.length !== 10)
//     return "Mobile number must be exactly 10 digits";

//   if (!this.mobileRegex.test(number))
//     return "Invalid mobile number";

//   if (/^(\d)\1{9}$/.test(number))
//     return "Invalid mobile number";

//   return "";
// }

validateMobile(number: string): string {

  if (!number) return "Mobile number is required";

  // Only digits
  if (!/^\d+$/.test(number))
    return "Only digits are allowed";

  // Length
  if (number.length !== 10)
    return "Mobile number must be exactly 10 digits";

  // Must start with 6–9
  if (!/^[6-9]/.test(number))
    return "Mobile number must start with 6, 7, 8 or 9";

  // All same digits (9999999999)
  if (/^(\d)\1{9}$/.test(number))
    return "Invalid mobile number";

  // Starts valid but rest zeros (9000000000)
  if (/^[6-9]0{9}$/.test(number))
    return "Invalid mobile number";

  // Sequential numbers
  if (/1234567890|9876543210/.test(number))
    return "Invalid mobile number";

  // Continuous repeated digits (6+ times)
  if (/(\d)\1{5,}/.test(number))
    return "Invalid mobile number";

  // Pattern repeat (1212121212)
  if (/(\d{2,3})\1{2,}/.test(number))
    return "Invalid mobile number";

  // Too many same digits overall (more than 7 total)
  const digitCount: any = {};
  for (let d of number) {
    digitCount[d] = (digitCount[d] || 0) + 1;
    if (digitCount[d] > 7)
      return "Invalid mobile number";
  }

  // Block known fake numbers
  const blockedNumbers = [
    '9999999999', '8888888888', '7777777777',
    '6666666666', '1234512345'
  ];
  if (blockedNumbers.includes(number))
    return "Invalid mobile number";

  // Final regex
  if (!this.mobileRegex.test(number))
    return "Invalid mobile number";

  return "";
}
  goback() {
    this.router.navigate(['applicant']);
  }


allowOnlyNumbers(event: KeyboardEvent) {

  const charCode = event.key.charCodeAt(0);

  // Allow only digits 0–9
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
  getOtp() {

  // Work type validation
  if (!this.selectedWorkType || this.selectedWorkType.trim() === '') {
    this.errormessageforinput = 'Please select work type';
    return;
  }

  // Input validation
  if (!this.inputValue || this.inputValue.trim() === '') {
    this.errorMessage = this.usePhoneNumber
      ? 'Mobile number is required'
      : 'Aadhaar number is required';
    return;
  }

  // 🔹 MOBILE VALIDATION
  if (this.usePhoneNumber) {

    const mobileError = this.validateMobile(this.inputValue);

    if (mobileError) {
      this.errorMessage = mobileError;
      return;
    }

  }

  // 🔹 AADHAAR VALIDATION
  if (!this.usePhoneNumber) {

    if (this.inputValue.length !== 12) {
      this.errorMessage = 'Aadhaar number must be exactly 12 digits';
      return;
    }

    if (!/^\d+$/.test(this.inputValue)) {
      this.errorMessage = 'Only digits are allowed';
      return;
    }

    if (/^[0-1]/.test(this.inputValue)) {
      this.errorMessage = 'Enter valid Aadhaar number';
      return;
    }

    if (/^(\d)\1{11}$/.test(this.inputValue)) {
      this.errorMessage = 'Invalid Aadhaar number';
      return;
    }

  }

  // Clear error if everything valid
  this.errorMessage = '';

  // 🔹 SEND OTP
  if (this.usePhoneNumber) {
    this.sendMobileOtp();
  } else {
    this.sendAadhaarOtp();
  }
}

  sendAadhaarOtp() {
    const model: AadharGetOtpModel = {
      AUAKUAParameters: {
        LAT: '17.494568',
        LONG: '78.392056',
        DEVMACID: '11:22:33:44:55',
        DEVID: 'public',
        CONSENT: 'Y',
        SHRC: 'Y',
        VER: '2.5',
        SERTYPE: '10',
        ENV: '2',
        CH: '0',
        AADHAARID: this.inputValue,
        SLK: 'JSTUX-KODGB-TXXEF-VELPU',
        RRN: '1668576481',
        REF: 'FROMSAMPLE',
      },

      PIDXML: ':',

      ENVIRONMENT: '0',
    };

    console.log('Sending Aadhaar OTP Model:', model);

    this.memberService.SendAadhaarOtp(model).subscribe({
      next: (response: ResponseModel) => {
        console.log('Aadhaar OTP Response:', response);

  // 🚫 Member already exists → stop OTP screen
if (response?.message?.toLowerCase().includes('aadhaar number exist')) {
  this.errorMessage = response.message;
  this.showOtpScreen = false;
  return;
}

        if (response.status.toUpperCase() === 'SUCCESS') {
          this.isWorkTypeLocked = true;

          const otpData = response.data;

          this.aadhaarTxn = otpData.txn;

          this.maskedValue = 'XXXXXX' + this.inputValue.slice(-4);

          this.showOtpScreen = true;

          this.otpDigits = ['', '', '', '', '', ''];

          this.startOtpTimer();
        } else {
          this.errorMessage = response.message;
        }
      },

      error: (error) => {
        console.error('Aadhaar OTP Error:', error);

        this.errorMessage = 'Failed to send Aadhaar OTP';
      },
    });
  }

  sendMobileOtp() {
    this.memberService.SendAnonymousOtp(this.inputValue).subscribe({
      next: (res: any) => {
        console.log('FULL OTP RESPONSE:', res);

            // 🚫 If member already exists → show error and stop
      if (res?.message?.toLowerCase().includes('member exist')) {
        this.errorMessage = res.message;
        this.showOtpScreen = false;
        return;
      }

        this.isWorkTypeLocked = true;

        this.maskedValue = 'XXXXXX' + this.inputValue.slice(-4);
        this.showOtpScreen = true;
        this.otpDigits = ['', '', '', '', '', ''];
        this.startOtpTimer();
      },
      error: (err) => {
        console.error('Send OTP Error:', err);
        this.errorMessage = 'Failed to send OTP';
      },
    });
  }

  verifyOtp() {
    const otp = this.otpDigits.join('').trim();

    if (otp.length !== 6) {
      this.showErrorPopup = true;
      return;
    }

    if (this.usePhoneNumber) {
      const mobileBody = {
        MobileNumber: this.inputValue,
        OTP: otp,
        AccessType: 'APPLICANT',
        worktype: this.selectedWorkType,
      };

      this.memberService.ValidateFormOtp(mobileBody).subscribe({
        next: (res: any) => {
          this.handleOtpResponse(res);
        },
        error: () => {
          this.showErrorPopup = true;
        },
      });
    }
    // 🔹 AADHAAR FLOW
    else {
      const aadhaarBody: AadharverifyOtpModel = {
        AUAKUAParameters: {
          LAT: '17.494568',
          LONG: '78.392056',
          DEVMACID: '11:22:33:44:55',
          DEVID: 'public',
          CONSENT: 'Y',
          SHRC: 'Y',
          VER: '2.5',
          SERTYPE: '05',
          ENV: '2',
          AADHAARID: this.inputValue,
          SLK: 'JSTUX-KODGB-TXXEF-VELPU',
          RRN: Date.now().toString(),
          REF: 'FROMSAMPLE',
          TXN: this.aadhaarTxn,
          OTP: otp,
          LANG: 'N',
          PFR: 'N',
        },

        PIDXML: '',

        ENVIRONMENT: '0',
      };
      this.memberService.ValidateAadhaarOtp(aadhaarBody).subscribe({
        next: (res: any) => {
          this.handleOtpResponse(res);
        },
        error: () => {
          this.showErrorPopup = true;
        },
      });
    }
  }

  handleOtpResponse1(res: any) {
    if (res?.status?.toUpperCase() === 'SUCCESS') {
      this.showErrorPopup = false;
      this.showSuccessPopup = true;

      if (res.data) {
        localStorage.removeItem('aadhaarData');

        const aadhaarData = res.data;
        localStorage.setItem('aadhaarData', JSON.stringify(aadhaarData));
        localStorage.setItem('verifiedMemberId', aadhaarData.memberId);
        const loginDetails = aadhaarData.loginDetails;

        if (loginDetails) {
          let accessToken: string = loginDetails.accessToken || '';
          let refreshToken: string = loginDetails.refreshToken || '';
          let privillage = loginDetails.privillage || [];

          accessToken = accessToken.replace('Bearer ', '');

          this.cookieService.set('privillage', JSON.stringify(privillage), 1);
          this.cookieService.set('user', JSON.stringify(loginDetails), 1);
          this.cookieService.set('token', accessToken, 1);
          this.cookieService.set('refreshToken', refreshToken, 1);
          this.cookieService.set('mobile', loginDetails.mobile || '', 1);
          this.cookieService.set('name', loginDetails.name || '', 1);
          this.cookieService.set(
            'accesstype',
            loginDetails.accessType || 'APPLICANT',
            1,
          );

          this.permissionsService.loadPermissions(privillage);
        }

        localStorage.setItem('verifiedMemberId', aadhaarData.memberId || '0');

        // this.router.navigate([
        //   'applicant',
        //   'mem-detail',
        //   aadhaarData.memberId,
        //   '0',
        // ]);
      }
    } else {
      this.showSuccessPopup = false;
      this.showErrorPopup = true;
    }
  }

  handleOtpResponse(res: any) {
    if (res?.status?.toUpperCase() !== 'SUCCESS') {
      this.showSuccessPopup = false;
      this.showErrorPopup = true;
      return;
    }

    this.showErrorPopup = false;
    this.showSuccessPopup = true;

    const responseData = res?.data;
    if (!responseData) return;

    const loginDetails = responseData.loginDetails;
    localStorage.setItem(
      'aadhaarVerified',
      JSON.stringify(responseData.aadhaarVerified === true),
    );

    if (responseData.aadhaarVerified) {
      localStorage.setItem('aadhaarData', JSON.stringify(responseData));
    } else {
    }

    if (loginDetails) {
      let accessToken: string = loginDetails.accessToken || '';
      const refreshToken: string = loginDetails.refreshToken || '';
      const privillage = loginDetails.privillage || [];

      accessToken = accessToken.replace('Bearer ', '');

      this.cookieService.set('token', accessToken, 1);
      this.cookieService.set('refreshToken', refreshToken, 1);
      this.cookieService.set('privillage', JSON.stringify(privillage), 1);
      this.cookieService.set('mobile', loginDetails.mobile || '', 1);
      this.cookieService.set('name', loginDetails.name || '', 1);
      this.cookieService.set(
        'accesstype',
        loginDetails.accessType || 'APPLICANT',
        1,
      );

      this.permissionsService.loadPermissions(privillage);

      
      localStorage.setItem('verifiedMemberId', responseData.memberId || '0');
      // this.router.navigate([
      //   'applicant',
      //   'mem-detail',
      //   responseData.memberId || '0',
      //   '0',
      // ]);
    }
  }

  startOtpTimer() {
    this.otpTimer = 60;

    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        clearInterval(this.timerInterval);
          // ✅ CLEAR OTP WHEN TIME ENDS
      this.otpDigits = ['', '', '', '', '', ''];

      // Optional UX improvements
      this.otperrormessage = 'OTP expired. Please resend OTP';
      }
    }, 1000);
  }

  loadworktype() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'TYPE_OF_WORK' })
      .subscribe((x) => {
        this.typeOfWork = x.data;
        console.log(this.typeOfWork);
      });
  }

  onWorkTypeChange(event?: any) {
    const selectedValue = event ? event.value : this.selectedWorkType;

    const selectedObj = this.typeOfWork.find(
      (x: any) => x.value === selectedValue,
    );

    if (selectedObj) {
      const workTypeData = {
        text: selectedObj.text,
        value: selectedObj.value,
      };

      localStorage.setItem('selectedWorkType', JSON.stringify(workTypeData));

      console.log('Saved Work Type:', workTypeData);
    }

    if (selectedValue === this.RAG_PICKER_ID) {
      this.usePhoneNumber = true;

      this.inputValue = '';
      this.errorMessage = '';
    } else {
      this.usePhoneNumber = false;
    }
  }

  toggleInputMode() {
    if (this.selectedWorkType === this.RAG_PICKER_ID) {
      return;
    }

    this.usePhoneNumber = !this.usePhoneNumber;

    this.inputValue = '';
    this.errorMessage = '';
  }

  validateInput() {
    if (/[^0-9]/.test(this.inputValue)) {
      this.errorMessage = 'Only numbers are allowed';
      this.inputValue = this.inputValue.replace(/[^0-9]/g, '');
      return;
    }

    // if (this.usePhoneNumber) {
    //   if (this.inputValue.length > 0 && this.inputValue.length < 10) {
    //     this.errorMessage = 'Mobile number must be 10 digits';
    //   } else {
    //     this.errorMessage = '';
    //   }
    // }
  if (this.usePhoneNumber) {

  const error = this.validateMobile(this.inputValue);

  if (error) {
    this.errorMessage = error;
    return;
  }

  this.errorMessage = '';
}
     else {
      if (this.inputValue.length > 0 && this.inputValue.length < 12) {
        this.errorMessage = 'Aadhaar number must be 12 digits';

        if (!/^[2-9][0-9]{11}$/.test(this.inputValue)) {
          this.errorMessage = 'Enter valid Aadhaar number';
          return;
        }
      } else {
        this.errorMessage = '';
      }
    }
  }

  // goNextPage() {
  //   this.router.navigate(['applicant', 'mem-detail', '0', '0']);
  // }

  goNextPage() {

  const memberId = localStorage.getItem('verifiedMemberId') || '0';

  this.router.navigate([
    '/applicant',
    'mem-detail',
    memberId,
    '0'
  ]);
}



  resetOtpScreen() {
    this.showOtpScreen = false;

    this.otpDigits = ['', '', '', '', '', ''];

    this.isWorkTypeLocked = false;

    clearInterval(this.timerInterval);
  }

  moveToNext(event: any, index: number) {
    const input = event.target;
    if (input.value.length === 1 && index < 5) {
      const nextInput = input.parentElement.children[index + 1];
      nextInput.focus();
    }
  }

  resendOtp() {
    if (this.otpTimer > 0) return;

      // ✅ CLEAR ERROR MESSAGE
    this.otperrormessage = '';

    if (this.usePhoneNumber) {
      this.sendMobileOtp();
    } else {
      this.sendAadhaarOtp();
    }

    this.otpDigits = ['', '', '', '', '', ''];
  }

  clearOtp()
  {
    this.showErrorPopup=false
    this.otpDigits = ['', '', '', '', '', ''];
  }

  trackByIndex(index: number): number {
    return index;
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value.replace(/[^0-9]/g, '');

    this.otpDigits[index] = value;
    if (value && index < 5) {
      const next = event.target.parentElement.children[index + 1];
      next.focus();
    }
  }

  onOtpKeyDown(event: any, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prev = event.target.parentElement.children[index - 1];
      prev.focus();
    }
  }
}
