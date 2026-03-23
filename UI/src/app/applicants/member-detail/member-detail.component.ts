import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import {
  AddressDetailFormModel,
  BankDetailSaveModel,
  MemberDetailsFormModel,
  MemberGetModels,
  OrganizationDetailFormModel,
} from 'src/app/_models/MemberDetailsModel';
import { MemberService } from 'src/app/services/member.sevice';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { MemBankDetailComponent } from 'src/app/shared/common/mem-bank-detail/mem-bank-detail.component';
import { MemDocumentDetailComponent } from 'src/app/shared/common/mem-document-detail/mem-document-detail.component';
import { MemFamilyDetailComponent } from 'src/app/shared/common/mem-family-detail/mem-family-detail.component';
import { MemPermanentAddressComponent } from 'src/app/shared/common/mem-permanent-address/mem-permanent-address.component';
import { MemPersonalDetailComponent } from 'src/app/shared/common/mem-personal-detail/mem-personal-detail.component';
import { OrganizationDetailComponent } from 'src/app/shared/common/organization-detail/organization-detail.component';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { MessageService } from 'primeng/api';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import moment, { Moment } from 'moment';
import {
  dateconvertionwithOnlyDate,
  dateconvertion,
  triggerValueChangesForAll,
  privileges,
} from 'src/app/shared/commonFunctions';
import { MemTempAddressComponent } from 'src/app/shared/common/mem-temp-address/mem-temp-address.component';

@UntilDestroy()
@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent {
  privleges = privileges;
  @ViewChild(MemBankDetailComponent)
  MemBankDetailComponent!: MemBankDetailComponent;
  @ViewChild(MemDocumentDetailComponent)
  MemDocumentDetailComponent!: MemDocumentDetailComponent;
  @ViewChild(MemFamilyDetailComponent)
  MemFamilyDetailComponent!: MemFamilyDetailComponent;
  @ViewChild(MemPermanentAddressComponent)
  MemPermanentAddressComponent!: MemPermanentAddressComponent;
  @ViewChild(MemPersonalDetailComponent)
  MemPersonalDetailComponent!: MemPersonalDetailComponent;
  @ViewChild(MemTempAddressComponent)
  MemTempAddressComponent!: MemTempAddressComponent;
  @ViewChild(OrganizationDetailComponent)
  OrganizationDetailComponent!: OrganizationDetailComponent;

  breadcrumbs!: BreadcrumbModel[];
  activeIndex: number[] = [0];
  isLoggedin: boolean = false;
  memberId: string = '';
  isAgreed: boolean = false;
  privillage: any;
  localMemPersonalInfo: any;
  IsFormCreate: boolean = false;
  localpersonalData: any;
  isEdit: boolean = false;
  isOfficerSave: boolean = false;
  currentStep: number = 1;
  completedSteps: number[] = [];
  // org
  orgForm!: OrganizationDetailFormModel;
  memberform!: MemberDetailsFormModel;
  addressTempform!: AddressDetailFormModel;
  addressPermform!: AddressDetailFormModel;
  personalData: any;
  personalValid: boolean = false;
  permanentData: any;
  permanentValid: boolean = false;
  tempData: any;
  tempValid: boolean = false;
  bankData: any;
  bankValid: boolean = false;
  familyData: any;
  familyValid: boolean = false;
  organizationData: any;
  organizationValid: boolean = false;
  documentData: any;
  documentValid: boolean = false;
  IsSubmitted: boolean = false;

  allDet!: MemberGetModels;
  errorMessage: string = '';

  routeSub!: Subscription;
  memberDetails!: AccountApplicantLoginResponseModel;
  privs: any;
  isHouseMaid: boolean = false;

  maxDate: Moment = moment(new Date());
  bankForm!: FormGroup;
  hideAadhaar: boolean = false;
  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private memberService: MemberService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private permissionsService: NgxPermissionsService,
  ) {}

  ngOnInit() {
    this.bankForm = new FormGroup({
      collectedByName: new FormControl(null),
      collectedByPhoneNumber: new FormControl(null, [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      collectedOn: new FormControl(this.dcwt(this.maxDate)),
    });
    this.route.queryParams.subscribe((params) => {
      this.isEdit = params['isEdit'] === 'true';
    });
    this.route.queryParams.subscribe((params) => {
      this.isOfficerSave = params['isOfficerSave'] === 'true';
    });

    const savedStep = sessionStorage.getItem('registrationStep');

    if (savedStep) {
      this.currentStep = +savedStep;
    }
    console.log(
      'OrganizationDetailComponent:',
      this.OrganizationDetailComponent,
    );
    this.memberDetails = this.accountService.userValue;

    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.memberId = params['id']; //log the value of id
        if (params['index'] && Number(params['index']) > 0) {
          this.activeIndex = [Number(params['index'])]; //log the value of id
        }

        if (!this.memberId || this.memberId === '0') {
          const storedMemberId = localStorage.getItem('verifiedMemberId');

          if (storedMemberId) {
            this.memberId = storedMemberId;
          }
        }

        if (this.memberId !== '0') {
          this.isLoggedin = true;

          this.memberService.Member_Get_All(this.memberId).subscribe((x) => {
            if (x) {
              this.allDet = x.data;
              this.localMemPersonalInfo = this.allDet?.memberDocuments;

              localStorage.setItem(
                'memPersonalInfo',
                JSON.stringify(this.localMemPersonalInfo),
              );

              const roleName = sessionStorage.getItem('privillage');

              if (roleName && roleName.includes('FORM_CREATE')) {
                const userStr = sessionStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;

                const mobile = user?.userDetails?.mobile;
                this.bankForm.patchValue({
                  collectedByName: `${user?.firstName ?? ''} ${
                    user?.lastName ?? ''
                  }`.trim(),
                  collectedByPhoneNumber: mobile ?? '',

                  collectedOn: this.dcwt(this.maxDate) ?? '',
                });
              }

              //             this.bankForm
              //               .get('collectedByName')
              //               ?.patchValue(this.allDet.memberDetails?.collectedByName);
              //            this.bankForm
              // .get('collectedByPhoneNumber')
              // ?.patchValue(this.allDet.memberDetails?.collectedByPhoneNumber );

              //             if (this.allDet.memberDetails?.collectedOn) {
              //               this.bankForm
              //                 .get('collectedOn')
              //                 ?.patchValue(this.allDet.memberDetails?.collectedOn);
              //             }

              if (this.allDet?.memberDetails) {
                this.bankForm.patchValue({
                  collectedByName: this.allDet.memberDetails?.collectedByName
                    ? this.allDet.memberDetails?.collectedByName
                    : this.bankForm.get('collectedByName')?.value,

                  collectedByPhoneNumber: this.allDet.memberDetails
                    ?.collectedByPhoneNumber
                    ? this.allDet.memberDetails?.collectedByPhoneNumber
                    : this.bankForm.get('collectedByPhoneNumber')?.value,

                  collectedOn: this.allDet.memberDetails?.collectedOn
                    ? this.allDet.memberDetails?.collectedOn
                    : this.bankForm.get('collectedOn')?.value,
                });
              }

              // TODO
              if (this.allDet?.memberDetails?.isSubmitted) {
                // this.movetoView();
              }
            }
          });
        }
      });

    //this.memberId = 'cb061aa3-0ca6-4a93-9f5e-73d09ea69fa9'; // this.route.snapshot.paramMap.get('id') ?? '';

    const roleName = sessionStorage.getItem('privillage');

    if (roleName && roleName.includes('FORM_CREATE')) {
      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const mobile = user?.userDetails?.mobile;
      this.bankForm.patchValue({
        collectedByName: `${user?.firstName ?? ''} ${
          user?.lastName ?? ''
        }`.trim(),
        collectedByPhoneNumber: mobile ?? '',

        collectedOn: this.dcwt(this.maxDate) ?? '',
      });
    }

    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
    }
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'Member Data',
        routing: '',
        isActionable: false,
      },
    ];
    this.privillage = sessionStorage.getItem('privillage');
    if (this.privillage && this.privillage.includes('FORM_CREATE')) {
      this.IsFormCreate = true;
    }
  }
  member_call() {
    this.memberService.Member_Get_All(this.memberId).subscribe((x) => {
      if (x) {
        this.allDet = x.data;

        const roleName = sessionStorage.getItem('privillage');

        if (roleName && roleName.includes('FORM_CREATE')) {
          const userStr = sessionStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;

          const mobile = user?.userDetails?.mobile;
          this.bankForm.patchValue({
            collectedByName: `${user?.firstName ?? ''} ${
              user?.lastName ?? ''
            }`.trim(),
            collectedByPhoneNumber: mobile ?? '',

            collectedOn: this.dcwt(this.maxDate) ?? '',
          });
        }

        //             this.bankForm
        //               .get('collectedByName')
        //               ?.patchValue(this.allDet.memberDetails?.collectedByName);
        //            this.bankForm
        // .get('collectedByPhoneNumber')
        // ?.patchValue(this.allDet.memberDetails?.collectedByPhoneNumber );

        //             if (this.allDet.memberDetails?.collectedOn) {
        //               this.bankForm
        //                 .get('collectedOn')
        //                 ?.patchValue(this.allDet.memberDetails?.collectedOn);
        //             }

        if (this.allDet?.memberDetails) {
          this.bankForm.patchValue({
            collectedByName: this.allDet.memberDetails?.collectedByName
              ? this.allDet.memberDetails?.collectedByName
              : this.bankForm.get('collectedByName')?.value,

            collectedByPhoneNumber: this.allDet.memberDetails
              ?.collectedByPhoneNumber
              ? this.allDet.memberDetails?.collectedByPhoneNumber
              : this.bankForm.get('collectedByPhoneNumber')?.value,

            collectedOn: this.allDet.memberDetails?.collectedOn
              ? this.allDet.memberDetails?.collectedOn
              : this.bankForm.get('collectedOn')?.value,
          });
        }

        // TODO
        if (this.allDet?.memberDetails?.isSubmitted) {
          // this.movetoView();
        }
      }
    });
  }
  onTypeOfWorkChanged(isRagPicker: boolean) {
    console.log('Parent received isRagPicker:', isRagPicker);
    this.hideAadhaar = isRagPicker;

    // Force change detection (PrimeNG accordion needs this)
    this.cdr.detectChanges();
  }

  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  bckClick() {
    this.router.navigate(['applicant', 'mem-dashboard']);
  }
  Logout() {
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }
  movetoNext(num: any) {
    this.activeIndex = [num];
    this.cdr.detectChanges();
    this.activeIndex = [num];
  }
  //   submit() {

  //   // if (!this.organizationValid) {
  //   //   this.errorMessage =
  //   //     'Please fill all mandatory fields in Organization Details.';
  //   //   return;
  //   // }

  //   if (!this.documentValid) {
  //     this.errorMessage =
  //       'Please upload all mandatory documents.';
  //     return;
  //   }

  //   // const payload = {
  //   //   organizationDetail: this.organizationData,
  //   //   isOfficerSave: false
  //   // };

  // if (!this.organizationData?.id || this.organizationData.id.trim() === '') {
  //   this.organizationData.id = Guid.raw().toString();
  // }

  // const payload = {
  //   organizationDetail: this.organizationData,
  //   isOfficerSave: false
  // };

  //   console.log('FINAL STEP 3 SAVE:', payload);

  //   this.memberService.Member_Save_All(payload)
  //     .subscribe(res => {

  //       if (res && res.status !== 'SUCCESS') {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: res.message
  //         });
  //         return;
  //       }

  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Success',
  //         detail: res.message
  //       });

  //       this.movetoView();
  //     });

  // }
  onWorkOfficeChange(value: boolean) {
    this.isHouseMaid = value;
  }
  submit() {
    // 🔴 Check Declaration
    if (!this.isAgreed) {
      this.errorMessage = 'Please accept the declaration to proceed.';
      return;
    }

    // 🔴 Check Organization Form
    if (!this.organizationValid) {
      if (this.OrganizationDetailComponent) {
        this.OrganizationDetailComponent.markAllAsTouched();
      }

      this.errorMessage =
        'Please fill all mandatory fields in the organization details section to submit the application / விண்ணப்பத்தைச் சமர்ப்பிக்க நிறுவன விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';

      return;
    } else {
      this.errorMessage = '';
    }

    // 🔴 Check Document Section
    if (!this.documentValid) {
      if (this.MemDocumentDetailComponent) {
        this.MemDocumentDetailComponent.markAllAsTouched();
      }

      this.errorMessage = 'Please upload all mandatory documents.';
      return;
    }

    if (!this.organizationData?.id || this.organizationData.id.trim() === '') {
      this.organizationData.id = Guid.raw().toString();
    }
    const storedData = localStorage.getItem('personalData');

    if (storedData) {
      this.localpersonalData = JSON.parse(storedData);
    }

    if (this.isEdit) {
      const organizationMap: any = {
        type_of_Work: 'type_of_Work',
        core_Sanitary_Worker_Type: 'core_Sanitary_Worker_Type',
        health_Worker_Type: 'health_Worker_Type',
        organization_Type: 'organization_Type',
        district_Id: 'district_Id',
        nature_of_Job: 'nature_of_Job',
        local_Body: 'local_Body',
        name_of_Local_Body: 'name_of_Local_Body',
        zone: 'zone',
        block: 'block',
        corporation: 'corporation',
        municipality: 'municipality',
        town_Panchayat: 'town_Panchayat',
        village_Panchayat: 'village_Panchayat',
        organisation_Name: 'organisation_Name',
        designation: 'designation',
        address: 'address',
        new_Yellow_Card_Number: 'new_Yellow_Card_Number',
        health_Id: 'health_Id',
        private_Organisation_Name: 'private_Organisation_Name',
        private_Designation: 'private_Designation',
        private_Address: 'private_Address',
        mP_Constituency: 'mP_Constituency',
        mLA_Constituency: 'mlA_Constituency',
        employer_Type: 'employer_Type',
        work_Office: 'work_office',
      };

      const changed = this.compareWithMap(
        this.organizationData,
        this.allDet?.organizationDetail,
        organizationMap,
      );

      (this.organizationData as any).isTemp = changed;
    }
    let payload: any;

    if (this.IsFormCreate) {
      payload = {
        memberDetails: {
          ...this.localpersonalData,
          aadhaar_json: this.allDet?.memberDetails?.aadhaar_json ?? '',
          collectedByName:
            this.bankForm.get('collectedByName')?.value ||
            this.allDet?.memberDetails?.collectedByName ||
            '',

          collectedByPhoneNumber:
            this.bankForm.get('collectedByPhoneNumber')?.value ||
            this.allDet?.memberDetails?.collectedByPhoneNumber ||
            '',

          collectedOn:
            this.bankForm.get('collectedOn')?.value ||
            this.allDet?.memberDetails?.collectedOn ||
            '',
        },
        organizationDetail: {
          ...this.organizationData,
          isActive: true,
          isSubmitted: true,
          isNewMember: true,
        },
        isOfficerSave: this.isOfficerSave,
      };
    } else {
      payload = {
        organizationDetail: {
          ...this.organizationData,
          isActive: true,
          isSubmitted: true,
          isNewMember: true,
        },
        isOfficerSave: this.isOfficerSave,
      };
    }
   
    console.log('FINAL STEP 3 SAVE:', payload);

    this.memberService.Member_Save_All(payload).subscribe((res) => {
      if (!res || res.status !== 'SUCCESS') {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res?.message || 'Something went wrong',
        });
        return;
      }
      localStorage.removeItem('selectedWorkType');
      localStorage.removeItem('aadhaarVerified');
      localStorage.removeItem('aadhaarData');
      localStorage.removeItem('memPersonalInfo');
      localStorage.removeItem('personalData');
      localStorage.removeItem('rationNumber');
      sessionStorage.removeItem('organizationFormData');
      sessionStorage.removeItem('isCurrent');
      sessionStorage.removeItem('familyData');
      sessionStorage.removeItem('registrationStep');
      this.errorMessage = '';
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: res.message,
      });

      this.privs = sessionStorage.getItem('privillage');

      if (this.privs && this.privs.includes('FORM_CREATE')) {
        this.movetoapp();
      } else {
        this.movetoView();
      }
    });
  }

  compareOrganization(formData: any, apiData: any, map: any): boolean {
    if (!formData || !apiData) return true;

    for (const formKey of Object.keys(map)) {
      const apiKey = map[formKey];

      const formValue = this.normalizeValue(formData?.[formKey]);
      const apiValue = this.normalizeValue(apiData?.[apiKey]);

      if (formValue !== apiValue) {
        console.log(
          'Organization changed:',
          formKey,
          '(form):',
          formValue,
          '(api):',
          apiValue,
        );

        return true;
      }
    }

    return false;
  }
  submitAll() {
    var orgDetail = this.OrganizationDetailComponent.overallsave();
    console.log('OrganizationDetailComponent:', orgDetail);
    if (!orgDetail) {
      this.movetoNext(0);
      this.errorMessage =
        'Please fill all mandatory fields in the organization details section to submit the application / விண்ணப்பத்தைச் சமர்ப்பிக்க நிறுவன விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';
      return;
    }
    var personalDetail = this.MemPersonalDetailComponent.overallsave();
    if (!personalDetail) {
      this.movetoNext(1);
      this.errorMessage =
        'Please fill all mandatory fields in the personal details section to submit the application / விண்ணப்பத்தை சமர்ப்பிக்க தனிப்பட்ட விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';

      return;
    }
    var overallsaveTempAdrressForm =
      this.MemPermanentAddressComponent.overallsaveTempAdrressForm();
    var overallsaveAddressForm =
      this.MemPermanentAddressComponent.overallsaveAddressForm();
    if (!overallsaveTempAdrressForm || !overallsaveAddressForm) {
      this.movetoNext(2);
      this.errorMessage =
        'Please fill all mandatory fields in the address details section to submit the application / விண்ணப்பத்தை சமர்ப்பிக்க முகவரி விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';

      return;
    }

    var familyDetail = this.MemFamilyDetailComponent.overallsave();
    if (familyDetail) {
      var ntsaved = familyDetail.filter((x) => !x.isSaved);
      if (ntsaved && ntsaved.length > 0) {
        this.movetoNext(3);
        this.errorMessage =
          'Please fill all mandatory fields in the family details section to submit the application / விண்ணப்பத்தை சமர்ப்பிக்க குடும்ப விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';

        return;
      }
    }

    var bankDetail = this.MemBankDetailComponent.overallsave();
    if (!bankDetail) {
      this.movetoNext(4);
      this.errorMessage =
        'Please fill all mandatory fields in the bank details section to submit the application / விண்ணப்பத்தை சமர்ப்பிக்க வங்கி விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';

      return;
    }

    var docDetail = this.MemDocumentDetailComponent.overallsave();
    if (docDetail) {
      var ntDocsaved = docDetail.filter(
        (x) => !x.originalFileName || x.originalFileName == '',
      );
      if (ntDocsaved && ntDocsaved.length > 0) {
        this.movetoNext(5);
        this.errorMessage =
          'Please fill all mandatory fields in the document details section to submit the application / விண்ணப்பத்தை சமர்ப்பிக்க ஆவண விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';

        return;
      }
    }
    this.memberService
      .Member_Save_All({
        memberDetails: {
          // ...personalDetail,
          // collectedByName: this.bankForm.get('collectedByName')?.value,
          // collectedByPhoneNumber: this.bankForm.get('collectedByPhoneNumber')
          //   ?.value,
          // collectedOn: this.bankForm.get('collectedOn')?.value,
          ...this.personalData,
          collectedByName: this.bankForm.get('collectedByName')?.value,
          collectedByPhoneNumber: this.bankForm.get('collectedByPhoneNumber')
            ?.value,
          collectedOn: this.bankForm.get('collectedOn')?.value,
        },
        // organizationDetail: orgDetail,
        // bankDetail: bankDetail,
        // workAddress: undefined,
        // permanentAddress: overallsaveAddressForm,
        // temprorayAddress: overallsaveTempAdrressForm,
        // isOfficerSave: false,
        organizationDetail: this.organizationData,
        bankDetail: this.bankData,
        workAddress: undefined,
        permanentAddress: this.permanentData,
        temprorayAddress: this.tempData,
        isOfficerSave: false,
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
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
          this.privs = sessionStorage.getItem('privillage');

          if (this.privs && this.privs.includes('FORM_CREATE')) {
            this.movetoapp();
          } else {
            this.movetoView();
          }
        }
      });
  }
  back() {
    this.location.back();
  }
  movetoView() {
    this.router.navigate(['applicant', 'mem-detail-view', this.memberId]);
  }
  movetoapp() {
    const privs = sessionStorage.getItem('privillage');
    const userStr = sessionStorage.getItem('user');
    const tokenStr = sessionStorage.getItem('token');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const accesstype = sessionStorage.getItem('accesstype');

    if (!privs || !userStr) return;

    const user = JSON.parse(userStr);

    if (privs.includes('FORM_CREATE')) {
      const privilegeArray = privs.split(',');
      let accessToken = tokenStr ? tokenStr.replace('Bearer ', '') : '';

      this.cookieService.set('privillage', privs, 1);
      this.cookieService.set('user', userStr, 1);
      this.cookieService.set('token', accessToken, 1);

      if (refreshToken) this.cookieService.set('refreshToken', refreshToken, 1);

      if (user?.mobile) this.cookieService.set('mobile', user.mobile, 1);

      if (user?.firstName) this.cookieService.set('name', user.firstName, 1);

      this.cookieService.set('accesstype', 'OFFICER', 1);

      this.permissionsService.loadPermissions(privilegeArray);
    }

    this.router.navigate(['officers', 'applications', 'applications']);
  }

  completeStep(step: number) {
    if (!this.completedSteps.includes(step)) {
      this.completedSteps.push(step);
    }
  }

  isStepCompleted(step: number): boolean {
    return this.completedSteps.includes(step);
  }

  getStepClass(step: number) {
    if (this.currentStep === step) return 'active';
    if (this.completedSteps.includes(step)) return 'completed';
    if (step > this.currentStep) return 'disabled';
    return '';
  }

  // goNext() {
  //   if (this.currentStep < 3) {
  //     this.currentStep++;
  //   }
  // }
  // goNext() {

  //   // 🔥 STEP 1 SAVE
  //   if (this.currentStep === 1 ) {

  //     const payload = {
  //       memberDetails: {
  //         ...this.personalData
  //       },
  //       permanentAddress: this.permanentData,
  //       temprorayAddress: this.tempData,
  //       bankDetail: this.bankData,
  //       organizationDetail: null,
  //       workAddress: null,
  //       isOfficerSave: false
  //     };

  //     this.memberService.Member_Save_All(payload)
  //       .subscribe((res: any) => {

  //         if (res && res.status === 'SUCCESS') {

  //           console.log('Step 1 saved successfully');

  //   if (this.currentStep < 3) {
  //     this.currentStep++;
  //     sessionStorage.setItem('registrationStep', this.currentStep.toString());
  //   }

  //           this.currentStep++;  // 👉 Move to Step 2

  //         } else {

  //           this.errorMessage = res?.message || 'Save failed';
  //         }

  //       });

  //     return; // 🚫 stop here
  //      this.currentStep++;
  //   }

  //   // 🔥 STEP 2 SAVE
  //   if (this.currentStep === 2) {

  // const payload = {
  //   familyMembers: this.familyData.members.map((m: any) => ({
  //     ...m,
  //     age: m.age?.toString() || ""
  //   })),
  //  isOfficerSave: false
  // };

  //     // Example if separate API
  //     this.memberService.Member_Save_All(payload)
  //       .subscribe((res: any) => {

  //         if (res && res.status === 'SUCCESS') {

  //         if (this.currentStep < 3) {
  //     this.currentStep++;
  //     sessionStorage.setItem('registrationStep', this.currentStep.toString());
  //   }

  //         } else {

  //           this.errorMessage = res?.message || 'Family save failed';
  //         }

  //       });

  //     return;
  //   }

  // }
  // goNext() {

  //   // STEP 1
  //   if (this.currentStep === 1) {

  //     const payload = {
  //       memberDetails: { ...this.personalData },
  //       permanentAddress: this.permanentData,
  //       temprorayAddress: this.tempData,
  //       bankDetail: this.bankData,
  //       organizationDetail: null,
  //       workAddress: null,
  //       isOfficerSave: false
  //     };
  // if(this.personalValid){
  //     this.memberService.Member_Save_All(payload)
  //       .subscribe((res: any) => {

  //         if (res && res.status === 'SUCCESS') {

  //           if (this.currentStep < 3) {
  //             this.currentStep++;
  //             sessionStorage.setItem('registrationStep', this.currentStep.toString());
  //           }

  //         } else {
  //           this.errorMessage = res?.message || 'Save failed';
  //         }

  //       });

  //     return;
  // }else{
  //   this.errorMessage = 'Please fill all mandatory fields in the personal details section to proceed.';
  //   }}

  //   // STEP 2
  //   if (this.currentStep === 2) {

  //     const payload = {
  //       familyMembers: this.familyData.members.map((m: any) => ({
  //         ...m,
  //         age: m.age?.toString() || ""
  //       })),
  //       isOfficerSave: false
  //     };

  //     this.memberService.Member_Save_All(payload)
  //       .subscribe((res: any) => {

  //         if (res && res.status === 'SUCCESS') {

  //           if (this.currentStep < 3) {
  //             this.currentStep++;
  //             sessionStorage.setItem('registrationStep', this.currentStep.toString());
  //           }

  //         } else {
  //           this.errorMessage = res?.message || 'Family save failed';
  //         }

  //       });

  //     return;
  //   }
  // }
  compareFamilyMember(formMember: any, apiMember: any): boolean {
    // if API record doesn't exist → new row
    if (!apiMember) return true;

    const fields = [
      'name',
      'relation',
      'sex',
      'date_of_birth',
      'age',
      'aadharNumber',
      'phone_number',
      'education',
      'standard',
      'school_Status',
      'college_Status',
      'eMIS_No',
      'uMIS_No',
      'completedYear',
      'discontinuedYear',
      'school_Name',
      'school_District',
      'school_Address',
      'college_Name',
      'college_District',
      'college_Address',
      'course',
      'degree_Name',
      'year',
      'occupation',
      'disability',
    ];

    for (const key of fields) {
      const formValue = this.FnormalizeValue(formMember[key]);
      const apiValue = this.FnormalizeValue(apiMember[key]);

      if (formValue !== apiValue) {
        console.log('Family changed:', key, formValue, apiValue);
        return true;
      }
    }

    return false;
  }
  FnormalizeValue(value: any) {
    if (value === null || value === undefined) return '';

    if (value instanceof Date) {
      return value.toISOString().substring(0, 10);
    }

    if (typeof value === 'string' && value.includes('T')) {
      return value.substring(0, 10);
    }

    return String(value).trim();
  }

  goNext() {
    this.errorMessage = '';

    if (this.currentStep === 1) {
      const personalMap: any = {
        id: 'id',
        member_Id: 'member_ID',
        first_Name: 'first_Name',
        last_Name: 'last_Name',
        father_Name: 'father_Name',
        date_Of_Birth: 'date_Of_Birth',
        ration_Card_Number: 'ration_Card_Number',
        email: 'email',
        gender: 'gender',
        community: 'community',
        caste: 'caste',
        marital_Status: 'marital_Status',
        aadhaar_Number: 'aadhaar_Number',
        phone_Number: 'phone_Number',
        education: 'education',
        religion: 'religion',
        profile_Picture: 'profile_Picture',
        isActive: 'isActive',
      };

      const bankMap: any = {
        id: 'id',
        member_Id: 'member_Id',
        account_Holder_Name: 'account_Holder_Name',
        account_Number: 'account_Number',
        iFSC_Code: 'ifsC_Code',
        bank_Name: 'bank_Name',
        bank_Id: 'bank_Id',
        branch: 'branch',
        branch_Id: 'branch_Id',
        isActive: 'isActive',
      };
      const permanentAddressMap: any = {
        id: 'id',
        memberId: 'memberId',
        addressType: 'addressType',
        doorNo: 'doorNo',
        streetName: 'streetName',
        district: 'district',
        villlageTownCity: 'villlageTownCity',
        taluk: 'taluk',
        pincode: 'pincode',
        isActive: 'isActive',
      };
      const temporaryAddressMap: any = {
        id: 'id',
        memberId: 'memberId',
        addressType: 'addressType',
        doorNo: 'doorNo',
        streetName: 'streetName',
        district: 'district',
        villlageTownCity: 'villlageTownCity',
        taluk: 'taluk',
        pincode: 'pincode',
        isActive: 'isActive',
      };

      // const payload = {
      //   memberDetails: { ...this.personalData },
      //   permanentAddress: this.permanentData,
      //   temprorayAddress: this.tempData,
      //   bankDetail: this.bankData,
      //   organizationDetail: null,
      //   workAddress: null,
      //   isOfficerSave: false
      // };
      let payload: any = {
        memberDetails: null,
        permanentAddress: null,
        temprorayAddress: null,
        bankDetail: null,
        organizationDetail: null,
        workAddress: null,
        isOfficerSave: false,
      };

      if (this.isEdit) {
        if (
          this.compareWithMap(
            this.personalData,
            this.allDet.memberDetails,
            personalMap,
          )
        ) {
          payload.memberDetails = { ...this.personalData,
          aadhaar_json: this.allDet?.memberDetails?.aadhaar_json ?? '',
             isTemp: true };
        }

        if (
          this.compareWithMap(
            this.permanentData,
            this.allDet.permanentAddress,
            permanentAddressMap,
          )
        ) {
          payload.permanentAddress = { ...this.permanentData, isTemp: true };
        }

        if (
          this.compareWithMap(
            this.tempData,
            this.allDet.temprorayAddress,
            temporaryAddressMap,
          )
        ) {
          payload.temprorayAddress = { ...this.tempData, isTemp: true };
        }

        if (
          this.compareWithMap(this.bankData, this.allDet.bankDetail, bankMap)
        ) {
          payload.bankDetail = { ...this.bankData, isTemp: true };
        }
      } else {
        payload.memberDetails = {
          ...this.personalData,
         aadhaar_json: this.allDet?.memberDetails?.aadhaar_json ?? '',
          collectedByName:
            this.bankForm.get('collectedByName')?.value ??
            this.allDet?.memberDetails?.collectedByName ??
            '',

          collectedByPhoneNumber:
            this.bankForm.get('collectedByPhoneNumber')?.value ??
            this.allDet?.memberDetails?.collectedByPhoneNumber ??
            '',

          collectedOn:
            this.bankForm.get('collectedOn')?.value ??
            this.allDet?.memberDetails?.collectedOn ??
            '',
        };
        ((payload.permanentAddress = this.permanentData),
          (payload.temprorayAddress = this.tempData),
          (payload.bankDetail = this.bankData));

        payload.isOfficerSave = this.isOfficerSave;
      }
      console.log('goNext Step 1 payload:', payload);

      if (
        this.personalValid &&
        this.permanentValid &&
        this.tempValid &&
        this.bankValid
      ) {
        this.memberService.Member_Save_All(payload).subscribe((res: any) => {
          if (res && res.status === 'SUCCESS') {
            if (this.currentStep < 3) {
              this.currentStep++;
              sessionStorage.setItem(
                'registrationStep',
                this.currentStep.toString(),
              );
              localStorage.setItem(
                'personalData',
                JSON.stringify(this.personalData),
              );
              setTimeout(() => {
                if (this.currentStep === 2 && this.MemFamilyDetailComponent) {
                  this.MemFamilyDetailComponent.initializeFamily();
                }
              });
            }
          } else {
            this.errorMessage = res?.message || 'Save failed';
          }
        });

        return;
      }

      if (this.MemPersonalDetailComponent) {
        this.MemPersonalDetailComponent.markAllAsTouched();
      }

      if (this.MemPermanentAddressComponent) {
        this.MemPermanentAddressComponent.markAllAsTouched();
      }

      if (this.MemTempAddressComponent) {
        this.MemTempAddressComponent.markAllAsTouched();
      }

      if (this.MemBankDetailComponent) {
        this.MemBankDetailComponent.markAllAsTouched();
      }

      this.errorMessage =
        'Please fill all mandatory fields in the personal details, address details and bank details sections to proceed / விண்ணப்பத்தை சமர்ப்பிக்க தனிப்பட்ட விவரங்கள், முகவரி விவரங்கள் மற்றும் வங்கி விவரங்கள் பிரிவுகளில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';

      return;
    }

    // ================= STEP 2 =================
    if (this.currentStep === 2) {
      console.log('goNext Step 2 - familyValid:', this.familyData);

      if (!this.familyValid) {
        if (this.MemFamilyDetailComponent) {
          this.MemFamilyDetailComponent.markAllAsTouched();
        }

        this.errorMessage =
          'Please fill all mandatory fields in the family section to proceed / விண்ணப்பத்தை சமர்ப்பிக்க குடும்ப விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும்.';

        return;
      }

      let familyMembers: any[] = [];
      if (this.isEdit) {
        const apiFamily = this.allDet?.familyMembers || [];

        familyMembers = this.familyData.members.map((m: any) => {
          const apiMember = apiFamily.find((x: any) => x.id === m.id);

          const changed = this.compareFamilyMember(m, apiMember);

          return {
            ...m,
            age: m.age?.toString() || '',
            isTemp: changed,
          };
        });
      } else {
        familyMembers = this.familyData.members.map((m: any) => ({
          ...m,
          age: m.age?.toString() || '',
        }));
      }

      const payload = {
        familyMembers: familyMembers,
        isOfficerSave: this.isOfficerSave,
      };
      console.log('goNext Step 2 payload:', payload);

      this.memberService.Member_Save_All(payload).subscribe((res: any) => {
        if (res && res.status === 'SUCCESS') {
          if (this.currentStep < 3) {
            this.currentStep++;
            sessionStorage.setItem(
              'registrationStep',
              this.currentStep.toString(),
            );
            sessionStorage.setItem(
              'familyData',
              JSON.stringify(this.familyData.members),
            );
          }
          this.allDet.familyMembers = this.familyData.members;
        } else {
          this.errorMessage = res?.message || 'Family save failed';
        }
      });

      return;
    }
  }
  compareWithMap(formData: any, apiData: any, map: any): boolean {
    if (!formData || !apiData) return true;

    for (const formKey of Object.keys(map)) {
      const apiKey = map[formKey];

      const formValue = this.normalizeValue(formData?.[formKey]);
      const apiValue = this.normalizeValue(apiData?.[apiKey]);

      if (formValue !== apiValue) {
        console.log(
          'Changed Field:',
          formKey,
          'Form:',
          formValue,
          'API:',
          apiValue,
        );

        return true;
      }
    }

    return false;
  }

  normalizeValue(value: any) {
    if (value === null || value === undefined) return '';

    // Handle Date object
    if (value instanceof Date) {
      return value.toISOString().substring(0, 10);
    }

    // Handle ISO date string
    if (typeof value === 'string' && value.includes('T')) {
      return value.substring(0, 10);
    }

    return String(value).trim();
  }
  triggerPersonalValidation() {
    if (this.MemPersonalDetailComponent) {
      this.MemPersonalDetailComponent.markAllAsTouched();
    }
  }
  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
      sessionStorage.setItem('registrationStep', this.currentStep.toString());
      if (this.currentStep === 1) {
        this.ngOnInit();
      }

      setTimeout(() => {
        if (this.currentStep === 2 && this.MemFamilyDetailComponent) {
          this.MemFamilyDetailComponent.initializeFamily();
        }
      }, 0);
    }
  }
}
