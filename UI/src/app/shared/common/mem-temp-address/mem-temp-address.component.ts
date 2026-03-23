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
  selector: 'app-mem-temp-address',
  templateUrl: './mem-temp-address.component.html',
  styleUrls: ['./mem-temp-address.component.scss'],
})
export class MemTempAddressComponent {
  addressForm!: FormGroup;
  isSame: boolean = false;
  @Input() member_Id: string = '';
  @Input() formDetail?: AddressDetailFormModel;
  @Input() addressDetail?: ApplicationAddressMaster;
    @Input() permaddressDetail?: ApplicationAddressMaster;
  @Input() permanentAddressData: any;

  @Output() formDataChange = new EventEmitter<any>();
  isRestoring: boolean=false;
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
    this.addressForm = new FormGroup(
      {
        id: new FormControl(Guid.raw().toString()),
        memberId: new FormControl(this.member_Id), // TODO
        addressType: new FormControl('TEMPORARY'), // TODO
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
        isCurrent: new FormControl(false),
      },
      {
        validators: this.combinedFieldsLengthValidator(
          [
            'doorNo',
            'streetName',
            'villageTownCity',
            'district',
            'taluk',
            'pincode',
          ],
          150,
        ),
      },
    );
    // this.addressForm.get('isCurrent')?.valueChanges.subscribe((value) => {
    //   if (value) {
    //     this.patchPermanentAddress();
    //   } else {
    //     this.addressForm.patchValue({
    //       streetName: '',
    //       district: null,
    //       pincode: null,
    //       taluk: null,
    //       villlageTownCity: '',
    //       doorNo: '',
    //     });
    //   }
    // });
 // subscribe
  this.setupIsCurrentListener();

  if (this.addressDetail && this.addressForm) {
    this.setAddressDetail();
  }
  this.restoreIsCurrent();

    this.addressForm.get('district')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.addressForm.get('district')?.value,
            CategoryCode: 'TALUK',
          })
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.taluk_SelectList = x.data;
            }
          });
        this.generalService
          .ConfigurationPincodeSelectList_GetByDistrict(
            this.addressForm.get('district')?.value,
          )
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.pincode_SelectList = x.data;
            }
          });
      } else {
        if (this.formDetail) {
          this.formDetail.taluk_SelectList = [];
        }
      }
    });
    if (this.addressDetail && this.addressForm) {
      this.setAddressDetail();
    }
    // this.addressForm.valueChanges.subscribe(value => {
    //   this.formDataChange.emit(value);
    // });
    this.addressForm.valueChanges.subscribe(() => {
        this.checkIfSameAddress(); 
      this.formDataChange.emit({
        value: this.addressForm.value,
        valid: this.addressForm.valid,
      });
    });
  }
  checkIfSameAddress() {
  if (!this.permanentAddressData || this.isRestoring) return;

  const temp = this.addressForm.getRawValue();

  const isSame =
    (temp.doorNo || '') === (this.permanentAddressData.doorNo || '') &&
    (temp.streetName || '') === (this.permanentAddressData.streetName || '') &&
    (temp.district || '') === (this.permanentAddressData.district || '') &&
    (temp.taluk || '') === (this.permanentAddressData.taluk || '') &&
    (temp.villlageTownCity || '') === (this.permanentAddressData.villlageTownCity || '') &&
    (temp.pincode || '') === (this.permanentAddressData.pincode || '');

  this.isRestoring = true;

  this.addressForm.patchValue(
    { isCurrent: isSame },
    { emitEvent: true }
  );

  // optional (keep if you want persistence)
  sessionStorage.setItem('isCurrent', JSON.stringify(isSame));

  this.isRestoring = false;
}
  patchPermanentAddress() {
    if (!this.permanentAddressData) return;

    this.addressForm.patchValue({
      streetName: this.permanentAddressData.streetName,
      district: this.permanentAddressData.district,
      pincode: this.permanentAddressData.pincode,
      taluk: this.permanentAddressData.taluk,
      villlageTownCity: this.permanentAddressData.villlageTownCity,
      doorNo: this.permanentAddressData.doorNo,
    });
  }
  patchAadhaarDistrict() {
    const storedData = localStorage.getItem('aadhaarData');
    if (!storedData || !this.formDetail?.district_SelectList) return;

    const aadhaar = JSON.parse(storedData);

    const district = this.formDetail.district_SelectList.find(
      (x) => x.text?.toLowerCase() === aadhaar?.district?.toLowerCase(),
    );
    console.log(this.formDetail?.district_SelectList);

    if (district) {
      this.addressForm.patchValue({
        district: district.value,
      });
    }

    this.addressForm.patchValue({
      pincode: aadhaar?.pincode,
    });
  }
  // markAllAsTouched() {
  //   alert("markAllAsTouched called in temp address component");
  //   this.addressForm.markAllAsTouched();
  // }
  markAllAsTouched() {
    this.addressForm.markAllAsTouched();
  }
  isInvalid(controlName: string): boolean {
    const control = this.addressForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  ngOnChanges() {
    if (this.addressDetail && this.addressForm) {
      this.setAddressDetail();
  if (this.permanentAddressData) {
    this.checkIfSameAddress();
  }
   this.restoreIsCurrent();

    }
  }
  setupIsCurrentListener() {
  this.addressForm.get('isCurrent')?.valueChanges.subscribe((value) => {

    sessionStorage.setItem('isCurrent', JSON.stringify(value));

    const controls = [
      'doorNo',
      'streetName',
      'district',
      'pincode',
      'taluk',
      'villlageTownCity'
    ];

    if (value) {

      this.patchPermanentAddress();

      // controls.forEach(ctrl =>
      //   this.addressForm.get(ctrl)?.disable({ emitEvent: false })
      // );

    } else {

      controls.forEach(ctrl =>
        this.addressForm.get(ctrl)?.enable({ emitEvent: false })
      );

      if (!this.isRestoring) {
        this.addressForm.patchValue({
          streetName: '',
          district: null,
          pincode: null,
          taluk: null,
          villlageTownCity: '',
          doorNo: ''
        }, { emitEvent: false });
      }

    }

  });
}
restoreIsCurrent() {

  const saved = sessionStorage.getItem('isCurrent');

  if (saved !== null) {

    this.isRestoring = true;

    this.addressForm.patchValue(
      { isCurrent: JSON.parse(saved) },
      { emitEvent: true }
    );

    this.isRestoring = false;
  }

}
  setAddressDetail() {

      setTimeout(() => {
    this.checkIfSameAddress();
  });
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

      this.addressForm.get('taluk')?.patchValue(this.addressDetail.taluk, {
        onlySelf: false,
        emitEvent: false,
      });
      this.addressForm.get('pincode')?.patchValue(this.addressDetail.pincode);
    }
  }
  overallsaveAddressForm() {
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
