import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { FamilyMemberModel } from 'src/app/_models/MemberDetailsModel';
import {
  FamilyMemberViewModelExisting,
  MemberDocumentMasterModelExisting,
} from 'src/app/_models/MemberViewModelExsisting';
import {
  dateconvertionwithOnlyDate,
  dateconvertion,
} from '../../commonFunctions';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-mem-family-detail-view',
  templateUrl: './mem-family-detail-view.component.html',
  styleUrls: ['./mem-family-detail-view.component.scss'],
})
export class MemFamilyDetailViewComponent {
  @Input() familyMemberList?: FamilyMemberViewModelExisting[];
    popupPosition = {
  top: 0,
  left: 0
};
showMorePopup = false;
selectedMember: any = null;
  constructor(private generalService: GeneralService ,private elementRef: ElementRef) {}
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  getCategories(mandoc: MemberDocumentMasterModelExisting[]) {
    return mandoc.filter((x) => x.savedFileName && x.savedFileName != '');
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  
// openMore(member: any, event: MouseEvent) {

//   const rect = (event.target as HTMLElement).getBoundingClientRect();

//   this.popupPosition = {
//     top: rect.top + window.scrollY - 40,
//     left: rect.right + window.scrollX + 10
//   };

//   this.selectedMember = member;
//   this.showMorePopup = true;
// }
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {

  const target = event.target as HTMLElement;

  const clickedInsidePopover = this.elementRef.nativeElement
    .querySelector('.education-popover')
    ?.contains(target);

  const clickedMoreButton = target.closest('.more-btn');

  if (!clickedInsidePopover && !clickedMoreButton) {
    this.showMorePopup = false;
  }
}
openMore(member: any, event: MouseEvent) {

  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();

  // this.popupPosition = {
  //   top: rect.bottom + 8,
  //   left: rect.left - 150
  // };

    this.popupPosition = {
    top: rect.top + window.scrollY - 10,
    left: rect.right + window.scrollX + 10
  };

  this.selectedMember = member;
  this.showMorePopup = true;
}
closeMore() {
  this.showMorePopup = false;
}

}
