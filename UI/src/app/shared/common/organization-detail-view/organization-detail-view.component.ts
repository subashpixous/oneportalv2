import { Component, Input } from '@angular/core';
import { OrganizationDetailModel } from 'src/app/_models/MemberDetailsModel';
import { OrganizationalViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';

@Component({
  selector: 'app-organization-detail-view',
  templateUrl: './organization-detail-view.component.html',
  styleUrls: ['./organization-detail-view.component.scss'],
})
export class OrganizationDetailViewComponent {
  @Input() orgDetail?: OrganizationalViewModelExisting;
  CheckNullorEmpty(value?: string | undefined | null) {
    return value != null && value != undefined && value != '';
  }
  CheckZero(value?: number) {
    return value != null && value != undefined && value != 0;
  }
}