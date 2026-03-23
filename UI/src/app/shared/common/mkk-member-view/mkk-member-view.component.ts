
import { Component,OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { GeneralService } from 'src/app/services/general.service';
import { environment } from 'src/environments/environment';
import { dateconvertionwithOnlyDate } from '../../commonFunctions';

@Component({
  selector: 'app-mkk-member-view',
  templateUrl: './mkk-member-view.component.html',
  styleUrls: ['./mkk-member-view.component.scss']
})
export class MkkMemberViewComponent  implements OnInit {

  schemeDetails: any = {};
  personalDetail: any = {};
  permanentAddress: any = {};
  temporaryAddress: any = {};
  bankDetail: any = {};
  familyMemberList: any[] = [];
  orgDetail: any = {};
  documentsList: any[] = [];
  memberDocuments: any[] = [];
  memberNonMandatoryDocuments: any[] = [];
  declarationChecked: boolean = false;

  baseUrl = environment.apiUrl.replace('/api/', '') + '/images/';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private generalService: GeneralService
  ) {}

ngOnInit(): void {

  const data = this.config.data;

  console.log("MKK VIEW RECEIVED =", data);

  if (!data) return;

  this.personalDetail = data.personalDetail || {};

  this.permanentAddress = data.permanentAddress || {};

  this.temporaryAddress = data.temporaryAddress || {};

  this.bankDetail = data.bankDetail || {};

  this.familyMemberList = data.familyMemberList || [];

  this.orgDetail = data.orgDetail || {};

  this.memberDocuments =
    data.memberDocuments || [];

  this.memberNonMandatoryDocuments =
    data.memberNonMandatoryDocuments || [];

  this.declarationChecked =
    data.declarationChecked || false;

}

  /* IMPORTANT: convert FormArray to usable object */
  convertDocuments(docs: any[]): any[] {

    if (!docs) return [];

    return docs.map(doc => {

      if (doc.get) {

        return {
          id: doc.get('id')?.value,
          documentCategoryName:
            doc.get('documentCategoryName')?.value,

          originalFileName:
            doc.get('originalFileName')?.value,

          savedFileName:
            doc.get('savedFileName')?.value,

          isVerified:
            doc.get('isVerified')?.value,

          isRequired:
            doc.get('isRequired')?.value
        };
      }

      return doc;
    });
  }

// getProfileImageUrl(){

//   if (!this.personalDetail?.profile_Picture)
//     return 'assets/default-profile.png';
// }

  getDocImage(savedFileName: string): string {

    if (!savedFileName) return '';

    return this.baseUrl + savedFileName;
  }

  downloadFile(id: string, fileName: string) {

    if (!id || !fileName) return;

    this.generalService.MemberFiledownloads(id, fileName);
  }

  dc(date: any) {

    if (!date) return '-';

    return dateconvertionwithOnlyDate(date);
  }

  hasValue(val: any): boolean {

    return val !== null &&
      val !== undefined &&
      val !== '';
  }

  close() {

    this.ref.close();
  }

}