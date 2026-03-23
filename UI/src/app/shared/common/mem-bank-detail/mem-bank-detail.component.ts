import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  BankDetailModel,
  BankDetailSaveModel,
  MemberDetailsFormModel,
} from 'src/app/_models/MemberDetailsModel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { triggerValueChangesForAll } from '../../commonFunctions';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { SchemeService } from 'src/app/services/scheme.Service';
import { AutoCompleteOnSelectEvent } from 'primeng/autocomplete';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-mem-bank-detail',
  templateUrl: './mem-bank-detail.component.html',
  styleUrls: ['./mem-bank-detail.component.scss'],
})
export class MemBankDetailComponent {
  bankForm!: FormGroup;

  @Input() member_Id: string = '';
  @Input() memPersonalInfo?: BankDetailSaveModel;
  suggestions: TCModel[] = [];
  @Output() formSaved = new EventEmitter<Number>();

  @Output() formDataChange = new EventEmitter<any>();
  @Input() isReadonly: boolean = true;
  @Input() showNextButton: boolean = true;
  constructor(
    private messageService: MessageService,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private memberService: MemberService,
    private router: Router,
  ) {}
  ngOnInit() {
    this.bankForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      member_Id: new FormControl(this.member_Id), // TODO
      account_Holder_Name: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?! )[A-Za-z]+( [A-Za-z]+)*$/),
      ]),
      account_Number: new FormControl(null, [
        Validators.required,
        Validators.minLength(9),
        Validators.pattern(new RegExp('^[0-9]+$')),
        this.accountNumberValidator(),
      ]),
      iFSC_Code: new FormControl(null, [Validators.required,]),
      bank_Name: new FormControl(null, [Validators.required]),
      bank_Id: new FormControl(null, [Validators.required]),
      branch: new FormControl(null, [Validators.required]),
      branch_Id: new FormControl(null, [Validators.required]),
      isActive: new FormControl(true),
    });
    if (this.memPersonalInfo && this.bankForm) {
      this.setPersonalDetail();
    }
    // this.bankForm.valueChanges.subscribe(value => {
    //   this.formDataChange.emit(value);
    // });
    this.bankForm.valueChanges.subscribe(() => {
      this.formDataChange.emit({
        value: this.bankForm.value,
        valid: this.bankForm.valid,
      });
    });
  }
  ngOnChanges() {
    if (this.memPersonalInfo && this.bankForm) {
      this.setPersonalDetail();
    }
  }
  blockSpace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  setPersonalDetail() {
    if (this.memPersonalInfo) {
      this.bankForm
        .get('id')
        ?.patchValue(
          this.memPersonalInfo.id == '' ? Guid.raw() : this.memPersonalInfo.id,
        );
      this.bankForm.get('member_Id')?.patchValue(this.member_Id);
      this.bankForm
        .get('account_Holder_Name')
        ?.patchValue(this.memPersonalInfo.account_Holder_Name);
      this.bankForm
        .get('account_Number')
        ?.patchValue(this.memPersonalInfo.account_Number);
      this.bankForm
        .get('iFSC_Code')
        ?.patchValue(this.memPersonalInfo.ifsC_Code);
      this.bankForm
        .get('bank_Name')
        ?.patchValue(this.memPersonalInfo.bank_Name);
      this.bankForm.get('bank_Id')?.patchValue(this.memPersonalInfo.bank_Id);
      this.bankForm.get('branch')?.patchValue(this.memPersonalInfo.branch);
      this.bankForm
        .get('branch_Id')
        ?.patchValue(this.memPersonalInfo.branch_Id);
    }
  }
  markAllAsTouched() {
    this.bankForm.markAllAsTouched();
  }
  isInvalid(controlName: string): boolean {
    const control = this.bankForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  save(isSave: boolean) {
    if (!this.bankForm.valid && !isSave) {
      triggerValueChangesForAll(this.bankForm);
      return;
    }
    if (!this.bankForm.valid && isSave) {
      triggerValueChangesForAll(this.bankForm);
      return;
    }
    this.memberService
      .Bank_SaveUpdate({
        id: this.bankForm.get('id')?.value,
        member_Id: this.bankForm.get('member_Id')?.value,
        isActive: true,
        isSubmit: !isSave,
        application_Id: this.bankForm.get('application_Id')?.value,
        account_Holder_Name: this.bankForm.get('account_Holder_Name')?.value,
        account_Number: this.bankForm.get('account_Number')?.value,
        ifsC_Code: this.bankForm.get('iFSC_Code')?.value,
        bank_Name: this.bankForm.get('bank_Name')?.value,
        bank_Id: this.bankForm.get('bank_Id')?.value,
        branch: this.bankForm.get('branch')?.value,
        branch_Id: this.bankForm.get('branch_Id')?.value,
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
  overallsave() {
    if (!this.bankForm.valid) {
      triggerValueChangesForAll(this.bankForm);
      return null;
    }
    return {
      id: this.bankForm.get('id')?.value,
      member_Id: this.bankForm.get('member_Id')?.value,
      isActive: true,
      isSubmit: true,
      application_Id: this.bankForm.get('application_Id')?.value,
      account_Holder_Name: this.bankForm.get('account_Holder_Name')?.value,
      account_Number: this.bankForm.get('account_Number')?.value,
      ifsC_Code: this.bankForm.get('iFSC_Code')?.value,
      bank_Name: this.bankForm.get('bank_Name')?.value,
      bank_Id: this.bankForm.get('bank_Id')?.value,
      branch: this.bankForm.get('branch')?.value,
      branch_Id: this.bankForm.get('branch_Id')?.value,
    };
  }
  MovetoNext() {
    this.formSaved.emit(5);
  }
  search(event: any) {
    this.generalService.Branch_Dropdown_Search(event.query).subscribe((x) => {
      this.suggestions = x.data;
    });
  }
  clearIfsc(event: any) {
    this.bankForm.get('iFSC_Code')?.patchValue('');
    this.bankForm.get('branch')?.patchValue('');
    this.bankForm.get('bank_Name')?.patchValue('');
    this.bankForm.get('bank_Id')?.patchValue('');
    this.bankForm.get('branch_Id')?.patchValue('');
  }
  selectifsc(event: AutoCompleteOnSelectEvent) {
    this.bankForm.get('iFSC_Code')?.patchValue(event.value.value);
    this.getbankDetails();
  }
  getbankDetails() {
    var ifsc = this.bankForm.get('iFSC_Code')?.value;
    this.schemeService.BranchGetByIFSC(ifsc).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
      } else if (x.data) {
        var data = x.data;
        this.bankForm.get('branch_Id')?.patchValue(data.branchId);
        this.bankForm.get('branch')?.patchValue(data.branchName);
        this.bankForm.get('bank_Id')?.patchValue(data.bankId);
        this.bankForm.get('bank_Name')?.patchValue(data.bankName);
      }
    });
  }
  // ifscValidator(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const value = (control.value || '').toUpperCase();

  //     if (!value) return null;

  //     const ifscRegex = /^[A-Z]{4}0[0-9]{6}$/;

  //     return ifscRegex.test(value) ? null : { invalidIFSC: true };
  //   };
  // }
  ifscValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').toUpperCase().trim();

    if (!value) return null;

    const ifscRegex = /^[A-Z]{4}0[0-9]{6}$/;

    return ifscRegex.test(value) ? null : { invalidIFSC: true };
  };
}
blockInvalidIFSCInput(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;

  const allowedKeys = [
    'Backspace','Delete','Tab','Escape','Enter',
    'ArrowLeft','ArrowRight','Home','End'
  ];

  if (allowedKeys.includes(event.key)) return;
  if (event.ctrlKey || event.metaKey) return;

  const regex = /^[a-zA-Z0-9]$/;

  if (!regex.test(event.key)) {
    event.preventDefault();
    return;
  }

  if (input.value.length >= 11) {
    event.preventDefault();
  }
}

onPasteIFSC(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text') || '';
  const input = event.target as HTMLInputElement;

  if (!/^[a-zA-Z0-9]*$/.test(pastedText)) {
    event.preventDefault();
    return;
  }

  if ((input.value + pastedText).length > 11) {
    event.preventDefault();
  }
}

//   blockInvalidIFSCInput(event: KeyboardEvent) {
//   const input = event.target as HTMLInputElement;


//   if (event.key === ' ') {
//     event.preventDefault();
//     return;
//   }


//   const regex = /^[a-zA-Z0-9]$/;

//   if (!regex.test(event.key)) {
//     event.preventDefault();
//     return;
//   }

  
//   if (input.value.length >= 11) {
//     event.preventDefault();
//     return;
//   }
// }

  accountNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';

      if (!value) return null;

      // all digits same
      if (/^(\d)\1+$/.test(value)) {
        return { invalidAccount: true };
      }

      return null;
    };
  }
}
