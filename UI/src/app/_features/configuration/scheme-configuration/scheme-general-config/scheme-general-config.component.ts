import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SchemeConfigDropdownModel } from 'src/app/_models/ConfigurationModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { ConfigurationSchemeSaveModel } from 'src/app/_models/schemeConfigModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-scheme-general-config',
  templateUrl: './scheme-general-config.component.html',
  styleUrls: ['./scheme-general-config.component.scss'],
})
export class SchemeGeneralConfigComponent {
  generalForm!: FormGroup;
  dropdown!: SchemeConfigDropdownModel;

  schemeId!: string;
  privleges = privileges;

  defaultDate = moment(new Date(1990, 1 - 1, 1)).toDate();
  endDate = moment(new Date()).toDate();

  constructor(
    private schemeConfigService: SchemeConfigService,
    private generalService: GeneralService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}
  ngOnDestroy() {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.schemeId = params.get('id') ?? Guid.createEmpty().toString();
    });
    // this.schemeConfigService
    //   .Scheme_Config_Form_Get(this.schemeId)
    //   .subscribe((x) => {
    //     this.dropdown = x.data;
    //   });
    this.schemeConfigService
      .Scheme_Config_Form_Get(this.schemeId)
      .subscribe((x) => {
        this.dropdown = x.data;
        if (
          this.dropdown.religions &&
          this.dropdown.religions.length === 1 &&
          !this.generalForm.get('religionsList')?.value
        ) {
          const defaultReligionValue = this.dropdown.religions[0].value;
          this.generalForm.get('religionsList')?.patchValue([defaultReligionValue]);
        }
      });
    this.generalForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      callLetterStatusIdsList: new FormControl(null, [Validators.required]),
      isActive: new FormControl(true, [Validators.required]),
      isSelfOrFamilyMember: new FormControl(null),
      isAlreadyAvailed: new FormControl(true, [Validators.required]),
      showAdditionalFields: new FormControl(true, [Validators.required]),
      showBankFields: new FormControl(true, [Validators.required]),
      isSingleCategorySelect: new FormControl(false, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      docRequiredStatusIdsList: new FormControl(null),
      religionsList: new FormControl(null, [Validators.required]),
      communityList: new FormControl(null, [Validators.required]),
      gendersList: new FormControl(null, [Validators.required]),
      districtsList: new FormControl(null, [Validators.required]),
      casteList: new FormControl(null),
      familyMemberCategorysList: new FormControl(null),
      memberEducationList: new FormControl(null, [Validators.required]),
      familyMemberEducationList: new FormControl(null),
      maritalStatusList: new FormControl(null, [Validators.required]),
      organizationTypeList: new FormControl(null, [Validators.required]),
      minimumAge: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(3),
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      maximumAge: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(3),
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      fromDate: new FormControl(null, [Validators.required]),
      toDate: new FormControl(null, [Validators.required]),
    });
    this.schemeConfigService.Config_Scheme_Get(this.schemeId).subscribe((x) => {
      if (x && x.data && x.data.length > 0) {
        var details = x.data[0] as ConfigurationSchemeSaveModel;
        this.generalForm
          .get('callLetterStatusIdsList')
          ?.patchValue(details.callLetterStatusIdsList);
        this.generalForm
          .get('isSelfOrFamilyMember')
          ?.patchValue(details.isSelfOrFamilyMember);
        this.generalForm
          .get('isAlreadyAvailed')
          ?.patchValue(details.isAlreadyAvailed);
        this.generalForm
          .get('showAdditionalFields')
          ?.patchValue(details.showAdditionalFields);
        this.generalForm
          .get('showBankFields')
          ?.patchValue(details.showBankFields);
        this.generalForm
          .get('isSingleCategorySelect')
          ?.patchValue(details.isSingleCategorySelect);
        this.generalForm.get('description')?.patchValue(details.description);
        this.generalForm
          .get('docRequiredStatusIdsList')
          ?.patchValue(details.docRequiredStatusIdsList);
        this.generalForm
          .get('religionsList')
          ?.patchValue(details.religionsList);
        this.generalForm
          .get('communityList')
          ?.patchValue(details.communityList);
        this.generalForm.get('gendersList')?.patchValue(details.gendersList);
        this.generalForm.get('casteList')?.patchValue(details.casteList);
        this.generalForm
          .get('districtsList')
          ?.patchValue(details.districtsList);
        this.generalForm
          .get('familyMemberCategorysList')
          ?.patchValue(details.familyMemberCategorysList);
        this.generalForm.get('minimumAge')?.patchValue(details.minimumAge);
        this.generalForm.get('maximumAge')?.patchValue(details.maximumAge);
        this.generalForm
          .get('fromDate')
          ?.patchValue(moment(details.fromDate).toDate());
        this.generalForm
          .get('toDate')
          ?.patchValue(moment(details.toDate).toDate());
        this.generalForm.get('status')?.patchValue(details.isActive);

        this.generalForm
          .get('memberEducationList')
          ?.patchValue(details.memberEducationList);
        this.generalForm
          .get('familyMemberEducationList')
          ?.patchValue(details.familyMemberEducationList);
        this.generalForm
          .get('maritalStatusList')
          ?.patchValue(details.maritalStatusList);
        this.generalForm
          .get('organizationTypeList')
          ?.patchValue(details.organizationTypeList);

        this.generalForm.updateValueAndValidity();
      }
    });
    // this.generalForm.get('religionsList')?.valueChanges.subscribe((x) => {
    //   if (x) {
    //     this.generalService
    //       .Configuration_GetSelectByParentConfigurationIds(x)
    //       .subscribe((x) => {
    //         this.dropdown.community = x.data;
    //       });
    //   } else {
    //     this.dropdown.community = [];
    //   }
    // });
    this.generalForm.get('religionsList')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .Configuration_GetSelectByParentConfigurationIds(x)
          .subscribe((res) => {
            this.dropdown.communityGrouped = res.data || [];
          });
      } else {
        this.dropdown.communityGrouped = [];
      }
    });
    this.generalForm
      .get('isSelfOrFamilyMember')
      ?.valueChanges.subscribe((x) => {
        if (x && (x == 'DEPENDENT' || x == 'BOTH')) {
          this.generalForm.get('familyMemberCategorysList')?.patchValue(null);
          this.generalForm
            .get('familyMemberCategorysList')
            ?.addValidators([Validators.required]);
          this.generalForm.get('familyMemberEducationList')?.patchValue(null);
          this.generalForm
            .get('familyMemberEducationList')
            ?.addValidators([Validators.required]);
        } else {
          this.generalForm.get('familyMemberCategorysList')?.patchValue(null);
          this.generalForm
            .get('familyMemberCategorysList')
            ?.removeValidators([Validators.required]);
          this.generalForm
            .get('familyMemberCategorysList')
            ?.updateValueAndValidity();
          this.generalForm.get('familyMemberEducationList')?.patchValue(null);
          this.generalForm
            .get('familyMemberEducationList')
            ?.removeValidators([Validators.required]);
          this.generalForm
            .get('familyMemberEducationList')
            ?.updateValueAndValidity();
        }
        this.generalForm.updateValueAndValidity();
      });
    this.generalForm.get('communityList')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .Configuration_GetSelectByParentConfigurationIds(x)
          .subscribe((x) => {
            this.dropdown.castes = x.data;
          });
      } else {
        this.dropdown.castes = [];
      }
    });
  }
  submit() {
    this.schemeConfigService
      .Config_Scheme_SaveUpdate({
        schemeId: this.schemeId,
        isActive: this.generalForm.get('isActive')?.value,
        callLetterStatusIdsList: this.generalForm.get('callLetterStatusIdsList')
          ?.value,
        docRequiredStatusIdsList: ['f'],
        religionsList: this.generalForm.get('religionsList')?.value,
        communityList: this.generalForm.get('communityList')?.value,
        gendersList: this.generalForm.get('gendersList')?.value,
        districtsList: this.generalForm.get('districtsList')?.value,
        familyMemberCategorysList: this.generalForm.get(
          'familyMemberCategorysList'
        )?.value,
        isSelfOrFamilyMember: this.generalForm.get('isSelfOrFamilyMember')
          ?.value,
        isAlreadyAvailed: this.generalForm.get('isAlreadyAvailed')?.value,
        minimumAge: this.generalForm.get('minimumAge')?.value,
        maximumAge: this.generalForm.get('maximumAge')?.value,
        fromDate: moment(this.generalForm.get('fromDate')?.value).format(
          'YYYY-MM-DD'
        ),
        toDate: moment(this.generalForm.get('toDate')?.value).format(
          'YYYY-MM-DD'
        ),
        casteList: this.generalForm.get('casteList')?.value,
        callLetterStatusId: '',
        callLetterStatusNames: '',
        callLetterStatusNamesList: [],
        docRequiredStatusId: '',
        docRequiredStatusListNames: '',
        docRequiredStatusNamesList: [],
        religions: '',
        religionsListNames: '',
        religionsNamesList: [],
        community: '',
        communityListNames: '',
        communityNamesList: [],
        caste: '',
        casteListNames: '',
        casteNamesList: [],
        genders: '',
        gendersListNames: '',
        gendersNamesList: [],
        districts: '',
        districtsListNames: '',
        districtsNamesList: [],
        familyMemberCategorys: '',
        familyMemberCategorysListNames: '',
        familyMemberCategorysNamesList: [],
        fromDateString: '',
        toDateString: '',
        documents: null,
        schemeName: '',
        isSingleCategorySelect: this.generalForm.get('isSingleCategorySelect')
          ?.value,
        description: this.generalForm.get('description')?.value,
        showBankFields: this.generalForm.get('showBankFields')?.value,
        showAdditionalFields: this.generalForm.get('showAdditionalFields')
          ?.value,
        schemeNameTamil: '',
        schemeNameEnglish: '',
        sortOrder: 0,
        memberEducationList: this.generalForm.get('memberEducationList')?.value,
        memberEducation: '',
        memberEducationListNames: '',
        memberEducationNamesList: null,
        familyMemberEducationList: this.generalForm.get(
          'familyMemberEducationList'
        )?.value,
        familyMemberEducation: '',
        familyMemberEducationListNames: '',
        familyMemberEducationNamesList: null,
        maritalStatusList: this.generalForm.get('maritalStatusList')?.value,
        maritalStatus: '',
        maritalStatusListNames: '',
        maritalStatusNamesList: null,
        organizationTypeList: this.generalForm.get('organizationTypeList')
          ?.value,
        organizationType: '',
        organizationTypeListNames: '',
        organizationTypeNamesList: null,
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
            detail: x?.message,
          });
        }
      });
  }
}
