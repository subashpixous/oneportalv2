import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';
import { TCModel } from 'src/app/_models/user/usermodel';
import { MemberService } from 'src/app/services/member.sevice';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import {
  OrganizationDetailFormModel,
  MemberDetailsFormModel,
  AddressDetailFormModel,
  MemberGetModels,
} from 'src/app/_models/MemberDetailsModel';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { MemBankDetailComponent } from 'src/app/shared/common/mem-bank-detail/mem-bank-detail.component';
import { MemDocumentDetailComponent } from 'src/app/shared/common/mem-document-detail/mem-document-detail.component';
import { MemFamilyDetailComponent } from 'src/app/shared/common/mem-family-detail/mem-family-detail.component';
import { MemPermanentAddressComponent } from 'src/app/shared/common/mem-permanent-address/mem-permanent-address.component';
import { MemPersonalDetailComponent } from 'src/app/shared/common/mem-personal-detail/mem-personal-detail.component';
import { OrganizationDetailComponent } from 'src/app/shared/common/organization-detail/organization-detail.component';
import { MessageService } from 'primeng/api';
import { MemTempAddressComponent } from 'src/app/shared/common/mem-temp-address/mem-temp-address.component';

@Component({
  selector: 'app-member-data-update',
  templateUrl: './member-data-update.component.html',
  styleUrls: ['./member-data-update.component.scss'],
})
export class MemberDataUpdateComponent {
  @ViewChild(MemBankDetailComponent)
  MemBankDetailComponent!: MemBankDetailComponent;
  @ViewChild(MemDocumentDetailComponent)
  MemDocumentDetailComponent!: MemDocumentDetailComponent;
  @ViewChild(MemFamilyDetailComponent)
  MemFamilyDetailComponent!: MemFamilyDetailComponent;
  @ViewChild(MemTempAddressComponent)
  MemPermanentAddressComponent!: MemTempAddressComponent;
  @ViewChild(MemPersonalDetailComponent)
  MemPersonalDetailComponent!: MemPersonalDetailComponent;
  @ViewChild(OrganizationDetailComponent)
  OrganizationDetailComponent!: OrganizationDetailComponent;

  breadcrumbs!: BreadcrumbModel[];
  isLoggedin: boolean = false;
  memberDetail!: MemberViewModelExisting;
  allDet!: MemberGetModels;
  memberDetails!: AccountApplicantLoginResponseModel;
  isApprovalPending: boolean = false;
  isAbleToCancelRequest: boolean = false;
  types: TCModel[] = [
    {
      text: 'நிறுவன விவரங்கள் மாற்றம் / Organization details change ',
      value: 'ORGANIZATION_DETAILS',
    },
    {
      text: 'தனிப்பட்ட விவரங்கள் மாற்றம் / Personal details change',
      value: 'PERSONAL_DETAILS',
    },
    {
      text: 'நிரந்தர முகவரி மாற்றம் / Permanent Address change',
      value: 'PERMANENT_ADDRESS',
    },
    {
      text: 'தற்காலிக முகவரி மாற்றம் / Temporary Address change',
      value: 'TEMPORARY_ADDRESS',
    },
    {
      text: 'குடும்ப உறுப்பினர் மாற்றம் / Family Member Change',
      value: 'FAMILY_MEMBER',
    },
    {
      text: 'வங்கி விவரம் மாற்றம் / Bank Detail Change',
      value: 'BANK_CHANGES',
    },
    {
      text: 'ஆவணங்கள் மாற்றம் / Document Change',
      value: 'DOCUMENT',
    },
  ];
  selectedValue!: string;
  orgForm!: OrganizationDetailFormModel;
  memberform!: MemberDetailsFormModel;
  addressTempform!: AddressDetailFormModel;
  addressPermform!: AddressDetailFormModel;
  memberId!: string;

  get selectedValueText() {
    if (this.selectedValue == 'ORGANIZATION_DETAILS') {
      return 'நிறுவன விவரங்கள் ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளன, தயவுசெய்து ஒப்புதலுக்காக காத்திருக்கவும். / Organization details is sent for approval please wait for approval';
    } else if (this.selectedValue == 'PERSONAL_DETAILS') {
      return 'தனிப்பட்ட விவரங்கள் ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளன, தயவுசெய்து ஒப்புதலுக்காக காத்திருக்கவும்.  / Personal detail is sent for approval please wait for approval';
    } else if (this.selectedValue == 'PERMANENT_ADDRESS') {
      return 'நிரந்தர முகவரி ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளன, தயவுசெய்து ஒப்புதலுக்காக காத்திருக்கவும்.  / Permanent Address is sent for approval please wait for approval';
    } else if (this.selectedValue == 'TEMPORARY_ADDRESS') {
      return 'தற்காலிக முகவரி ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளன, தயவுசெய்து ஒப்புதலுக்காக காத்திருக்கவும்.  / Temporary Address is sent for approval please wait for approval';
    } else if (this.selectedValue == 'BANK_CHANGES') {
      return 'வங்கி விவரம் ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளன, தயவுசெய்து ஒப்புதலுக்காக காத்திருக்கவும்.  / Bank Detail is sent for approval please wait for approval';
    } else if (this.selectedValue == 'FAMILY_MEMBER') {
      return 'குடும்ப உறுப்பினர் ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளன, தயவுசெய்து ஒப்புதலுக்காக காத்திருக்கவும்.  / Family Member is sent for approval please wait for approval';
    } else if (this.selectedValue == 'DOCUMENT') {
      return 'ஆவணங்கள் ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளன, தயவுசெய்து ஒப்புதலுக்காக காத்திருக்கவும்.  / Documents are sent for approval please wait for approval';
    }
    return '';
  }
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private location: Location,
    private messageService: MessageService,
    private accountService: AccountService,
    private memberService: MemberService,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    this.memberDetails = this.accountService.userValue;
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
      this.memberId = this.memberDetails.id;
    }
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'Member Services',
        routing: '',
        isActionable: false,
      },
    ];
    this.memberService.Member_Get_All(this.memberId).subscribe((x) => {
      if (x) {
        this.allDet = x.data;
      }
    });
    this.memberService
      .Get_Member_All_Details_By_MemberId(this.memberId)
      .subscribe((x) => {
        if (x) {
          this.memberDetail = x.data;
        }
      });
  }
  bckClick() {
    this.location.back();
  }
  Logout() {
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }
  submit() {
    if (this.selectedValue == 'ORGANIZATION_DETAILS') {
      var orgDetail = this.OrganizationDetailComponent.overallsave();
      if (!orgDetail) {
        return;
      }
      this.memberService
        .Organization_SaveUpdate({ ...orgDetail, isTemp: true })
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
            this.fetchLatestDoc();
            this.selectedValue = '';
          }
        });
    } else if (this.selectedValue == 'PERSONAL_DETAILS') {
      var personalDetail = this.MemPersonalDetailComponent.overallsave();
      if (!personalDetail) {
        return;
      }
      this.memberService
        .Member_SaveUpdate({
          ...personalDetail,
          isTemp: true,
          collectedByPhoneNumber: '',
          collectedByName: '',
          collectedOn: '',
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
            this.fetchLatestDoc();
            this.selectedValue = '';
          }
        });
    } else if (this.selectedValue == 'PERMANENT_ADDRESS') {
      var overallsaveAddressForm =
        this.MemPermanentAddressComponent.overallsaveAddressForm();
      if (!overallsaveAddressForm) {
        return;
      }
      this.memberService
        .Address_Master_SaveUpdate({ ...overallsaveAddressForm, isTemp: true })
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
            this.fetchLatestDoc();
            this.selectedValue = '';
          }
        });
    } else if (this.selectedValue == 'TEMPORARY_ADDRESS') {
      var overallsaveTempAdrressForm =
        this.MemPermanentAddressComponent.overallsaveAddressForm();
      if (!overallsaveTempAdrressForm) {
        return;
      }
      this.memberService
        .Address_Master_SaveUpdate({
          ...overallsaveTempAdrressForm,
          isTemp: true,
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
            this.fetchLatestDoc();
            this.selectedValue = '';
          }
        });
    } else if (this.selectedValue == 'BANK_CHANGES') {
      var bankDetail = this.MemBankDetailComponent.overallsave();
      if (!bankDetail) {
        return;
      }
      this.memberService
        .Bank_SaveUpdate({ ...bankDetail, isTemp: true })
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
            this.fetchLatestDoc();
            this.selectedValue = '';
          }
        });
    }
  }
  fetchLatestDoc() {
    this.memberService
      .Get_Member_All_Details_By_MemberId(this.memberId)
      .subscribe((x) => {
        if (x) {
          this.memberDetail = x.data;
        }
      });

    this.memberService.Member_Get_All(this.memberId).subscribe((x) => {
      if (x) {
        this.allDet = x.data;
      }
    });
  }
  checkisApprovalPending() {
    if (this.selectedValue == 'ORGANIZATION_DETAILS') {
      this.isApprovalPending =
        this.allDet.organizationDetail?.isApprovalPending ?? false;
      this.isAbleToCancelRequest =
        this.allDet.organizationDetail?.isAbleToCancelRequest ?? false;
    } else if (this.selectedValue == 'PERSONAL_DETAILS') {
      this.isApprovalPending =
        this.allDet.memberDetails?.isApprovalPending ?? false;
      this.isAbleToCancelRequest =
        this.allDet.memberDetails?.isAbleToCancelRequest ?? false;
    } else if (this.selectedValue == 'PERMANENT_ADDRESS') {
      this.isApprovalPending =
        this.allDet.permanentAddress?.isApprovalPending ?? false;
      this.isAbleToCancelRequest =
        this.allDet.permanentAddress?.isAbleToCancelRequest ?? false;
    } else if (this.selectedValue == 'TEMPORARY_ADDRESS') {
      this.isApprovalPending =
        this.allDet.temprorayAddress?.isApprovalPending ?? false;
      this.isAbleToCancelRequest =
        this.allDet.temprorayAddress?.isAbleToCancelRequest ?? false;
    } else if (this.selectedValue == 'BANK_CHANGES') {
      this.isApprovalPending =
        this.allDet.bankDetail?.isApprovalPending ?? false;
      this.isAbleToCancelRequest =
        this.allDet.bankDetail?.isAbleToCancelRequest ?? false;
    } else if (this.selectedValue == 'DOCUMENT') {
      this.isApprovalPending =
        (this.allDet.memberDocuments &&
          this.allDet.memberDocuments[0].isApprovalPending) ??
        false;
      this.isAbleToCancelRequest =
        (this.allDet.memberDocuments &&
          this.allDet.memberDocuments[0].isAbleToCancelRequest) ??
        false;
    } else if (this.selectedValue == 'FAMILY_MEMBER') {
      this.isApprovalPending =
        (this.allDet.familyMembers &&
          this.allDet.familyMembers[0].isApprovalPending) ??
        false;
      this.isAbleToCancelRequest =
        (this.allDet.familyMembers &&
          this.allDet.familyMembers[0].isAbleToCancelRequest) ??
        false;
    }
  }
  cancelREquest() {
    var code: string = '';

    if (this.selectedValue == 'ORGANIZATION_DETAILS') {
      code = 'MEMBER_ORGANIZATION';
    } else if (this.selectedValue == 'PERSONAL_DETAILS') {
      code = 'MEMBER_DETAIL';
    } else if (this.selectedValue == 'PERMANENT_ADDRESS') {
      code = 'MEMBER_ADDRESS';
    } else if (this.selectedValue == 'TEMPORARY_ADDRESS') {
      code = 'MEMBER_ADDRESS';
    } else if (this.selectedValue == 'BANK_CHANGES') {
      code = 'MEMBER_BANK';
    } else if (this.selectedValue == 'DOCUMENT') {
      code = 'MEMBER_DOCUMENT';
    } else if (this.selectedValue == 'FAMILY_MEMBER') {
      code = 'MEMBER_FAMILY';
    }
    this.memberService
      .PartialChangeRequest_Cancel(this.memberId, code)
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
          this.fetchLatestDoc();
          this.selectedValue = '';
          this.isApprovalPending = false;
        }
      });
  }
}
