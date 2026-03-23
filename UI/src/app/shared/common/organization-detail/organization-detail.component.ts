import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  OrganizationDetailFormModel,
  OrganizationDetailModel,
} from 'src/app/_models/MemberDetailsModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { triggerValueChangesForAll } from '../../commonFunctions';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { UserService } from 'src/app/services/user.service';
import { Guid } from 'guid-typescript';
import { TCModel } from 'src/app/_models/user/usermodel';

@Component({
  selector: 'app-organization-detail',
  templateUrl: './organization-detail.component.html',
  styleUrls: ['./organization-detail.component.scss'],
})
export class OrganizationDetailComponent {
  organizationForm!: FormGroup;
  @Input() orgDetail?: OrganizationDetailModel;
  @Input() member_Id: string = '';
  @Input() formDetail?: OrganizationDetailFormModel;
  @Output() formSaved = new EventEmitter<Number>();
  @Input() isReadonly: boolean = true;
  @Input() showNextButton: boolean = true;
  @Output() typeOfWorkChanged = new EventEmitter<boolean>();
  @Output() formDataChange = new EventEmitter<any>();
  @Output() workOfficeChange = new EventEmitter<boolean>();

  hideAadhaar = false;
  isRestoring = false;
  get localbodyValue() {
    return this.organizationForm.get('local_Body')?.value;
  }
  get nameoflocalbodyValue() {
    return this.organizationForm.get('name_of_Local_Body')?.value;
  }
  get workoffice(): boolean {
    const value = this.organizationForm.get('work_Office')?.value;
    const list = this.formDetail?.work_Office_SelectList;

    if (!value || !list) return false;

    const type = list.find((x) => x.value === value);

    return type?.text?.toLowerCase().includes('others') ?? false;
  }
  get IsPrivateOrg() {
    if (
      !this.formDetail?.organization_Type_SelectList ||
      !this.organizationForm.get('organization_Type')?.value
    ) {
      return false;
    }

    const selectedType = this.formDetail.organization_Type_SelectList.find(
      (x) => x.value === this.organizationForm.get('organization_Type')?.value,
    );

    return selectedType?.text === 'Private / தனியார்';
  }
  get IsCoreSanitoryworkkerOrg() {
    if (
      this.formDetail &&
      this.formDetail.type_of_Work_SelectList &&
      this.organizationForm.get('type_of_Work')?.value
    ) {
      var type = this.formDetail.type_of_Work_SelectList.find(
        (x) => x.value == this.organizationForm.get('type_of_Work')?.value,
      );
      return type && type.text.includes('Core Sanitary Workers');
    }
    return false;
  }
  // Updated By Sivasankar K on 14/01/2026 for Health Worker
  get IshealthworkkersOrg() {
    if (
      this.formDetail &&
      this.formDetail.type_of_Work_SelectList &&
      this.organizationForm.get('type_of_Work')?.value
    ) {
      var type = this.formDetail.type_of_Work_SelectList.find(
        (x) => x.value == this.organizationForm.get('type_of_Work')?.value,
      );
      return type && type.text.includes('Health Workers');
    }
    return false;
  }
  originalfileds: TCModel[] | undefined = [];
  constructor(
    private messageService: MessageService,
    private generalService: GeneralService,
    private memberService: MemberService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}
  ngOnInit() {
    this.originalfileds = this.formDetail?.name_of_Local_Body_SelectList;
    this.organizationForm = new FormGroup({
      id: new FormControl(Guid.raw().toString()),
      member_Id: new FormControl(this.member_Id), // TODO
      type_of_Work: new FormControl(null, [Validators.required]),
      core_Sanitary_Worker_Type: new FormControl(null),
      health_Worker_Type: new FormControl(null),
      organization_Type: new FormControl(null, [Validators.required]),
      district_Id: new FormControl(null, [Validators.required]),
      nature_of_Job: new FormControl(null, Validators.required),
      local_Body: new FormControl(null, [Validators.required]),
      name_of_Local_Body: new FormControl(null),
      zone: new FormControl(null),
      block: new FormControl(null),
      corporation: new FormControl(null),
      municipality: new FormControl(null),
      town_Panchayat: new FormControl(null),
      village_Panchayat: new FormControl(null),
      organisation_Name: new FormControl(null, [
        Validators.minLength(3),
        Validators.maxLength(500),
      ]),
      health_Id: new FormControl(null, [
        Validators.minLength(3),
        Validators.maxLength(75),
      ]),
      new_Yellow_Card_Number: new FormControl(null, [
        Validators.minLength(3),
        Validators.maxLength(75),
      ]),
      address: new FormControl(null, [
        Validators.minLength(3),
        Validators.maxLength(500),
      ]),
      designation: new FormControl(null, [
        Validators.minLength(3),
        Validators.maxLength(500),
      ]),

      private_Address: new FormControl(null, []),

      private_Designation: new FormControl(null, []),
      private_Organisation_Name: new FormControl(null, []),
      mP_Constituency: new FormControl(null, [Validators.required]),
      mLA_Constituency: new FormControl(null, [Validators.required]),
      employer_Type: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(500),
      ]),
      work_Office: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(500),
      ]),
      work_Office_Others: new FormControl(null, [
        Validators.minLength(3),
        Validators.maxLength(500),
      ]),
    });

    this.organizationForm.get('district_Id')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .General_Configuration_GetAreaList_ByDistrict(x)
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.local_Body_SelectList = x.data;
            }
          });
        this.generalService
          .Application_NameOfTheLocalBody_Select_Get(this.member_Id, x)
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.name_of_Local_Body_SelectList = x.data;
            }
          });
      } else {
        if (this.formDetail) {
          this.formDetail.local_Body_SelectList = x.data;
        }
      }
    });
    this.organizationForm
      .get('district_Id')
      ?.valueChanges.subscribe((districtId) => {
        if (districtId) {
          // this.organizationForm.patchValue({
          //   mP_Constituency: null,
          //   mLA_Constituency: null
          // });

          this.generalService
            .Get_Configration_MLA_MP(districtId, 'MP')
            .subscribe((res) => {
              if (this.formDetail) {
                this.formDetail.mp_SelectList = res.data;
              }
            });

          // 🔥 MLA Load
          this.generalService
            .Get_Configration_MLA_MP(districtId, 'MLA')
            .subscribe((res) => {
              if (this.formDetail) {
                this.formDetail.mla_SelectList = res.data;
              }
            });
        } else {
          if (this.formDetail) {
            this.formDetail.mp_SelectList = [];
            this.formDetail.mla_SelectList = [];
          }
        }
      });
    this.organizationForm.get('local_Body')?.valueChanges.subscribe((x) => {
      if (x && x == 'URBAN') {
        this.organizationForm.get('block')?.clearValidators();
        this.organizationForm.get('block')?.patchValue(null);
        this.organizationForm.get('village_Panchayat')?.clearValidators();
        this.organizationForm.get('village_Panchayat')?.patchValue(null);
        if (this.formDetail) {
          this.formDetail.block_SelectList = [];
        }
      } else if (
        x &&
        x == 'RURAL' &&
        this.organizationForm.get('district_Id')?.value &&
        this.organizationForm.get('district_Id')?.value != ''
      ) {
        this.organizationForm.get('corporation')?.clearValidators();
        this.organizationForm.get('corporation')?.patchValue(null);
        this.organizationForm.get('town_Panchayat')?.clearValidators();
        this.organizationForm.get('town_Panchayat')?.patchValue(null);
        this.organizationForm.get('municipality')?.clearValidators();
        this.organizationForm.get('municipality')?.patchValue(null);
        this.organizationForm.get('zone')?.clearValidators();
        this.organizationForm.get('zone')?.patchValue(null);

        this.organizationForm.get('name_of_Local_Body')?.clearValidators();
        this.organizationForm.get('name_of_Local_Body')?.patchValue(null);

        this.organizationForm.get('block')?.addValidators(Validators.required);
        this.organizationForm
          .get('village_Panchayat')
          ?.addValidators(Validators.required);
        this.organizationForm.updateValueAndValidity();
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.organizationForm.get('district_Id')?.value,
            CategoryCode: 'BLOCK',
          })
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.block_SelectList = x.data;
            }
          });
      } else {
        if (this.formDetail) {
          this.formDetail.block_SelectList = [];
        }
      }
    });

    this.organizationForm.get('type_of_Work')?.valueChanges.subscribe((x) => {
      if (x) {
        console.log('Type of Work changed to:', x);
        this.onTypeOfWorkChange(x);
        var type = this.formDetail?.type_of_Work_SelectList?.find(
          (x) => x.value == this.organizationForm.get('type_of_Work')?.value,
        );
        console.log('Matched type:', type?.text);
        if (type && type.text.includes('Core Sanitary Workers')) {
          this.organizationForm
            .get('core_Sanitary_Worker_Type')
            ?.addValidators(Validators.required);
          this.organizationForm.updateValueAndValidity();
        } else {
          this.organizationForm
            .get('core_Sanitary_Worker_Type')
            ?.clearValidators();
          this.organizationForm
            .get('core_Sanitary_Worker_Type')
            ?.patchValue(null);
        }
      }
    });
    this.organizationForm.get('type_of_Work')?.valueChanges.subscribe((x) => {
      if (x) {
        console.log('Type of Work changed to:', x);
        this.onTypeOfWorkChange(x);
        var type = this.formDetail?.type_of_Work_SelectList?.find(
          (x) => x.value == this.organizationForm.get('type_of_Work')?.value,
        );
        console.log('Matched type:', type?.text);
        if (type && type.text.includes('Health Workers')) {
          this.organizationForm
            .get('health_Worker_Type')
            ?.addValidators(Validators.required);
          this.organizationForm.updateValueAndValidity();
        } else {
          this.organizationForm.get('health_Worker_Type')?.clearValidators();
          this.organizationForm.get('health_Worker_Type')?.patchValue(null);
        }
      }
    });

    // this.organizationForm
    //   .get('organization_Type')
    //   ?.valueChanges.subscribe((x) => {
    //     if (x) {
    //       var type = this.formDetail?.organization_Type_SelectList?.find(
    //         (x) =>
    //           x.value == this.organizationForm.get('organization_Type')?.value
    //       );
    //       if (type && type.text == 'Private / தனியார்') {

    //         this.organizationForm
    //           .get('private_Organisation_Name')
    //           ?.addValidators(Validators.required);
    //         this.organizationForm
    //           .get('private_Designation')
    //           ?.addValidators(Validators.required);
    //         this.organizationForm
    //           .get('private_Address')
    //           ?.addValidators(Validators.required);
    //         this.organizationForm.updateValueAndValidity();
    //       }
    //     } else {
    //       this.organizationForm
    //         .get('private_Organisation_Name')
    //         ?.patchValue(null);
    //       this.organizationForm.get('private_Designation')?.patchValue(null);
    //       this.organizationForm.get('private_Address')?.patchValue(null);
    //       this.organizationForm
    //         .get('private_Organisation_Name')
    //         ?.clearValidators();
    //       this.organizationForm.get('private_Designation')?.clearValidators();
    //       this.organizationForm.get('private_Address')?.clearValidators();
    //       this.organizationForm.get('organisation_Name')?.patchValue(null);
    //       this.organizationForm.get('designation')?.patchValue(null);
    //       this.organizationForm.get('address')?.patchValue(null);
    //       this.organizationForm.get('organisation_Name')?.clearValidators();
    //       this.organizationForm.get('designation')?.clearValidators();
    //       this.organizationForm.get('address')?.clearValidators();
    //     }
    //   });

this.organizationForm
  .get('organization_Type')
  ?.valueChanges.subscribe((value) => {
    console.log('organization_Type valueChanges fired:', value);
    console.trace();
    this.handleOrganizationType(value);
  });
    this.organizationForm
      .get('work_Office')
      ?.valueChanges.subscribe((value) => {
        const others = this.organizationForm.get('work_Office_Others');

        const type = this.formDetail?.work_Office_SelectList?.find(
          (x) => x.value === value,
        );

        const isOthers = type?.text?.toLowerCase().includes('others') ?? false;
        if (isOthers) {
          others?.setValidators([Validators.required]);
        } else {
          others?.clearValidators();
          others?.patchValue(null, { emitEvent: false });
        }

        others?.updateValueAndValidity();
      });
    this.organizationForm
      .get('work_Office')
      ?.valueChanges.subscribe((value) => {
        const selected = this.formDetail?.work_Office_SelectList?.find(
          (x) => x.value === value,
        );

        const isHouseMaid = selected?.text
          ?.toLowerCase()
          .includes('house maid');

        this.workOfficeChange.emit(isHouseMaid);
      });

    this.organizationForm.get('block')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.organizationForm.get('block')?.value,
            CategoryCode: 'VILLAGEPANCHAYAT',
          })
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.village_Panchayat_SelectList = x.data;
            }
          });
      }
    });
    this.organizationForm
      .get('name_of_Local_Body')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'MUNICIPALITY') {
          this.organizationForm.get('corporation')?.clearValidators();
          this.organizationForm.get('corporation')?.patchValue(null);
          this.organizationForm.get('town_Panchayat')?.clearValidators();
          this.organizationForm.get('town_Panchayat')?.patchValue(null);
          this.organizationForm.get('zone')?.clearValidators();
          this.organizationForm.get('zone')?.patchValue(null);
          this.organizationForm.updateValueAndValidity();
          if (
            this.organizationForm.get('district_Id')?.value &&
            this.organizationForm.get('district_Id')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.organizationForm.get('district_Id')?.value,
                CategoryCode: 'MUNICIPALITY',
              })
              .subscribe((x) => {
                if (this.formDetail) {
                  this.formDetail.municipality_SelectList = x.data;

                  this.organizationForm
                    .get('municipality')
                    ?.addValidators(Validators.required);
                  this.organizationForm.updateValueAndValidity();
                }
              });
          }
        } else if (x && x == 'CORPORATION') {
          this.organizationForm.get('municipality')?.clearValidators();
          this.organizationForm.get('municipality')?.patchValue(null);
          this.organizationForm.get('town_Panchayat')?.clearValidators();
          this.organizationForm.get('town_Panchayat')?.patchValue(null);
          this.organizationForm.get('zone')?.clearValidators();
          this.organizationForm.get('zone')?.patchValue(null);
          this.organizationForm.updateValueAndValidity();
          if (
            this.organizationForm.get('district_Id')?.value &&
            this.organizationForm.get('district_Id')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.organizationForm.get('district_Id')?.value,
                CategoryCode: 'CORPORATION',
              })
              .subscribe((x) => {
                if (this.formDetail) {
                  this.formDetail.corporation_SelectList = x.data;
                  this.organizationForm
                    .get('corporation')
                    ?.addValidators(Validators.required);
                  this.organizationForm.updateValueAndValidity();
                }
                this.cdr.detectChanges();
                this.cdr.markForCheck();
              });
          }
        } else if (x && x == 'TOWNPANCHAYAT') {
          this.organizationForm.get('corporation')?.clearValidators();
          this.organizationForm.get('corporation')?.patchValue(null);
          this.organizationForm.get('municipality')?.clearValidators();
          this.organizationForm.get('municipality')?.patchValue(null);
          this.organizationForm.get('zone')?.clearValidators();
          this.organizationForm.get('zone')?.patchValue(null);
          this.organizationForm.updateValueAndValidity();
          if (
            this.organizationForm.get('district_Id')?.value &&
            this.organizationForm.get('district_Id')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.organizationForm.get('district_Id')?.value,
                CategoryCode: 'TOWNPANCHAYAT',
              })
              .subscribe((x) => {
                if (this.formDetail) {
                  this.formDetail.town_Panchayat_SelectList = x.data;
                  this.organizationForm
                    .get('town_Panchayat')
                    ?.addValidators(Validators.required);
                  this.organizationForm.updateValueAndValidity();
                }
              });
          }
        } else if (x && x != '') {
          this.organizationForm.get('corporation')?.clearValidators();
          this.organizationForm.get('corporation')?.patchValue(null);
          this.organizationForm.get('municipality')?.clearValidators();
          this.organizationForm.get('municipality')?.patchValue(null);
          this.organizationForm.get('town_Panchayat')?.clearValidators();
          this.organizationForm.get('town_Panchayat')?.patchValue(null);
          this.organizationForm.get('zone')?.addValidators(Validators.required);
          this.organizationForm.updateValueAndValidity();
          this.organizationForm.updateValueAndValidity();
        }
      });
    if (this.orgDetail && this.organizationForm) {
      this.setOrgDetail();
    }

    // this.organizationForm.valueChanges.subscribe(value => {
    //   this.formDataChange.emit(value);
    // });
    this.isRestoring = true;

    // ✅ Wait till form fully ready
    setTimeout(() => {
      this.restoreOrganizationForm();
    });

    this.organizationForm.valueChanges.subscribe((value) => {
      if (!this.isRestoring) {
        sessionStorage.setItem('organizationFormData', JSON.stringify(value));
      }

      this.formDataChange.emit({
        value: this.organizationForm.getRawValue(),
        valid: this.organizationForm.valid,
      });
    });
    if (this.formDetail?.type_of_Work_SelectList?.length) {
      this.patchWorkTypeFromStorage();
    }

    if (this.hasFormCreatePrivilege()) {
      this.loadUserLocalBodyDetails();
    }
  }
  restoreOrganizationForm() {
    const saved = sessionStorage.getItem('organizationFormData');

    if (saved) {
      const data = JSON.parse(saved);

      this.organizationForm.patchValue(data, { emitEvent: true });

      console.log('Restored Data:', data); // debug
    }


    this.isRestoring = false;
  }

  onTypeOfWorkChange(value: any) {
    const selectedType = this.formDetail?.type_of_Work_SelectList?.find(
      (x) => x.value === value,
    );

    const isRagPicker = selectedType?.text?.includes('Rag Pickers') ?? false;

    console.log('Type of Work changed to:', value);
    console.log('Matched type:', selectedType?.text);
    console.log('Is Rag Picker:', isRagPicker);

    this.typeOfWorkChanged.emit(isRagPicker);
  }
  markAllAsTouched() {
    this.organizationForm.markAllAsTouched();
  }
  ngOnChanges() {
    if (this.orgDetail && this.organizationForm) {
      this.setOrgDetail();
    }
    if (this.formDetail && this.organizationForm) {
      this.originalfileds = this.formDetail.name_of_Local_Body_SelectList;
    }
    if (this.formDetail?.type_of_Work_SelectList?.length) {
      this.patchWorkTypeFromStorage();
    }
  }
  isInvalid(controlName: string): boolean {
    const control = this.organizationForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
  private patchWorkTypeFromStorage() {
    const saved = localStorage.getItem('selectedWorkType');

    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (!parsed?.value) return;

    // Wait until dropdown list is available
    if (this.formDetail?.type_of_Work_SelectList?.length) {
      this.organizationForm.patchValue({
        type_of_Work: parsed.value,
      });

      console.log('Work type patched:', parsed.value);
    } else {
      console.log('Work type list not loaded yet');
    }
  }
  setOrgDetail() {
    if (this.orgDetail) {
      this.organizationForm.get('id')?.patchValue(this.orgDetail.id);
      this.organizationForm.get('member_Id')?.patchValue(this.member_Id);
      this.organizationForm
        .get('type_of_Work')
        ?.patchValue(this.orgDetail.type_of_Work, {
          onlySelf: false,
          emitEvent: false,
        });
      this.onTypeOfWorkChange(this.orgDetail.type_of_Work);
      this.organizationForm
        .get('core_Sanitary_Worker_Type')
        ?.patchValue(this.orgDetail.core_Sanitary_Worker_Type, {
          onlySelf: false,
          emitEvent: false,
        });

      this.organizationForm
        .get('health_Worker_Type')
        ?.patchValue(this.orgDetail.health_Worker_Type, {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('organization_Type')
        ?.patchValue(this.orgDetail.organization_Type, {
             onlySelf: false,
          emitEvent: false
        });
        this.handleOrganizationType(this.orgDetail.organization_Type);
      this.organizationForm
        .get('employer_Type')
        ?.patchValue(this.orgDetail.employer_Type, {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('work_Office')
        ?.patchValue(this.orgDetail.work_office, {
          onlySelf: false,
          emitEvent: true,
        });
      this.organizationForm
        .get('work_Office_Others')
        ?.patchValue(this.orgDetail.work_Office_Others, {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('mP_Constituency')
        ?.patchValue(this.orgDetail.mP_Constituency, {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('mLA_Constituency')
        ?.patchValue(this.orgDetail.mlA_Constituency, {
          onlySelf: false,
          emitEvent: false,
        });

      this.organizationForm
        .get('district_Id')
        ?.patchValue(this.orgDetail.district_Id, {
          onlySelf: false,
          emitEvent: true,
        });
      this.organizationForm
        .get('nature_of_Job')
        ?.patchValue(this.orgDetail.nature_of_Job);
      this.organizationForm
        .get('local_Body')
        ?.patchValue(this.orgDetail.local_Body?.toUpperCase(), {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('name_of_Local_Body')
        ?.patchValue(
          this.orgDetail.name_of_Local_Body?.replace(/\s+/g, '').toUpperCase(),
          { onlySelf: false, emitEvent: false },
        );
      this.organizationForm.get('zone')?.patchValue(this.orgDetail.zone, {
        onlySelf: false,
        emitEvent: false,
      });
      this.organizationForm.get('block')?.patchValue(this.orgDetail.block, {
        onlySelf: false,
        emitEvent: false,
      });
      // Try matching by text first
      const corpMatchByText = this.formDetail?.corporation_SelectList?.find(
        (c) => {
          const apiCorporationText = this.orgDetail?.corporationString
            ?.trim()
            .split('/')[0]
            ?.trim();
          return apiCorporationText
            ? c.text.includes(apiCorporationText)
            : false;
        },
      );

      // If no text match, try matching by the API's GUID value
      const corpMatchByValue = this.formDetail?.corporation_SelectList?.find(
        (c) => c.value === this.orgDetail?.corporation,
      );

    
      const corpId = corpMatchByText?.value || corpMatchByValue?.value || null;

      if (corpId) {
        this.organizationForm.get('corporation')?.patchValue(corpId);
        console.log('Patched corporation value:', corpId);
      } else {
        console.warn('Could not find matching corporation in select list');
        console.warn('API corporation:', this.orgDetail?.corporation);
        console.warn(
          'API corporationString:',
          this.orgDetail?.corporationString,
        );
        console.warn(
          'Available options:',
          this.formDetail?.corporation_SelectList,
        );
      }
      this.organizationForm
        .get('municipality')
        ?.patchValue(this.orgDetail.municipality, {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('town_Panchayat')
        ?.patchValue(this.orgDetail.town_Panchayat, {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('village_Panchayat')
        ?.patchValue(this.orgDetail.village_Panchayat, {
          onlySelf: false,
          emitEvent: false,
        });
      this.organizationForm
        .get('organisation_Name')
        ?.patchValue(this.orgDetail.organisation_Name);
      this.organizationForm.get('address')?.patchValue(this.orgDetail.address);
      const matchedVillage =
        this.formDetail?.village_Panchayat_SelectList?.find(
          (x) =>
            x?.text &&
            this.orgDetail?.village_Panchayat &&
            x.text.trim().toUpperCase() ===
              this.orgDetail.village_Panchayat.trim().toUpperCase(),
        );

      if (matchedVillage) {
        this.organizationForm
          .get('village_Panchayat')
          ?.patchValue(matchedVillage.value);
      }

      this.organizationForm
        .get('health_Id')
        ?.patchValue(this.orgDetail.health_Id);
      this.organizationForm
        .get('new_Yellow_Card_Number')
        ?.patchValue(this.orgDetail.new_Yellow_Card_Number);
      this.organizationForm
        .get('designation')
        ?.patchValue(this.orgDetail.designation);
      this.organizationForm
        .get('private_Organisation_Name')
        ?.patchValue(this.orgDetail.private_Organisation_Name);
      this.organizationForm
        .get('private_Designation')
        ?.patchValue(this.orgDetail.private_Designation);
      this.organizationForm
        .get('private_Address')
        ?.patchValue(this.orgDetail.private_Address);

      var dis = this.formDetail?.district_SelectList?.find(
        (y) => y.value == this.orgDetail?.district_Id,
      );

      console.log('Corporation from API:', this.orgDetail.corporation);
      console.log(
        'Corporation options:',
        this.formDetail?.corporation_SelectList,
      );

      if (
        dis &&
        this.formDetail &&
        this.originalfileds &&
        this.originalfileds.length > 0 &&
        dis?.text.includes('Chennai')
      ) {
        this.formDetail.name_of_Local_Body_SelectList =
          this.originalfileds.filter(
            (x) => x.value == 'CMWS' || x.value == 'GCC',
          ) ?? [];
      } else if (
        dis &&
        this.formDetail &&
        this.originalfileds &&
        this.originalfileds.length > 0
      ) {
        this.formDetail.name_of_Local_Body_SelectList =
          this.originalfileds.filter(
            (x) => x.value != 'CMWS' && x.value != 'GCC',
          ) ?? [];
      }
      // At the very end of setOrgDetail(), after all patches:

var currentValue = this.orgDetail.organization_Type;

var govtType = this.formDetail?.organization_Type_SelectList?.find(
  (x) => x.text.toLowerCase().includes('government')
);
var privateType = this.formDetail?.organization_Type_SelectList?.find(
  (x) => x.text.toLowerCase().includes('private')
);

if (currentValue === govtType?.value) {
  this.organizationForm.get('organization_Type')?.patchValue(privateType?.value, { emitEvent: true });
  setTimeout(() => {
    this.organizationForm.get('organization_Type')?.patchValue(govtType?.value, { emitEvent: true });
  });
}
    }
  }

//   handleOrganizationType(value: any) {

//   const type = this.formDetail?.organization_Type_SelectList?.find(
//     (x) => x.value === value
//   );

//   const privateName = this.organizationForm.get('private_Organisation_Name');
//   const privateDesignation = this.organizationForm.get('private_Designation');
//   const privateAddress = this.organizationForm.get('private_Address');


//   const isPrivate =
//     type?.text?.toLowerCase().includes('private') ?? false;

//   if (isPrivate) {
//     privateName?.enable({ emitEvent: false });
//     privateDesignation?.enable({ emitEvent: false });
//     privateAddress?.enable({ emitEvent: false });

//     privateName?.setValidators([Validators.required]);
//     privateDesignation?.setValidators([Validators.required]);
//     privateAddress?.setValidators([Validators.required]);
//   } else {
//     privateName?.clearValidators();
//     privateDesignation?.clearValidators();
//     privateAddress?.clearValidators();
   
//     privateName?.reset(null, { emitEvent: false });
//     privateDesignation?.reset(null, { emitEvent: false });
//     privateAddress?.reset(null, { emitEvent: false });

//     privateName?.disable({ emitEvent: false });
//     privateDesignation?.disable({ emitEvent: false });
//     privateAddress?.disable({ emitEvent: false });
//   }

//   privateName?.updateValueAndValidity();
//   privateDesignation?.updateValueAndValidity();
//   privateAddress?.updateValueAndValidity();
// }
handleOrganizationType(value: any) {
  console.log('=== handleOrganizationType ===');
  console.log('value:', value);
  console.log('list:', this.formDetail?.organization_Type_SelectList?.length);
  console.trace();

  var list = this.formDetail?.organization_Type_SelectList;
  var isPrivate = false;

  if (list?.length) {
    var type = list.find((x) => x.value === value);
    isPrivate = !!value && (type?.text?.toLowerCase().includes('private') ?? false);
  }

  console.log('isPrivate:', isPrivate);

  if (isPrivate) {
    this.organizationForm.get('private_Organisation_Name')?.setValidators([Validators.required]);
    this.organizationForm.get('private_Designation')?.setValidators([Validators.required]);
    this.organizationForm.get('private_Address')?.setValidators([Validators.required]);
    this.organizationForm.get('private_Organisation_Name')?.updateValueAndValidity();
    this.organizationForm.get('private_Designation')?.updateValueAndValidity();
    this.organizationForm.get('private_Address')?.updateValueAndValidity();
  } else {
    this.organizationForm.get('private_Organisation_Name')?.clearValidators();
    this.organizationForm.get('private_Designation')?.clearValidators();
    this.organizationForm.get('private_Address')?.clearValidators();
    this.organizationForm.get('private_Organisation_Name')?.patchValue(null);
    this.organizationForm.get('private_Designation')?.patchValue(null);
    this.organizationForm.get('private_Address')?.patchValue(null);
    this.organizationForm.get('private_Organisation_Name')?.updateValueAndValidity();
    this.organizationForm.get('private_Designation')?.updateValueAndValidity();
    this.organizationForm.get('private_Address')?.updateValueAndValidity();
  }

  console.log('private_Organisation_Name status after:', this.organizationForm.get('private_Organisation_Name')?.status);
  console.log('private_Designation status after:', this.organizationForm.get('private_Designation')?.status);
  console.log('private_Address status after:', this.organizationForm.get('private_Address')?.status);
}
  save(isSave: boolean) {
    debugger;
    if (!this.organizationForm.valid && !isSave) {
      triggerValueChangesForAll(this.organizationForm);
      return;
    }

    if (this.organizationForm.get('local_Body')?.value == 'URBAN') {
      this.organizationForm.get('village_Panchayat')?.patchValue('');
      this.organizationForm.get('block')?.patchValue('');
    } else if (this.organizationForm.get('local_Body')?.value == 'RURAL') {
      this.organizationForm.get('name_of_Local_Body')?.patchValue('');
      this.organizationForm.get('corporation')?.patchValue('');
      this.organizationForm.get('municipality')?.patchValue('');
      this.organizationForm.get('town_Panchayat')?.patchValue('');
      this.organizationForm.get('zone')?.patchValue('');
    }

    const payload = this.organizationForm.getRawValue();
    console.log('Payload before adjustments:', payload);
    // ⭐ Adjust payload only
    if (
      payload.local_Body === 'URBAN' &&
      !this.organizationForm.get('block')?.disabled
    ) {
      payload.village_Panchayat = '';
      payload.block = '';
    }

    if (
      payload.local_Body === 'RURAL' &&
      !this.organizationForm.get('name_of_Local_Body')?.disabled
    ) {
      payload.name_of_Local_Body = '';
      payload.corporation = '';
      payload.municipality = '';
      payload.town_Panchayat = '';
      payload.zone = '';
    }

    if (!this.organizationForm.valid && isSave) {
      triggerValueChangesForAll(this.organizationForm);
      return;
    }
    console.log('Payload after adjustments:', payload);
    this.memberService
      .Organization_SaveUpdate({
        ...payload,
        already_a_Member_of_CWWB: false,
        isActive: true,
      })
      // this.memberService
      //   .Organization_SaveUpdate({
      //     id: this.organizationForm.get('id')?.value,
      //     member_Id: this.organizationForm.get('member_Id')?.value,
      //     type_of_Work: this.organizationForm.get('type_of_Work')?.value,
      //     core_Sanitary_Worker_Type: this.organizationForm.get(
      //       'core_Sanitary_Worker_Type',
      //     )?.value,
      //     health_Worker_Type:
      //       this.organizationForm.get('health_Worker_Type')?.value,
      //     organization_Type:
      //       this.organizationForm.get('organization_Type')?.value,
      //     district_Id: this.organizationForm.get('district_Id')?.value,
      //     nature_of_Job: this.organizationForm.get('nature_of_Job')?.value,
      //     local_Body: this.organizationForm.get('local_Body')?.value,
      //     name_of_Local_Body:
      //       this.organizationForm.get('name_of_Local_Body')?.value,
      //     zone: this.organizationForm.get('zone')?.value,
      //     block: this.organizationForm.get('block')?.value,
      //     village_Panchayat:
      //       this.organizationForm.get('village_Panchayat')?.value,
      //     corporation: this.organizationForm.get('corporation')?.value,
      //     municipality: this.organizationForm.get('municipality')?.value,
      //     town_Panchayat: this.organizationForm.get('town_Panchayat')?.value,

      //     organisation_Name:
      //       this.organizationForm.get('organisation_Name')?.value,
      //     designation: this.organizationForm.get('designation')?.value,
      //     address: this.organizationForm.get('address')?.value,
      //     new_Yellow_Card_Number: this.organizationForm.get(
      //       'new_Yellow_Card_Number',
      //     )?.value,
      //     health_Id: this.organizationForm.get('health_Id')?.value,
      //     // private_Organisation_Name: '',
      //     // private_Designation: '',
      //     // private_Address: '',
      //     already_a_Member_of_CWWB: false,
      //     isActive: true,
      //     private_Organisation_Name: this.organizationForm.get(
      //       'private_Organisation_Name',
      //     )?.value,
      //     private_Designation: this.organizationForm.get('private_Designation')
      //       ?.value,
      //     private_Address: this.organizationForm.get('private_Address')?.value,
      //   })
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
          this.MovetoNext();
        }
      });
  }

  isAadhaarDoc(doc: any): boolean {
    const cat = doc?.documentCategory?.toLowerCase?.() || '';
    return (
      cat.includes('aadhaar') || cat.includes('aadhar') || cat.includes('ஆதார்')
    );
  }

  overallsave() {
    debugger;
    if (!this.organizationForm.valid) {
      triggerValueChangesForAll(this.organizationForm);
      return null;
    }
    return {
      id: this.organizationForm.get('id')?.value,
      member_Id: this.organizationForm.get('member_Id')?.value,
      type_of_Work: this.organizationForm.get('type_of_Work')?.value,
      core_Sanitary_Worker_Type: this.organizationForm.get(
        'core_Sanitary_Worker_Type',
      )?.value,
      health_Worker_Type:
        this.organizationForm.get('health_Worker_Type')?.value,
      organization_Type: this.organizationForm.get('organization_Type')?.value,
      district_Id: this.organizationForm.get('district_Id')?.value,
      nature_of_Job: this.organizationForm.get('nature_of_Job')?.value,
      local_Body: this.organizationForm.get('local_Body')?.value,
      name_of_Local_Body:
        this.organizationForm.get('name_of_Local_Body')?.value,
      zone: this.organizationForm.get('zone')?.value,
      block: this.organizationForm.get('block')?.value,
      village_Panchayat: this.organizationForm.get('village_Panchayat')?.value,
      corporation: this.organizationForm.get('corporation')?.value,
      municipality: this.organizationForm.get('municipality')?.value,
      town_Panchayat: this.organizationForm.get('town_Panchayat')?.value,

      organisation_Name: this.organizationForm.get('organisation_Name')?.value,
      designation: this.organizationForm.get('designation')?.value,
      address: this.organizationForm.get('address')?.value,
      new_Yellow_Card_Number: this.organizationForm.get(
        'new_Yellow_Card_Number',
      )?.value,
      health_Id: this.organizationForm.get('health_Id')?.value,
      // private_Organisation_Name: '',
      // private_Designation: '',
      // private_Address: '',
      already_a_Member_of_CWWB: false,
      isActive: true,
      private_Address: this.organizationForm.get('private_Address')?.value,
      private_Designation: this.organizationForm.get('private_Designation')
        ?.value,
      private_Organisation_Name: this.organizationForm.get(
        'private_Organisation_Name',
      )?.value,
    };
  }
  MovetoNext() {
    this.formSaved.emit(1);
  }

  loadUserLocalBodyDetails() {
    if (!this.hasFormCreatePrivilege()) return;

    const userStr = sessionStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const userId = user?.userId;

    this.userService
      .User_Filter_DropdownswithUserId(userId)
      .subscribe((res) => {
        const data = res?.data;
        if (!data) return;

        // ⭐ Extract first values safely
        const districtId = data.districtSelectList?.[0]?.value ?? null;
        const localBody = data.localBodyIds?.[0]?.value ?? null;
        const nameOfLocalBody = data.nameOfLocalBodyIds?.[0]?.value ?? null;
        const zoneId = data.zoneIds?.[0]?.value ?? null;

        const block = data.blockIds?.[0]?.value ?? null;
        const corporation = data.corporationIds?.[0]?.value ?? null;
        const municipality = data.municipalityIds?.[0]?.value ?? null;
        const townPanchayat = data.townPanchayatIds?.[0]?.value ?? null;
        const villagePanchayat = data.villagePanchayatIds?.[0]?.value ?? null;

        // ⭐ Patch form
        this.organizationForm.patchValue({
          district_Id: districtId,
          local_Body: localBody,
          name_of_Local_Body: nameOfLocalBody,
          zone: zoneId,
          block,
          corporation,
          municipality,
          town_Panchayat: townPanchayat,
          village_Panchayat: villagePanchayat,
        });

        // ⭐ Disable fields
        this.disableLocalBodyFields();
      });
  }
  disableLocalBodyFields() {
    const fields = [
      'district_Id',
      'local_Body',
      'name_of_Local_Body',
      'block',
      'corporation',
      'municipality',
      'town_Panchayat',
      'village_Panchayat',
      'zone',
    ];

    fields.forEach((f) => {
      this.organizationForm.get(f)?.disable({ emitEvent: false });
    });
  }
  hasFormCreatePrivilege(): boolean {
    const user = sessionStorage.getItem('user');
    if (!user) return false;

    const parsed = JSON.parse(user);
    return parsed?.privillage?.includes('FORM_CREATE');
  }
}
