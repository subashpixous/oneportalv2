import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment, { Moment } from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import {
  OrganizationDetailFormModel,
  MemberDetailsFormModel,
  AddressDetailFormModel,
  MemberGetModels,
} from 'src/app/_models/MemberDetailsModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
import { AccountService } from 'src/app/services/account.service';
import { MemberService } from 'src/app/services/member.sevice';
import { MemBankDetailComponent } from 'src/app/shared/common/mem-bank-detail/mem-bank-detail.component';
import { MemDocumentDetailComponent } from 'src/app/shared/common/mem-document-detail/mem-document-detail.component';
import { MemFamilyDetailComponent } from 'src/app/shared/common/mem-family-detail/mem-family-detail.component';
import { MemPermanentAddressComponent } from 'src/app/shared/common/mem-permanent-address/mem-permanent-address.component';
import { MemPersonalDetailComponent } from 'src/app/shared/common/mem-personal-detail/mem-personal-detail.component';
import { OrganizationDetailComponent } from 'src/app/shared/common/organization-detail/organization-detail.component';
import {
  dateconvertionwithOnlyDate,
  dateconvertion,
} from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss'],
})
export class MemberEditComponent {
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
  @ViewChild(OrganizationDetailComponent)
  OrganizationDetailComponent!: OrganizationDetailComponent;

  breadcrumbs!: BreadcrumbModel[];
  activeIndex: number[] = [0];
  isLoggedin: boolean = false;
  memberId: string = '';
  // org
  orgForm!: OrganizationDetailFormModel;
  memberform!: MemberDetailsFormModel;
  addressTempform!: AddressDetailFormModel;
  addressPermform!: AddressDetailFormModel;

  allDet!: MemberGetModels;
  errorMessage: string = '';

  routeSub!: Subscription;
  bankForm!: FormGroup;
  memberDetails!: AccountApplicantLoginResponseModel;
  maxDate: Moment = moment(new Date());

  isOrgEdit: boolean = false;
  isPersonalEdit: boolean = false;
  isMemberAddressEdit: boolean = false;
  isFamilyEdit: boolean = false;
  isMemberBankEdit: boolean = false;
  isDocumentEdit: boolean = false;
  isAdditionalDocumentEdit: boolean = false;
  roleName: string = '';
  hideAadhaar: boolean = false;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    this.memberDetails = this.accountService.userValue;

    const privileges = this.cookieService.get('privillage');
    const privilegeList = privileges ? privileges.split(',') : [];
    const userPrivilege = this.cookieService.get('user');
    if (userPrivilege) {
      const userObj = JSON.parse(userPrivilege);
      this.roleName = userObj?.userDetails?.roleName;
    }
    if (this.roleName != 'Super Admin') {
      if (privilegeList.includes('ORGANIZATION_INFO_EDIT')) {
        this.isOrgEdit = true;
      }

      if (privilegeList.includes('MEMBER_PERSONAL_DETAILS_EDIT')) {
        this.isPersonalEdit = true;
      }

      if (privilegeList.includes('MEMBER_ADDRESS_EDIT')) {
        this.isMemberAddressEdit = true;
      }

      if (privilegeList.includes('FAMILY_MEMBER_DETAILS_EDIT')) {
        this.isFamilyEdit = true;
      }

      if (privilegeList.includes('MEMBER_BANK_DETAILS_EDIT')) {
        this.isMemberBankEdit = true;
      }

      if (privilegeList.includes('DOCUMENT_DETAILS_EDIT')) {
        this.isDocumentEdit = true;
      }

      if (privilegeList.includes('ADDITIONAL_DOCUMENT_DETAILS_EDIT')) {
        this.isAdditionalDocumentEdit = true;
      }
    } else {
      this.isOrgEdit = true;
      this.isPersonalEdit = true;
      this.isMemberAddressEdit = true;
      this.isFamilyEdit = true;
      this.isMemberBankEdit = true;
      this.isDocumentEdit = true;
      this.isAdditionalDocumentEdit = true;
    }

    this.bankForm = new FormGroup({
      collectedByName: new FormControl(null),
      collectedByPhoneNumber: new FormControl(null),
      collectedOn: new FormControl(this.dcwt(this.maxDate)),
    });
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.memberId = params['id']; //log the value of id
        if (params['index'] && Number(params['index']) > 0) {
          this.activeIndex = [Number(params['index'])]; //log the value of id
        }
        if (this.memberId !== '0') {
          this.isLoggedin = true;
          this.memberService.Member_Get_All(this.memberId).subscribe((x) => {
            if (x) {
              this.allDet = x.data;
              this.bankForm
                .get('collectedByName')
                ?.patchValue(this.allDet.memberDetails?.collectedByName);
              this.bankForm
                .get('collectedByPhoneNumber')
                ?.patchValue(this.allDet.memberDetails?.collectedByPhoneNumber);

              if (this.allDet.memberDetails?.collectedOn) {
                this.bankForm
                  .get('collectedOn')
                  ?.patchValue(this.allDet.memberDetails?.collectedOn);
              }
            }
          });
        }
      });

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
    this.router.navigate(['/officers/applications/applications']);
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
  submit() {
    var orgDetail = this.OrganizationDetailComponent.overallsave();
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
      // var ntDocsaved = docDetail.filter(
      //   (x) => !x.originalFileName || x.originalFileName == ''
      // );

      const filteredDocs = this.hideAadhaar
        ? docDetail.filter(
            (x) =>
              !x.documentCategory?.toLowerCase().includes('aadhaar') &&
              !x.documentCategory?.includes('ஆதார்')
          )
        : docDetail;

      const ntDocsaved = filteredDocs.filter(
        (x) => !x.originalFileName || x.originalFileName === ''
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
          ...personalDetail,
          collectedByName: this.bankForm.get('collectedByName')?.value,
          collectedByPhoneNumber: this.bankForm.get('collectedByPhoneNumber')
            ?.value,
          collectedOn: this.bankForm.get('collectedOn')?.value,
        },
        organizationDetail: orgDetail,
        bankDetail: bankDetail,
        workAddress: undefined,
        permanentAddress: overallsaveAddressForm,
        temprorayAddress: overallsaveTempAdrressForm,
        isOfficerSave: true,
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
          this.movetoView();
        }
      });
  }
  movetoView() {
    this.router.navigate(['officers', 'applications']);
  }
}
