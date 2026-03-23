import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  AddressDetailFormModel,
  ApplicationAddressMaster,
} from 'src/app/_models/MemberDetailsModel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { triggerValueChangesForAll } from '../../commonFunctions';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-mem-permanent-address',
  templateUrl: './mem-permanent-address.component.html',
  styleUrls: ['./mem-permanent-address.component.scss'],
})
export class MemPermanentAddressComponent {
  addressForm!: FormGroup;
  addressPermForm!: FormGroup;
  aadhaarVerified: boolean = false;
  isAadhar: boolean = false;
  isSame: boolean = false;
  @Input() member_Id: string = '';
  @Input() formDetail?: AddressDetailFormModel;
  @Input() formtempDetail?: AddressDetailFormModel;
  @Input() addressDetail?: ApplicationAddressMaster;
  @Input() addressPermDetail?: ApplicationAddressMaster;
  @Output() formSaved = new EventEmitter<Number>();
  @Output() formDataChange = new EventEmitter<any>();
  @Input() aadhaarJson?: string;

  @Input() showNextButton: boolean = true;
  private aadhaarPatched = false;

  constructor(
    private messageService: MessageService,
    private generalService: GeneralService,
    private memberService: MemberService,
    private router: Router,
  ) {}
  combinedFieldsLengthValidator(
    fields: string[],
    maxLength: number,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      let combinedLength = 0;

      for (const field of fields) {
        const value = formGroup.get(field)?.value || '';
        combinedLength += value.length;
      }

      return combinedLength > maxLength
        ? { combinedFieldsTooLong: true }
        : null;
    };
  }
  ngOnInit() {
    const storedData = localStorage.getItem('aadhaarData');
    console.log('Stored Aadhaar Data:', storedData);
    this.addressForm = new FormGroup(
      {
        id: new FormControl(Guid.raw()),
        member_Id: new FormControl(this.member_Id), // TODO
        addressType: new FormControl('TEMPORARY'), // TODO
        doorNo: new FormControl(null, [
          // Validators.required,
          Validators.minLength(1),
          Validators.maxLength(15),
        ]),
        streetName: new FormControl(null, []),
        villlageTownCity: new FormControl(null, []),
        district: new FormControl(null, []),
        taluk: new FormControl(null, []),
        pincode: new FormControl(null, [
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(new RegExp('^[0-9]+$')),
        ]),
        isActive: new FormControl(true),
        isPermanent: new FormControl(false),
      },
      {
        validators: this.combinedFieldsLengthValidator(
          [
            'doorNo',
            'streetName',
            'villlageTownCity',
            'district',
            'taluk',
            'pincode',
          ],
          150,
        ),
      },
    );

    this.addressPermForm = new FormGroup(
      {
        id: new FormControl(Guid.raw()),
        memberId: new FormControl(this.member_Id), // TODO
        addressType: new FormControl('PERMANENT'), // TODO
        doorNo: new FormControl(null, [
          // Validators.required,
          Validators.minLength(1),
          Validators.maxLength(15),
        ]),
        streetName: new FormControl(null, [
          Validators.required,
          this.noExtraSpacesValidator(),
        ]),
        district: new FormControl(null, [Validators.required]),
        villlageTownCity: new FormControl(null, []),
        taluk: new FormControl(null, []),
        pincode: new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(new RegExp('^[0-9]+$')),
        ]),
        isActive: new FormControl(true),
        isPermanent: new FormControl(true),
      },
      {
        validators: this.combinedFieldsLengthValidator(
          [
            'doorNo',
            'streetName',
            'villlageTownCity',
            'district',
            'taluk',
            'pincode',
          ],
          150,
        ),
      },
    );

    if (this.addressDetail && this.addressForm) {
      this.setAddressDetail();
    }
    if (this.addressPermDetail && this.addressPermForm) {
      this.setTempAddressDetail();
    }
    if (this.addressPermForm && this.addressPermForm) {
      this.checkbothSame();
    }

    this.addressPermForm.get('district')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: x,
            CategoryCode: 'TALUK',
          })
          .subscribe((res) => {
            if (this.formDetail) {
              this.formDetail.taluk_SelectList = res.data;
            }
          });

        this.generalService
          .ConfigurationPincodeSelectList_GetByDistrict(x)
          .subscribe((res) => {
            if (this.formDetail) {
              this.formDetail.pincode_SelectList = res.data;
            }
          });
      } else {
        if (this.formDetail) {
          this.formDetail.taluk_SelectList = [];
          this.formDetail.pincode_SelectList = [];
        }
      }
    });
    this.addressForm.get('district')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: x,
            CategoryCode: 'TALUK',
          })
          .subscribe((res) => {
            if (this.formtempDetail) {
              this.formtempDetail.taluk_SelectList = res.data;
            }
          });

        this.generalService
          .ConfigurationPincodeSelectList_GetByDistrict(x)
          .subscribe((res) => {
            if (this.formtempDetail) {
              this.formtempDetail.pincode_SelectList = res.data;
            }
          });
      } else {
        if (this.formtempDetail) {
          this.formtempDetail.taluk_SelectList = [];
          this.formtempDetail.pincode_SelectList = [];
        }
      }
    });
    this.addressPermForm.valueChanges.subscribe(() => {
      this.formDataChange.emit({
        value: this.addressPermForm.value,
        valid: this.addressPermForm.valid,
      });
    });
    // this.patchAadhapatchAadhaarDistrict();
  }
  markAllAsTouched() {
    this.addressPermForm.markAllAsTouched();
  }
  isInvalid(controlName: string): boolean {
    const control = this.addressPermForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  patchAadhaarIfExists() {
    const storedData = localStorage.getItem('aadhaarData');
    if (!storedData) return;

    const aadhaarData = JSON.parse(storedData);

    this.aadhaarVerified = aadhaarData.aadhaarVerified === true;
  }
  ngOnChanges() {
    if (this.formDetail?.district_SelectList?.length) {
      this.patchAadhaarDistrict();
    }
    if (this.addressDetail && this.addressForm) {
      this.setAddressDetail();
    }
    if (this.addressPermDetail && this.addressPermForm) {
      this.setTempAddressDetail();
    }
    if (this.addressPermForm && this.addressPermForm) {
      this.checkbothSame();
    }
  }
  checkbothSame() {
    if (
      this.addressPermForm.get('doorNo')?.value != '' &&
      this.addressPermForm.get('doorNo')?.value ==
        this.addressForm.get('doorNo')?.value &&
      this.addressPermForm.get('streetName')?.value ==
        this.addressForm.get('streetName')?.value &&
      this.addressPermForm.get('villlageTownCity')?.value ==
        this.addressForm.get('villlageTownCity')?.value &&
      this.addressPermForm.get('district')?.value ==
        this.addressForm.get('district')?.value &&
      this.addressPermForm.get('taluk')?.value ==
        this.addressForm.get('taluk')?.value &&
      this.addressPermForm.get('pincode')?.value ==
        this.addressForm.get('pincode')?.value
    ) {
      this.isSame = true;
    }
  }
  isameChange(x: any) {
    if (x && x == true) {
      this.addressForm
        .get('doorNo')
        ?.patchValue(this.addressPermForm.get('doorNo')?.value);
      this.addressForm
        .get('streetName')
        ?.patchValue(this.addressPermForm.get('streetName')?.value);
      this.addressForm
        .get('villlageTownCity')
        ?.patchValue(this.addressPermForm.get('villlageTownCity')?.value);

      this.addressForm
        .get('district')
        ?.patchValue(this.addressPermForm.get('district')?.value);
      this.addressForm
        .get('taluk')
        ?.patchValue(this.addressPermForm.get('taluk')?.value);
      this.addressForm
        .get('pincode')
        ?.patchValue(this.addressPermForm.get('pincode')?.value);
    } else {
      this.addressForm.get('doorNo')?.patchValue(null);
      this.addressForm.get('streetName')?.patchValue(null);
      this.addressForm.get('villlageTownCity')?.patchValue(null);
      this.addressForm.get('district')?.patchValue(null);
      this.addressForm.get('taluk')?.patchValue(null);
      this.addressForm.get('pincode')?.patchValue(null);
    }
  }
  ngAfterViewChecked() {
    if (!this.aadhaarPatched && this.formDetail?.district_SelectList?.length) {
      this.patchAadhaarDistrict();
      this.aadhaarPatched = true;
    }
  }

patchAadhaarDistrict() {
  let aadhaar: any = null;


  if (this.aadhaarJson) {
    try {
      aadhaar = JSON.parse(this.aadhaarJson);
    } catch (e) {
      console.error('Invalid aadhaar_json', e);
    }
  }


  if (!aadhaar) {
    const storedData = localStorage.getItem('aadhaarData');
    if (!storedData) return;

    aadhaar = JSON.parse(storedData);
  }

  if (!this.formDetail?.district_SelectList?.length) return;


  const aadhaarDistrict =
    aadhaar?.District?.trim().toLowerCase() ||   // API
    aadhaar?.district?.trim().toLowerCase();     // local

  const districtObj = this.formDetail.district_SelectList.find((x) => {
    const englishName = x.text?.split('/')[0]?.trim().toLowerCase();
    return englishName === aadhaarDistrict;
  });

  if (!districtObj) {
    console.warn('District not found:', aadhaarDistrict);
    return;
  }

  this.addressPermForm.patchValue({
    district: districtObj.value,
    pincode: aadhaar?.Pincode || aadhaar?.pincode,
  });

  this.isAadhar = true;

  console.log('Patched district:', districtObj);
}
  setTempAddressDetail() {
    if (this.addressPermDetail) {
      this.addressPermForm.get('id')?.patchValue(this.addressPermDetail.id);
      this.addressPermForm
        .get('member_Id')
        ?.patchValue(this.addressPermDetail.memberId);
      this.addressPermForm
        .get('addressType')
        ?.patchValue(this.addressPermDetail.addressType);
      this.addressPermForm
        .get('doorNo')
        ?.patchValue(this.addressPermDetail.doorNo);
      this.addressPermForm
        .get('streetName')
        ?.patchValue(this.addressPermDetail.streetName);
      this.addressPermForm
        .get('district')
        ?.patchValue(this.addressPermDetail.district, {
          onlySelf: false,
          emitEvent: false,
        });
      this.addressPermForm
        .get('villlageTownCity')
        ?.patchValue(this.addressPermDetail.villlageTownCity);
      this.addressPermForm
        .get('taluk')
        ?.patchValue(this.addressPermDetail.taluk);
      this.addressPermForm
        .get('pincode')
        ?.patchValue(this.addressPermDetail.pincode);
    }
  }
  setAddressDetail() {
    if (this.addressDetail) {
      this.addressForm.get('id')?.patchValue(this.addressDetail.id);
      this.addressForm
        .get('member_Id')
        ?.patchValue(this.addressDetail.memberId);
      this.addressForm
        .get('addressType')
        ?.patchValue(this.addressDetail.addressType);
      this.addressForm.get('doorNo')?.patchValue(this.addressDetail.doorNo);
      this.addressForm
        .get('streetName')
        ?.patchValue(this.addressDetail.streetName);
      this.addressForm
        .get('district')
        ?.patchValue(this.addressDetail.district, {
          onlySelf: false,
          emitEvent: false,
        });
      this.addressForm
        .get('villlageTownCity')
        ?.patchValue(this.addressDetail.villlageTownCity);
      this.addressForm.get('taluk')?.patchValue(this.addressDetail.taluk);
      this.addressForm.get('pincode')?.patchValue(this.addressDetail.pincode);
    }
  }
  save(isSave: boolean) {
    // if (!this.addressForm.valid && !isSave) {
    //   triggerValueChangesForAll(this.addressForm);
    //   return;
    // }
    // if (this.isSame) {
    //   this.isameChange(true);
    // }
    // if (!this.addressPermForm.valid && !isSave) {
    //   triggerValueChangesForAll(this.addressPermForm);
    //   return;
    // }
    if (this.isSame) {
      this.isameChange(true);
    }

    if (!isSave) {
      //  Not saving → validate each form individually
      if (!this.addressForm.valid) {
        triggerValueChangesForAll(this.addressForm);
        return;
      }

      if (!this.addressPermForm.valid) {
        triggerValueChangesForAll(this.addressPermForm);
        return;
      }
    } else {
      // 🔹 Saving → both forms must be valid
      if (!this.addressForm.valid || !this.addressPermForm.valid) {
        triggerValueChangesForAll(this.addressForm);
        triggerValueChangesForAll(this.addressPermForm);
        return;
      }
    }
    this.memberService
      .Address_Master_SaveUpdate({
        id: this.addressForm.get('id')?.value,
        memberId: this.addressForm.get('member_Id')?.value,
        isActive: true,
        addressType: this.addressForm.get('addressType')?.value,
        doorNo: this.addressForm.get('doorNo')?.value,
        streetName: this.addressForm.get('streetName')?.value,
        villlageTownCity: this.addressForm.get('villlageTownCity')?.value,
        localBody: '',
        nameoflocalBody: '',
        district: this.addressForm.get('district')?.value,
        taluk: this.addressForm.get('taluk')?.value,
        block: '',
        corporation: '',
        municipality: '',
        townPanchayat: '',
        pincode: this.addressForm.get('pincode')?.value,
        area: '',
        districtString: '',
        talukString: '',
        blockString: '',
        corporationString: '',
        municipalityString: '',
        townPanchayatString: '',
        isSubmit: !isSave,
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
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'Success',
          //   detail: x.message,
          // });
        }
      });
    this.memberService
      .Address_Master_SaveUpdate({
        id: this.addressPermForm.get('id')?.value,
        memberId: this.addressPermForm.get('member_Id')?.value,
        isActive: true,
        addressType: this.addressPermForm.get('addressType')?.value,
        doorNo: this.addressPermForm.get('doorNo')?.value,
        streetName: this.addressPermForm.get('streetName')?.value,
        villlageTownCity: this.addressPermForm.get('villlageTownCity')?.value,
        localBody: '',
        nameoflocalBody: '',
        district: this.addressPermForm.get('district')?.value,
        taluk: this.addressPermForm.get('taluk')?.value,
        block: '',
        corporation: '',
        municipality: '',
        townPanchayat: '',
        pincode: this.addressPermForm.get('pincode')?.value,
        area: '',
        districtString: '',
        talukString: '',
        blockString: '',
        corporationString: '',
        municipalityString: '',
        townPanchayatString: '',
        isSubmit: !isSave,
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
          this.MovetoNext();
        }
      });
  }
  overallsaveTempAdrressForm() {
    if (!this.addressForm.valid) {
      triggerValueChangesForAll(this.addressForm);
      return null;
    }
    return {
      id: this.addressForm.get('id')?.value,
      memberId: this.addressForm.get('member_Id')?.value,
      isActive: true,
      addressType: this.addressForm.get('addressType')?.value,
      doorNo: this.addressForm.get('doorNo')?.value,
      streetName: this.addressForm.get('streetName')?.value,
      villlageTownCity: this.addressForm.get('villlageTownCity')?.value,
      localBody: '',
      nameoflocalBody: '',
      district: this.addressForm.get('district')?.value,
      taluk: this.addressForm.get('taluk')?.value,
      block: '',
      corporation: '',
      municipality: '',
      townPanchayat: '',
      pincode: this.addressForm.get('pincode')?.value,
      area: '',
      districtString: '',
      talukString: '',
      blockString: '',
      corporationString: '',
      municipalityString: '',
      townPanchayatString: '',
      isSubmit: true,
    };
  }
  overallsaveAddressForm() {
    if (this.isSame) {
      this.isameChange(true);
    }
    if (!this.addressPermForm.valid) {
      triggerValueChangesForAll(this.addressPermForm);
      return null;
    }
    return {
      id: this.addressPermForm.get('id')?.value,
      memberId: this.addressPermForm.get('member_Id')?.value,
      isActive: true,
      addressType: this.addressPermForm.get('addressType')?.value,
      doorNo: this.addressPermForm.get('doorNo')?.value,
      streetName: this.addressPermForm.get('streetName')?.value,
      villlageTownCity: this.addressPermForm.get('villlageTownCity')?.value,
      localBody: '',
      nameoflocalBody: '',
      district: this.addressPermForm.get('district')?.value,
      taluk: this.addressPermForm.get('taluk')?.value,
      block: '',
      corporation: '',
      municipality: '',
      townPanchayat: '',
      pincode: this.addressPermForm.get('pincode')?.value,
      area: '',
      districtString: '',
      talukString: '',
      blockString: '',
      corporationString: '',
      municipalityString: '',
      townPanchayatString: '',
      isSubmit: true,
    };
  }
  MovetoNext() {
    this.formSaved.emit(3);
  }
  noExtraSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';

      if (!value.trim()) return { required: true };

      if (/^\s|\s$/.test(value)) return { edgeSpaces: true };

      if (/\s{2,}/.test(value)) return { multipleSpaces: true };

      return null;
    };
  }
}
