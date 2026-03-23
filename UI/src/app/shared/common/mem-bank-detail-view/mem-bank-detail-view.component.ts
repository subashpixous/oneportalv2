import { Component, Input } from '@angular/core';
import { BankDetailModel } from 'src/app/_models/MemberDetailsModel';
import { BankViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';

@Component({
  selector: 'app-mem-bank-detail-view',
  templateUrl: './mem-bank-detail-view.component.html',
  styleUrls: ['./mem-bank-detail-view.component.scss'],
})
export class MemBankDetailViewComponent {
  @Input() personalDetail?: BankViewModelExisting;
   @Input() oldDetail?: BankViewModelExisting;
    @Input() tempDetail?: BankViewModelExisting;
  CheckNullorEmpty(value?: string | undefined | null) {
    return value != null && value != undefined && value != '';
  }
  CheckZero(value?: number) {
    return value != null && value != undefined && value != 0;
  }
   isChanged(field: string): boolean {

  if (!this.oldDetail || !this.tempDetail) {
    return false;
  }
  

  const oldVal = (this.oldDetail as any)?.[field] ?? '';
  const newVal = (this.tempDetail as any)?.[field] ?? '';

  return String(oldVal).trim() !== String(newVal).trim();
}

get bankHeader(): string {

  if (this.tempDetail) {
    return 'Updated Bank Details';
  }

  return 'வங்கி விவரங்கள் / Bank details';
}
getValue(field: string) {

  // if temp value exists show it
  if (this.tempDetail && (this.tempDetail as any)[field] !== undefined) {
    return (this.tempDetail as any)[field];
  }

  // otherwise fallback to normal value
  return (this.personalDetail as any)?.[field];
}
}
