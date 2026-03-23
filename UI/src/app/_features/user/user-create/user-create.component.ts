import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { firstValueFrom, Subscription } from 'rxjs';
import {
  AccountUserFormDetailModel,
  AccountUserViewModel,
} from 'src/app/_models/AccountUserViewModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel, UserBankBranch } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { UserService } from 'src/app/services/user.service';
import {
  privileges,
  triggerValueChangesForAll,
} from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
})
export class UserCreateComponent {
  title: string = 'User Create';
  passTooltip: string = `Password Requirements:
                  - At least 8 characters long
                  - First letter must be uppercase
                  Example: P@ssw0rd123
                  `;
  userId!: string;
  userForm!: FormGroup;
  userDetails!: AccountUserViewModel | null;

  passwordPattern = /^[A-Z](?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{7,}$/;

  isNewForm: boolean = false;
  defaultDate = moment(new Date(1990, 1 - 1, 1)).toDate();

  routeSub!: Subscription;
  genders: TCModel[] = [];
  roles: TCModel[] = [];

  districts: TCModel[] = [];
  localbody: TCModel[] = [];
  nameoflocalbody: TCModel[] = [];

  schemes: TCModel[] = [];
  cardPrintStatusList: TCModel[] = [];
  banks: TCModel[] = [];
  branches: any[] = [];
  privleges = privileges;
  uploadedFiles: any[] = [];
  visible: boolean = false;
  branchForm!: FormGroup;
  member_Id!: string | '';
  localbodyValue: string = '';
  nameoflocalbodyValue: string = '';
  block_SelectList: TCModel[] = [];
  corporation_SelectList: TCModel[] = [];
  municipality_SelectList: TCModel[] = [];
  town_Panchayat_SelectList: TCModel[] = [];
  village_Panchayat_SelectList: TCModel[] = [];
  zone_SelectList: TCModel[] = [];
  localbodytrue!: boolean;
  nameoflocalbodytrue: boolean = false;

  get f() {
    return this.branchForm.controls;
  }
  get t() {
    return this.f['branchs'] as FormArray;
  }
  get branchList() {
    return this.t.controls as FormGroup[];
  }

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private generalService: GeneralService,
    private roleService: RoleService
  ) {}

  back() {
    this.router.navigate(['officers', 'user']);
  }
  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.userForm.reset();
  }

  ngOnInit() {
    this.userForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      firstName: new FormControl('', [
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(1),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(1),
      ]),
      dob: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      email: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
      district: new FormControl('', [Validators.required]),
      localbody: new FormControl('', [Validators.required]),
      nameoflocalbody: new FormControl('', [Validators.required]),
      block: new FormControl('', [Validators.required]),
      corporation: new FormControl('', [Validators.required]),
      municipality: new FormControl('', [Validators.required]),
      town_Panchayat: new FormControl('', [Validators.required]),
      village_Panchayat: new FormControl('', [Validators.required]),
      zone: new FormControl('', [Validators.required]),
      scheme: new FormControl('', [Validators.required]),
      cardPrintStatusIdList: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      telephone: new FormControl(''),
      banks: new FormControl(null),
      branches: new FormControl(null),
      userName: new FormControl(''),
      password: new FormControl('P@ssw0rd123', [
        Validators.required,
        Validators.minLength(8),
        //Validators.pattern(new RegExp('^(?=.*[A-Z])[A-Za-z0-9]+$')),
        Validators.pattern(new RegExp(this.passwordPattern)),
      ]),
      isActive: new FormControl(true),
    });

    this.branchForm = this.formBuilder.group({
      branchs: new FormArray([]),
    });
    this.userForm.controls['banks'].valueChanges.subscribe((x) => {
      this.changeBranch();
    });
    this.userForm.controls['district'].valueChanges.subscribe((x) => {
      this.changeBranch();
    });

    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.userId = params['id']; //log the value of id
        if (this.userId !== '0') {
          this.userService.GetUserbyId(this.userId).subscribe((x: any) => {
            if (x) {
              this.userDetails = x.data[0];
              this.cdr.detectChanges();
            } else {
              this.userDetails = null;
              this.userForm.reset();
              this.userForm.get('id')?.patchValue(Guid.raw());
            }

            this.userService
              .GetUserFormDD(this.userId == '0' ? '' : this.userId)
              .subscribe((x) => {
                var dds: AccountUserFormDetailModel = x.data;
                this.roles = dds.roleList;
                this.genders = dds.genderList;
                this.districts = dds.districtList;
                this.banks = dds.bankList;
                this.branches = dds.branchList;
                this.schemes = dds.schemeList;
                this.cardPrintStatusList = dds.cardPrintStatusList;
                this.updateData();
              });
          });
        } else {
          this.isNewForm = true;
          this.userService.GetUserbyId(Guid.raw()).subscribe((x: any) => {
            if (x) {
              this.userDetails = x.data[0];
              this.updateData();
              this.cdr.detectChanges();
            } else {
              this.userDetails = null;
              this.userForm.reset();
              this.userForm.get('id')?.patchValue(Guid.raw());
            }

            this.userService
              .GetUserFormDD(this.userId == '0' ? '' : this.userId)
              .subscribe((x) => {
                var dds: AccountUserFormDetailModel = x.data;
                this.roles = dds.roleList;
                this.genders = dds.genderList;
                this.districts = dds.districtList;
                this.banks = dds.bankList;
                this.branches = dds.branchList;
                this.schemes = dds.schemeList;
                this.cardPrintStatusList = dds.cardPrintStatusList;
                this.updateData();
              });
          });
        }
      });

    this.userForm.get('district')?.valueChanges.subscribe((x) => {
      this.localbody = [];
      this.nameoflocalbody = [];
      this.nameoflocalbodytrue = false;
      this.localbodyValue = '';
      this.nameoflocalbodyValue = '';

      this.userForm.get('localbody')?.reset(null);
      this.userForm.get('nameoflocalbody')?.reset(null);
      this.userForm.get('block')?.reset(null);
      this.userForm.get('corporation')?.reset(null);
      this.userForm.get('municipality')?.reset(null);
      this.userForm.get('village_Panchayat')?.reset(null);
      this.userForm.get('zone')?.reset(null);

      // ✅ Clear all dependent dropdowns
      this.clearDependentDropdowns();

      const roleid = this.userForm.get('role')?.value ?? '';
      const status = true;

      this.getRoleAndContinue(roleid, status);

      if (x) {
        this.generalService
          .General_Configuration_GetAreaList_ByDistrict(x)
          .subscribe((x) => {
            this.localbody = x.data;
          });
        this.generalService
          .Application_NameOfTheLocalBody_Select_Get(this.member_Id, x)
          .subscribe((x) => {
            this.nameoflocalbody = x.data;
          });
        this.nameoflocalbodytrue = true;
      } else {
        if (this.userForm) {
          this.localbody = x.data;
          this.nameoflocalbodytrue = true;
        }
      }
    });

    this.userForm.get('role')?.valueChanges.subscribe((x) => {
      const status = true;
      this.roleService.Role_Get(x, status).subscribe((x) => {
        if (x) {
          const isUrbanRural = x.data[0].isUrbanRural ?? null;
          if (isUrbanRural) {
            this.localbodytrue = true;
            this.localbodyValue = '';
            this.nameoflocalbodytrue = false;
            this.userForm.get('districts')?.reset(null);
            this.userForm.get('localbody')?.reset(null);
          } else {
            this.localbodytrue = false;
            this.nameoflocalbodytrue = false;
          }
        }
      });
    });

    this.userForm.get('localbody')?.valueChanges.subscribe((x) => {
      if (x && x == 'URBAN') {
        this.userForm.get('block')?.clearValidators();
        this.userForm.get('block')?.patchValue(null);
        this.userForm.get('village_Panchayat')?.clearValidators();
        this.userForm.get('village_Panchayat')?.patchValue(null);
        this.localbodyValue = x;

        this.nameoflocalbodyValue = '';
        this.userForm.get('nameoflocalbody')?.clearValidators();
        this.userForm.get('nameoflocalbody')?.updateValueAndValidity();
      } else if (
        x &&
        x == 'RURAL' &&
        this.userForm.get('district')?.value &&
        this.userForm.get('district')?.value != ''
      ) {
        this.userForm.get('corporation')?.clearValidators();
        this.userForm.get('corporation')?.patchValue(null);
        this.userForm.get('town_Panchayat')?.clearValidators();
        this.userForm.get('town_Panchayat')?.patchValue(null);
        this.userForm.get('municipality')?.clearValidators();
        this.userForm.get('municipality')?.patchValue(null);
        this.userForm.get('zone')?.clearValidators();
        this.userForm.get('zone')?.patchValue(null);

        this.userForm.get('block')?.addValidators(Validators.required);
        this.userForm
          .get('village_Panchayat')
          ?.addValidators(Validators.required);
        this.userForm
          .get('nameoflocalbody')
          ?.addValidators(Validators.required);
        this.userForm.updateValueAndValidity();
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.userForm.get('district')?.value,
            CategoryCode: 'BLOCK',
          })
          .subscribe((x) => {
            this.block_SelectList = x.data;
          });
        this.localbodyValue = x;
        this.nameoflocalbodyValue = '';
      } else {
        this.block_SelectList = [];
        this.localbodyValue = x;
        this.nameoflocalbodyValue = '';
        this.userForm.get('nameoflocalbody')?.clearValidators();
        this.userForm.get('nameoflocalbody')?.updateValueAndValidity();
      }
    });

    this.userForm.get('block')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.userForm.get('block')?.value,
            CategoryCode: 'VILLAGEPANCHAYAT',
          })
          .subscribe((x) => {
            this.village_Panchayat_SelectList = x.data;
          });
      }
    });

    this.userForm.get('nameoflocalbody')?.valueChanges.subscribe((x) => {
      if (x && x == 'MUNICIPALITY') {
        this.userForm.get('corporation')?.clearValidators();
        this.userForm.get('corporation')?.patchValue(null);
        this.userForm.get('town_Panchayat')?.clearValidators();
        this.userForm.get('town_Panchayat')?.patchValue(null);
        this.userForm.get('zone')?.clearValidators();
        this.userForm.get('zone')?.patchValue(null);
        this.userForm.updateValueAndValidity();
        if (
          this.userForm.get('district')?.value &&
          this.userForm.get('district')?.value != ''
        ) {
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId: this.userForm.get('district')?.value,
              CategoryCode: 'MUNICIPALITY',
            })
            .subscribe((x) => {
              this.nameoflocalbodyValue = 'MUNICIPALITY';
              this.municipality_SelectList = x.data;
              this.userForm
                .get('municipality')
                ?.addValidators(Validators.required);
              this.userForm.updateValueAndValidity();
            });
        }
      } else if (x && x == 'CORPORATION') {
        this.userForm.get('municipality')?.clearValidators();
        this.userForm.get('municipality')?.patchValue(null);
        this.userForm.get('town_Panchayat')?.clearValidators();
        this.userForm.get('town_Panchayat')?.patchValue(null);
        this.userForm.get('zone')?.clearValidators();
        this.userForm.get('zone')?.patchValue(null);
        this.userForm.updateValueAndValidity();
        if (
          this.userForm.get('district')?.value &&
          this.userForm.get('district')?.value != ''
        ) {
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId: this.userForm.get('district')?.value,
              CategoryCode: 'CORPORATION',
            })
            .subscribe((x) => {
              this.corporation_SelectList = x.data;
              this.userForm
                .get('corporation')
                ?.addValidators(Validators.required);
              this.userForm.updateValueAndValidity();
              this.nameoflocalbodyValue = 'CORPORATION';
              this.cdr.detectChanges();
              this.cdr.markForCheck();
            });
        }
      } else if (x && x == 'TOWNPANCHAYAT') {
        this.userForm.get('corporation')?.clearValidators();
        this.userForm.get('corporation')?.patchValue(null);
        this.userForm.get('municipality')?.clearValidators();
        this.userForm.get('municipality')?.patchValue(null);
        this.userForm.get('zone')?.clearValidators();
        this.userForm.get('zone')?.patchValue(null);
        this.userForm.updateValueAndValidity();
        if (
          this.userForm.get('district')?.value &&
          this.userForm.get('district')?.value != ''
        ) {
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId: this.userForm.get('district')?.value,
              CategoryCode: 'TOWNPANCHAYAT',
            })
            .subscribe((x) => {
              this.town_Panchayat_SelectList = x.data;
              this.userForm
                .get('town_Panchayat')
                ?.addValidators(Validators.required);
              this.userForm.updateValueAndValidity();
              this.nameoflocalbodyValue = 'TOWNPANCHAYAT';
            });
        }
      } else if (x && x != '') {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            CategoryCode: 'ZONE',
          })
          .subscribe((x) => {
            this.zone_SelectList = x.data;
          });

        this.userForm.get('corporation')?.clearValidators();
        this.userForm.get('corporation')?.patchValue(null);
        this.userForm.get('municipality')?.clearValidators();
        this.userForm.get('municipality')?.patchValue(null);
        this.userForm.get('town_Panchayat')?.clearValidators();
        this.userForm.get('town_Panchayat')?.patchValue(null);
        this.userForm.get('zone')?.addValidators(Validators.required);
        this.userForm.updateValueAndValidity();
        this.userForm.updateValueAndValidity();
        this.nameoflocalbodyValue = 'GCC/CMWS';
      }
    });
  }

  changeBranch() {
    let districtValue = this.userForm.get('district')?.value;
    const districtIds = Array.isArray(districtValue)
      ? districtValue
      : [districtValue];

    if (this.userForm.get('id')?.value) {
      this.userService
        .User_GetBranchByBanks({
          bankIds: this.userForm.get('banks')?.value,
          userId: this.userForm.get('id')?.value,
          districtIds: districtIds,
        })
        .subscribe((x) => {
          this.generateDefaultRows(x.data);
        });
    }
  }

  clearDependentDropdowns() {
    this.block_SelectList = [];
    this.town_Panchayat_SelectList = [];
    this.municipality_SelectList = [];
    this.corporation_SelectList = [];
    this.village_Panchayat_SelectList = [];
    this.zone_SelectList = [];

    this.userForm.patchValue(
      {
        block: null,
        town_Panchayat: null,
        municipality: null,
        corporation: null,
        village_Panchayat: null,
        zone: null,
      },
      { emitEvent: false }
    );
  }

  openbranchs() {
    this.visible = true;
  }

  setSelection() {}

  async updateData() {
    const roleid = this.userDetails?.roleId ?? '';
    const status = true;

    await this.getRoleAndContinue(roleid, status);

    // ✅ Patch all basic fields
    this.userForm.patchValue({
      id: this.userDetails?.userId ?? '',
      firstName: this.userDetails?.firstName ?? '',
      lastName: this.userDetails?.lastName ?? '',
      email: this.userDetails?.email ?? '',
      gender: this.userDetails?.genderId ?? '',
      mobile: this.userDetails?.mobile ?? '',
      isActive: this.userDetails?.isActive,
      dob: moment(this.userDetails?.dOB).toDate(),
      role: this.userDetails?.roleId ?? '',
      address: this.userDetails?.address ?? '',
      password: this.userDetails?.password ?? 'P@ssw0rd123',
      userName: this.userDetails?.email ?? '',
      telephone: this.userDetails?.telephone ?? '',
    });

    /* ✅ District handling (multiSelect expects array) */
    // const districtIds = this.userDetails?.districtIds ?? [];
    const districtIds = this.ensureArray(this.userDetails?.districtIdList);

    const districtArray = Array.isArray(districtIds)
      ? districtIds
      : districtIds
      ? [districtIds]
      : [];
    this.userForm
      .get('district')
      ?.patchValue(districtArray, { emitEvent: false });

    /* ✅ MultiSelects — Always ensure arrays */
    this.userForm
      .get('scheme')
      ?.patchValue(this.ensureArray(this.userDetails?.schemeIdList));
    this.userForm
      .get('banks')
      ?.patchValue(this.ensureArray(this.userDetails?.bankIdList), {
        emitEvent: false,
      });
    this.userForm
      .get('branches')
      ?.patchValue(this.ensureArray(this.userDetails?.branchIdList));
    this.userForm
      .get('cardPrintStatusIdList')
      ?.patchValue(this.ensureArray(this.userDetails?.cardPrintStatusIdList));

    /* ✅ Local Body */
    this.userForm
      .get('localbody')
      ?.patchValue(this.ensureArray(this.userDetails?.localBodyIdList), {
        emitEvent: false,
      });

    /* ✅ Name of Local Body */
    this.userForm
      .get('nameoflocalbody')
      ?.patchValue(this.ensureArray(this.userDetails?.nameOfLocalBodyIdList), {
        emitEvent: false,
      });

    /* ✅ Dropdowns (single values only) */
    this.userForm
      .get('block')
      ?.patchValue(this.userDetails?.blockIdList?.[0] ?? '', {
        emitEvent: false,
      });
    this.userForm
      .get('town_Panchayat')
      ?.patchValue(this.userDetails?.townPanchayatIdList?.[0] ?? '', {
        emitEvent: false,
      });
    this.userForm
      .get('municipality')
      ?.patchValue(this.userDetails?.municipalityIdList?.[0] ?? '', {
        emitEvent: false,
      });
    this.userForm
      .get('corporation')
      ?.patchValue(this.userDetails?.corporationIdList?.[0] ?? '', {
        emitEvent: false,
      });
    this.userForm
      .get('zone')
      ?.patchValue(this.userDetails?.zoneIdList?.[0] ?? '', {
        emitEvent: false,
      });
    this.userForm
      .get('village_Panchayat')
      ?.patchValue(this.userDetails?.villagePanchayatIdList?.[0] ?? '', {
        emitEvent: false,
      });

    // ✅ Load dropdowns after patch
    this.loadDropdownsForEdit();
  }

  /* ========================================================== */
  /*                   LOAD DROPDOWNS FOR EDIT                   */
  /* ========================================================== */

  loadDropdownsForEdit() {
    const district = this.userForm.get('district')?.value;

    if (district && district.length > 0) {
      // ✅ [NEW 1] Check user's role Urban/Rural flag before loading dropdowns
      const roleId =
        this.userForm.get('role')?.value || this.userDetails?.roleId;
      this.roleService.Role_Get(roleId, true).subscribe((res) => {
        const isUrbanRural = res?.data?.[0]?.isUrbanRural ?? false;

        // ✅ [NEW 2] Dynamically control visibility flags
        this.localbodytrue = isUrbanRural;
        this.nameoflocalbodytrue = isUrbanRural;

        if (isUrbanRural) {
          // ✅ [NEW 3] Load these only when applicable

          /* ============= 1️⃣ Local Body ============= */
          this.generalService
            .General_Configuration_GetAreaList_ByDistrict(district)
            .subscribe((res) => {
              this.localbody = Array.isArray(res.data) ? res.data : [];

              const selectedValues = this.ensureArray(
                this.userDetails?.localBodyIdList
              );

              this.localbody = this.localbody.map((item: any) => ({
                ...item,
                selected: selectedValues.includes(item.value),
              }));

              this.userForm.get('localbody')?.setValue(selectedValues);
            });

          /* ============= 2️⃣ Name Of Local Body ============= */
          this.generalService
            .Application_NameOfTheLocalBody_Select_Get(this.member_Id, district)
            .subscribe((res) => {
              this.nameoflocalbody = Array.isArray(res.data) ? res.data : [];

              const selectedNameOfLocalBody = this.ensureArray(
                this.userDetails?.nameOfLocalBodyIdList
              );

              this.nameoflocalbody = this.nameoflocalbody.map((item: any) => ({
                ...item,
                selected: selectedNameOfLocalBody.includes(item.value),
              }));

              this.userForm
                .get('nameoflocalbody')
                ?.setValue(selectedNameOfLocalBody);
              this.localbodyValue = this.userForm.get('nameoflocalbody')?.value;
            });
        }
      });

      /* ============= 3️⃣ BLOCK ============= */
      if (this.userDetails?.blockIdList?.length) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: district,
            CategoryCode: 'BLOCK',
          })
          .subscribe((res) => {
            this.block_SelectList = Array.isArray(res.data) ? res.data : [];
            this.userForm
              .get('block')
              ?.patchValue(this.userDetails?.blockIdList?.[0] ?? '');
          });
      }

      /* ============= 4️⃣ TOWN PANCHAYAT ============= */
      if (this.userDetails?.townPanchayatIdList?.length) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: district,
            CategoryCode: 'TOWNPANCHAYAT',
          })
          .subscribe((res) => {
            this.town_Panchayat_SelectList = Array.isArray(res.data)
              ? res.data
              : [];
            this.userForm
              .get('town_Panchayat')
              ?.patchValue(this.userDetails?.townPanchayatIdList?.[0] ?? '');
          });
      }

      /* ============= 5️⃣ MUNICIPALITY ============= */
      if (this.userDetails?.municipalityIdList?.length) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: district,
            CategoryCode: 'MUNICIPALITY',
          })
          .subscribe((res) => {
            this.municipality_SelectList = Array.isArray(res.data)
              ? res.data
              : [];
            this.userForm
              .get('municipality')
              ?.patchValue(this.userDetails?.municipalityIdList?.[0] ?? '');
          });
      }

      /* ============= 6️⃣ CORPORATION ============= */
      if (this.userDetails?.corporationIdList?.length) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: district,
            CategoryCode: 'CORPORATION',
          })
          .subscribe((res) => {
            this.corporation_SelectList = Array.isArray(res.data)
              ? res.data
              : [];
            this.userForm
              .get('corporation')
              ?.patchValue(this.userDetails?.corporationIdList?.[0] ?? '');
          });
      }

      /* ============= 7️⃣ VILLAGE PANCHAYAT ============= */
      if (this.userDetails?.villagePanchayatIdList?.length) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.userForm.get('block')?.value,
            CategoryCode: 'VILLAGEPANCHAYAT',
          })
          .subscribe((x) => {
            this.village_Panchayat_SelectList = Array.isArray(x.data)
              ? x.data
              : [];
          });
      }

      /* ============= 8️⃣ GCC (ZONE) ============= */
      const zoneIds: string[] = this.userDetails?.zoneIdList ?? [];
      if (zoneIds.length > 0) {
        this.nameoflocalbodyValue = 'GCC/CMWS';

        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            CategoryCode: 'ZONE',
          })
          .subscribe({
            next: (res) => {
              this.zone_SelectList = Array.isArray(res?.data) ? res.data : [];
              const validZoneValues = this.zone_SelectList
                .filter((z) => zoneIds.includes(z.value))
                .map((z) => z.value);

              this.userForm.get('zone')?.patchValue(validZoneValues);
            },
            error: (err) => console.error('Error fetching zone list:', err),
          });
      } else {
        console.warn('User zoneIdList is empty or undefined.');
      }
    }
  }

  /* ✅ Utility function (helper for all multiselects) */
  private ensureArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }

  //modified by Sivasankar on 10-11-2025 for user create validation issue

  async getRoleAndContinue(roleid: string, status: boolean) {
    try {
      const x = await firstValueFrom(this.roleService.Role_Get(roleid, status));

      if (x && x.data && x.data.length > 0) {
        const isUrbanRural = x.data[0].isUrbanRural ?? false;

        this.localbodytrue = isUrbanRural;
        this.nameoflocalbodytrue = isUrbanRural;

        const areaFields = [
          'localbody',
          'nameoflocalbody',
          'block',
          'corporation',
          'municipality',
          'town_Panchayat',
          'village_Panchayat',
          'zone',
        ];

        // Step 1️⃣: Clear all validators first
        areaFields.forEach((field) => {
          const ctrl = this.userForm.get(field);
          if (ctrl) {
            ctrl.clearValidators();
            ctrl.setErrors(null);
            ctrl.updateValueAndValidity({ emitEvent: false });
          }
        });

        // Step 2️⃣: If role has Urban/Rural → add required validators for main fields
        if (isUrbanRural) {
          this.userForm.get('localbody')?.setValidators([Validators.required]);
          this.userForm
            .get('nameoflocalbody')
            ?.setValidators([Validators.required]);
        }

        // Step 3️⃣: Update all at once
        this.userForm.updateValueAndValidity({ emitEvent: false });
        this.cdr.detectChanges();

        console.log(`Role_Get: isUrbanRural = ${isUrbanRural}`);
      }
    } catch (err) {
      console.error('Error in getRoleAndContinue:', err);
    }
  }

  isAllBranchchange(event: any, record: FormGroup) {
    if (!event.checked) {
      this.generalService
        .Branch_Dropdown_Get({
          bankIds: [record.controls['bankId'].value],
          districtIds: this.userForm.controls['district'].value,
        })
        .subscribe((c) => {
          record.controls['branchList'].patchValue(
            (c.data as TCModel[])[0].items
          );
        });
    }
  }

  //modified by Sivasankar on 10-11-2025 for user create validation issue

  async submit() {
    const roleId = this.userForm.get('role')?.value;
    const roleResponse = await firstValueFrom(
      this.roleService.Role_Get(roleId, true)
    );
    const isUrbanRural = roleResponse?.data?.[0]?.isUrbanRural ?? false;
    console.log('Role_Get: isUrbanRural =', isUrbanRural);

    // 🔹 2️⃣ Define all area-related fields
    const areaFields = [
      'localbody',
      'nameoflocalbody',
      'block',
      'corporation',
      'municipality',
      'town_Panchayat',
      'village_Panchayat',
      'zone',
    ];

    // 🔹 3️⃣ Clear all area validators
    areaFields.forEach((field) => {
      const ctrl = this.userForm.get(field);
      if (ctrl) {
        ctrl.clearValidators();
        ctrl.setErrors(null);
        ctrl.updateValueAndValidity({ emitEvent: false });
      }
    });

    // 🔹 4️⃣ If this role is urban/rural → reapply main required validators
    if (isUrbanRural) {
      this.userForm.get('localbody')?.setValidators([Validators.required]);
      this.userForm
        .get('nameoflocalbody')
        ?.setValidators([Validators.required]);
    }

    this.userForm.updateValueAndValidity();
    this.cdr.detectChanges();
    await Promise.resolve(); // wait one tick

    console.log('🧾 Form validation status:', this.userForm.valid);
    if (!this.userForm.valid) {
      console.warn('Form invalid, cannot submit.');
      Object.keys(this.userForm.controls).forEach((key) => {
        const control = this.userForm.get(key);
        if (control?.invalid) {
          console.warn(` Field "${key}" is invalid`, control.errors);
        }
      });
      triggerValueChangesForAll(this.userForm);
      return;
    }

    console.log('Form valid → proceeding to save.');

    // 🔹 5️⃣ Normalize district into array
    let districtValue = this.userForm.get('district')?.value;
    if (districtValue && !Array.isArray(districtValue)) {
      districtValue = [districtValue];
    }

    // 🔹 6️⃣ Proceed to save (unchanged from your original)
    this.userService
      .User_SaveBankBranchMapping({
        userId: this.userForm.get('id')?.value,
        bankBranch: this.branchForm.get('branchs')?.value,
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
          return;
        }

        this.userService
          .SaveUser({
            userId: this.userForm.get('id')?.value,
            firstName: this.userForm.get('firstName')?.value,
            lastName: this.userForm.get('lastName')?.value,
            dOB: this.userForm.get('dob')?.value,
            email: this.userForm.get('email')?.value,
            roleId: this.userForm.get('role')?.value,
            mobile: this.userForm.get('mobile')?.value?.toString(),
            userGroup: this.userForm.get('userGroup')?.value,
            password: this.userForm.get('password')?.value,
            isActive: true,
            genderId: this.userForm.get('gender')?.value,
            address: this.userForm.get('address')?.value,
            userName: this.userForm.get('email')?.value,
            jobTitle: this.userForm.get('password')?.value,
            isSuperAdmin: false,
            schemesIdss: this.toArray(this.userForm.get('scheme')?.value),
            cardPrintStatusIdss: this.toArray(
              this.userForm.get('cardPrintStatusIdList')?.value
            ),
            districtIdss: this.toArray(this.userForm.get('district')?.value),
            localbodyIdss: this.toArray(this.userForm.get('localbody')?.value),
            nameoflocalbodyIdss: this.toArray(
              this.userForm.get('nameoflocalbody')?.value
            ),
            blockIdss: this.toArray(this.userForm.get('block')?.value),
            corporationIdss: this.toArray(
              this.userForm.get('corporation')?.value
            ),
            municipalityIdss: this.toArray(
              this.userForm.get('municipality')?.value
            ),
            town_PanchayatIdss: this.toArray(
              this.userForm.get('town_Panchayat')?.value
            ),
            village_PanchayatIdss: this.toArray(
              this.userForm.get('village_Panchayat')?.value
            ),
            zoneIdss: this.toArray(this.userForm.get('zone')?.value),
            bankIdss: this.toArray(this.userForm.get('banks')?.value) ?? [],
            telephone: this.userForm.get('telephone')?.value,
          })
          .subscribe((res) => {
            if (
              res &&
              (res.status == FailedStatus || res.status == ErrorStatus)
            ) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                life: 2000,
                detail: res.message,
              });
            } else if (res) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'User saved successfully',
              });
              console.log('✅ User saved successfully → navigating...');
              this.router.navigate(['/officers/user']);
            }
          });
      });
  }

  toCommaSeparated(value: any): string[] {
    if (Array.isArray(value)) {
      return [value.join(',')];
    }
    if (value !== null && value !== undefined) {
      return [String(value)];
    }
    return [];
  }

  resetForm() {
    this.router.navigate(['/officers/user']);
  }

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }

  // Change this helper in your component
  private toArray(value: any): string[] | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined; // <-- undefined, not null
    }
    return Array.isArray(value) ? value : [value];
  }

  generateDefaultRows(templateMilestones: UserBankBranch[]) {
    this.t.clear();
    if (templateMilestones) {
      templateMilestones.forEach((x) => {
        this.t.push(
          this.formBuilder.group({
            bankId: [x.bankId],
            bankName: [x.bankName, [Validators.required]],
            isAllBranch: [x.isAllBranch, [Validators.required]],
            selectedBranchIds: [x.selectedBranchIds],
            branchList: [x.branchList],
          })
        );
      });
    }
  }
}
