import { Component, Input } from '@angular/core';
import { ApplicationAddressMaster } from 'src/app/_models/MemberDetailsModel';
import { AddressViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';

@Component({
  selector: 'app-mem-permanent-address-view',
  templateUrl: './mem-permanent-address-view.component.html',
  styleUrls: ['./mem-permanent-address-view.component.scss'],
})
export class MemPermanentAddressViewComponent {
  @Input() addressDetail?: AddressViewModelExisting;
  @Input() oldDetail?: AddressViewModelExisting;
  @Input() tempDetail?: AddressViewModelExisting;
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

  return oldVal.toString().trim() !== newVal.toString().trim();
}
getValue(field: string) {

  const tempVal = (this.tempDetail as any)?.[field];

  if (tempVal !== null && tempVal !== undefined && tempVal !== '') {
    return tempVal;
  }

  return (this.addressDetail as any)?.[field];
}
}
