import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import {
  ConfirmationService,
  ConfirmEventType,
  Message,
  MessageService,
} from 'primeng/api';
import { UploadEvent } from 'primeng/fileupload';
import {
  ApplicationDetailViewModel,
  ApplicationDocumentFormModel,
  ApplicationDocumentModel,
  ApplicationDropdownModel,
  StatusFlowModel,
  SubsidyValueGetResponseModel,
} from 'src/app/_models/schemeModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import {
  calculateCompletedAge,
  convertoWords,
  fatherandHubdependents,
  femaledependents,
  maledependents,
  monthDiff,
} from 'src/app/shared/commonFunctions';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { ApplicationValidationErrorModel } from 'src/app/_models/utils';
import {
  ConfigurationSchemeCostFieldModel,
  ConfigurationSchemeSaveModel,
} from 'src/app/_models/schemeConfigModel';
import { AutoCompleteOnSelectEvent } from 'primeng/autocomplete';

@UntilDestroy()
@Component({
  selector: 'app-scheme',
  templateUrl: './scheme.component.html',
  styleUrls: ['./scheme.component.scss'],
})
export class SchemeComponent {
  checked: boolean = false;
  showDecError: boolean = false;
  separatorExp: RegExp = /,| /;
  activeIndex: number[] = [0];
  index: number = 0;
  schemeGeneralForm!: FormGroup;
  schemePersonalForm!: FormGroup;
  schemeProjectForm!: FormGroup;
  documentsForm!: FormGroup;
  applicationid: string = '';
  id: string = '';
  url: any = '';
  IsExpanded: boolean = false;
  isnew: boolean = false;
  schemeDetails!: ApplicationDetailViewModel;

  defaultDate = moment(new Date(1990, 1 - 1, 1)).toDate();
  endDate = moment(new Date()).toDate();

  catgories: TCModel[] = [];
  services: TCModel[] = [];
  ranks: TCModel[] = [];
  dependants: TCModel[] = [];
  sexes: TCModel[] = [];
  communities: TCModel[] = [];
  religions: TCModel[] = [];
  maritalstatuses: TCModel[] = [];
  ventures: TCModel[] = [];
  activities: TCModel[] = [];
  documentGroups: string[] = [];

  areas: TCModel[] = [];
  nameOfLocalbody: TCModel[] = [];
  districts: TCModel[] = [];
  blocks: TCModel[] = [];
  taluks: TCModel[] = [];
  corporations: TCModel[] = [];
  municipalities: TCModel[] = [];
  townpanchayat: TCModel[] = [];
  villagepanchayat: TCModel[] = [];

  residence_areas: TCModel[] = [];
  residence_nameOfLocalbody: TCModel[] = [];
  residence_districts: TCModel[] = [];
  residence_blocks: TCModel[] = [];
  residence_taluks: TCModel[] = [];
  residence_corporations: TCModel[] = [];
  residence_municipalities: TCModel[] = [];
  residence_townpanchayat: TCModel[] = [];
  residence_villagepanchayat: TCModel[] = [];

  corres_areas: TCModel[] = [];
  corres_nameOfLocalbody: TCModel[] = [];
  corres_districts: TCModel[] = [];
  corres_blocks: TCModel[] = [];
  corres_taluks: TCModel[] = [];
  corres_corporations: TCModel[] = [];
  corres_municipalities: TCModel[] = [];
  corres_townpanchayat: TCModel[] = [];
  corres_villagepanchayat: TCModel[] = [];

  educationslQualifications: TCModel[] = [];
  banks: TCModel[] = [];
  branches: TCModel[] = [];
  costFieldModels: ConfigurationSchemeCostFieldModel[] = [];
  suggestions: TCModel[] = [];
  employmentTypes: TCModel[] = [
    { text: 'Central', value: 'Central' },
    { text: 'PSUs', value: 'PSUs' },
    { text: 'State', value: 'State' },
    { text: 'Others', value: 'Others' },
  ];

  maledependents = maledependents;
  femaledependents = femaledependents;
  fatherandHubdependents = fatherandHubdependents;

  configDetail!: ConfigurationSchemeSaveModel;

  messages!: Message[];
  // getIndex(val: number) {
  //   return this.activeIndex.toString().includes(val.toString());
  // }
  get documentsFormArray() {
    return this.documentsForm.controls['documents'] as FormArray;
  }
  get documentsList() {
    return this.documentsFormArray.controls as FormGroup[];
  }
  get educationalDetailsArray() {
    return this.schemePersonalForm.controls['educationalDetails'] as FormArray;
  }
  get educationalDetailsList() {
    return this.educationalDetailsArray.controls as FormGroup[];
  }
  get trainingDetailsArray() {
    return this.schemePersonalForm.controls['trainingDetails'] as FormArray;
  }
  get trainingDetailsList() {
    return this.trainingDetailsArray.controls as FormGroup[];
  }
  // get getfathernameCol() {
  //   if (this.schemeGeneralForm.get('dependents')?.value) {
  //     var dpnt = this.dependants.find(
  //       (x) => x.value == this.schemeGeneralForm.get('dependents')?.value
  //     );
  //     if (
  //       dpnt &&
  //       fatherandHubdependents.includes(dpnt.text.toLocaleLowerCase())
  //     ) {
  //       return "Father's Name / Husband's Name / தந்தையின் பெயர் / கணவரின் பெயர்";
  //     }
  //   }
  //   return "Father's Name / தந்தை பெயர்";
  // }
  get courseErrorMsg() {
    var error: any;
    this.educationalDetailsList.map((x) => {
      if (x.controls['courseDetails'].errors) {
        error = x.controls['courseDetails'].errors;
      }
    });
    if (error && error['required']) {
      return 'Required';
    }

    return null;
  }
  get institutionErrorMsg() {
    var error: any;
    if (this.educationalDetailsList) {
      this.educationalDetailsList.map((x) => {
        if (x.controls['institution'].errors) {
          error = x.controls['institution'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
    }

    return null;
  }
  get yearErrorMsg() {
    var error: any;
    if (this.educationalDetailsList) {
      this.educationalDetailsList.map((x) => {
        if (x.controls['yearOfPassing'].errors) {
          error = x.controls['yearOfPassing'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
      if (error && error['pattern']) {
        return 'In-Valid';
      }
    }

    return null;
  }

  get trainingFromErrorMsg() {
    var error: any;
    if (this.trainingDetailsList) {
      this.trainingDetailsList.map((x) => {
        if (x.controls['fromDate'].errors) {
          error = x.controls['fromDate'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
      if (error && error['pattern']) {
        return 'In-Valid';
      }
    }

    return null;
  }
  get instErrorMsg() {
    var error: any;
    if (this.trainingDetailsList) {
      this.trainingDetailsList.map((x) => {
        if (x.controls['nameOfTheInstitution'].errors) {
          error = x.controls['nameOfTheInstitution'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
    }

    return null;
  }
  get trainingtoErrorMsg() {
    var error: any;
    if (this.trainingDetailsList) {
      this.trainingDetailsList.map((x) => {
        if (x.controls['toDate'].errors) {
          error = x.controls['toDate'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
    }

    return null;
  }
  get typetrainingErrorMsg() {
    var error: any;
    if (this.trainingDetailsList) {
      this.trainingDetailsList.map((x) => {
        if (x.controls['typeOfTraining'].errors) {
          error = x.controls['typeOfTraining'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
    }

    return null;
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
  stylee!: string;
  cashow!: boolean;

  @ViewChild('chipInput') chipInput!: ElementRef;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private generalService: GeneralService,
    private schemeService: SchemeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private http: HttpClient
  ) {
    this.generalService.Config_Scheme_Get_By_Code('MKKS').subscribe((x) => {
      this.configDetail = x.data[0];
    });
  }
  ngOnInit() {
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
            this.schemeGeneralForm.controls['mobile'].disable();
            this.schemeGeneralForm.controls['projectDistrict'].disable();
            // this.schemeGeneralForm.controls['isNativeTamilNadu'].disable();
            // this.schemeGeneralForm.controls['isFirstEntrepreneur'].disable();
            var d: any[] = x.data;
            this.schemeDetails = d.find(
              (x) => x.applicationId == this.applicationid
            );
            this.id = this.schemeDetails.id;
            this.url =
              this.schemeDetails.thumbnailSavedFileName &&
              this.schemeDetails.thumbnailSavedFileName != ''
                ? `${environment.apiUrl.replace('/api/', '')}/images/${
                    this.schemeDetails.thumbnailSavedFileName
                  }`
                : '';

            this.schemeGeneralForm.controls['userImage'].patchValue(
              this.schemeDetails.thumbnailSavedFileName
            );
            this.getDocuments();
            this.setDetails();
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
    this.getApplicationFormDD();
    this.getEducationalDetails();
    this.schemeGeneralForm = new FormGroup({
      id: new FormControl(this.applicationid),
      applicationId: new FormControl(this.applicationid), // TODO
      //no: new FormControl(null, Validators.required),
      userImage: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ]),
      lastName: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ]),
      mobile: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      rank: new FormControl(null, [Validators.required]),
      dependents: new FormControl(null),
      servedIn: new FormControl(null, Validators.required),
      age: new FormControl(0),
      dateOfEnrollment: new FormControl(null),
      dateOfDischarge: new FormControl(null),
      totalYearsinService: new FormControl(0),
      isSelf: new FormControl(false, [Validators.required]),
      serviceNumber: new FormControl('', [Validators.required]),
      idCardNo: new FormControl(null),
      dependentName: new FormControl(null),
      dependentDob: new FormControl(null),
      isNativeTamilNadu: new FormControl(false, [Validators.required]),
      isFirstEntrepreneur: new FormControl(false, [Validators.required]),
      ppoNo: new FormControl(null),
      sex: new FormControl(null, [Validators.required]),
      community: new FormControl(null),
      religion: new FormControl(null),
      maritalStatus: new FormControl(null, [Validators.required]),
      dob: new FormControl(null, [Validators.required]),
      img: new FormControl(null),
      fathersName: new FormControl(null),
      projectDistrict: new FormControl(null, [Validators.required]),
    });
    this.schemeProjectForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      applicationId: new FormControl(this.applicationid), // TODO
      projectAddressid: new FormControl(Guid.raw()),
      activityLane: new FormControl(null, Validators.required),
      activityLaneOther: new FormControl(null),
      ventureCategory: new FormControl(null, Validators.required),
      doorNo: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(250),
      ]),
      streetName: new FormControl(null, Validators.required),
      villlageTownCity: new FormControl(null, Validators.required),
      localBody: new FormControl(null),
      nameoflocalBody: new FormControl(null),
      district: new FormControl(null, Validators.required),
      taluk: new FormControl(null, Validators.required),
      block: new FormControl(null),
      corporation: new FormControl(null),
      municipality: new FormControl(null),
      townPanchayat: new FormControl(null),

      accountNumber: new FormControl(null, [
        Validators.required,
        Validators.maxLength(20),
      ]),
      ifsc: new FormControl(null, Validators.required),
      bank: new FormControl(null, Validators.required),
      branch: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),

      //villagePanchayat: new FormControl(null, [Validators.required]),
      pincode: new FormControl(null, [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      projectOutlayCost: new FormControl(0),

      landCost: new FormControl(0),
      buildingCost: new FormControl(0),
      equipmentCost: new FormControl(0),
      workingCost: new FormControl(0),
      preopertaiveExpense: new FormControl(0),
      otherExpense: new FormControl(0),
      subsidyCost: new FormControl(0),
      beneficiaryCost: new FormControl(0),

      totalCost: new FormControl(0, [
        Validators.maxLength(12),
        Validators.required,
      ]),
      loanCost: new FormControl(0, [
        Validators.maxLength(12),
        Validators.required,
      ]),
      subsidyPercentage_Config: new FormControl(0, [
        Validators.maxLength(12),
        Validators.required,
      ]),
      subsidyCost_Config: new FormControl(0, [
        Validators.maxLength(12),
        Validators.required,
      ]),
      totalCostinWords: new FormControl(null),
      loanCostinWords: new FormControl(null),
    });
    this.schemePersonalForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      applicationId: new FormControl(this.applicationid), // TODO
      residentialAddressId: new FormControl(Guid.raw()),
      correspondenceAddressId: new FormControl(Guid.raw()),
      resident_doorNo: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(250),
      ]),
      resident_streetName: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      resident_district: new FormControl(null, Validators.required),
      resident_taluk: new FormControl(null, Validators.required),
      resident_localBody: new FormControl(null),
      resident_nameoflocalBody: new FormControl(null),
      resident_block: new FormControl(null),
      resident_corporation: new FormControl(null),
      resident_municipality: new FormControl(null),
      resident_townPanchayat: new FormControl(null),
      resident_village: new FormControl(null, Validators.required),
      resident_pincode: new FormControl(null, [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      isSame: new FormControl(false, Validators.required),
      correspondence_doorNo: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(250),
      ]),
      correspondence_streetName: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      correspondence_district: new FormControl(null, Validators.required),
      correspondence_taluk: new FormControl(null, Validators.required),
      correspondence_village: new FormControl(null, Validators.required),
      correspondence_localBody: new FormControl(null),
      correspondence_nameoflocalBody: new FormControl(null),
      correspondence_block: new FormControl(null),
      correspondence_corporation: new FormControl(null),
      correspondence_municipality: new FormControl(null),
      correspondence_townPanchayat: new FormControl(null),
      correspondence_pincode: new FormControl(null, [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      aadharNo: new FormControl(null, [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
        Validators.pattern(new RegExp('^(?!([0-9])\\1{11}$)[1-9][0-9]{11}$')),
      ]),
      email: new FormControl(null, [
        Validators.required,
        Validators.email,
        Validators.maxLength(100),
      ]),
      // pincode: new FormControl(null, [
      //   Validators.required,
      //   Validators.pattern(new RegExp('^[0-9]+$')),
      // ]),
      residinginSameArea: new FormControl(false, [Validators.required]),
      istrainingUndergone: new FormControl(false, [Validators.required]),

      typeOfTraining: new FormControl(null),
      institutionName: new FormControl(null),
      trainingDurationFrom: new FormControl(null),
      trainingDurationTo: new FormControl(null),
      isEmployed: new FormControl(false, [Validators.required]),
      employmentDetails: new FormControl(null),
      employeementType: new FormControl(null),
      employementOthers: new FormControl(null),
      isReEmployed: new FormControl(false),
      isRegistered: new FormControl(false, [Validators.required]),
      registrationNo: new FormControl(null),
      registrationDate: new FormControl(null),
      hasPreviousExp: new FormControl(false),
      previousExperience: new FormControl(null),
      educationalDetails: new FormArray([]),
      trainingDetails: new FormArray([]),
    });

    this.documentsForm = new FormGroup({
      documents: new FormArray([]),
    });
    this.schemePersonalForm.get('isSame')?.valueChanges.subscribe((x) => {
      if (x && x == true) {
        this.schemePersonalForm
          .get('correspondence_doorNo')
          ?.patchValue(this.schemePersonalForm.get('resident_doorNo')?.value);
        this.schemePersonalForm
          .get('correspondence_streetName')
          ?.patchValue(
            this.schemePersonalForm.get('resident_streetName')?.value,
            {
              emitEvent: false,
            }
          );
        this.schemePersonalForm
          .get('correspondence_district')
          ?.patchValue(
            this.schemePersonalForm.get('resident_district')?.value,
            {
              emitEvent: false,
            }
          );
        this.schemePersonalForm
          .get('correspondence_taluk')
          ?.patchValue(this.schemePersonalForm.get('resident_taluk')?.value);
        this.schemePersonalForm
          .get('correspondence_village')
          ?.patchValue(this.schemePersonalForm.get('resident_village')?.value);
        this.schemePersonalForm
          .get('correspondence_pincode')
          ?.patchValue(this.schemePersonalForm.get('resident_pincode')?.value);

        this.schemePersonalForm
          .get('correspondence_localBody')
          ?.patchValue(
            this.schemePersonalForm.get('resident_localBody')?.value
          );
        this.schemePersonalForm
          .get('correspondence_nameoflocalBody')
          ?.patchValue(
            this.schemePersonalForm.get('resident_nameoflocalBody')?.value
          );
        this.schemePersonalForm
          .get('correspondence_block')
          ?.patchValue(this.schemePersonalForm.get('resident_block')?.value);
        this.schemePersonalForm
          .get('correspondence_corporation')
          ?.patchValue(
            this.schemePersonalForm.get('resident_corporation')?.value
          );
        this.schemePersonalForm
          .get('correspondence_municipality')
          ?.patchValue(
            this.schemePersonalForm.get('resident_municipality')?.value
          );
        this.schemePersonalForm
          .get('correspondence_townPanchayat')
          ?.patchValue(
            this.schemePersonalForm.get('resident_townPanchayat')?.value
          );
      } else {
        this.schemePersonalForm.get('correspondence_doorNo')?.patchValue(null);
        this.schemePersonalForm
          .get('correspondence_streetName')
          ?.patchValue(null);
        this.schemePersonalForm
          .get('correspondence_district')
          ?.patchValue(null);
        this.schemePersonalForm.get('correspondence_taluk')?.patchValue(null);
        this.schemePersonalForm.get('correspondence_village')?.patchValue(null);
        this.schemePersonalForm.get('correspondence_pincode')?.patchValue(null);
        this.schemePersonalForm.get('correspondence_doorNo')?.patchValue(null);

        this.schemePersonalForm
          .get('correspondence_localBody')
          ?.patchValue(null);
        this.schemePersonalForm
          .get('correspondence_nameoflocalBody')
          ?.patchValue(null);
        this.schemePersonalForm.get('correspondence_block')?.patchValue(null);
        this.schemePersonalForm
          .get('correspondence_corporation')
          ?.patchValue(null);
        this.schemePersonalForm
          .get('correspondence_municipality')
          ?.patchValue(null);
        this.schemePersonalForm
          .get('correspondence_townPanchayat')
          ?.patchValue(null);
      }
    });

    this.schemePersonalForm
      .get('istrainingUndergone')
      ?.valueChanges.subscribe((x) => {
        if (x && x == true) {
          this.trainingDetailsArray.clear();
          this.addTrainng();
        } else {
          this.trainingDetailsArray.clear();
        }
      });
    // this.schemeGeneralForm
    //   .get('isFirstEntrepreneur')
    //   ?.valueChanges.subscribe((x) => {
    //     if (x == false) {
    //       this.confirmationService.confirm({
    //         message: `This scheme is applicable only to First-Generation Entrepreneurs.`,
    //         header: 'Not Eligible',
    //         icon: 'pi pi-exclamation-triangle',
    //         accept: () => {},
    //         reject: (type: ConfirmEventType) => {},
    //       });
    //     }
    //   });
    this.schemeGeneralForm
      .get('isNativeTamilNadu')
      ?.valueChanges.subscribe((x) => {
        if (x == false) {
          this.confirmationService.confirm({
            message: `Applicant must be a native of Tamil Nadu. Non-natives are not eligible.`,
            header: 'Not Eligible',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
        }
      });

    this.schemePersonalForm.get('isEmployed')?.valueChanges.subscribe((x) => {
      if (x && x == true) {
        // this.schemePersonalForm
        //   .get('employmentDetails')
        //   ?.addValidators([
        //     Validators.required,
        //     Validators.minLength(3),
        //     Validators.maxLength(250),
        //   ]);
        this.schemePersonalForm
          .get('employeementType')
          ?.addValidators([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(250),
          ]);
      } else {
        this.schemePersonalForm.get('employeementType')?.clearValidators();
        this.schemePersonalForm.get('employeementType')?.patchValue(null);
        this.schemePersonalForm.get('employmentDetails')?.clearValidators();
        this.schemePersonalForm.get('employmentDetails')?.patchValue(null);
        this.schemePersonalForm.updateValueAndValidity();
      }
    });
    this.schemeGeneralForm.get('isSelf')?.valueChanges.subscribe((x) => {
      if (x && x == true) {
        this.schemeGeneralForm
          .get('dependents')
          ?.addValidators([Validators.required, Validators.minLength(3)]);
      } else {
        this.schemeGeneralForm.get('dependents')?.clearValidators();
        this.schemeGeneralForm.get('dependents')?.patchValue(null);
        this.schemeGeneralForm.updateValueAndValidity();
      }
    });
    // this.schemeGeneralForm.get('dependents')?.valueChanges.subscribe((x) => {
    //   if (x) {
    //     var dpnt = this.dependants.find(
    //       (x) => x.value == this.schemeGeneralForm.get('dependents')?.value
    //     );
    //     if (
    //       dpnt &&
    //       fatherandHubdependents.includes(dpnt?.text.toLocaleLowerCase())
    //     ) {
    //       this.schemeGeneralForm
    //         .get('fathersName')
    //         ?.addValidators([
    //           Validators.required,
    //           Validators.minLength(3),
    //           Validators.maxLength(150),
    //         ]);
    //       this.schemeGeneralForm.get('fathersName')?.patchValue(null);
    //       this.schemeGeneralForm.updateValueAndValidity();
    //       return;
    //     }
    //   }
    //   this.schemeGeneralForm.get('fathersName')?.clearValidators();
    //   this.schemeGeneralForm.get('fathersName')?.patchValue(null);
    //   this.schemeGeneralForm.updateValueAndValidity();
    // });

    this.schemeGeneralForm.get('religion')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: x,
            CategoryCode: 'COMMUNITY',
          })
          .subscribe((x) => {
            this.communities = x.data;
          });
      } else {
        this.communities = [];
      }
    });
    this.schemeGeneralForm.get('servedIn')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: x,
            CategoryCode: 'RANK',
          })
          .subscribe((x) => {
            this.ranks = x.data;
          });
      } else {
        this.ranks = [];
      }
    });

    this.schemeProjectForm.get('localBody')?.valueChanges.subscribe((x) => {
      if (x && x == 'URBAN') {
        this.blocks = [];
      } else if (
        x &&
        x == 'RURAL' &&
        this.schemeProjectForm.get('district')?.value &&
        this.schemeProjectForm.get('district')?.value != ''
      ) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.schemeProjectForm.get('district')?.value,
            CategoryCode: 'BLOCK',
          })
          .subscribe((x) => {
            this.blocks = x.data;
          });
      } else {
        this.blocks = [];
      }
    });

    this.schemeProjectForm.get('bank')?.valueChanges.subscribe((x) => {
      if (x) {
        this.branches = [];
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.schemeProjectForm.get('bank')?.value,
            CategoryCode: 'BRANCH',
          })
          .subscribe((x) => {
            this.branches = x.data;
          });
      } else {
        this.branches = [];
      }
    });

    this.schemeProjectForm.get('branch')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .Branch_Address_Get(
            this.schemeProjectForm.get('bank')?.value,
            this.schemeProjectForm.get('branch')?.value
          )
          .subscribe((x) => {
            this.schemeProjectForm.get('ifsc')?.patchValue(x.data[0].ifscCode);
            this.schemeProjectForm
              .get('address')
              ?.patchValue(x.data[0].address);
          });
      } else {
        this.schemeProjectForm.get('ifsc')?.patchValue('');
        this.schemeProjectForm.get('address')?.patchValue('');
      }
    });

    this.schemeProjectForm
      .get('resident_localBody')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'URBAN') {
          this.residence_blocks = [];
        } else if (
          x &&
          x == 'RURAL' &&
          this.schemePersonalForm.get('resident_district')?.value &&
          this.schemePersonalForm.get('resident_district')?.value != ''
        ) {
          this.residence_nameOfLocalbody = [];
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId:
                this.schemePersonalForm.get('resident_district')?.value,
              CategoryCode: 'BLOCK',
            })
            .subscribe((x) => {
              this.residence_blocks = x.data;
            });
        } else {
          this.residence_nameOfLocalbody = [];
          this.residence_blocks = [];
        }
      });

    this.schemeProjectForm
      .get('correspondence_localBody')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'URBAN') {
          this.corres_blocks = [];
        } else if (
          x &&
          x == 'RURAL' &&
          this.schemePersonalForm.get('correspondence_district')?.value &&
          this.schemePersonalForm.get('correspondence_district')?.value != ''
        ) {
          this.corres_nameOfLocalbody = [];
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId: this.schemePersonalForm.get(
                'correspondence_district'
              )?.value,
              CategoryCode: 'BLOCK',
            })
            .subscribe((x) => {
              this.corres_blocks = x.data;
            });
        } else {
          this.corres_nameOfLocalbody = [];
          this.corres_blocks = [];
        }
      });
    this.schemeProjectForm.get('activityLane')?.valueChanges.subscribe((x) => {
      if (x && this.showactiviOther) {
        this.schemeProjectForm
          .get('activityLaneOther')
          ?.addValidators(Validators.required);
        this.schemeProjectForm
          .get('activityLaneOther')
          ?.updateValueAndValidity();
      } else {
        this.schemeProjectForm
          .get('activityLaneOther')
          ?.removeValidators(Validators.required);
        this.schemeProjectForm
          .get('activityLaneOther')
          ?.updateValueAndValidity();
      }
    });
    this.schemePersonalForm
      .get('employeementType')
      ?.valueChanges.subscribe((x) => {
        if (x && x.toString().toLocaleLowerCase() == 'others') {
          this.schemePersonalForm
            .get('employementOthers')
            ?.addValidators(Validators.required);
          this.schemePersonalForm
            .get('employementOthers')
            ?.updateValueAndValidity();
        } else if (x) {
          this.confirmationService.confirm({
            message: `Employed persons are not eligible for this scheme.`,
            header: 'Not Eligible',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
        } else {
          this.schemePersonalForm
            .get('employementOthers')
            ?.removeValidators(Validators.required);
          this.schemePersonalForm
            .get('employementOthers')
            ?.updateValueAndValidity();
        }
      });
    //#region  lOAD SUB VALUES OF DISTRICT
    this.schemeProjectForm.get('district')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: x,
            CategoryCode: 'TALUK',
          })
          .subscribe((x) => {
            this.taluks = x.data;
          });
        this.generalService
          .General_Configuration_GetAreaList_ByDistrict(x)
          .subscribe((x) => {
            this.areas = x.data;
          });
      } else {
        this.taluks = [];
        this.areas = [];
      }
    });

    this.schemePersonalForm
      .get('resident_district')
      ?.valueChanges.subscribe((x) => {
        if (x) {
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId: x,
              CategoryCode: 'TALUK',
            })
            .subscribe((x) => {
              this.residence_taluks = x.data;
            });
          this.generalService
            .General_Configuration_GetAreaList_ByDistrict(x)
            .subscribe((x) => {
              this.residence_areas = x.data;
            });
        } else {
          this.residence_taluks = [];
          this.residence_areas = [];
        }
      });

    this.schemePersonalForm
      .get('correspondence_district')
      ?.valueChanges.subscribe((x) => {
        if (x) {
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId: x,
              CategoryCode: 'TALUK',
            })
            .subscribe((x) => {
              this.corres_taluks = x.data;
            });
          this.generalService
            .General_Configuration_GetAreaList_ByDistrict(x)
            .subscribe((x) => {
              this.corres_areas = x.data;
            });
        } else {
          this.corres_areas = [];
          this.corres_taluks = [];
        }
      });
    //#endregion
    this.schemeGeneralForm
      .get('dateOfEnrollment')
      ?.valueChanges.subscribe((x) => {
        let dateOfDischarge =
          this.schemeGeneralForm.get('dateOfDischarge')?.value;
        if (x && dateOfDischarge) {
          var years = calculateCompletedAge(x, dateOfDischarge);
          this.schemeGeneralForm.get('totalYearsinService')?.patchValue(years);
        }
      });
    this.schemeGeneralForm
      .get('dateOfDischarge')
      ?.valueChanges.subscribe((x) => {
        let dateOfEnrollment =
          this.schemeGeneralForm.get('dateOfEnrollment')?.value;
        if (x && dateOfEnrollment) {
          var years = calculateCompletedAge(x, dateOfEnrollment);
          this.schemeGeneralForm.get('totalYearsinService')?.patchValue(years);
        }
      });

    this.schemePersonalForm.get('isRegistered')?.valueChanges.subscribe((x) => {
      if (x && x == true) {
        // this.schemePersonalForm
        //   .get('registrationNo')
        //   ?.addValidators([Validators.required, Validators.minLength(3)]);
        // this.schemePersonalForm
        //   .get('registrationDate')
        //   ?.addValidators([Validators.required]);
      } else {
        this.schemePersonalForm.get('registrationNo')?.clearValidators();
        this.schemePersonalForm.get('registrationDate')?.clearValidators();
        this.schemePersonalForm.get('registrationDate')?.patchValue(null);
        this.schemePersonalForm.get('registrationNo')?.patchValue(null);
        this.schemePersonalForm.updateValueAndValidity();
      }
    });

    this.schemePersonalForm
      .get('hasPreviousExp')
      ?.valueChanges.subscribe((x) => {
        if (x && x == true) {
          // this.schemePersonalForm
          //   .get('previousExperience')
          //   ?.addValidators([Validators.required, Validators.minLength(3)]);
        } else {
          this.schemePersonalForm.get('previousExperience')?.clearValidators();
          this.schemePersonalForm.get('previousExperience')?.patchValue(null);
          this.schemePersonalForm.updateValueAndValidity();
        }
      });

    this.schemeGeneralForm.get('dob')?.valueChanges.subscribe((x) => {
      this.schemePersonalForm.get('trainingDurationFrom')?.patchValue(null);
      this.schemePersonalForm.get('trainingDurationTo')?.patchValue(null);
      this.schemePersonalForm.updateValueAndValidity();
    });

    //#region  Local body changes
    this.schemeProjectForm.get('localBody')?.valueChanges.subscribe((x) => {
      if (x && x == 'URBAN') {
        this.schemeProjectForm
          .get('nameoflocalBody')
          ?.addValidators([Validators.required]);
        this.schemeProjectForm.get('block')?.clearValidators();
        this.schemeProjectForm.get('block')?.patchValue(null);
      } else {
        // this.schemeProjectForm
        //   .get('block')
        //   ?.addValidators([Validators.required]);
        this.schemeProjectForm.get('nameoflocalBody')?.clearValidators();
        this.schemeProjectForm.get('nameoflocalBody')?.patchValue(null);
        this.schemeProjectForm.get('corporation')?.clearValidators();
        this.schemeProjectForm.get('corporation')?.patchValue(null);
        this.schemeProjectForm.get('municipality')?.clearValidators();
        this.schemeProjectForm.get('municipality')?.patchValue(null);
        this.schemeProjectForm.get('townPanchayat')?.clearValidators();
        this.schemeProjectForm.get('townPanchayat')?.patchValue(null);
      }
      this.schemeProjectForm.updateValueAndValidity();
    });

    this.schemePersonalForm
      .get('resident_localBody')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'URBAN') {
          // this.schemePersonalForm
          //   .get('resident_nameoflocalBody')
          //   ?.addValidators([Validators.required]);
          this.schemePersonalForm.get('block')?.clearValidators();
          this.schemePersonalForm.get('block')?.patchValue(null);
        } else {
          // this.schemePersonalForm
          //   .get('block')
          //   ?.addValidators([Validators.required]);
          this.schemePersonalForm
            .get('resident_nameoflocalBody')
            ?.clearValidators();
          this.schemePersonalForm
            .get('resident_nameoflocalBody')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('resident_corporation')
            ?.clearValidators();
          this.schemePersonalForm.get('resident_corporation')?.patchValue(null);
          this.schemePersonalForm
            .get('resident_municipality')
            ?.clearValidators();
          this.schemePersonalForm
            .get('resident_municipality')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.patchValue(null);
          if (
            this.schemePersonalForm.get('resident_district')?.value &&
            this.schemePersonalForm.get('resident_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId:
                  this.schemePersonalForm.get('resident_district')?.value,
                CategoryCode: 'BLOCK',
              })
              .subscribe((x) => {
                this.residence_blocks = x.data;
              });
          }
        }
        this.schemePersonalForm.updateValueAndValidity();
      });

    this.schemePersonalForm
      .get('correspondence_localBody')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'URBAN') {
          this.schemePersonalForm
            .get('correspondence_nameoflocalBody')
            ?.addValidators([Validators.required]);
          this.schemePersonalForm
            .get('correspondence_block')
            ?.clearValidators();
          this.schemePersonalForm.get('correspondence_block')?.patchValue(null);
        } else {
          // this.schemePersonalForm
          //   .get('correspondence_block')
          //   ?.addValidators([Validators.required]);
          this.schemePersonalForm
            .get('correspondence_nameoflocalBody')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_nameoflocalBody')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('correspondence_nameoflocalBody')
            ?.updateValueAndValidity();
          this.schemePersonalForm
            .get('correspondence_corporation')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_corporation')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('correspondence_corporation')
            ?.updateValueAndValidity();
          this.schemePersonalForm
            .get('correspondence_municipality')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_municipality')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.patchValue(null);
          if (
            this.schemePersonalForm.get('correspondence_district')?.value &&
            this.schemePersonalForm.get('correspondence_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.schemePersonalForm.get(
                  'correspondence_district'
                )?.value,
                CategoryCode: 'BLOCK',
              })
              .subscribe((x) => {
                this.corres_blocks = x.data;
              });
          }
        }
        this.schemePersonalForm.updateValueAndValidity();
      });

    //#endregion

    //#region  Name of local body

    this.schemeProjectForm
      .get('nameoflocalBody')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'MUNICIPALITY') {
          // this.schemeProjectForm
          //   .get('municipality')
          //   ?.addValidators([Validators.required]);
          this.schemeProjectForm.get('corporation')?.clearValidators();
          this.schemeProjectForm.get('corporation')?.patchValue(null);
          this.schemeProjectForm.get('townPanchayat')?.clearValidators();
          this.schemeProjectForm.get('townPanchayat')?.patchValue(null);
          this.schemeProjectForm.updateValueAndValidity();
          if (
            this.schemeProjectForm.get('district')?.value &&
            this.schemeProjectForm.get('district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.schemeProjectForm.get('district')?.value,
                CategoryCode: 'MUNICIPALITY',
              })
              .subscribe((x) => {
                this.municipalities = x.data;
              });
          }
        } else if (x && x == 'CORPORATION') {
          // this.schemeProjectForm
          //   .get('corporation')
          //   ?.addValidators([Validators.required]);
          this.schemeProjectForm.get('municipality')?.clearValidators();
          this.schemeProjectForm.get('municipality')?.patchValue(null);
          this.schemeProjectForm.get('townPanchayat')?.clearValidators();
          this.schemeProjectForm.get('townPanchayat')?.patchValue(null);
          this.schemeProjectForm.updateValueAndValidity();
          if (
            this.schemeProjectForm.get('district')?.value &&
            this.schemeProjectForm.get('district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.schemeProjectForm.get('district')?.value,
                CategoryCode: 'CORPORATION',
              })
              .subscribe((x) => {
                this.corporations = x.data;
              });
          }
        } else {
          this.schemeProjectForm.get('corporation')?.clearValidators();
          this.schemeProjectForm.get('corporation')?.patchValue(null);
          this.schemeProjectForm.get('townPanchayat')?.clearValidators();
          this.schemeProjectForm.get('townPanchayat')?.patchValue(null);
          this.schemeProjectForm.updateValueAndValidity();
          if (
            this.schemeProjectForm.get('district')?.value &&
            this.schemeProjectForm.get('district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.schemeProjectForm.get('district')?.value,
                CategoryCode: 'TOWNPANCHAYAT',
              })
              .subscribe((x) => {
                this.townpanchayat = x.data;
              });
          }
        }
      });

    this.schemePersonalForm
      .get('resident_nameoflocalBody')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'MUNICIPALITY') {
          // this.schemePersonalForm
          //   .get('resident_municipality')
          //   ?.addValidators([Validators.required]);
          this.schemePersonalForm
            .get('resident_corporation')
            ?.clearValidators();
          this.schemePersonalForm.get('resident_corporation')?.patchValue(null);
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.patchValue(null);
          this.schemePersonalForm.updateValueAndValidity();
          if (
            this.schemePersonalForm.get('resident_district')?.value &&
            this.schemePersonalForm.get('resident_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId:
                  this.schemePersonalForm.get('resident_district')?.value,
                CategoryCode: 'MUNICIPALITY',
              })
              .subscribe((x) => {
                this.residence_municipalities = x.data;
              });
          }
        } else if (x && x == 'CORPORATION') {
          // this.schemePersonalForm
          //   .get('resident_corporation')
          //   ?.addValidators([Validators.required]);
          this.schemePersonalForm
            .get('resident_municipality')
            ?.clearValidators();
          this.schemePersonalForm
            .get('resident_municipality')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.patchValue(null);
          this.schemePersonalForm.updateValueAndValidity();
          if (
            this.schemePersonalForm.get('resident_district')?.value &&
            this.schemePersonalForm.get('resident_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId:
                  this.schemePersonalForm.get('resident_district')?.value,
                CategoryCode: 'CORPORATION',
              })
              .subscribe((x) => {
                this.residence_corporations = x.data;
              });
          }
        } else {
          this.schemePersonalForm
            .get('resident_corporation')
            ?.clearValidators();
          this.schemePersonalForm.get('resident_corporation')?.patchValue(null);
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('resident_townPanchayat')
            ?.patchValue(null);
          this.schemePersonalForm.updateValueAndValidity();
          if (
            this.schemePersonalForm.get('resident_district')?.value &&
            this.schemePersonalForm.get('resident_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId:
                  this.schemePersonalForm.get('resident_district')?.value,
                CategoryCode: 'TOWNPANCHAYAT',
              })
              .subscribe((x) => {
                this.residence_townpanchayat = x.data;
              });
          }
        }
      });

    this.schemePersonalForm
      .get('correspondence_nameoflocalBody')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'MUNICIPALITY') {
          // this.schemePersonalForm
          //   .get('correspondence_municipality')
          //   ?.addValidators([Validators.required]);
          this.schemePersonalForm
            .get('correspondence_corporation')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_corporation')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.patchValue(null);
          this.schemePersonalForm.updateValueAndValidity();
          if (
            this.schemePersonalForm.get('correspondence_district')?.value &&
            this.schemePersonalForm.get('correspondence_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.schemePersonalForm.get(
                  'correspondence_district'
                )?.value,
                CategoryCode: 'MUNICIPALITY',
              })
              .subscribe((x) => {
                this.corres_municipalities = x.data;
              });
          }
        } else if (x && x == 'CORPORATION') {
          // this.schemePersonalForm
          //   .get('correspondence_corporation')
          //   ?.addValidators([Validators.required]);
          this.schemePersonalForm
            .get('correspondence_municipality')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_municipality')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.patchValue(null);
          this.schemePersonalForm.updateValueAndValidity();
          if (
            this.schemePersonalForm.get('correspondence_district')?.value &&
            this.schemePersonalForm.get('correspondence_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.schemePersonalForm.get(
                  'correspondence_district'
                )?.value,
                CategoryCode: 'CORPORATION',
              })
              .subscribe((x) => {
                this.corres_corporations = x.data;
              });
          }
        } else {
          this.schemePersonalForm
            .get('correspondence_corporation')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_corporation')
            ?.patchValue(null);
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.clearValidators();
          this.schemePersonalForm
            .get('correspondence_townPanchayat')
            ?.patchValue(null);
          this.schemePersonalForm.updateValueAndValidity();
          if (
            this.schemePersonalForm.get('correspondence_district')?.value &&
            this.schemePersonalForm.get('correspondence_district')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.schemePersonalForm.get(
                  'correspondence_district'
                )?.value,
                CategoryCode: 'TOWNPANCHAYAT',
              })
              .subscribe((x) => {
                this.corres_townpanchayat = x.data;
              });
          }
        }
      });
    //#endregion

    //#region Cost calculation and value changes
    this.schemeProjectForm
      .get('projectOutlayCost')
      ?.valueChanges.subscribe((x) => {
        this.updateTotalCost();
      });
    this.schemeProjectForm.get('landCost')?.valueChanges.subscribe((x) => {
      this.updateTotalCost();
    });
    this.schemeProjectForm.get('buildingCost')?.valueChanges.subscribe((x) => {
      this.updateTotalCost();
    });
    this.schemeProjectForm.get('equipmentCost')?.valueChanges.subscribe((x) => {
      this.updateTotalCost();
    });
    this.schemeProjectForm
      .get('beneficiaryCost')
      ?.valueChanges.subscribe((x) => {
        this.updateTotalCost();
      });
    this.schemeProjectForm.get('workingCost')?.valueChanges.subscribe((x) => {
      this.updateTotalCost();
    });
    this.schemeProjectForm
      .get('preopertaiveExpense')
      ?.valueChanges.subscribe((x) => {
        this.updateTotalCost();
      });
    this.schemeProjectForm.get('otherExpense')?.valueChanges.subscribe((x) => {
      this.updateTotalCost();
    });
    //#endregion

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
  setDetails() {
    this.schemeGeneralForm
      .get('applicationId')
      ?.patchValue(this.schemeDetails.applicationId);
    this.checked = this.schemeDetails.declarationAccepted;
    this.schemeGeneralForm.get('id')?.patchValue(this.schemeDetails.id);
    this.schemeGeneralForm
      .get('serviceNumber')
      ?.patchValue(this.schemeDetails.serviceNumber);

    this.schemeGeneralForm
      .get('firstName')
      ?.patchValue(this.schemeDetails.firstName);
    this.schemeGeneralForm
      .get('lastName')
      ?.patchValue(this.schemeDetails.lastName);
    this.schemeGeneralForm.get('mobile')?.patchValue(this.schemeDetails.mobile);
    this.schemeGeneralForm
      .get('projectDistrict')
      ?.patchValue(this.schemeDetails.projectDistrict);
    this.schemeGeneralForm
      .get('dependents')
      ?.patchValue(this.schemeDetails.dependentId);
    this.schemeGeneralForm.get('rank')?.patchValue(this.schemeDetails.rank);
    this.schemeGeneralForm
      .get('servedIn')
      ?.patchValue(this.schemeDetails.servedIn);
    //this.schemeGeneralForm.get('age')?.patchValue(this.schemeDetails.age);
    this.schemeGeneralForm
      .get('dateOfEnrollment')
      ?.patchValue(
        this.schemeDetails.dateOfEnrollment
          ? moment(this.schemeDetails.dateOfEnrollment ?? null).toDate()
          : null
      );
    this.schemeGeneralForm
      .get('dateOfDischarge')
      ?.patchValue(
        this.schemeDetails.dateOfDischarge
          ? moment(this.schemeDetails.dateOfDischarge ?? null).toDate()
          : null
      );
    this.schemeGeneralForm
      .get('totalYearsinService')
      ?.patchValue(this.schemeDetails.totalYearsinService);
    this.schemeGeneralForm
      .get('isSelf')
      ?.patchValue(this.schemeDetails.isSelf, {
        emitEvent: false,
        onlySelf: true,
      });
    this.schemeGeneralForm
      .get('idCardNo')
      ?.patchValue(this.schemeDetails.idCardNo);
    this.schemeGeneralForm
      .get('dependentName')
      ?.patchValue(this.schemeDetails.dependentName);
    this.schemeGeneralForm.get('ppoNo')?.patchValue(this.schemeDetails.ppoNo);
    this.schemeGeneralForm.get('sex')?.patchValue(this.schemeDetails.sex);
    this.schemeGeneralForm
      .get('community')
      ?.patchValue(this.schemeDetails.community, {
        emitEvent: false,
        onlySelf: true,
      });
    this.schemeGeneralForm
      .get('religion')
      ?.patchValue(this.schemeDetails.religion);
    this.schemeGeneralForm
      .get('maritalStatus')
      ?.patchValue(this.schemeDetails.maritalStatus);
    this.schemeGeneralForm
      .get('dob')
      ?.patchValue(
        this.schemeDetails.dob
          ? moment(this.schemeDetails.dob ?? null).toDate()
          : null
      );
    this.schemeGeneralForm
      .get('dependentDob')
      ?.patchValue(
        this.schemeDetails.dependentDob
          ? moment(this.schemeDetails.dependentDob ?? null).toDate()
          : null
      );
    this.schemeGeneralForm
      .get('isNativeTamilNadu')
      ?.patchValue(this.schemeDetails.isNativeTamilNadu, {
        emitEvent: false,
      });
    this.schemeGeneralForm
      .get('isFirstEntrepreneur')
      ?.patchValue(this.schemeDetails.isFirstEntrepreneur, {
        emitEvent: false,
      });
    this.schemeGeneralForm
      .get('fathersName')
      ?.patchValue(this.schemeDetails.fathersName);

    this.schemePersonalForm.get('id')?.patchValue(this.schemeDetails.id);
    this.schemePersonalForm
      .get('residentialAddressId')
      ?.patchValue(this.schemeDetails.residentialAddress?.id);
    this.schemePersonalForm
      .get('correspondenceAddressId')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.id);
    this.schemePersonalForm
      .get('applicationId')
      ?.patchValue(this.schemeDetails.applicationId);
    this.schemePersonalForm
      .get('resident_doorNo')
      ?.patchValue(this.schemeDetails.residentialAddress?.doorNo);
    this.schemePersonalForm
      .get('resident_streetName')
      ?.patchValue(this.schemeDetails.residentialAddress?.streetName);
    this.schemePersonalForm
      .get('resident_district')
      ?.patchValue(this.schemeDetails.residentialAddress?.district, {
        emitEvent: false,
      });
    this.schemePersonalForm
      .get('resident_taluk')
      ?.patchValue(this.schemeDetails.residentialAddress?.taluk);
    this.schemePersonalForm
      .get('resident_village')
      ?.patchValue(this.schemeDetails.residentialAddress?.villlageTownCity);
    this.schemePersonalForm
      .get('resident_pincode')
      ?.patchValue(this.schemeDetails.residentialAddress?.pincode);

    this.schemePersonalForm
      .get('resident_localBody')
      ?.patchValue(this.schemeDetails.residentialAddress?.localBody, {
        emitEvent: false,
      });
    this.schemePersonalForm.get('resident_localBody')?.updateValueAndValidity();
    this.schemePersonalForm
      .get('resident_nameoflocalBody')
      ?.patchValue(this.schemeDetails.residentialAddress?.nameoflocalBody, {
        emitEvent: false,
      });
    this.schemePersonalForm
      .get('resident_block')
      ?.patchValue(this.schemeDetails.residentialAddress?.block);
    this.schemePersonalForm
      .get('resident_corporation')
      ?.patchValue(this.schemeDetails.residentialAddress?.corporation);
    this.schemePersonalForm
      .get('resident_municipality')
      ?.patchValue(this.schemeDetails.residentialAddress?.municipality);
    this.schemePersonalForm
      .get('resident_townPanchayat')
      ?.patchValue(this.schemeDetails.residentialAddress?.townPanchayat);
    this.schemePersonalForm
      .get('isSame')
      ?.patchValue(this.schemeDetails.isCorrespondenceSameAsResident, {
        emitEvent: false,
      });

    this.schemePersonalForm
      .get('correspondence_doorNo')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.doorNo);
    this.schemePersonalForm
      .get('correspondence_streetName')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.streetName);
    this.schemePersonalForm
      .get('correspondence_district')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.district, {
        emitEvent: false,
      });
    this.schemePersonalForm
      .get('correspondence_taluk')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.taluk);
    this.schemePersonalForm
      .get('correspondence_village')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.villlageTownCity);
    this.schemePersonalForm
      .get('correspondence_pincode')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.pincode);

    this.schemePersonalForm
      .get('correspondence_localBody')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.localBody, {
        emitEvent: false,
      });
    this.schemePersonalForm
      .get('correspondence_localBody')
      ?.updateValueAndValidity();
    this.schemePersonalForm
      .get('correspondence_nameoflocalBody')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.nameoflocalBody, {
        emitEvent: false,
      });
    this.schemePersonalForm
      .get('correspondence_block')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.block);
    this.schemePersonalForm
      .get('correspondence_corporation')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.corporation);
    this.schemePersonalForm
      .get('correspondence_municipality')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.municipality);
    this.schemePersonalForm
      .get('correspondence_townPanchayat')
      ?.patchValue(this.schemeDetails.correspondenceAddress?.townPanchayat);

    this.schemePersonalForm
      .get('aadharNo')
      ?.patchValue(this.schemeDetails.aadharNo);
    this.schemePersonalForm.get('email')?.patchValue(this.schemeDetails.email);
    this.schemePersonalForm
      .get('residinginSameArea')
      ?.patchValue(this.schemeDetails.residinginSameArea);
    this.schemePersonalForm
      .get('istrainingUndergone')
      ?.patchValue(this.schemeDetails.isTrainingUndergone, {
        emitEvent: false,
      });
    // this.schemePersonalForm
    //   .get('typeOfTraining')
    //   ?.patchValue(this.schemeDetails.typeOfTraining.split('|'));
    // this.schemePersonalForm
    //   .get('institutionName')
    //   ?.patchValue(this.schemeDetails.institutionName);
    // this.schemePersonalForm
    //   .get('trainingDurationFrom')
    //   ?.patchValue(
    //     this.schemeDetails.trainingDurationFrom
    //       ? moment(this.schemeDetails.trainingDurationFrom).toDate()
    //       : null
    //   );
    // this.schemePersonalForm
    //   .get('trainingDurationTo')
    //   ?.patchValue(
    //     this.schemeDetails.trainingDurationTo
    //       ? moment(this.schemeDetails.trainingDurationTo).toDate()
    //       : null
    //   );
    this.schemePersonalForm
      .get('isEmployed')
      ?.patchValue(this.schemeDetails.isEmployed);
    this.schemePersonalForm
      .get('isReEmployed')
      ?.patchValue(this.schemeDetails.isReEmployed);
    this.schemePersonalForm
      .get('employmentDetails')
      ?.patchValue(this.schemeDetails.employmentDetails);
    this.schemePersonalForm
      .get('employeementType')
      ?.patchValue(this.schemeDetails.employeementType);
    this.schemePersonalForm
      .get('employementOthers')
      ?.patchValue(this.schemeDetails.employementOthers);
    this.schemePersonalForm
      .get('isRegistered')
      ?.patchValue(this.schemeDetails.isRegistered);
    this.schemePersonalForm
      .get('registrationNo')
      ?.patchValue(this.schemeDetails.registrationNo);
    this.schemePersonalForm
      .get('registrationDate')
      ?.patchValue(
        this.schemeDetails.registrationDate
          ? moment(this.schemeDetails.registrationDate).toDate()
          : null
      );
    this.schemePersonalForm
      .get('hasPreviousExp')
      ?.patchValue(this.schemeDetails.hasPreviousExp);
    this.schemePersonalForm
      .get('previousExperience')
      ?.patchValue(this.schemeDetails.previousExperience);

    this.schemeProjectForm.get('id')?.patchValue(this.schemeDetails.id);
    this.schemeProjectForm
      .get('projectAddressid')
      ?.patchValue(this.schemeDetails.projectAddress?.id);
    this.schemeProjectForm
      .get('applicationId')
      ?.patchValue(this.schemeDetails.applicationId);
    this.schemeProjectForm
      .get('activityLane')
      ?.patchValue(this.schemeDetails.activityLane, {
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('activityLaneOther')
      ?.patchValue(this.schemeDetails.activityLaneOther);
    this.schemeProjectForm
      .get('ventureCategory')
      ?.patchValue(this.schemeDetails.ventureCategory, {
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('doorNo')
      ?.patchValue(this.schemeDetails.projectAddress?.doorNo);
    this.schemeProjectForm
      .get('streetName')
      ?.patchValue(this.schemeDetails.projectAddress?.streetName);
    this.schemeProjectForm
      .get('villlageTownCity')
      ?.patchValue(this.schemeDetails.projectAddress?.villlageTownCity);
    this.schemeProjectForm
      .get('localBody')
      ?.patchValue(this.schemeDetails.projectAddress?.localBody);
    this.schemeProjectForm
      .get('nameoflocalBody')
      ?.patchValue(this.schemeDetails.projectAddress?.nameoflocalBody, {
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('district')
      ?.patchValue(this.schemeDetails.projectAddress?.district, {
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('taluk')
      ?.patchValue(this.schemeDetails.projectAddress?.taluk);
    this.schemeProjectForm
      .get('block')
      ?.patchValue(this.schemeDetails.projectAddress?.block);
    this.schemeProjectForm
      .get('corporation')
      ?.patchValue(this.schemeDetails.projectAddress?.corporation);
    this.schemeProjectForm
      .get('municipality')
      ?.patchValue(this.schemeDetails.projectAddress?.municipality);
    this.schemeProjectForm
      .get('townPanchayat')
      ?.patchValue(this.schemeDetails.projectAddress?.townPanchayat);
    this.schemeProjectForm
      .get('pincode')
      ?.patchValue(this.schemeDetails.projectAddress?.pincode);
    this.schemeProjectForm
      .get('projectOutlayCost')
      ?.patchValue(this.schemeDetails.projectOutlayCost, {
        onlySelf: false,
        emitEvent: false,
      });

    this.schemeProjectForm
      .get('subsidyCost')
      ?.patchValue(this.schemeDetails.subsidyCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('beneficiaryCost')
      ?.patchValue(this.schemeDetails.beneficiaryCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('loanCost')
      ?.patchValue(this.schemeDetails.loanCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('subsidyPercentage_Config')
      ?.patchValue(this.schemeDetails.subsidyPercentage_Config, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('subsidyCost_Config')
      ?.patchValue(this.schemeDetails.subsidyCost_Config, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('landCost')
      ?.patchValue(this.schemeDetails.landCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('buildingCost')
      ?.patchValue(this.schemeDetails.buildingCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('equipmentCost')
      ?.patchValue(this.schemeDetails.equipmentCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('workingCost')
      ?.patchValue(this.schemeDetails.workingCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('preopertaiveExpense')
      ?.patchValue(this.schemeDetails.preopertaiveExpense, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('otherExpense')
      ?.patchValue(this.schemeDetails.otherExpense, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('totalCost')
      ?.patchValue(this.schemeDetails.totalCost, {
        onlySelf: false,
        emitEvent: false,
      });
    this.schemeProjectForm
      .get('totalCostinWords')
      ?.patchValue(
        convertoWords(this.schemeProjectForm.get('totalCost')?.value)
      );
    this.schemeProjectForm
      .get('loanCostinWords')
      ?.patchValue(
        convertoWords(this.schemeProjectForm.get('loanCost')?.value)
      );
    this.schemeProjectForm.get('ifsc')?.patchValue(this.schemeDetails.ifsc);
    this.schemeProjectForm.get('bank')?.patchValue(this.schemeDetails.bank);
    this.schemeProjectForm.get('branch')?.patchValue(this.schemeDetails.branch);
    this.schemeProjectForm
      .get('address')
      ?.patchValue(this.schemeDetails.address);
    this.schemeProjectForm
      .get('accountNumber')
      ?.patchValue(this.schemeDetails.accountNumber);

    this.upadateEducationInformation();

    this.generateTrainingDefaultRows();
  }
  validatecourse(cs: number, field: string) {
    if (
      this.educationalDetailsList[cs].controls[field].value &&
      this.educationalDetailsList[cs].controls[field].value != ''
    ) {
      this.educationalDetailsList[cs].controls['institution'].addValidators([
        Validators.required,
      ]);
      this.educationalDetailsList[cs].controls['courseDetails'].addValidators([
        Validators.required,
      ]);
      this.educationalDetailsList[cs].controls['yearOfPassing'].addValidators([
        Validators.required,
      ]);
      this.educationalDetailsList[cs].controls[
        'institution'
      ].updateValueAndValidity();
      this.educationalDetailsList[cs].controls[
        'courseDetails'
      ].updateValueAndValidity();
      this.educationalDetailsList[cs].controls[
        'yearOfPassing'
      ].updateValueAndValidity();
      return;
    } else {
      if (
        (this.educationalDetailsList[cs].controls['institution'].value &&
          this.educationalDetailsList[cs].controls['institution'].value !=
            '') ||
        (this.educationalDetailsList[cs].controls['courseDetails'].value &&
          this.educationalDetailsList[cs].controls['courseDetails'].value !=
            '') ||
        (this.educationalDetailsList[cs].controls['yearOfPassing'].value &&
          this.educationalDetailsList[cs].controls['yearOfPassing'].value != '')
      ) {
        this.educationalDetailsList[cs].controls['institution'].addValidators([
          Validators.required,
        ]);
        this.educationalDetailsList[cs].controls['courseDetails'].addValidators(
          [Validators.required]
        );
        this.educationalDetailsList[cs].controls['yearOfPassing'].addValidators(
          [Validators.required]
        );

        this.educationalDetailsList[cs].controls[
          'institution'
        ].updateValueAndValidity();
        this.educationalDetailsList[cs].controls[
          'courseDetails'
        ].updateValueAndValidity();
        this.educationalDetailsList[cs].controls[
          'yearOfPassing'
        ].updateValueAndValidity();
        return;
      }
    }
    this.educationalDetailsList[cs].controls['institution'].setValidators(null);
    this.educationalDetailsList[cs].controls[
      'institution'
    ].updateValueAndValidity();
    this.educationalDetailsList[cs].controls['courseDetails'].setValidators(
      null
    );
    this.educationalDetailsList[cs].controls[
      'courseDetails'
    ].updateValueAndValidity();
    this.educationalDetailsList[cs].controls['yearOfPassing'].setValidators(
      null
    );
    this.educationalDetailsList[cs].controls[
      'yearOfPassing'
    ].updateValueAndValidity();
  }

  validateTraining(cs: number, field: string) {
    if (
      this.trainingDetailsList[cs].controls[field].value &&
      this.trainingDetailsList[cs].controls[field].value != ''
    ) {
      this.trainingDetailsList[cs].controls[
        'nameOfTheInstitution'
      ].addValidators([Validators.required]);
      this.trainingDetailsList[cs].controls['fromDate'].addValidators([
        Validators.required,
      ]);
      this.trainingDetailsList[cs].controls['toDate'].addValidators([
        Validators.required,
      ]);
      this.trainingDetailsList[cs].controls['typeOfTraining'].addValidators([
        Validators.required,
      ]);
      this.trainingDetailsList[cs].controls[
        'nameOfTheInstitution'
      ].updateValueAndValidity();
      this.trainingDetailsList[cs].controls[
        'fromDate'
      ].updateValueAndValidity();
      this.trainingDetailsList[cs].controls['toDate'].updateValueAndValidity();
      this.trainingDetailsList[cs].controls[
        'typeOfTraining'
      ].updateValueAndValidity();
      return;
    } else {
      if (
        (this.trainingDetailsList[cs].controls['nameOfTheInstitution'].value &&
          this.trainingDetailsList[cs].controls['nameOfTheInstitution'].value !=
            '') ||
        (this.trainingDetailsList[cs].controls['fromDate'].value &&
          this.trainingDetailsList[cs].controls['fromDate'].value != '') ||
        (this.trainingDetailsList[cs].controls['toDate'].value &&
          this.trainingDetailsList[cs].controls['toDate'].value != '') ||
        (this.trainingDetailsList[cs].controls['typeOfTraining'].value &&
          this.trainingDetailsList[cs].controls['typeOfTraining'].value != '')
      ) {
        this.trainingDetailsList[cs].controls[
          'nameOfTheInstitution'
        ].addValidators([Validators.required]);
        this.trainingDetailsList[cs].controls['fromDate'].addValidators([
          Validators.required,
        ]);
        this.trainingDetailsList[cs].controls['toDate'].addValidators([
          Validators.required,
        ]);
        this.trainingDetailsList[cs].controls['typeOfTraining'].addValidators([
          Validators.required,
        ]);

        this.trainingDetailsList[cs].controls[
          'nameOfTheInstitution'
        ].updateValueAndValidity();
        this.trainingDetailsList[cs].controls[
          'fromDate'
        ].updateValueAndValidity();
        this.trainingDetailsList[cs].controls[
          'toDate'
        ].updateValueAndValidity();
        this.trainingDetailsList[cs].controls[
          'typeOfTraining'
        ].updateValueAndValidity();
        return;
      }
    }
    this.trainingDetailsList[cs].controls['nameOfTheInstitution'].setValidators(
      null
    );
    this.trainingDetailsList[cs].controls[
      'nameOfTheInstitution'
    ].updateValueAndValidity();
    this.trainingDetailsList[cs].controls['fromDate'].setValidators(null);
    this.trainingDetailsList[cs].controls['fromDate'].updateValueAndValidity();
    this.trainingDetailsList[cs].controls['toDate'].setValidators(null);
    this.trainingDetailsList[cs].controls['toDate'].updateValueAndValidity();
    this.trainingDetailsList[cs].controls['typeOfTraining'].setValidators(null);
    this.trainingDetailsList[cs].controls[
      'typeOfTraining'
    ].updateValueAndValidity();
  }
  updateTotalCost() {
    let projectOutlayCost = Number(
      this.schemeProjectForm.get('projectOutlayCost')?.value
    );
    let landCost = Number(this.schemeProjectForm.get('landCost')?.value);
    let buildingCost = Number(
      this.schemeProjectForm.get('buildingCost')?.value
    );
    let equipmentCost = Number(
      this.schemeProjectForm.get('equipmentCost')?.value
    );
    let beneficiaryCost = Number(
      this.schemeProjectForm.get('beneficiaryCost')?.value
    );
    let workingCost = Number(this.schemeProjectForm.get('workingCost')?.value);
    let preopertaiveExpense = Number(
      this.schemeProjectForm.get('preopertaiveExpense')?.value
    );
    let otherExpense = Number(
      this.schemeProjectForm.get('otherExpense')?.value
    );
    var total =
      projectOutlayCost +
      landCost +
      buildingCost +
      equipmentCost +
      workingCost +
      preopertaiveExpense +
      otherExpense -
      beneficiaryCost;
    this.schemeProjectForm.get('totalCost')?.patchValue(total);

    this.schemeProjectForm.get('subsidyCost')?.patchValue(0, {
      emitEvent: false,
    });
    this.schemeProjectForm.get('subsidyPercentage_Config')?.patchValue(0, {
      emitEvent: false,
    });
    this.schemeProjectForm.get('subsidyCost_Config')?.patchValue(0, {
      emitEvent: false,
    });
    this.schemeProjectForm.get('loanCost')?.patchValue(total, {
      emitEvent: false,
    });
    this.schemeProjectForm
      .get('totalCostinWords')
      ?.patchValue(convertoWords(total));

    this.schemeProjectForm
      .get('loanCostinWords')
      ?.patchValue(
        convertoWords(this.schemeProjectForm.get('loanCost')?.value)
      );
  }
  get localbodyValue() {
    return this.schemeProjectForm.get('localBody')?.value;
  }
  get nameoflocalbodyValue() {
    return this.schemeProjectForm.get('nameoflocalBody')?.value;
  }
  get res_localbodyValue() {
    return this.schemePersonalForm.get('resident_localBody')?.value;
  }
  get res_nameoflocalbodyValue() {
    return this.schemePersonalForm.get('resident_nameoflocalBody')?.value;
  }
  get corres_localbodyValue() {
    return this.schemePersonalForm.get('correspondence_localBody')?.value;
  }
  get corres_nameoflocalbodyValue() {
    return this.schemePersonalForm.get('correspondence_nameoflocalBody')?.value;
  }
  get showactiviOther() {
    var ac = this.activities.find((x) => x.text.toLocaleLowerCase() == 'other');
    if (ac && this.schemeProjectForm.get('activityLane')?.value) {
      return ac.value == this.schemeProjectForm.get('activityLane')?.value;
    }
    return false;
  }
  get showemptypeOther() {
    if (
      this.schemePersonalForm.get('employeementType')?.value &&
      this.schemePersonalForm
        .get('employeementType')
        ?.value?.toLocaleLowerCase() == 'others'
    ) {
      return true;
    }
    return false;
  }
  back() {
    if (this.cashow) {
      this.router.navigateByUrl('/applicant/eligibility');
    } else {
      this.router.navigateByUrl('/officers/applications');
    }
  }
  next(num: number) {
    if (num == 1) {
      if (
        this.schemeGeneralForm.controls['isNativeTamilNadu'].value == true &&
        (this.schemeGeneralForm.controls['mobile'].valid ||
          this.schemeGeneralForm.controls['mobile'].status == 'DISABLED') &&
        (this.schemeGeneralForm.controls['projectDistrict'].valid ||
          this.schemeGeneralForm.controls['projectDistrict'].status ==
            'DISABLED')
      ) {
        this.savegeneralForm(false);
      } else {
        var value = this.schemeGeneralForm.controls['mobile'].value;
        this.schemeGeneralForm.controls['mobile'].markAllAsTouched();
        this.schemeGeneralForm.controls['mobile'].updateValueAndValidity({
          onlySelf: false,
          emitEvent: true,
        });
        this.schemeGeneralForm.controls['mobile'].setValue(value);

        var value = this.schemeGeneralForm.controls['projectDistrict'].value;
        this.schemeGeneralForm.controls['projectDistrict'].markAllAsTouched();
        this.schemeGeneralForm.controls[
          'projectDistrict'
        ].updateValueAndValidity({
          onlySelf: false,
          emitEvent: true,
        });
        this.schemeGeneralForm.controls['projectDistrict'].setValue(value);

        // if (
        //   this.schemeGeneralForm.controls['isFirstEntrepreneur'].value != true
        // ) {
        //   this.confirmationService.confirm({
        //     message: `This scheme is applicable only to First-Generation Entrepreneurs.`,
        //     header: 'Not Eligible',
        //     icon: 'pi pi-exclamation-triangle',
        //     accept: () => {},
        //     reject: (type: ConfirmEventType) => {},
        //   });
        // }
        if (
          this.schemeGeneralForm.controls['isNativeTamilNadu'].value != true
        ) {
          this.confirmationService.confirm({
            message: `Applicant must be a native of Tamil Nadu. Non-natives are not eligible.`,
            header: 'Not Eligible',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
        }

        return;
      }
    }
    if (num == 2) {
      if (
        this.schemePersonalForm.get('employeementType')?.value &&
        this.schemePersonalForm.controls[
          'employeementType'
        ].value.toLocaleLowerCase() != 'others'
      ) {
        this.confirmationService.confirm({
          message: `Employed persons are not eligible for this scheme.`,
          header: 'Not Eligible',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {},
          reject: (type: ConfirmEventType) => {},
        });
        return;
      }
      this.savePersonalForm();
      return;
    }
    if (num == 3) {
      this.saveProjectForm();
      return;
    }
    var df = this.activeIndex as number[];
    this.activeIndex = [num];
    this.cdr.detectChanges();
    this.activeIndex = [num];
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
  validateall() {
    if (!this.checked) {
      this.showDecError = true;
      return;
    }

    // if (this.schemeGeneralForm.controls['isFirstEntrepreneur'].value != true) {
    //   this.confirmationService.confirm({
    //     message: `This scheme is applicable only to First-Generation Entrepreneurs.`,
    //     header: 'Not Eligible',
    //     icon: 'pi pi-exclamation-triangle',
    //     accept: () => {},
    //     reject: (type: ConfirmEventType) => {},
    //   });
    //   return;
    // }
    if (this.schemeGeneralForm.controls['isNativeTamilNadu'].value != true) {
      this.confirmationService.confirm({
        message: `Applicant must be a native of Tamil Nadu. Non-natives are not eligible.`,
        header: 'Not Eligible',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {},
        reject: (type: ConfirmEventType) => {},
      });
      return;
    }

    if (
      this.schemePersonalForm.get('employeementType')?.value &&
      this.schemePersonalForm.controls[
        'employeementType'
      ].value.toLocaleLowerCase() != 'others'
    ) {
      this.confirmationService.confirm({
        message: `Employed persons are not eligible for this scheme.`,
        header: 'Not Eligible',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {},
        reject: (type: ConfirmEventType) => {},
      });
      return;
    }

    if (!this.schemeGeneralForm.valid) {
      this.activeIndex = [0];
      this.cdr.markForCheck();
      this.schemeGeneralForm.markAllAsTouched();
      this.schemeGeneralForm.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
      this.triggerValueChangesForAll(this.schemeGeneralForm);
      this.activeIndex = [0];
      this.cdr.detectChanges();
      return;
    }
    if (this.schemePersonalForm.valid) {
      setTimeout(() => {
        this.savePersonalForm(true);
      }, 1000);
    } else {
      this.activeIndex = [1];
      this.schemePersonalForm.markAllAsTouched();
      this.schemePersonalForm.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
      this.triggerValueChangesForAll(this.schemePersonalForm);
      this.activeIndex = [1];
      window.scroll({
        top: 50,
        left: 50,
        behavior: 'smooth',
      });
      return;
    }
    if (this.schemeProjectForm.valid) {
      setTimeout(() => {
        this.saveProjectForm(true);
      }, 1500);
    } else {
      this.activeIndex = [2];
      this.schemeProjectForm.markAllAsTouched();
      this.schemeProjectForm.markAsDirty();
      this.schemeProjectForm.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
      this.triggerValueChangesForAll(this.schemeProjectForm);
      this.activeIndex = [2];
      window.scroll({
        top: 50,
        left: 50,
        behavior: 'smooth',
      });
      return;
    }
    if (this.documentsForm.valid) {
    } else {
      this.activeIndex = [3];
      this.documentsForm.markAllAsTouched();
      this.documentsForm.markAsDirty();
      this.documentsForm.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
      this.triggerValueChangesForAll(this.documentsForm);
      this.activeIndex = [3];
      window.scroll({
        top: 50,
        left: 50,
        behavior: 'smooth',
      });
      return;
    }
    if (this.schemeGeneralForm.valid) {
      if (
        this.schemeProjectForm.get('district')?.value !=
        this.schemeGeneralForm.get('projectDistrict')?.value
      ) {
        this.schemeGeneralForm
          .get('projectDistrict')
          ?.patchValue(this.schemeProjectForm.get('district')?.value);
      }
      setTimeout(() => {
        this.savegeneralForm(true, true);
      }, 2000);
    } else {
      this.activeIndex = [0];
      this.schemeGeneralForm.markAllAsTouched();
      this.schemeGeneralForm.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
      this.triggerValueChangesForAll(this.schemeGeneralForm);
      this.activeIndex = [0];
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      return;
    }
  }
  onSelectFile(event: any) {
    if (event.files && event.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.files[0]); // read file as data url
      var url = event.files[0].objectURL;
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.url = url;
        this.schemeGeneralForm.controls['userImage'].patchValue(this.url);
      };

      const formData = new FormData();
      formData.append('file', event.files[0]);
      formData.append('applicationId', this.applicationid);
      this.http
        .post(`${environment.apiUrl}/Scheme/Profile_Upload`, formData)
        .subscribe(
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Uploaded Successfully',
            });
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
  expandCollapse() {
    if (this.IsExpanded) {
      this.IsExpanded = false;
      this.activeIndex = [];
    } else {
      this.IsExpanded = true;
      if (this.isnew) {
        this.activeIndex = [0];
      } else {
        this.activeIndex = [0, 1, 2, 3, 4];
      }
    }
  }
  public delete() {
    this.url = '';
  }
  updateError() {
    this.showDecError = false;
  }
  getApplicationFormDD() {
    this.schemeService.applicationFormGet(this.applicationid).subscribe((x) => {
      var det: ApplicationDropdownModel = x.data;
      if (det) {
        this.services = det.services ?? [];
        this.sexes = det.sexes ?? [];
        this.communities = det.communities ?? [] ?? [];
        this.religions = det.religions ?? [];
        this.maritalstatuses = det.maritalstatuses ?? [];
        this.ventures = det.ventures ?? [];
        this.dependants = det.dependents ?? [];
        this.ranks = det.rank ?? [];
        this.activities = det.activites ?? [];
        this.nameOfLocalbody = det.nameOfLocalbody ?? [];
        this.areas = det.areas ?? [];

        this.districts = det.districts ?? [];
        this.blocks = det.blocks ?? [];
        this.taluks = det.taluks ?? [];
        this.corporations = det.corporations ?? [];
        this.municipalities = det.municipalities ?? [];
        this.townpanchayat = det.townpanchayat ?? [];
        this.villagepanchayat = det.villagepanchayat ?? [];

        this.residence_nameOfLocalbody = det.residence_NameOfLocalbody ?? [];
        this.residence_districts = det.residence_Districts ?? [];
        this.residence_blocks = det.residence_Blocks ?? [];
        this.residence_taluks = det.residence_Taluks ?? [];
        this.residence_corporations = det.residence_Corporations ?? [];
        this.residence_municipalities = det.residence_Municipalities ?? [];
        this.residence_townpanchayat = det.residence_Townpanchayat ?? [];
        this.residence_villagepanchayat = det.residence_Villagepanchayat ?? [];
        this.residence_areas = det.residence_Areas ?? [];

        this.corres_nameOfLocalbody = det.corres_NameOfLocalbody ?? [];
        this.corres_districts = det.corres_Districts ?? [];
        this.corres_blocks = det.corres_Blocks ?? [];
        this.corres_taluks = det.corres_Taluks ?? [];
        this.corres_corporations = det.corres_Corporations ?? [];
        this.corres_municipalities = det.corres_Municipalities ?? [];
        this.corres_townpanchayat = det.corres_Townpanchayat ?? [];
        this.corres_villagepanchayat = det.corres_Villagepanchayat ?? [];
        this.banks = det.banks ?? [];
        this.branches = det.branches ?? [];
        this.costFieldModels = det.costFieldModels ?? [];
        this.setMandatoryOptions();
      }
    });
  }

  savegeneralForm(isSubmit: boolean, noNeedtoMove: boolean = false) {
    this.schemeService
      .saveGeneral({
        applicationId: this.schemeGeneralForm.get('applicationId')?.value,
        id: this.id,
        firstName: this.schemeGeneralForm.get('firstName')?.value,
        lastName: this.schemeGeneralForm.get('lastName')?.value,
        rank: this.schemeGeneralForm.get('rank')?.value,
        mobile: this.schemeGeneralForm.get('mobile')?.value,
        projectDistrict: this.schemeGeneralForm.get('projectDistrict')?.value,
        servedIn: this.schemeGeneralForm.get('servedIn')?.value,
        age: this.schemeGeneralForm.get('age')?.value,
        dateOfEnrollment: this.schemeGeneralForm.get('dateOfEnrollment')?.value,
        dateOfDischarge: this.schemeGeneralForm.get('dateOfDischarge')?.value,
        totalYearsinService: this.schemeGeneralForm.get('totalYearsinService')
          ?.value,
        isSelf: this.schemeGeneralForm.get('isSelf')?.value,
        idCardNo: this.schemeGeneralForm.get('idCardNo')?.value,
        dependentName: this.schemeGeneralForm.get('dependentName')?.value,
        ppoNo: this.schemeGeneralForm.get('ppoNo')?.value,
        sex: this.schemeGeneralForm.get('sex')?.value,
        community: this.schemeGeneralForm.get('community')?.value,
        religion: this.schemeGeneralForm.get('religion')?.value,
        maritalStatus: this.schemeGeneralForm.get('maritalStatus')?.value,
        dob: this.schemeGeneralForm.get('dob')?.value,
        fathersName: this.schemeGeneralForm.get('fathersName')?.value,
        dependentId: this.schemeGeneralForm.get('dependents')?.value,
        isSubmit: isSubmit,
        declarationAccepted: this.checked,
        serviceNumber: this.schemeGeneralForm.get('serviceNumber')?.value,
        isNativeTamilNadu:
          this.schemeGeneralForm.get('isNativeTamilNadu')?.value,
        isFirstEntrepreneur:
          this.schemeGeneralForm.get('isFirstEntrepreneur')?.value ?? false,
        dependentDob: this.schemeGeneralForm.get('dependentDob')?.value,
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messages = [];
          if (x.message == 'Validations failed') {
            var list = x.data as ApplicationValidationErrorModel[];
            list.map((x) => {
              if (!this.messages) {
                this.messages = [
                  {
                    severity: 'error',
                    summary: x.label && x.label != '' ? x.label : x.key,
                    detail: x.errorMessage,
                  },
                ];
              } else {
                this.messages = [
                  ...this.messages,
                  {
                    severity: 'error',
                    summary: x.label && x.label != '' ? x.label : x.key,
                    detail: x.errorMessage,
                  },
                ];
              }
            });
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          if (this.isnew) {
            var fg: string = x.data;
            this.applicationid = fg.split('~')[0];
            this.id = fg.split('~')[1];
            this.isnew = false;
            this.router.navigate([
              'applicant',
              'scheme',
              this.applicationid,
              1,
            ]);
          } else {
            if (!noNeedtoMove) {
              this.activeIndex = [1];
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            } else {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Application Submitted Successfully',
              });
              if (this.cashow) {
                this.router.navigateByUrl(
                  '/applicant/view/' + this.applicationid
                );
              } else {
                this.router.navigateByUrl('/officers/applications');
              }
            }
          }
        }
      });
  }
  savePersonalForm(noNeedtoMove: boolean = false) {
    this.schemeService
      .savePerosonal({
        aadharNo: this.schemePersonalForm.get('aadharNo')?.value,
        id: this.id,
        applicationId: this.applicationid,
        isCorrespondenceSameAsResident:
          this.schemePersonalForm.get('isSame')?.value,
        residentialAddress: {
          id: this.schemePersonalForm.get('residentialAddressId')?.value,
          applicationId: this.applicationid,
          doorNo: this.schemePersonalForm.get('resident_doorNo')?.value,
          streetName: this.schemePersonalForm.get('resident_streetName')?.value,
          district: this.schemePersonalForm.get('resident_district')?.value,
          taluk: this.schemePersonalForm.get('resident_taluk')?.value,
          villlageTownCity:
            this.schemePersonalForm.get('resident_village')?.value,
          localBody: this.schemePersonalForm.get('resident_localBody')?.value,
          nameoflocalBody: this.schemePersonalForm.get(
            'resident_nameoflocalBody'
          )?.value,
          block: this.schemePersonalForm.get('resident_block')?.value,
          corporation: this.schemePersonalForm.get('resident_corporation')
            ?.value,
          municipality: this.schemePersonalForm.get('resident_municipality')
            ?.value,
          townPanchayat: this.schemePersonalForm.get('resident_townPanchayat')
            ?.value,
          pincode: this.schemePersonalForm.get('resident_pincode')?.value,
          isActive: true,
        },
        correspondenceAddress: {
          id: this.schemePersonalForm.get('correspondenceAddressId')?.value,
          applicationId: this.applicationid,
          doorNo: this.schemePersonalForm.get('correspondence_doorNo')?.value,
          streetName: this.schemePersonalForm.get('correspondence_streetName')
            ?.value,
          district: this.schemePersonalForm.get('correspondence_district')
            ?.value,
          taluk: this.schemePersonalForm.get('correspondence_taluk')?.value,
          villlageTownCity: this.schemePersonalForm.get(
            'correspondence_village'
          )?.value,
          localBody: this.schemePersonalForm.get('correspondence_localBody')
            ?.value,
          nameoflocalBody: this.schemePersonalForm.get(
            'correspondence_nameoflocalBody'
          )?.value,
          block: this.schemePersonalForm.get('correspondence_block')?.value,
          corporation: this.schemePersonalForm.get('correspondence_corporation')
            ?.value,
          municipality: this.schemePersonalForm.get(
            'correspondence_municipality'
          )?.value,
          townPanchayat: this.schemePersonalForm.get(
            'correspondence_townPanchayat'
          )?.value,
          pincode: this.schemePersonalForm.get('correspondence_pincode')?.value,
          isActive: true,
        },
        email: this.schemePersonalForm.get('email')?.value,
        residinginSameArea:
          this.schemePersonalForm.get('residinginSameArea')?.value,
        isTrainingUndergone: this.schemePersonalForm.get('istrainingUndergone')
          ?.value,
        isEmployed: this.schemePersonalForm.get('isEmployed')?.value,
        employmentDetails:
          this.schemePersonalForm.get('employmentDetails')?.value,
        isRegistered: this.schemePersonalForm.get('isRegistered')?.value,
        registrationNo: this.schemePersonalForm.get('registrationNo')?.value,
        registrationDate:
          this.schemePersonalForm.get('registrationDate')?.value,
        hasPreviousExp: this.schemePersonalForm.get('hasPreviousExp')?.value,
        previousExperience:
          this.schemePersonalForm.get('previousExperience')?.value,
        educationalQualification:
          this.schemePersonalForm.controls['educationalDetails'].getRawValue(),
        employeementType:
          this.schemePersonalForm.get('employeementType')?.value,
        typeOfTrainingList:
          this.schemePersonalForm.get('istrainingUndergone')?.value == true
            ? this.schemePersonalForm.get('trainingDetails')?.value
            : null,
        isReEmployed: this.schemePersonalForm.get('isReEmployed')?.value,
        employementOthers:
          this.schemePersonalForm.get('employementOthers')?.value,
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
          if (this.isnew) {
            var fg: string = x.data;
            this.applicationid = fg.split('~')[0];
            this.id = fg.split('~')[1];
            this.isnew = false;
            this.router.navigate([
              'applicant',
              'scheme',
              this.applicationid,
              1,
            ]);
          } else {
            if (!noNeedtoMove) {
              this.activeIndex = [2];
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            }
          }
        }
      });
  }
  saveProjectForm(noNeedtoMove: boolean = false) {
    this.schemeService
      .saveProject({
        id: this.id,
        applicationId: this.applicationid,
        activityLane: this.schemeProjectForm.get('activityLane')?.value,
        ventureCategory: this.schemeProjectForm.get('ventureCategory')?.value,
        projectOutlayCost:
          this.schemeProjectForm.get('projectOutlayCost')?.value,
        landCost: this.schemeProjectForm.get('landCost')?.value,
        buildingCost: this.schemeProjectForm.get('buildingCost')?.value,
        equipmentCost: this.schemeProjectForm.get('equipmentCost')?.value,
        workingCost: this.schemeProjectForm.get('workingCost')?.value,
        preopertaiveExpense: this.schemeProjectForm.get('preopertaiveExpense')
          ?.value,
        otherExpense: this.schemeProjectForm.get('otherExpense')?.value,
        address: this.schemeProjectForm.get('address')?.value,
        branch: this.schemeProjectForm.get('branch')?.value,
        bank: this.schemeProjectForm.get('bank')?.value,
        iFSC: this.schemeProjectForm.get('ifsc')?.value,
        accountNumber: this.schemeProjectForm.get('accountNumber')?.value,
        totalCost: this.schemeProjectForm.get('totalCost')?.value,
        projectAddress: {
          id: this.schemeProjectForm.get('projectAddressid')?.value,
          applicationId: this.applicationid,
          doorNo: this.schemeProjectForm.get('doorNo')?.value,
          streetName: this.schemeProjectForm.get('streetName')?.value,
          district: this.schemeProjectForm.get('district')?.value,
          taluk: this.schemeProjectForm.get('taluk')?.value,
          villlageTownCity:
            this.schemeProjectForm.get('villlageTownCity')?.value,
          localBody: this.schemeProjectForm.get('localBody')?.value,
          nameoflocalBody: this.schemeProjectForm.get('nameoflocalBody')?.value,
          block: this.schemeProjectForm.get('block')?.value,
          corporation: this.schemeProjectForm.get('corporation')?.value,
          municipality: this.schemeProjectForm.get('municipality')?.value,
          townPanchayat: this.schemeProjectForm.get('townPanchayat')?.value,
          pincode: this.schemeProjectForm.get('pincode')?.value,
          isActive: true,
        },
        subsidyCost: this.schemeProjectForm.get('subsidyCost')?.value,
        beneficiaryCost: this.schemeProjectForm.get('beneficiaryCost')?.value,
        loanCost: this.schemeProjectForm.get('loanCost')?.value,
        subsidyPercentage_Config: this.schemeProjectForm.get(
          'subsidyPercentage_Config'
        )?.value,
        subsidyCost_Config:
          this.schemeProjectForm.get('subsidyCost_Config')?.value,
        activityLaneOther:
          this.schemeProjectForm.get('activityLaneOther')?.value,
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
          if (this.isnew) {
            var fg: string = x.data;
            this.applicationid = fg.split('~')[0];
            this.id = fg.split('~')[1];
            this.isnew = false;
            this.router.navigate([
              'applicant',
              'scheme',
              this.applicationid,
              1,
            ]);
          } else {
            if (!noNeedtoMove) {
              this.activeIndex = [3];
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            }
          }
        }
      });
  }
  generateDefaultRows(docs: ApplicationDocumentModel[]) {
    if (docs) {
      docs.forEach((x) => {
        this.documentsFormArray.push(
          this.formBuilder.group({
            id: [x.id],
            applicationId: [x.applicationId, [Validators.required]],
            documentCategoryName: [x.documentCategory, [Validators.required]],
            documentType: [
              x.documentGroupName,
              x.isRequired ? [Validators.required] : [],
            ],
            documentCategoryId: [x.documentCategoryId],
            isRequired: [x.isRequired],
            savedFileName: [
              x.savedFileName,
              x.isRequired ? [Validators.required] : [],
            ],
            acceptedDocumentList: [x.acceptedDocumentList],
            documentConfigId: [x.documentConfigId],
            acceptedDocumentTypeId: [
              x.acceptedDocumentTypeId,
              x.isRequired ? [Validators.required] : [],
            ],
            originalFileName: [x.originalFileName],
          })
        );
      });
    }
  }
  removeFile(id: string) {
    this.schemeService.deleteDocument(id).subscribe((v) => {
      this.getDocuments();
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
    this.generalService.SchemeFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  getDocuments() {
    this.schemeService.getDocument(this.applicationid).subscribe((c) => {
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
  acceptedDocument(event: any, id: string) {}
  getEducationalDetails() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'EDUCATIONQUALIFICATION',
      })
      .subscribe((x) => {
        this.educationslQualifications = x.data;
        this.generateEduDefaultRows();
      });
  }
  getFormGrp(id: string) {
    var file = this.documentsList.find((x) => x.controls['id'].value == id);
    if (file) {
      return this.documentsList.indexOf(file);
    }
    return 0;
  }
  generateEduDefaultRows() {
    if (this.educationslQualifications) {
      var df!: TCModel;
      this.educationslQualifications.forEach((x) => {
        if (x.text.toLocaleLowerCase() != 'others') {
          this.educationalDetailsArray.push(
            this.formBuilder.group({
              id: [Guid.raw()],
              applicationId: [this.applicationid, [Validators.required]],
              educationalQualificationId: [x.value, [Validators.required]],
              educationalQualification: [x.text, [Validators.required]],
              courseDetails: [''],
              institution: [''],
              yearOfPassing: [
                '',
                [
                  Validators.minLength(4),
                  Validators.minLength(4),
                  Validators.pattern(new RegExp('^[0-9]+$')),
                ],
              ],
            })
          );
        } else {
          df = x;
        }
        this.cdr.detectChanges();
        this.schemePersonalForm.controls[
          'educationalDetails'
        ].updateValueAndValidity();
      });
      if (df) {
        this.educationalDetailsArray.push(
          this.formBuilder.group({
            id: [Guid.raw()],
            applicationId: [this.applicationid, [Validators.required]],
            educationalQualificationId: [df.value, [Validators.required]],
            educationalQualification: [df.text, [Validators.required]],
            courseDetails: [''],
            institution: [''],
            yearOfPassing: [
              '',
              [
                Validators.minLength(4),
                Validators.minLength(4),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ],
            ],
          })
        );
      }
      this.upadateEducationInformation();
    }
  }

  generateTrainingDefaultRows() {
    if (
      this.schemeDetails &&
      this.schemeDetails.typeOfTrainingList &&
      this.schemeDetails.typeOfTrainingList.length > 0
    ) {
      this.schemeDetails.typeOfTrainingList.forEach((x) => {
        this.trainingDetailsArray.push(
          this.formBuilder.group({
            id: [x.id, [Validators.required]],
            applicationId: [this.applicationid, [Validators.required]],
            nameOfTheInstitution: [
              x.nameOfTheInstitution,
              [Validators.required],
            ],
            fromDate: [moment(x.fromDate).toDate(), [Validators.required]],
            toDate: [moment(x.toDate).toDate(), [Validators.required]],
            typeOfTraining: [x.typeOfTraining, [Validators.required]],
            isActive: [true],
          })
        );
      });
    } else {
      this.trainingDetailsArray.push(
        this.formBuilder.group({
          id: [Guid.raw()],
          applicationId: [this.applicationid, [Validators.required]],
          nameOfTheInstitution: ['', [Validators.required]],
          fromDate: ['', [Validators.required]],
          toDate: ['', [Validators.required]],
          typeOfTraining: ['', [Validators.required]],
          isActive: [true],
        })
      );
    }
    this.cdr.detectChanges();
    this.schemePersonalForm.controls[
      'trainingDetails'
    ].updateValueAndValidity();
  }
  addTrainng() {
    this.trainingDetailsArray.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        applicationId: [this.applicationid, [Validators.required]],
        nameOfTheInstitution: ['', [Validators.required]],
        fromDate: ['', [Validators.required]],
        toDate: ['', [Validators.required]],
        typeOfTraining: ['', [Validators.required]],
        isActive: [true],
      })
    );
    this.schemePersonalForm.controls[
      'trainingDetails'
    ].updateValueAndValidity();
  }
  removeTrainng(id: string) {
    const index = this.trainingDetailsArray.controls.findIndex(
      (item) => item.get('id')?.value === id
    );
    this.trainingDetailsArray.removeAt(index);
    this.schemePersonalForm.controls[
      'trainingDetails'
    ].updateValueAndValidity();
  }
  onSelectDocumentFile(event: any, id: string) {
    if (event.files && event.files[0]) {
      var df = this.documentsList.find((x) => x.controls['id'].value == id);
      if (df) {
        var applicationId = df.controls['applicationId'].value;
        var acceptedDocumentTypeId =
          df.controls['acceptedDocumentTypeId'].value;
        var documentConfigId = df.controls['documentConfigId'].value;
        const formData = new FormData();
        formData.append('file', event.files[0]);
        formData.append('documentConfigId', documentConfigId);
        formData.append('acceptedDocumentTypeId', acceptedDocumentTypeId);
        formData.append('id', id);
        formData.append('applicationId', applicationId);
        this.http
          .post(`${environment.apiUrl}/Scheme/Document_SaveUpdate`, formData)
          .subscribe(
            (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Uploaded Successfully',
              });
              this.getDocuments();
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
  backtogrid() {
    if (this.cashow) {
      this.router.navigateByUrl('/applicant/eligibility');
    } else {
      this.router.navigateByUrl('/officers/applications');
    }
  }
  upadateEducationInformation() {
    if (this.schemeDetails && this.schemeDetails.educationalQualification) {
      this.schemeDetails.educationalQualification.forEach((s) => {
        this.educationalDetailsList.map((c) => {
          if (
            c.controls['educationalQualificationId'].value ==
            s.educationalQualificationId
          ) {
            c.controls['id'].patchValue(s.id);
            c.controls['educationalQualificationId'].patchValue(
              s.educationalQualificationId
            );
            c.controls['courseDetails'].patchValue(s.courseDetails);
            c.controls['institution'].patchValue(s.institution);
            c.controls['yearOfPassing'].patchValue(s.yearOfPassing);
          }
        });
      });
    }
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
  removeImage() {
    this.schemeService.Profile_Delete(this.applicationid).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.url = '';
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Removed Successfully',
        });
      }
    });
  }
  getSubsidy() {
    var totalCost = this.schemeProjectForm.get('totalCost')?.value;
    this.schemeService
      .SubsidyValueGet({
        cost: totalCost,
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x.data) {
          var data: SubsidyValueGetResponseModel = x.data;

          if (totalCost > (data.maxProjectCost ?? 0)) {
            this.schemeProjectForm.get('subsidyCost')?.patchValue(0);
            this.schemeProjectForm
              .get('subsidyPercentage_Config')
              ?.patchValue(0);
            this.schemeProjectForm.get('subsidyCost_Config')?.patchValue(0);
            this.schemeProjectForm.get('loanCost')?.patchValue(0);
            this.confirmationService.confirm({
              message: `Total Project Cost exceeds the approved budget. Please ensure the cost is within the allowed limit of ${data.maxProjectCost}.`,
              header: 'Total Project Cost Exceeds Maximum Limit!',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                this.schemeProjectForm.get('subsidyCost')?.patchValue(0);
                this.schemeProjectForm
                  .get('subsidyPercentage_Config')
                  ?.patchValue(0);
                this.schemeProjectForm.get('subsidyCost_Config')?.patchValue(0);
                this.schemeProjectForm.get('loanCost')?.patchValue(0);
              },
              reject: (type: ConfirmEventType) => {},
            });
          }

          this.schemeProjectForm
            .get('subsidyCost')
            ?.patchValue(Math.round(data.subsidyCost));
          this.schemeProjectForm
            .get('subsidyPercentage_Config')
            ?.patchValue(data.subsidyPercentage_Config);
          this.schemeProjectForm
            .get('subsidyCost_Config')
            ?.patchValue(data.subsidyCost_Config);
          this.schemeProjectForm
            .get('loanCost')
            ?.patchValue(Number(totalCost) - Math.round(data.subsidyCost), {
              emitEvent: false,
            });
          this.schemeProjectForm
            .get('loanCostinWords')
            ?.patchValue(
              convertoWords(this.schemeProjectForm.get('loanCost')?.value)
            );
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Subsidy Received Successfully',
          });
        }
      });
  }
  getbankDetails() {
    var ifsc = this.schemeProjectForm.get('ifsc')?.value;
    this.schemeService.BranchGetByIFSC(ifsc).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
      } else if (x.data) {
        var data = x.data;
        this.schemeProjectForm.get('address')?.patchValue(data.address);
        this.schemeProjectForm.get('branch')?.patchValue(data.branchId);
        this.schemeProjectForm.get('bank')?.patchValue(data.bankId);
      }
    });
  }
  canShowthisProjectField(fieldName: string) {
    var filed = this.costFieldModels.filter((x) => x.fieldId == fieldName);
    if (filed && filed.length > 0) {
      return filed[0].isVisible;
    }
    return false;
  }
  getTooltipthisProjectField(fieldName: string) {
    var filed = this.costFieldModels.filter((x) => x.fieldId == fieldName);
    if (filed) {
      return filed[0].tooltip;
    }
    return fieldName;
  }
  addtypetraining(value: any) {
    var typeOfTraining: string[] =
      this.schemePersonalForm.get('typeOfTraining')?.value;
    if (!typeOfTraining) {
      typeOfTraining = [value.nativeElement.value];
    } else {
      typeOfTraining = [...typeOfTraining, value.nativeElement.value];
    }
    this.schemePersonalForm.get('typeOfTraining')?.patchValue(typeOfTraining);
    value.nativeElement.value = '';
  }
  removeChip(chip: string) {
    var typeOfTraining: string[] =
      this.schemePersonalForm.get('typeOfTraining')?.value;
    this.schemePersonalForm
      .get('typeOfTraining')
      ?.patchValue(typeOfTraining.filter((c) => c !== chip));
  }
  setMandatoryOptions() {
    this.costFieldModels.map((x) => {
      switch (x.fieldId) {
        case 'LAND_COST':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('landCost')
              ?.addValidators([
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'BUILDING_COST':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('buildingCost')
              ?.addValidators([
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'MACHINERY_EQUIPMENT_COST':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('equipmentCost')
              ?.addValidators([
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'WORKING_COST':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('workingCost')
              ?.addValidators([
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'PRE_OPERTAIVE_EXPENSE':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('preopertaiveExpense')
              ?.addValidators([
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'OTHER_EXPENSE':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('otherExpense')
              ?.addValidators([
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'SUBSIDY_COST':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('subsidyCost')
              ?.addValidators([
                Validators.required,
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'BENEFICIARY_CONTRIBUTION':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('beneficiaryCost')
              ?.addValidators([
                Validators.required,
                Validators.min(1),
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'LOAN_AMOUNT':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('loanCost')
              ?.addValidators([
                Validators.required,
                Validators.min(1),
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
        case 'TOTAL_COST':
          if (x.isRequired) {
            this.schemeProjectForm
              .get('totalCost')
              ?.addValidators([
                Validators.required,
                Validators.min(1),
                Validators.maxLength(12),
                Validators.pattern(new RegExp('^[0-9]+$')),
              ]);
          }
          break;
      }
    });
  }
  home() {
    this.router.navigateByUrl('/');
  }
  search(event: any) {
    this.generalService.Branch_Dropdown_Search(event.query).subscribe((x) => {
      this.suggestions = x.data;
    });
  }
  clearIfsc(event: any) {
    this.schemeProjectForm.get('ifsc')?.patchValue('');
    this.schemeProjectForm.get('address')?.patchValue('');
    this.schemeProjectForm.get('branch')?.patchValue('');
    this.schemeProjectForm.get('bank')?.patchValue('');
  }
  selectifsc(event: AutoCompleteOnSelectEvent) {
    this.schemeProjectForm.get('ifsc')?.patchValue(event.value.value);
    this.getbankDetails();
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
}
