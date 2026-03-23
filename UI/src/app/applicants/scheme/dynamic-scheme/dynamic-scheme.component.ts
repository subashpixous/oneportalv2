  import { HttpClient } from '@angular/common/http';
  import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Renderer2,
    ViewChild,
  } from '@angular/core';
  import {
    FormGroup,
    FormArray,
    FormBuilder,
    FormControl,
    Validators,
  } from '@angular/forms';
  import { Router, ActivatedRoute } from '@angular/router';
  import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
  import { Guid } from 'guid-typescript';
  import moment from 'moment';
  import { CookieService } from 'ngx-cookie-service';
  import {
    Message,
    ConfirmationService,
    MessageService,
    ConfirmEventType,
  } from 'primeng/api';
  import { AutoCompleteOnSelectEvent } from 'primeng/autocomplete';
  import { BreadcrumbModel } from 'src/app/_models/CommonModel';
  import {
    ApplicationDocumentVerificationMasterModel,
    ApplicationSchemeCostDetails,
    MemberGetModels,
    MemberModels,
    OrganizationDetailFormModel,
  } from 'src/app/_models/MemberDetailsModel';
  import { MemberDocumentMasterModelExisting, MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
  import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
  import {
    ConfigurationSchemeCostFieldModel,
    ConfigurationSchemeSaveModel,
  } from 'src/app/_models/schemeConfigModel';
  import {
    ApplicationDetailViewModel,
    ApplicationDropdownModel,
    ApplicationDocumentModel,
    ApplicationDocumentFormModel,
    StatusFlowModel,
    SubsidyValueGetResponseModel,
    ApplicationDetailViewModel1,
  } from 'src/app/_models/schemeModel';
  import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
  import { TCModel } from 'src/app/_models/user/usermodel';
  import { ApplicationValidationErrorModel } from 'src/app/_models/utils';
  import { AccountService } from 'src/app/services/account.service';
  import { GeneralService } from 'src/app/services/general.service';
  import { MemberService } from 'src/app/services/member.sevice';
  import { SchemeService } from 'src/app/services/scheme.Service';
  import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
  import {
    maledependents,
    femaledependents,
    fatherandHubdependents,
    calculateCompletedAge,
    convertoWords,
    dateconvertion,
    dateconvertionwithOnlyDate,
  } from 'src/app/shared/commonFunctions';
  import { environment } from 'src/environments/environment';
  import { Location } from '@angular/common';
  //import { OrganizationDetailComponent } from 'src/app/shared/common/organization-detail/organization-detail.component';
  import { MemBankDetailComponent } from 'src/app/shared/common/mem-bank-detail/mem-bank-detail.component';
  import { MemDocumentDetailComponent } from 'src/app/shared/common/mem-document-detail/mem-document-detail.component';
  import { MemFamilyDetailComponent } from 'src/app/shared/common/mem-family-detail/mem-family-detail.component';
  import { MemPermanentAddressComponent } from 'src/app/shared/common/mem-permanent-address/mem-permanent-address.component';
  import { MemPersonalDetailComponent } from 'src/app/shared/common/mem-personal-detail/mem-personal-detail.component';
  import { OrganizationDetailComponent } from 'src/app/shared/common/organization-detail/organization-detail.component';
  //import { MessageService } from 'primeng/api';
  import { MemTempAddressComponent } from 'src/app/shared/common/mem-temp-address/mem-temp-address.component';
  import { NgxPermissionsService } from 'ngx-permissions';
import { DialogService } from 'primeng/dynamicdialog';
import { MkkViewComponent } from '../../../shared/common/mkk-view/mkk-view.component';

  @UntilDestroy()
  @Component({
    selector: 'app-dynamic-scheme',
    templateUrl: './dynamic-scheme.component.html',
    styleUrls: ['./dynamic-scheme.component.scss'],
    providers: [DialogService]
  })
  export class DynamicSchemeComponent {
    @ViewChild('permanentAddressComp')
    MemPermanentAddressComponent!: MemTempAddressComponent;

    @ViewChild('temporaryAddressComp')
    MemTempAddressComponent!: MemTempAddressComponent;

    @ViewChild(MemBankDetailComponent)
    MemBankDetailComponent!: MemBankDetailComponent;
    @ViewChild(MemDocumentDetailComponent)
    MemDocumentDetailComponent!: MemDocumentDetailComponent;
    @ViewChild(MemFamilyDetailComponent)
    MemFamilyDetailComponent!: MemFamilyDetailComponent;
    // @ViewChild(MemPermanentAddressComponent)
    // MemPermanentAddressComponent!: MemPermanentAddressComponent;
    // @ViewChild(MemTempAddressComponent)
    // MemTempAddressComponent!: MemTempAddressComponent;
    @ViewChild(MemPersonalDetailComponent)
    MemPersonalDetailComponent!: MemPersonalDetailComponent;
    @ViewChild(OrganizationDetailComponent)
    OrganizationDetailComponent!: OrganizationDetailComponent;

    checked: boolean = false;
    showDecError: boolean = false;
    separatorExp: RegExp = /,| /;
    activeIndex: number[] = [-1];
    index: number = -1;
    applicationid: string = '';
    id: string = '';
    url: any = '';
    IsExpanded: boolean = false;
    isnew: boolean = false;
    schemeDetails!: ApplicationDetailViewModel1;
    errorMessage: string = '';
    name: string = '';
    allDet!: MemberGetModels;
    defaultDate = moment(new Date(1990, 1 - 1, 1)).toDate();
    endDate = moment(new Date()).toDate();

    privillage = sessionStorage.getItem('privillage');
    user = sessionStorage.getItem('user');
    token = sessionStorage.getItem('token');
    refreshToken = sessionStorage.getItem('refreshToken');
    accessToken = sessionStorage.getItem('accessToken');

    documentGroups: string[] = [];
    configDetail!: ConfigurationSchemeSaveModel;

    banks: TCModel[] = [];
    branches: TCModel[] = [];
    suggestions: TCModel[] = [];
    orgForm!: OrganizationDetailFormModel;
    memberDetail!: MemberViewModelExisting;
    schemeDetail!: ApplicationSchemeCostDetails;
    messages!: Message[];
    breadcrumbs!: BreadcrumbModel[];
    stylee!: string;
    cashow!: boolean;
    memberInformation!: AccountApplicantLoginResponseModel;
    documentsForm!: FormGroup;
    schemeForm!: FormGroup;
    memberId!: string;
    selectedValue!: string;

    canApplicantEdit: boolean = false;

    isOrgEdit: boolean = false;
    isPersonalEdit: boolean = false;
    isMemberAddressEdit: boolean = false;
    isFamilyEdit: boolean = false;
    isMemberBankEdit: boolean = false;
    isDocumentEdit: boolean = false;
    isAdditionalDocumentEdit: boolean = false;
    isOrgHide: boolean = false;
    isPersonalHide: boolean = false;
    isMemberAddressHide: boolean = false;
    isFamilyHide: boolean = false;
    isMemberBankHide: boolean = false;
    isDocumentHide: boolean = false;
    isAdditionalDocumentHide: boolean = false;
    isSchemeApplicantEdit: boolean = false;
    roleName: string = '';
    showPreview: boolean = false;
    bankForm!: FormGroup;
mainSchemeName: string = '';
previewImages: any = {};
showSubmitPopup: boolean = false;
  popupType: 'success' | 'error' = 'success';
  popupMessage: string = '';
    get documentsFormArray() {
      return this.documentsForm.controls['documents'] as FormArray;
    }
    get documentsList() {
      return this.documentsFormArray.controls as FormGroup[];
    }
    get schemeFormArray() {
      return this.schemeForm.controls['scategories'] as FormArray;
    }
    get schemeFormsList() {
      return this.schemeFormArray.controls as FormGroup[];
    }
    get documentTypeErrorMsg() {
      var error: any;
      if (this.documentsList) {
        this.documentsList.map((x) => {
          if (x.controls['acceptedDocumentTypeId'].errors) {
            error = x.controls['acceptedDocumentTypeId'].errors;
          }
        });
        if (error && error['required']) {
          return 'Required';
        }
      }

      return null;
    }
    get fileUploadErrorMsg() {
      var error: any;
      if (this.documentsList) {
        this.documentsList.map((x) => {
          if (x.controls['savedFileName'].errors) {
            error = x.controls['savedFileName'].errors;
          }
        });
        if (error && error['required']) {
          return 'Required';
        }
      }

      return null;
    }
    get verifiedErrorMsg() {
      var error: any;
      var anyerrror: boolean = false;
      if (this.documentsList) {
        this.documentsList.map((x) => {
          if (x.controls['isVerified'].errors) {
            error = x.controls['isVerified'].errors;
          }
          if (!x.controls['isVerified'].value && x.controls['isRequired'].value) {
            anyerrror = true;
          }
        });
        if ((error && error['required']) || anyerrror) {
          return 'Required';
        }
      }

      return null;
    }
    get categorySelectionErrorMsg() {
      var error: any;
      var issingle = this.schemeDetail.isSingleCategorySelect;
      var total = 0;
      if (this.schemeFormsList) {
        this.documentsList.map((x) => {
          if (x.controls['isSelected'].value) {
            total++;
          }
        });
        if (issingle && total > 0 && total != 1) {
          return 'Only one category is allowed to select';
        }
      }

      return null;
    }

    @ViewChild('chipInput') chipInput!: ElementRef;

    constructor(
      private confirmationService: ConfirmationService,
      private permissionsService: NgxPermissionsService,
      private messageService: MessageService,
      private accountService: AccountService,
      private generalService: GeneralService,
      private location: Location,
      private schemeService: SchemeService,
      private cdr: ChangeDetectorRef,
      private router: Router,
      private route: ActivatedRoute,
      private memberService: MemberService,
      private formBuilder: FormBuilder,
      private schemeConfigService: SchemeConfigService,
      private cookieService: CookieService,
      private dialogService: DialogService,
      private http: HttpClient
    ) {
      // this.generalService.Config_Scheme_Get_By_Code('MKKS').subscribe((x) => {
      //   this.configDetail = x.data[0];
      // });
    }
    ngOnInit() {
      //modified by Indu on 25-10-2025 for storing collected by details for scheme
this.mainSchemeName = history.state?.schemeGroupName || '';
      this.bankForm = new FormGroup({
        collectedByName: new FormControl(null),
        collectedByPhoneNumber: new FormControl(null),
        collectedOn: new FormControl(this.dcwt(this.endDate)),
      });

      const roleName = sessionStorage.getItem('privillage');

      if (roleName && roleName.includes('APPLY_SCHEME')) {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const mobile = user?.userDetails?.mobile;
        this.bankForm.patchValue({
          collectedByName: `${user?.firstName ?? ''} ${
            user?.lastName ?? ''
          }`.trim(),
          collectedByPhoneNumber: mobile ?? '',

          collectedOn: this.dcwt(this.endDate) ?? '',
        });
      }
      //end

      const privileges = this.cookieService.get('privillage');
      const privilegeList = privileges ? privileges.split(',') : [];
      const userPrivilege = this.cookieService.get('user');
      if (userPrivilege) {
        const userObj = JSON.parse(userPrivilege);
        this.roleName = userObj?.userDetails?.roleName;
      }
      if (this.roleName != 'Super Admin') {
        if (privilegeList.length > 0) {
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
          if (privilegeList.includes('ORGANIZATION_INFO_HIDE')) {
            this.isOrgHide = true;
          }

          if (privilegeList.includes('MEMBER_PERSONAL_DETAILS_HIDE')) {
            this.isPersonalHide = true;
          }

          if (privilegeList.includes('MEMBER_ADDRESS_HIDE')) {
            this.isMemberAddressHide = true;
          }

          if (privilegeList.includes('FAMILY_MEMBER_DETAILS_HIDE')) {
            this.isFamilyHide = true;
          }

          if (privilegeList.includes('MEMBER_BANK_DETAILS_HIDE')) {
            this.isMemberBankHide = true;
          }

          if (privilegeList.includes('DOCUMENT_DETAILS_HIDE')) {
            this.isDocumentHide = true;
          }

          if (privilegeList.includes('ADDITIONAL_DOCUMENT_DETAILS_HIDE')) {
            this.isAdditionalDocumentHide = true;
          }
          if (privilegeList.includes('SCHEME_AND_APPLICANT_DETAIL_EDIT')) {
            this.isSchemeApplicantEdit = true;
          }
        } else {
          this.isOrgEdit = true;
          this.isPersonalEdit = true;
          this.isMemberAddressEdit = true;
          this.isFamilyEdit = true;
          this.isMemberBankEdit = true;
          this.isDocumentEdit = true;
          this.isAdditionalDocumentEdit = true;
          this.isOrgHide = false;
          this.isPersonalHide = false;
          this.isMemberAddressHide = false;
          this.isFamilyHide = false;
          this.isMemberBankHide = false;
          this.isDocumentHide = false;
          this.isAdditionalDocumentHide = false;
          this.isSchemeApplicantEdit = true;
        }
      } else {
        this.isOrgEdit = true;
        this.isPersonalEdit = true;
        this.isMemberAddressEdit = true;
        this.isFamilyEdit = true;
        this.isMemberBankEdit = true;
        this.isDocumentEdit = true;
        this.isAdditionalDocumentEdit = true;
        this.isOrgHide = false;
        this.isPersonalHide = false;
        this.isMemberAddressHide = false;
        this.isFamilyHide = false;
        this.isMemberBankHide = false;
        this.isDocumentHide = false;
        this.isAdditionalDocumentHide = false;
        this.isSchemeApplicantEdit = true;
      }

      this.memberInformation = this.accountService.userValue;
      this.documentsForm = new FormGroup({
        documents: new FormArray([]),
      });
      this.schemeForm = new FormGroup({
        scategories: new FormArray([]),

        id: new FormControl(''),
        member_Id: new FormControl(''), // TODO
        account_Holder_Name: new FormControl(null),
        account_Number: new FormControl(null),
        address: new FormControl(null),
        iFSC_Code: new FormControl(null),
        bank_Name: new FormControl(null),
        bank_Id: new FormControl(null),
        branch: new FormControl(null),
        branch_Id: new FormControl(null),
        placeOfAccident: new FormControl(null),
        relationshipToTheAccident: new FormControl(null),
        medicalInsurancePlanRegistrationNumber: new FormControl(null),
        isActive: new FormControl(true),
      });

      this.breadcrumbs = [
        {
          pathName: 'Homepage ',
          routing: 'applicant',
          isActionable: true,
        },
        {
          pathName: 'Member Services',
          routing: 'applicant/mem-detail-dashboard',
          isActionable: true,
        },
        {
          pathName: 'Schemes',
          routing: 'applicant/scheme-group',
          isActionable: true,
        },
        {
          pathName: 'Scheme Registration',
          routing: '',
          isActionable: false,
        },
      ];
      this.stylee = this.cookieService.check('accesstype')
        ? this.cookieService.get('accesstype') != 'OFFICER' &&
          this.cookieService.get('accesstype') != ''
          ? 'width: 100%;'
          : ''
        : 'width: 100%;';
      this.cashow = this.cookieService.check('accesstype')
        ? this.cookieService.get('accesstype') != 'OFFICER' &&
          this.cookieService.get('accesstype') != ''
          ? true
          : false
        : true;
      this.route.params.pipe(untilDestroyed(this)).subscribe((params) => {
        this.applicationid = params['id']; //log the value of id
        this.index = params['index']; //log the value of id
        if (this.applicationid) {
          this.schemeService
            .Application_Get(this.applicationid)
            .subscribe((x) => {
              this.schemeDetails = x.data[0];

              // Set memberId here
              this.memberId = this.schemeDetails.memberId;

              this.schemeForm
                .get('member_Id')
                ?.patchValue(this.schemeDetails?.applicationBank?.application_Id);
              this.schemeForm
                .get('account_Holder_Name')
                ?.patchValue(
                  this.schemeDetails?.applicationBank?.account_Holder_Name
                );
              this.schemeForm
                .get('account_Number')
                ?.patchValue(this.schemeDetails?.applicationBank?.account_Number);
              this.schemeForm
                .get('iFSC_Code')
                ?.patchValue(this.schemeDetails?.applicationBank?.ifsC_Code);
              this.schemeForm
                .get('bank_Name')
                ?.patchValue(this.schemeDetails?.applicationBank?.bank_Name);
              this.schemeForm
                .get('bank_Id')
                ?.patchValue(this.schemeDetails?.applicationBank?.bank_Id);
              this.schemeForm
                .get('branch')
                ?.patchValue(this.schemeDetails?.applicationBank?.branch);
              this.schemeForm
                .get('branch_Id')
                ?.setValue(this.schemeDetails?.applicationBank?.branch_Id);
              this.schemeForm
                .get('placeOfAccident')
                ?.setValue(
                  this.schemeDetails?.schemeAdditionalInformation?.placeOfAccident
                );
              this.schemeForm
                .get('relationshipToTheAccident')
                ?.setValue(
                  this.schemeDetails?.schemeAdditionalInformation
                    ?.relationshipToTheAccident
                );
              this.schemeForm
                .get('medicalInsurancePlanRegistrationNumber')
                ?.setValue(
                  this.schemeDetails?.schemeAdditionalInformation
                    ?.medicalInsurancePlanRegistrationNumber
                );
              if (
                (this.cashow && !this.schemeDetails.isSubmitted) ||
                !this.cashow
              ) {
                this.canApplicantEdit = true;
              }
              if (this.schemeDetails?.showBankFields) {
                this.schemeForm.controls['account_Holder_Name'].addValidators(
                  Validators.required
                );
                this.schemeForm.controls['account_Number'].addValidators(
                  Validators.required
                );
                this.schemeForm.controls['bank_Id'].addValidators(
                  Validators.required
                );
                this.schemeForm.controls['branch_Id'].addValidators(
                  Validators.required
                );
                this.schemeForm.controls['iFSC_Code'].addValidators(
                  Validators.required
                );
              }
              if (this.schemeDetails?.showAdditionalFields) {
                this.schemeForm.controls['placeOfAccident'].addValidators(
                  Validators.required
                );
                this.schemeForm.controls[
                  'relationshipToTheAccident'
                ].addValidators(Validators.required);
                this.schemeForm.controls[
                  'medicalInsurancePlanRegistrationNumber'
                ].addValidators(Validators.required);
              }
              this.memberService
                .Member_Get_All(this.schemeDetails.memberId)
                .subscribe({
                  next: (res) => {
                    if (res && res.data) {
                      this.allDet = res.data;
                      console.log('Member_Get_All response:', this.allDet);

                      // if you want to see specific values
                    } else {
                      console.warn('No data returned from Member_Get_All');
                    }
                  },
                  error: (err) => {
                    console.error('Error fetching member details:', err);
                  },
                });
              this.memberService
                .Get_Member_All_Details_By_MemberId(x.data[0].memberId)
                .subscribe((x) => {
                  if (x) {
                    this.memberDetail = x.data;
                  }
                });
              this.getDocuments(
                this.schemeDetails?.applicantId,
                this.schemeDetails?.schemeId
              );
              this.schemeConfigService
                .Application_Scheme_Form({
                  applicationId: this.applicationid,
                  schemeId: x.data[0].schemeId,
                })
                .subscribe((x) => {
                  if (x) {
                    this.schemeDetail = x.data;
                    this.generateDefaultCategories();
                  }
                });
            });
        } else {
          this.isnew = true;
          this.applicationid = Guid.create().toString();
        }
        if (this.index) {
          this.activeIndex = [Number(this.index)];
          this.cdr.detectChanges();
        }
      });
      //#endregion

      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
    generateDefaultCategories() {
      if (this.schemeDetail?.schemeSubCategory) {
        var isselcted = this.schemeDetail?.schemeSubCategory.length == 1;

        this.schemeDetail?.schemeSubCategory.forEach((x) => {
          this.schemeFormArray.push(
            this.formBuilder.group({
              applicationId: [this.applicationid, [Validators.required]],
              groupId: [x.groupId, [Validators.required]],
              subCategoryId: [x.subCategoryId, [Validators.required]],
              isSelected: [{ value: isselcted, disabled: false }],
              subCategory: [x.subCategory, [Validators.required]],
              communityId: [x.communityId, [Validators.required]],
              community: [x.community, [Validators.required]],
              occurrence: [x.occurrence, [Validators.required]],
              recurrence: [x.recurrence, [Validators.required]],
              amount: [x.amount, [Validators.required]],
            })
          );
        });
        this.chengerestInputs(1);
      }
    }
    chengerestInputs(i: any) {
      var issingle = this.schemeDetail.isSingleCategorySelect;
      var total = 0;
      if (this.schemeFormsList) {
        this.schemeFormsList.map((x) => {
          if (issingle && total > 0) {
            x.controls['isSelected'].disable();
          } else if (issingle && total == 0) {
            x.controls['isSelected'].enable();
          }
          if (x.controls['isSelected'].value) {
            total++;
          }
        });
        this.schemeFormsList.map((x) => {
          if (issingle && total > 0 && !x.controls['isSelected'].value) {
            x.controls['isSelected'].disable();
          } else if (issingle && total == 0) {
            x.controls['isSelected'].enable();
          }
        });
      }
    }
    back() {
      this.location.back();
    }
    resetForm() {}
    triggerValueChangesForAll(formGroup: FormGroup): void {
      Object.keys(formGroup.controls).forEach((key) => {
        const control = formGroup.get(key);
        if (control) {
          const value = control.value; // Get current value
          control.setValue(value); // Re-set the same value to trigger valueChanges
        }
      });
    }
    public delete() {
      this.url = '';
    }
    updateError() {
      this.showDecError = false;
    }
    getFormGrp(id: string) {
      var file = this.documentsList.find((x) => x.controls['id'].value == id);
      if (file) {
        return this.documentsList.indexOf(file);
      }
      return 0;
    }
    verifiedClicked(event: any, id: string) {
      console.log(event);
      var df = this.documentsList.find((x) => x.controls['id'].value == id);
      if (df && event) {
        this.confirmationService.confirm({
          message: `முன்னர் பதிவேற்றப்பட்ட ஆவணங்களைக் கண்டறிந்தோம். இந்த ஆவணங்கள் இன்னும் செல்லுபடியாகும் மற்றும் புதுப்பித்த நிலையில் உள்ளனவா? /
            We found previously uploaded documents. Are these documents still valid and up-to-date?`,
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.setVerificationDone({
              id: id,
              applicationId: this.applicationid,
              applicantId: this.schemeDetails?.applicantId,
              documentCategoryId: df?.controls['documentCategoryId'].value,
              isVerified: true,
            });
          },
          reject: (type: ConfirmEventType) => {
            if (type === ConfirmEventType.REJECT) {
              this.removeFile(df?.controls['documentCategoryId'].value);
            }
          },
        });
        return;
      }
    }
    setVerificationDone(obj: ApplicationDocumentVerificationMasterModel) {
      this.schemeService.Document_Verification_SaveUpdate(obj).subscribe((v) => {
        this.getDocuments(
          this.schemeDetails?.applicantId,
          this.schemeDetails?.schemeId
        );
      });
    }
    dcwt(val: any) {
      return dateconvertion(val);
    }
    onSelectDocumentFile(event: any, id: string) {
      if (event.files && event.files[0]) {

const file = event.files[0];

      // 🔥 PUDHU CODE: Image Preview Logic 🔥
      if (file.type.match(/image\/*/) != null) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
          this.previewImages[id] = reader.result; // local base64 URL save aagum
        };
      } else if (file.type === 'application/pdf') {
        this.previewImages[id] = 'PDF'; // PDF-kku aana flag
      }

        var df = this.documentsList.find((x) => x.controls['id'].value == id);
        if (df) {
          var applicationId = df.controls['applicationId'].value;
          var acceptedDocumentTypeId =
            df.controls['acceptedDocumentTypeId'].value;
          var documentCategoryId = df.controls['documentCategoryId'].value;
          const formData = new FormData();
          formData.append('Id', id);
          formData.append('Member_Id', this.schemeDetails?.applicantId);
          formData.append('DocumentCategoryId', documentCategoryId);
          formData.append('AcceptedDocumentTypeId', acceptedDocumentTypeId);
          formData.append('OriginalFileName', '');
          formData.append('SavedFileName', '');
          formData.append('IsTemp', 'false');
          formData.append('IsActive', 'true');
          formData.append('File', event.files[0]);
          this.http
            .post(
              `${environment.apiUrl}/Member/Member_Document_SaveUpdate`,
              formData
            )
            .subscribe(
              (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Uploaded Successfully',
                });
                this.getDocuments(
                  this.schemeDetails?.applicantId,
                  this.schemeDetails?.schemeId
                );
              },
              (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to Upload! Please try again',
                });
              }
            );
        }
      }
    }
    getDocuments(MemberId: string, SchemeId: string) {
      this.schemeService
        .Application_Document_Get_From_Member_Doc_Table(
          MemberId,
          this.applicationid,
          SchemeId
        )
        .subscribe((c) => {
          if (c.data) {
            var d: ApplicationDocumentFormModel[] = c.data;
            if (d) {
              this.documentsFormArray.clear();
              d.forEach((v) => {
                if (v.documents) {
                  if (!this.documentGroups.includes(v.documentGroupName)) {
                    this.documentGroups = [
                      ...this.documentGroups,
                      v.documentGroupName,
                    ];
                  }
                  this.generateDefaultRows(v.documents);
                  this.diableDropdown();
                }
              });
            }
          }
        });
    }
    diableDropdown() {
      this.documentsList.forEach((x) => {
        if (x.controls['originalFileName'].value) {
          x?.controls['acceptedDocumentTypeId'].disable();
        } else {
          x?.controls['acceptedDocumentTypeId'].enable();
        }
      });
    }
    getGrpItems(grpname: string) {
      return this.documentsFormArray.controls.filter(
        (item) => item.get('documentType')?.value == grpname
      );
    }
    downloadFile(id: string, originalFileNAme: string) {
      this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
    }
    backtogrid() {
      if (this.cashow) {
        this.router.navigateByUrl('/applicant/eligibility');
      } else {
        this.router.navigateByUrl('/officers/applications');
      }
    }
    generateDefaultRows(docs: ApplicationDocumentModel[]) {
      if (docs) {
        docs.forEach((x) => {
          if (
            (!x.acceptedDocumentTypeId || x.acceptedDocumentTypeId == '') &&
            x.acceptedDocumentList &&
            x.acceptedDocumentList.length == 1
          ) {
            x.acceptedDocumentTypeId = x.acceptedDocumentList[0].value;
          }

          this.documentsFormArray.push(
            this.formBuilder.group({
              id: [x.id],
              applicationId: [this.applicationid, [Validators.required]],
              documentCategoryName: [x.documentCategory, [Validators.required]],
              documentType: [
                x.documentGroupName,
                x.isRequired ? Validators.required : null,
              ],
              documentCategoryId: [x.documentCategoryId],
              isVerified: [
                { value: x.isVerified, disabled: !x.savedFileName },
                x.isRequired ? Validators.required : null,
              ],
              isRequired: [x.isRequired],
              savedFileName: [
                x.savedFileName,
                x.isRequired ? Validators.required : null,
              ],
              acceptedDocumentList: [x.acceptedDocumentList],
              documentConfigId: [x.documentConfigId],
              acceptedDocumentTypeId: [
                x.acceptedDocumentTypeId,
                x.isRequired ? Validators.required : null,
              ],
              originalFileName: [x.originalFileName],
            })
          );
        });
      }
    }
    // removeFile(DocumentCategoryId: string) {
    //   this.schemeService
    //     .Member_Document_Delete_From_Application(
    //       this.schemeDetails?.applicantId,
    //       DocumentCategoryId,
    //       this.applicationid
    //     )
    //     .subscribe((v) => {
    //       this.getDocuments(
    //         this.schemeDetails?.applicantId,
    //         this.schemeDetails?.schemeId
    //       );
    //     });
    // }
    removeFile(DocumentCategoryId: string, id?: string) {
    this.schemeService
      .Member_Document_Delete_From_Application(
        this.schemeDetails?.applicantId,
        DocumentCategoryId,
        this.applicationid
      )
      .subscribe((v) => {
        // 🔥 PUDHU CODE: Clear the image preview from the dictionary
        if (id && this.previewImages[id]) {
          delete this.previewImages[id];
        }

        this.getDocuments(
          this.schemeDetails?.applicantId,
          this.schemeDetails?.schemeId
        );
      });
  }
    getclass(item: StatusFlowModel) {
      var isPassed = item.isPassed;
      var isPreviousPassed = this.schemeDetails.statusFlow?.find(
        (x) => x.number == item.number - 1
      )?.isPassed;
      if (isPassed) {
        return 'ChevronDiv ChevronDiv_completed';
      } else if (isPreviousPassed && !isPassed) {
        return 'ChevronDiv ChevronDiv_Active';
      }
      return 'ChevronDiv';
    }
    getStyle(item: StatusFlowModel) {
      var isPassed = item.isPassed;
      var isPreviousPassed = this.schemeDetails.statusFlow?.find(
        (x) => x.number == item.number - 1
      )?.isPassed;
      if (isPassed) {
        return (
          'background-color:#28a745;' + 'z-index:' + (50 - item.number) + ';'
        );
      } else if (
        (isPreviousPassed != undefined && isPreviousPassed) ||
        isPreviousPassed == undefined
      ) {
        return (
          'background-color:#06568e;' + 'z-index:' + (50 - item.number) + ';'
        );
      }
      return 'z-index:' + (50 - item.number) + ';';
    }
    home() {
      this.router.navigateByUrl('/');
    }
    showButton() {
      if (this.cookieService.get('accesstype') == 'APPLICANT') {
        return false;
      } else if (
        this.cookieService.get('privillage') &&
        this.schemeDetails.isSubmitted == true
      ) {
        return true;
      }
      return false;
    }
    save() {
      var cats = this.schemeForm.get('scategories')?.value;
      cats.forEach((x: any) => {
        if (x.isSelected != true) {
          x.isSelected = false;
        } else {
          x.isSelected = true;
        }
        x.applicationId = this.applicationid;
      });
      this.schemeConfigService
        .Application_Save_Scheme_Cost_Details({
          applicationCostDetails: cats,
          bankDetailSaveModel: {
            id: '',
            application_Id: this.applicationid,
            account_Holder_Name: this.schemeForm.get('account_Holder_Name')
              ?.value,
            account_Number: this.schemeForm.get('account_Number')?.value,
            ifsC_Code: this.schemeForm.get('iFSC_Code')?.value,
            bank_Name: this.schemeForm.get('bank_Name')?.value,
            bank_Id: this.schemeForm.get('bank_Id')?.value,
            branch: this.schemeForm.get('branch')?.value,
            branch_Id: this.schemeForm.get('branch_Id')?.value,
            isActive: true,
          },
          schemeAdditionalInformation: {
            applicationId: this.applicationid,
            placeOfAccident: this.schemeForm.get('placeOfAccident')?.value,
            relationshipToTheAccident: this.schemeForm.get(
              'relationshipToTheAccident'
            )?.value,
            medicalInsurancePlanRegistrationNumber: this.schemeForm.get(
              'medicalInsurancePlanRegistrationNumber'
            )?.value,
          },
          actionType: 'save',
        })
        .subscribe((x) => {
          if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
            // this.messageService.add({
            //   severity: 'error',
            //   summary: 'Error',
            //   life: 2000,
            //   detail: x.message,
            // });
          } else if (x) {
            this.schemeDetail = x.data;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Saved Successfully',
            });
          }
        });
    }
    saveSection() {
      if (!this.selectedValue) return;

      // 🔹 Determine which section is being saved
      switch (this.selectedValue) {
        case 'ORGANIZATION_DETAILS':
          var orgDetail = this.OrganizationDetailComponent.overallsave();
          if (!orgDetail) {
            return;
          }
          this.memberService
            .Organization_SaveUpdate({
              ...orgDetail,
              isTemp: false,
              member_Id: this.schemeDetails?.memberId,
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

                window.location.reload();
              }
            });
          break;

        case 'PERSONAL_DETAILS':
          var personalDetail = this.MemPersonalDetailComponent.overallsave();
          if (!personalDetail) {
            return;
          }
          this.memberService
            .Member_SaveUpdate({
              ...personalDetail,
              isTemp: false,
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

                window.location.reload();
              }
            });
          break;

        case 'PERMANENT_ADDRESS':
          const permanentAddressForm =
            this.MemPermanentAddressComponent.overallsaveAddressForm();
          if (!permanentAddressForm) return;

          this.memberService
            .Address_Master_SaveUpdate({
              ...permanentAddressForm,
              isTemp: false,
              addressType: 'PERMANENT',
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

                window.location.reload();
              }
            });
          break;

        case 'TEMPORARY_ADDRESS':
          var overallsavenewTempAdrressForm =
            this.MemTempAddressComponent.overallsaveAddressForm();
          if (!overallsavenewTempAdrressForm) {
            return;
          }
          this.memberService
            .Address_Master_SaveUpdate({
              ...overallsavenewTempAdrressForm,
              isTemp: false,
              addressType: 'TEMPORARY',
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

                window.location.reload();
              }
            });
          break;

        case 'BANK_CHANGES':
          var bankDetail = this.MemBankDetailComponent.overallsave();
          if (!bankDetail) {
            return;
          }

          this.memberService
            .Bank_SaveUpdate({
              ...bankDetail,
              isTemp: false,
              member_Id: this.schemeDetails?.memberId,
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

                window.location.reload();
              }
            });
          break;

        default:
          return;
      }
    }

    // 🔹 Refresh member details and reflect on the UI
    fetchLatestDoc() {
      if (!this.memberId) return;
      this.memberService
        .Get_Member_All_Details_By_MemberId(this.memberId)
        .subscribe((res) => {
          if (res) {
            this.memberDetail = res.data;
          }
        });

      this.memberService.Member_Get_All(this.memberId).subscribe((res) => {
        if (res) {
          this.allDet = res.data;
        }
      });
    }

    // submit() {
    //   if (!this.checked) {
    //     this.errorMessage =
    //       'சமர்ப்பிக்க பிரகடனத்தைத் தேர்ந்தெடுக்க வேண்டும். / Declaration should be selected in order to submit.';
    //     return;
    //   }
    //   var issingle = this.schemeDetail.isSingleCategorySelect;
    //   var total = 0;
    //   if (this.schemeFormsList) {
    //     this.schemeFormsList.map((x) => {
    //       if (x.controls['isSelected'].value) {
    //         total++;
    //       }
    //     });
    //   }
    //   if (issingle && total > 1) {
    //     this.errorMessage =
    //       'திட்ட வகையிலிருந்து ஒரே ஒரு விருப்பத்தை மட்டும் தேர்வு செய்யவும். பல தேர்வுகள் அனுமதிக்கப்படாது. / Please choose only one option from scheme category. Multiple selections are not allowed.';
    //     return;
    //   } else if (total == 0) {
    //     this.errorMessage =
    //       'திட்ட வகையிலிருந்து ஏதேனும் ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும். / Please choose any one option from scheme category.';
    //     return;
    //   }
    //   var anyerrror: boolean = false;
    //   if (this.documentsList) {
    //     this.documentsList.map((x) => {
    //       if (!x.controls['isVerified'].value && x.controls['isRequired'].value) {
    //         anyerrror = true;
    //       }
    //     });
    //   }
    //   if (this.documentsForm.valid && !anyerrror) {
    //     this.errorMessage = '';
    //     var cats: any[] = this.schemeForm.get('scategories')?.value;
    //     cats.forEach((x: any) => {
    //       if (x.isSelected != true) {
    //         x.isSelected = false;
    //       } else {
    //         x.isSelected = true;
    //       }
    //       x.applicationId = this.applicationid;
    //     });
    //     this.schemeConfigService
    //       .Application_Save_Scheme_Cost_Details({
    //         applicationCostDetails: cats,
    //         bankDetailSaveModel: {
    //           id: '',
    //           application_Id: this.applicationid,
    //           account_Holder_Name: this.schemeForm.get('account_Holder_Name')
    //             ?.value,
    //           account_Number: this.schemeForm.get('account_Number')?.value,
    //           ifsC_Code: this.schemeForm.get('iFSC_Code')?.value,
    //           bank_Name: this.schemeForm.get('bank_Name')?.value,
    //           bank_Id: this.schemeForm.get('bank_Id')?.value,
    //           branch: this.schemeForm.get('branch')?.value,
    //           branch_Id: this.schemeForm.get('branch_Id')?.value,
    //           isActive: true,
    //         },
    //         schemeAdditionalInformation: {
    //           applicationId: this.applicationid,
    //           placeOfAccident: this.schemeForm.get('placeOfAccident')?.value,
    //           relationshipToTheAccident: this.schemeForm.get(
    //             'relationshipToTheAccident'
    //           )?.value,
    //           medicalInsurancePlanRegistrationNumber: this.schemeForm.get(
    //             'medicalInsurancePlanRegistrationNumber'
    //           )?.value,
    //         },
    //         actionType: 'submit',
    //       })
    //       .subscribe((x) => {
    //         if (x) {
    //           this.schemeConfigService
    //             .Application_Init({
    //               id: this.applicationid,
    //               schemeId: this.schemeDetails.schemeId,
    //               memberId: this.schemeDetails.memberId,
    //               fromStatusId: '',
    //               toStatusId: '',
    //               isSubmit: true,
    //               selectedMember: undefined,
    //               memberName: this.memberInformation.name,
    //               applicantName: this.schemeDetails.name,
    //               mobile: this.schemeDetails.mobile,
    //               district: this.memberDetail.permanentAddress.district,

    //               // modified by Indu on 25-10-2025 for storing collected by details for scheme
    //               collectedByName: this.bankForm.get('collectedByName')?.value,
    //               collectedByPhoneNumber: this.bankForm.get(
    //                 'collectedByPhoneNumber'
    //               )?.value,
    //               collectedOn: this.bankForm.get('collectedOn')?.value,
    //             })
    //             .subscribe((x) => {
    //               if (
    //                 x &&
    //                 (x.status == FailedStatus || x.status == ErrorStatus)
    //               ) {
    //                 this.messageService.add({
    //                   severity: 'error',
    //                   summary: 'Error',
    //                   life: 2000,
    //                   detail: x.message,
    //                 });
    //               } else if (x) {
    //                 this.messageService.add({
    //                   severity: 'success',
    //                   summary: 'Success',
    //                   detail: 'Submitted Successfully',
    //                 });
    //                 if (
    //                   this.cashow &&
    //                   !this.privillage?.includes('APPLY_SCHEME')
    //                 ) {
    //                   this.router.navigate(['applicant', 'dashboard']);
    //                 }

    //                 // modified by Indu on 25-10-2025 for redirecting from scheme form to Officers Application form only he has APPLY_SCHEME privilage

    //                 if (this.privillage?.includes('APPLY_SCHEME')) {
    //                   const userdetailsString = sessionStorage.getItem('user');

    //                   if (userdetailsString) {
    //                     const userdetails = JSON.parse(userdetailsString); // ✅ must parse JSON

    //                     const privillage =
    //                       sessionStorage.getItem('privillage') || '';
    //                     const accessToken = sessionStorage.getItem('token') || '';
    //                     const refreshToken =
    //                       sessionStorage.getItem('refreshToken') || '';

    //                     // Clear sensitive info before storing again
    //                     userdetails.privillage = null;
    //                     userdetails.accessToken = null;
    //                     userdetails.refreshToken = null;
    //                     this.cookieService.delete('mobile');
    //                     this.cookieService.delete('name');

    //                     this.cookieService.set('privillage', privillage, 1);
    //                     this.cookieService.set(
    //                       'user',
    //                       JSON.stringify(userdetails),
    //                       1
    //                     );
    //                     this.cookieService.set('token', accessToken, 1);
    //                     this.cookieService.set('refreshToken', refreshToken, 1);
    //                     this.cookieService.set('accesstype', 'OFFICER', 1);

    //                     const privilegeList = privillage.split(',');
    //                     this.permissionsService.loadPermissions(privilegeList);

    //                     // ✅ Redirect to application page as new user
    //                     const returnUrl =
    //                       this.route.snapshot.queryParams['returnUrl'] ||
    //                       '/officers/applications';
    //                     this.router.navigateByUrl(returnUrl);
    //                   } else {
    //                     console.warn('User session not found in sessionStorage.');
    //                   }

    //                   //end
    //                 } else {
    //                   this.router.navigate(['officers', 'applications']);
    //                 }
    //               }
    //             });
    //         }
    //       });
    //   } else {
    //     this.errorMessage =
    //       'தேவையான அனைத்து ஆவணங்களையும் பதிவேற்றவும் / சரிபார்க்கவும். / Please upload / verify all the neccessary documents.';
    //     return;
    //   }
    // }

    // Updated by sivasankar K on 18/12/2025
    showPopup(type: 'success' | 'error', message: string) {
    this.popupType = type;
    this.popupMessage = message;
    this.showSubmitPopup = true;
  }

    submit() {
      console.log('Submit function called', this.checked); // Debug log
if (!this.checked) {
      this.showPopup('error', 'சமர்ப்பிக்க பிரகடனத்தைத் தேர்ந்தெடுக்க வேண்டும். <br><br> Declaration should be selected in order to submit.');
      return;
    }
    console.log('Scheme',this.schemeDetails.schemeId); // Debug log
    console.log('Application ID', this.applicationid); // Debug log
    console.log('Aadhaar', this.schemeDetails.applicantAadharNumber); // Debug log

    var issingle = this.schemeDetail.isSingleCategorySelect;
    var total = 0;

    if (this.schemeFormsList) {
      this.schemeFormsList.map((x) => {
        if (x.controls['isSelected'].value) {
          total++;
        }
      });
    }

if (issingle && total > 1) {
      this.showPopup('error', 'திட்ட வகையிலிருந்து ஒரே ஒரு விருப்பத்தை மட்டும் தேர்வு செய்யவும். பல தேர்வுகள் அனுமதிக்கப்படாது. <br><br> Please choose only one option from scheme category. Multiple selections are not allowed.');
      return;
    } else if (total == 0) {
      this.showPopup('error', 'திட்ட வகையிலிருந்து ஏதேனும் ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும். <br><br> Please choose any one option from scheme category.');
      return;
    }

    var anyerrror: boolean = false;
    if (this.documentsList) {
      this.documentsList.map((x) => {
        if (!x.controls['isVerified'].value && x.controls['isRequired'].value) {
          anyerrror = true;
        }
      });
    }

    if (this.documentsForm.valid && !anyerrror) {
      this.errorMessage = '';

      var cats: any[] = this.schemeForm.get('scategories')?.value;
      cats.forEach((x: any) => {
        x.isSelected = x.isSelected === true;
        x.applicationId = this.applicationid;
      });
      // console.log('Submitting scheme details:', this.schemeDetails); // Debug log
      // return;

      this.schemeConfigService
        .Application_Save_Scheme_Cost_Details({
          applicationCostDetails: cats,
          bankDetailSaveModel: {
            id: '',
            application_Id: this.applicationid,
            account_Holder_Name:
            this.schemeForm.get('account_Holder_Name')?.value,
            account_Number: this.schemeForm.get('account_Number')?.value,
            ifsC_Code: this.schemeForm.get('iFSC_Code')?.value,
            bank_Name: this.schemeForm.get('bank_Name')?.value,
            bank_Id: this.schemeForm.get('bank_Id')?.value,
            branch: this.schemeForm.get('branch')?.value,
            branch_Id: this.schemeForm.get('branch_Id')?.value,
            isActive: true,
          },
          schemeAdditionalInformation: {
            applicationId: this.applicationid,
            placeOfAccident:
              this.schemeForm.get('placeOfAccident')?.value,
            relationshipToTheAccident:
              this.schemeForm.get('relationshipToTheAccident')?.value,
            medicalInsurancePlanRegistrationNumber:
              this.schemeForm.get(
                'medicalInsurancePlanRegistrationNumber'
              )?.value,
          },
          actionType: 'submit',
        })
        .subscribe((x) => {
          if (x) {
            this.schemeConfigService
              .Application_Init({
                id: this.applicationid,
                schemeId: this.schemeDetails.schemeId,
                memberId: this.schemeDetails.memberId,
                fromStatusId: '',
                toStatusId: '',
                isSubmit: true,
                selectedMember: undefined,
                memberName: this.memberInformation.name,
                applicantName: this.schemeDetails.name,
                mobile: this.schemeDetails.mobile,
                AadharNumber: this.schemeDetails.applicantAadharNumber,
                district:this.memberDetail.permanentAddress.district,
                collectedByName:this.bankForm.get('collectedByName')?.value,
                collectedByPhoneNumber:this.bankForm.get('collectedByPhoneNumber')?.value,
                collectedOn:this.bankForm.get('collectedOn')?.value
              })
          .subscribe((x) => {
                if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
                  // API ERROR (Shows in Popup instead of MessageService)
                  this.showPopup('error', x.message || 'Submission Failed!');
                } else if (x) {
                  // API SUCCESS (Shows in Popup instead of MessageService)
                  this.showPopup('success', 'Application submitted<br>successfully');
                }
              });
          }
        });
    } else {
      // FORM VALIDATION ERROR
      this.showPopup('error', 'தேவையான அனைத்து ஆவணங்களையும் பதிவேற்றவும் / சரிபார்க்கவும். <br><br> Please upload / verify all the necessary documents.');
      return;
    }
  }
                

                  // ✅ KEEP EXISTING ROLE LOGIC (NO CHANGE)
                  // if (this.privillage?.includes('APPLY_SCHEME')) {
                  //   const userdetailsString =
                  //     sessionStorage.getItem('user');

                  //   if (userdetailsString) {
                  //     const userdetails =
                  //       JSON.parse(userdetailsString);

                  //     const privillage =
                  //       sessionStorage.getItem('privillage') || '';
                  //     const accessToken =
                  //       sessionStorage.getItem('token') || '';
                  //     const refreshToken =
                  //       sessionStorage.getItem('refreshToken') || '';

                  //     userdetails.privillage = null;
                  //     userdetails.accessToken = null;
                  //     userdetails.refreshToken = null;

                  //     this.cookieService.delete('mobile');
                  //     this.cookieService.delete('name');

                  //     this.cookieService.set(
                  //       'privillage',
                  //       privillage,
                  //       1
                  //     );
                  //     this.cookieService.set(
                  //       'user',
                  //       JSON.stringify(userdetails),
                  //       1
                  //     );
                  //     this.cookieService.set(
                  //       'token',
                  //       accessToken,
                  //       1
                  //     );
                  //     this.cookieService.set(
                  //       'refreshToken',
                  //       refreshToken,
                  //       1
                  //     );
                  //     this.cookieService.set(
                  //       'accesstype',
                  //       'OFFICER',
                  //       1
                  //     );

                  //     const privilegeList =
                  //       privillage.split(',');
                  //     this.permissionsService.loadPermissions(
                  //       privilegeList
                  //     );

                  //     const returnUrl =
                  //       this.route.snapshot.queryParams[
                  //         'returnUrl'
                  //       ] || '/officers/applications';

                  //     this.router.navigateByUrl(returnUrl);
                  //   }
                  // } else {
                  //   // ✅ MEMBER REDIRECT (UNCHANGED)
                  //   this.router.navigate(['applicant', 'dashboard']);
                  // }
  //               }
  //             });
  //         }
  //       });
  //   } else {
  //     this.errorMessage =
  //       'தேவையான அனைத்து ஆவணங்களையும் பதிவேற்றவும் / சரிபார்க்கவும். / Please upload / verify all the neccessary documents.';
  //     return;
  //   }
  // }

// Submit Popup-ல் உள்ள 'Back to Home' பட்டனை கிளிக் செய்தால் இது வேலை செய்யும்
closeSubmitPopup() {
    this.showSubmitPopup = false;

    // Only navigate if it was a success popup. If error, just close the popup.
    if (this.popupType === 'success') {
      if (this.privillage?.includes('APPLY_SCHEME')) {
        const userdetailsString = sessionStorage.getItem('user');

        if (userdetailsString) {
          const userdetails = JSON.parse(userdetailsString);
          const privillage = sessionStorage.getItem('privillage') || '';
          const accessToken = sessionStorage.getItem('token') || '';
          const refreshToken = sessionStorage.getItem('refreshToken') || '';

          userdetails.privillage = null;
          userdetails.accessToken = null;
          userdetails.refreshToken = null;

          this.cookieService.delete('mobile');
          this.cookieService.delete('name');

          this.cookieService.set('privillage', privillage, 1);
          this.cookieService.set('user', JSON.stringify(userdetails), 1);
          this.cookieService.set('token', accessToken, 1);
          this.cookieService.set('refreshToken', refreshToken, 1);
          this.cookieService.set('accesstype', 'OFFICER', 1);

          const privilegeList = privillage.split(',');
          this.permissionsService.loadPermissions(privilegeList);

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/officers/applications';
          this.router.navigateByUrl(returnUrl);
        }
      } else {
        this.router.navigate(['applicant', 'dashboard']);
      }
    }
  }

    CheckNullorEmpty(value?: string | undefined | null) {
      return true;
      return value != null && value != undefined && value != '';
    }
    CheckZero(value?: number) {
      return value != null && value != undefined && value != 0;
    }
    getAmount() {
      var totl = 0;
      var cats = this.schemeForm.get('scategories')?.value;
      cats.forEach((x: any) => {
        if (x.isSelected == true) {
          totl += Number(x.amount);
        }
      });
      return totl;
    }
    CtoWords(amt: any) {
      return convertoWords(amt);
    }
    search(event: any) {
      this.generalService.Branch_Dropdown_Search(event.query).subscribe((x) => {
        this.suggestions = x.data;
      });
    }
    clearIfsc(event: any) {
      this.schemeForm.get('iFSC_Code')?.patchValue('');
      this.schemeForm.get('branch_Id')?.patchValue('');
      this.schemeForm.get('bank_Id')?.patchValue('');
      this.schemeForm.get('branch')?.patchValue('');
    }
    selectifsc(event: AutoCompleteOnSelectEvent) {
      this.schemeForm.get('iFSC_Code')?.patchValue(event.value.value);
      this.getbankDetails();
    }
    getbankDetails() {
      var ifsc = this.schemeForm.get('iFSC_Code')?.value;
      this.schemeService.BranchGetByIFSC(ifsc).subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        } else if (x.data) {
          var data = x.data;
          this.schemeForm.get('branch_Id')?.patchValue(data.branchId);
          this.schemeForm.get('branch')?.patchValue(data.branchName);
          this.schemeForm.get('bank_Id')?.patchValue(data.bankId);
        }
      });
    }
    onTabOpen(event: any) {
      const index = event.index;

      switch (index) {
        case 0:
          this.selectedValue = 'ORGANIZATION_DETAILS';
          break;
        case 1:
          this.selectedValue = 'PERSONAL_DETAILS';
          break;
        case 2:
          this.selectedValue = 'PERMANENT_ADDRESS';
          break;
        case 3:
          this.selectedValue = 'TEMPORARY_ADDRESS';
          break;
        case 4:
          this.selectedValue = 'BANK_CHANGES';
          break;
        default:
          this.selectedValue = '';
      }

      console.log('Active Section:', this.selectedValue);
    }
    // togglePreview() {
    //   this.showPreview = !this.showPreview;
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    // }
    getSelectedSubScheme(): string {
  if (!this.schemeFormArray || !this.schemeFormArray.controls) return 'N/A';
  
  // Find the selected scheme from the form array
  const selected = this.schemeFormArray.controls.find(c => c.get('isSelected')?.value === true);
  return selected ? selected.get('subCategory')?.value : 'N/A';
}
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
    getCategories(mandoc: MemberDocumentMasterModelExisting[]) {
      return mandoc.filter((x) => x.savedFileName && x.savedFileName != '');
    }
openPreviewPopup() {
  // Get selected sub scheme
  const selectedSubScheme = this.getSelectedSubScheme();
  
  // Prepare data for popup - USING CORRECT PROPERTY NAMES from your model
  const previewData = {
    schemeDetails: {
      applicationId: this.applicationid,
      memberId: this.memberDetail?.memberDetail?.memberId,
      schemeGroupName: this.schemeDetails?.schemeGroupName,
      scheme: this.schemeDetails?.scheme,
      subScheme: selectedSubScheme,
      applicantName: this.schemeDetails?.name || '',
      memberName: this.schemeDetails?.memberName,
      beneficiaryName: this.schemeDetails?.beneficiaryName || '',
      relationship: this.schemeDetails?.relationship || '',
      amount: this.getAmount() + '/-',
      amountInWords: this.CtoWords(this.getAmount()),
      aadharNumber: this.schemeDetails?.applicantAadharNumber || '',
      mobileNumber: this.schemeDetails?.mobile || ''
    },
    // FIXED: Changed 'personalDetail' to 'memberDetail' based on your interface
    personalDetail: {
      firstName: this.memberDetail?.memberDetail?.firstName || '',
      lastName: this.memberDetail?.memberDetail?.lastName || '',
      fathersName: this.memberDetail?.memberDetail?.fathersName || '',
      gender: this.memberDetail?.memberDetail?.gender || '',
      community: this.memberDetail?.memberDetail?.community || '',
      // caste: this.memberDetail?.memberDetail?.caste || '',
      maritalStatus: this.memberDetail?.memberDetail?.maritalStatus || '',
      education: this.memberDetail?.memberDetail?.education || '',
      dob: this.memberDetail?.memberDetail?.dob || '',
      phoneNumber: this.memberDetail?.memberDetail?.phoneNumber || '',
      aadharNumber: this.memberDetail?.memberDetail?.aadharNumber || '',
      profilePicture: this.memberDetail?.memberDetail?.profile_Picture || '' // mapped profile_Picture
    },
    permanentAddress: {
      doorNo: this.memberDetail?.permanentAddress?.doorNo || '',
      streetName: this.memberDetail?.permanentAddress?.streetName || '',
      villageorCity: this.memberDetail?.permanentAddress?.villageorCity || '',
      talukName: this.memberDetail?.permanentAddress?.talukName || '',
      district: this.memberDetail?.permanentAddress?.district || '',
      pincode: this.memberDetail?.permanentAddress?.pincode || '',
      isConfirmed: true
    },
    temporaryAddress: {
      doorNo: this.memberDetail?.temproraryAddress?.doorNo || '',
      streetName: this.memberDetail?.temproraryAddress?.streetName || '',
      villageorCity: this.memberDetail?.temproraryAddress?.villageorCity || '',
      talukName: this.memberDetail?.temproraryAddress?.talukName || '',
      district: this.memberDetail?.temproraryAddress?.district || '',
      pincode: this.memberDetail?.temproraryAddress?.pincode || '',
      isConfirmed: true
    },
    bankDetail: {
      accountHolderName: this.memberDetail?.bankDetails?.accountHolderName || '',
      accountNumber: this.memberDetail?.bankDetails?.accountNumber || '',
      ifsc: this.memberDetail?.bankDetails?.ifsc || '',
      branchName: this.memberDetail?.bankDetails?.branchName || '',
      bankName: this.memberDetail?.bankDetails?.bankName || '',
      note: 'திட்ட நலன்களை பெற, உங்கள் வங்கி கணக்கு ஆதாருடன் இணைக்கப்பட்டிருக்க வேண்டும்.'
    },
    familyMemberList: this.memberDetail?.familyMembers || [],
    orgDetail: {
      typeOfWork: this.memberDetail?.organizationalDetail?.typeOfWork || '',
      typeOfCoreSanitoryWorker: this.memberDetail?.organizationalDetail?.typeOfCoreSanitoryWorker || '',
      organizationType: this.memberDetail?.organizationalDetail?.organizationType || '',
      natureOfJob: this.memberDetail?.organizationalDetail?.natureOfJob || '',
      workOrganisationName: this.memberDetail?.organizationalDetail?.workOrganisationName || '',
      distritName: this.memberDetail?.organizationalDetail?.distritName || '',
      localBody: this.memberDetail?.organizationalDetail?.localBody || '',
      nameoftheLocalBody: this.memberDetail?.organizationalDetail?.nameoftheLocalBody || '',
      townPanchayat: this.memberDetail?.organizationalDetail?.townPanchayat || ''
    },
    documentsList: this.documentsList, // Pass the form array directly
    memberDocuments: this.memberDetail?.memberDocuments || [],
    memberNonMandatoryDocuments: this.memberDetail?.memberNonMandatoryDocuments || [],
    declarationChecked: this.checked
  };

  console.log('Preview Data:', previewData);
const ref = this.dialogService.open(MkkViewComponent, {
width: '1000px',             // Kept from your original <p-dialog>
      closable: true,            // Hides the default close icon (clossabel falso)
      showHeader: false,          // Hides the header completely
      dismissableMask: true,      // Closes when clicking outside (from your original)
      styleClass: 'mkk-popup',    // Added from your DialogService example
      contentStyle: { padding: '0', overflow: 'auto' },
  data: previewData
});
}

// Helper method to get documents list
getDocumentsList(): any[] {
  const docs: any[] = [];
  if (this.documentsList && this.documentsList.length > 0) {
    this.documentsList.forEach((doc: any) => {
      docs.push({
        category: doc.get('documentCategoryName')?.value || 'Document',
        isRequired: doc.get('isRequired')?.value || false,
        files: doc.get('originalFileName')?.value ? 
          [{ id: doc.get('id')?.value, fileName: doc.get('originalFileName')?.value }] : []
      });
    });
  }
  return docs;
}
togglePreview() {
  this.openPreviewPopup();
}
  }
