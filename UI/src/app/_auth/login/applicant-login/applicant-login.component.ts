import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { MessageService, Message } from 'primeng/api';
import { Subscription } from 'rxjs';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { SuccessStatus } from 'src/app/_models/ResponseStatus';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/services/auth.service';
import { Location } from '@angular/common';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-applicant-login',
  templateUrl: './applicant-login.component.html',
  styleUrls: ['./applicant-login.component.scss',],
  providers: [MessageService],

})
export class ApplicantLoginComponent {
  msgs: Message[] = [];
  valCheck: string[] = ['remember'];
  ErrorMessage!: string;
  isError: boolean = false;
  rememberMe: boolean = false;
  mobile!: string;
  otp!: string;

  showotp: boolean = false;
  timerExpired: boolean = false;

  showCounter: boolean = false;
  showResendOtp: boolean = false;
  countDown: Subscription = {} as Subscription;
  counter = 60;
  tick = 1000;
  breadcrumbs!: BreadcrumbModel[];
  accessType : string = '';
showAllSchemes: boolean = false;
  schemeDocumentsList: any[] = [];
displayImages: string[] = [];
showImageModal: boolean = false;

  constructor(
    public layoutService: LayoutService,
    private permissionsService: NgxPermissionsService,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private location: Location,
    private router: Router,
    private schemeConfigService: SchemeConfigService
  ) {}

  ngOnInit(): void {
    this.accessType = this.cookieService.get('accesstype');
    var privilegess = this.cookieService.get('privillage');
 this.route.paramMap.subscribe(params => {
    const param = params.get('param');
    if (param) {
      const decodedParam = decodeURIComponent(param); // decode %2F

      let id: string | undefined;
      let memberId: string | undefined;
      let aadhar: string | undefined;
      let phone: string | undefined;

      if (/^\d{10}$/.test(decodedParam)) {
        phone = decodedParam;
      } else if (/^\d{12}$/.test(decodedParam)) {
        aadhar = decodedParam;
      } else {
        memberId = decodedParam;
      }

      this.authService.getMemberByParam(id, memberId, aadhar, phone)
        .subscribe(x => {
          if (x.status === 'SUCCESS' && x.data?.phone_Number) {
            this.mobile = x.data.phone_Number;
            this.onSubmit(); // auto-send OTP
          }
        });
    }
  });
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'Member Login',
        routing: '',
        isActionable: false,
      },
    ];
    this.loadDefaultSchemeDocuments();
  }
loadDefaultSchemeDocuments() {
  this.schemeConfigService.Config_Scheme_Group_Get(true).subscribe((res: any) => {
    if (!res?.data) return;

    // 1. Filter out the specific scheme names you don't want to display
    const excludedSchemes = ['Ungaludan Stalin', 'Livelihood Scheme(CM Arise)'];
    const filteredSchemes = res.data.filter((s: any) => !excludedSchemes.includes(s.groupName));
    
    const groupIds = filteredSchemes.map((s: any) => s.id);

    this.schemeConfigService
      .getRequiredDocumentsByGroupIds(groupIds)
      .subscribe((docRes: any) => {
        if (docRes.status !== 'SUCCESS' || !docRes.data) return;

        let allUniqueDocsForImages: any[] = [];
        this.schemeDocumentsList = []; // Clear array before populating

        // 2. Map documents properly to avoid duplicating all documents into every scheme header
        filteredSchemes.forEach((scheme: any, index: number) => {
          let uniqueDocs: any[] = [];
          
          // Safely map the returned documents to the correct scheme 
          // (Attempts to match by name, falls back to array index)
          const groupDocuments = docRes.data.find((g: any) => g.groupName === scheme.groupName) || docRes.data[index];

          if (groupDocuments && groupDocuments.requiredDocumentCategory) {
            groupDocuments.requiredDocumentCategory.forEach((doc: any) => {
              // Ensure uniqueness WITHIN this specific scheme
              if (!uniqueDocs.find((d: any) => d.categoryName === doc.categoryName)) {
                uniqueDocs.push(doc);
                allUniqueDocsForImages.push(doc);
              }
            });
          }

          // 3. Only add the scheme to the UI list if it actually has documents
          if (uniqueDocs.length > 0) {
            this.schemeDocumentsList.push({
              schemeNameTamil: scheme.groupNameTamil,
              schemeNameEnglish: scheme.groupName,
              documents: uniqueDocs
            });
          }
        });

        this.mapReferenceImages(allUniqueDocsForImages);
      });
  });
}

  toggleViewMore() {
  this.showAllSchemes = !this.showAllSchemes;
}

  mapReferenceImages(documents: any[]) {
    const imageMap: { [key: string]: string[] } = {
      'Student ID': ['assets/Document images/School-ID-Card-Vertical_Design-2_a.jpg'],
      'Hostel Certificate': ['assets/Document images/Hostel Certificate.png'],
      'Birth Certificate': ['assets/Document images/Birth Certificate.png'],
      'Death Certificate': ['assets/Document images/Death Certificate.png'],
      'Birth & Death Certificate': [
        'assets/Document images/Birth Certificate.png',
        'assets/Document images/Death Certificate.png'
      ],
      'Marriage Registration': ['assets/Document images/Marriage Registration Certificate.png'],
      'Marriage Invitation': [
        'assets/Document images/Marriage Invitation.png',
        'assets/Document images/Marriage Invitation back.png'
      ],
      'Legal Heir': ['assets/Document images/Legal Heir Certificate.png'],
      'FIR': ['assets/Document images/FIR Copy.png'],
      'Eye Specialist': ['assets/Document images/Eye Test Report.png'],
      'Medical Certificate': ['assets/Document images/Doctor certificate, in case of abortion claim.png'],
      'Ration Card': ['assets/Document images/Family Ration card.jpg'],
      'Aadhaar': ['assets/worker-reference-image.png'], 
      'Bank Passbook': ['assets/worker-reference-second.jpg']
    };

    documents.forEach((doc: any) => {
      const name = doc.categoryName || '';
      Object.keys(imageMap).forEach(key => {
        if (name.includes(key)) {
          imageMap[key].forEach(imgPath => {
            // Push image only if it hasn't been added yet to avoid duplicates
            if (!this.displayImages.includes(imgPath)) {
              this.displayImages.push(imgPath);
            }
          });
        }
      });
    });
  }
openImageModal() {
  if (this.displayImages.length > 0) {
    this.showImageModal = true;
  }
}
  clearErrormessage(value: any) {
    this.isError = false;
    this.ErrorMessage = '';
  }

  navigatetoRegister() {
     this.router.navigate(['applicant', 'mem-detail', '0', '0']);
  }
  allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.charCode;
  // Only allow digits 0–9
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
isValidMobile(): boolean {
  return /^[6-9]\d{9}$/.test(this.mobile);
}

  onSubmit() {
    if (this.mobile && this.mobile.length == 10) {
      this.ErrorMessage = '';
    } else {
      this.ErrorMessage = 'Mobile number is not valid';
      this.isError = true;
      return;
    }
    if (!this.showotp) {
      this.authService.ApplicantLogin(this.mobile).subscribe((x) => {
        if (x.status == SuccessStatus) {
          // const privillage: string = this.cookieService.get('privillage');
          // this.permissionsService.loadPermissions(privillage.split(','));
          // const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          // this.router.navigateByUrl(returnUrl);
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
            const returnUrl =
              this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
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
  bckClick() {
    this.location.back();
  }
}
