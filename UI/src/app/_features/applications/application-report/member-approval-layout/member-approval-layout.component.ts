import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MemberService } from 'src/app/services/member.sevice';
import {
  MemberDetailsViewModelExisting,
  MemberDiffViewModel,
  FamilyMemberEducation,
  MemberViewModelExisting
} from 'src/app/_models/MemberViewModelExsisting';
import {
  MemberDataApprovalFormModel,
  MemberDataApprovalFromSubmitModel,
  MemberDocumentMaster
} from 'src/app/_models/MemberDetailsModel';
import {
  dateconvertion,
  dateconvertionwithOnlyDate,
  triggerValueChangesForAll
} from 'src/app/shared/commonFunctions';
import { MessageService } from 'primeng/api';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { Guid } from 'guid-typescript';
import { AccountService } from 'src/app/services/account.service';
import { UserModel } from 'src/app/_models/user';
import { DialogService } from 'primeng/dynamicdialog';
import { MkkMemberViewComponent } from '../../../../shared/common/mkk-member-view/mkk-member-view.component';
import { ApplicationDetailViewModel1, ApproveStatusItemModel } from 'src/app/_models/schemeModel';
import { GeneralService } from 'src/app/services/general.service';
import {HostListener, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-member-approval-layout',
  templateUrl: './member-approval-layout.component.html',
  styleUrls: ['./member-approval-layout.component.scss'],
  providers: [MessageService, DialogService]
})
export class MemberApprovalLayoutComponent implements OnInit,OnChanges {

  title = 'Application Approval';
  memberDetail!: MemberDetailsViewModelExisting;
  MemberDiffViewModel!: MemberDiffViewModel;
  memberDetails!: MemberViewModelExisting;
  approvalformDetail!: MemberDataApprovalFormModel;
  schemeDetails!: ApplicationDetailViewModel1;
  memberCardData:any;
  memberId!: string;
  requestId!: string;
  user!: UserModel;
  showPreview: boolean = false;
  approvalStatuses: ApproveStatusItemModel[] = [];
  applicationid: string = '';
  approvalForm!: FormGroup;
  schemeForm!: FormGroup;
  checked: boolean = false;
  canApprove: boolean = false;
canReturn: boolean = false;
canRejected: boolean = false;
  canshowApproval: boolean = true; 
  // confirmation popups
showRejectConfirm = false;
showReturnConfirm = false;
// success popup
showSuccessPopup = false;
successMessage = '';
showMorePopup = false;
selectedMember: any = null;
showProfilePopup = false;
showVerificationPopup = false;
verifiedclicked = false;
buttoncliked = false;
changedDetailRecord!: string;
selectedMemberIndex: number = -1;
hasSchemeVerifyPrivilege: boolean = false;
selectedIsTemp = false;
popupPosition = {
  top: 0,
  left: 0
};
url: string = environment.apiUrl.replace('/api/', '') + '/images/';
selectedDoc: any = null;
pdfBlobUrl: SafeResourceUrl | null = null;
// store current action temporarily
pendingAction: string | null = null;
public Validators = Validators;
declarationError: boolean = false;
isHQ = false;
  cols = [
    { field: 'field', header: 'Field' },
    { field: 'oldValue', header: 'Old Value' },
    { field: 'newValue', header: 'New Value' }
  ];

  get documentsFormArray() {
    return this.approvalForm.controls['documents'] as FormArray;
  }
  
  get schemeFormArray() {
    return this.schemeForm.controls['scategories'] as FormArray;
  }
  
  get documentsList() {
    return this.documentsFormArray.controls as FormGroup[];
  }

  // 100% Old Component Logic for canshowreason
  get canshowreason() {
    var selectedstsId = this.approvalForm.controls['approvalRejectedstatus']?.value;

     // 👉 get selected text (for RETURN cases)
  const selectedItem = this.approvalformDetail?.statusList
    ?.find(x => x.value === selectedstsId);

  const selectedText = selectedItem?.text?.toLowerCase() || '';
  
    if (selectedstsId == 'RETURNED_TO_MEMBER' || selectedstsId == 'REJECTED'  || selectedText.includes('return')) {
      this.approvalForm.controls['reason'].addValidators(Validators.required);
      this.approvalForm.controls['reason'].updateValueAndValidity();
      return true;
    } else {
      this.approvalForm.controls['reason'].removeValidators(Validators.required);
      this.approvalForm.controls['reason'].updateValueAndValidity();
      return false;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private accountService: AccountService,
    private generalService: GeneralService,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private location: Location
  ) { }
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {

  const target = event.target as HTMLElement;

  const clickedInsidePopover = this.elementRef.nativeElement
    .querySelector('.education-popover')
    ?.contains(target);

  const clickedInsideProfile = this.elementRef.nativeElement
    .querySelector('.profile-popup')
    ?.contains(target);

  const clickedMoreButton = target.closest('.more-btn');
  const clickedViewButton = target.closest('.view-details-btn');
  const clickedVerificationButton = target.closest('.verification-btn');

  if (
    !clickedInsidePopover &&
    !clickedInsideProfile &&
    !clickedMoreButton &&
    !clickedViewButton &&
    !clickedVerificationButton
  ) {
    this.showMorePopup = false;
    this.showProfilePopup = false;
    this.showVerificationPopup = false;
  }
}

  ngOnInit(): void {
    this.user = this.accountService.userValue;
    var dd: UserModel = this.accountService.userValue;
  
    this.schemeForm = new FormGroup({
      scategories: new FormArray([]),
      id: new FormControl(''),
      member_Id: new FormControl(''),
      account_Holder_Name: new FormControl(null),
      account_Number: new FormControl(null),
      address: new FormControl(null),
      iFSC_Code: new FormControl(null),
      bank_Name: new FormControl(null),
      bank_Id: new FormControl(null),
      branch: new FormControl(null),
      branch_Id: new FormControl(null),
      placeOfAccident: new FormControl(null),
      relationshipToTheAccident: new FormControl(null),
      medicalInsurancePlanRegistrationNumber: new FormControl(null),
      isActive: new FormControl(true),
    });

    // Old Component Form Structure fully intact
    this.approvalForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      statusfrom: new FormControl(''),
      status: new FormControl(''),
      date: new FormControl(new Date().toLocaleString()),
      approvalRejectedstatus: new FormControl('', [Validators.required]),
      jobTitle: new FormControl(dd.userDetails.roleName),
      roleId: new FormControl(dd.userDetails.roleId),
      reason: new FormControl(''),
      name: new FormControl(`${dd.firstName} ${dd.lastName}`),
      document: new FormControl(''),
      comments: new FormControl(''),
      assertVerificationDate: new FormControl(''),
      assertVerificationVenue: new FormControl(''),
      verifiedby: new FormControl(''),
      assertVerificationDeclaration: new FormControl(true),
      documents: new FormArray([]),
    });

    let currentUrl = window.location.href;

    // Delete Approval Logic mapping
    if (currentUrl.includes('delete-approval')) {
      this.canshowApproval = false;
      this.approvalForm.get('comments')?.addValidators(Validators.required);
      this.approvalForm.get('comments')?.updateValueAndValidity();
      this.approvalForm.get('approvalRejectedstatus')?.disable();
      this.approvalForm.get('approvalRejectedstatus')?.clearValidators();
      this.approvalForm.get('approvalRejectedstatus')?.updateValueAndValidity();
      this.title = 'Delete Approval Form';
    } else {
      this.title = 'Approval Form';
      this.canshowApproval = true;
    }

    this.route.params.subscribe(params => {
      this.memberId = params['memberid'];
      this.requestId = params['id'];
      this.loadData();
    });

    this.route.queryParams.subscribe(params => {
    this.changedDetailRecord = params['changedDetailRecord'];

    console.log('Changed Detail Record:', this.changedDetailRecord);
    // alert(JSON.stringify( this.changedDetailRecord));
  });
  

  
 const approvalDone = sessionStorage.getItem('approvalDone');

  if (approvalDone === 'true') {
    sessionStorage.removeItem('approvalDone');
    this.router.navigate(['officers', 'applications']);
    return;
  }
  
  this.route.queryParams.subscribe(params => {

  this.changedDetailRecord = params['changedDetailRecord'];

  });

}


ngOnChanges() {

  if (!this.verifiedclicked) {
    this.buttoncliked = false;
  }
}


isImage(fileName: string): boolean {

  if (!fileName) return false;

  const ext = fileName.split('.').pop()?.toLowerCase();

  return ['jpg','jpeg','png','gif','webp'].includes(ext ?? '');

}


openPreview(doc: any) {

  this.selectedDoc = doc;

  if (this.isImage(doc.savedFileName)) {
    this.showPreview = true;
    return;
  }

   const fileUrl =
    `${environment.apiUrl}/Member/Member_Document_Download_for_qr?fileId=${doc.id}`;

  fetch(fileUrl)
    .then(res => res.blob())
    .then(blob => {

      const blobUrl = URL.createObjectURL(blob);

      this.pdfBlobUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

      this.showPreview = true;

    });
}


getDocumentImageUrl(doc: any): SafeResourceUrl | null {

  // if (!doc) return null;

    const fileUrl =
    `${environment.apiUrl}/Member/Member_Document_Download_for_qr?fileId=${doc.id}`;

  // ALWAYS sanitize (important for hosted environments)
  return this.sanitizer.bypassSecurityTrustUrl(fileUrl);
}


closePreview() {
  this.showPreview = false;
}



openDocumentInNewTab(doc: any) {

  if (!doc) return;

  const fileUrl =
    `${environment.apiUrl}Member/Member_Document_Download_for_qr?fileId=${doc.id}`;

  // Open in new tab
  window.open(fileUrl, '_blank');
}

  loadData() {
    let currentUrl = window.location.href;
    this.memberService.Get_Member_Detail_View(this.memberId).subscribe(res => {
      if (res) {
        this.memberDetail = res.data;
      }
    });
     this.memberService.Get_Member_Id_Card(this.memberId)
        .subscribe((x) => {
          if (x) {
            this.memberCardData = x.data;

          }
        });

     this.memberService
              .Get_Member_All_Details_By_MemberId(this.memberId)
              .subscribe((x) => {
                if (x) {
                  this.memberDetails = x.data;
                }
              });

    this.memberService.Get_Member_All_Details_Diff_By_MemberId(this.memberId).subscribe(res => {
      if (res) {
        this.MemberDiffViewModel = res.data;
      }
    });

  this.memberService.MemberDataApprovalForm(this.requestId).subscribe((x) => {
      if (x) {
        this.approvalformDetail = x.data;
         this.setRoleFlag();
        if (currentUrl.includes('delete-approval')) {
          const approveItem = this.approvalformDetail.statusList?.find((x) =>
            x.text?.toLowerCase().startsWith('approve')
          );

          if (approveItem) {
            this.approvalForm
              .get('approvalRejectedstatus')
              ?.patchValue(approveItem.value);
          }
        }

        console.log('approvalformDetail', this.approvalformDetail);
        this.approvalForm
          .get('status')
          ?.patchValue(this.approvalformDetail.currentRoleName);
      }
    });
  }

  submit() {
    if (this.approvalForm.valid) {
      this.submitfnAlone();
    } else {
      triggerValueChangesForAll(this.approvalForm);
    }
  }

// onStatusChange(selectedValue: string) {

//   this.pendingAction = selectedValue;

//   // If Reject or Return → reason required
//   if (selectedValue === 'REJECTED') {

//     const reason = this.approvalForm.get('reason')?.value;
//     if (!reason) {
//       this.approvalForm.get('reason')?.markAsTouched();
//       return;
//     }

//     this.showRejectConfirm = true;
//     return;
//   }

//   // If value is NOT rejected and not same as currentRoleId
//   if (selectedValue !== this.approvalformDetail.currentRoleId &&
//       selectedValue !== 'REJECTED') {

//     const reason = this.approvalForm.get('reason')?.value;
//     if (!reason) {
//       this.approvalForm.get('reason')?.markAsTouched();
//       return;
//     }

//     this.showReturnConfirm = true;
//     return;
//   }

//   // // Approve (same role id)
//   // this.submit();
// }


onStatusChange(selectedValue: string) {

  this.pendingAction = selectedValue;

  const selectedItem = this.approvalformDetail.statusList
    ?.find(x => x.value === selectedValue);

  const selectedText = selectedItem?.text?.toLowerCase() || '';

  // 👉 If Reject OR Return → reason required
  if (selectedText.includes('reject') || selectedText.includes('return')) {

    const reason = this.approvalForm.get('reason')?.value;

    if (!reason) {
      this.approvalForm.get('reason')?.markAsTouched();
      return;
    }

    if (selectedText.includes('reject')) {
      this.showRejectConfirm = true;
    } else {
      this.showReturnConfirm = true;
    }

    return;
  }

  // 👉 Approve case
  // this.submit();
}

goHome() {
  this.showSuccessPopup = false;
  // this.router.navigate(['officers', 'applications']);
   sessionStorage.removeItem('approvalDone');
  this.location.back();

}


confirmReject() {
  this.showRejectConfirm = false;
  this.submit();
}

confirmReturn() {
  this.showReturnConfirm = false;
  this.submit();
}

cancelReject() {
  this.showRejectConfirm = false;
}

cancelReturn() {
  this.showReturnConfirm = false;
}


submitfnAlone() {

  var appstats = this.approvalformDetail.statusList.find(
    (x) => x.value == this.approvalForm.controls['approvalRejectedstatus']?.value
  );

  let selectedText = appstats?.text ?? '';

  var d: MemberDataApprovalFromSubmitModel = {
    requestId: this.requestId,
    selectedRoleText: selectedText,
    status: '',
    selectedRoleId: this.approvalForm.controls['approvalRejectedstatus']?.value,
    currentRoleId: this.approvalformDetail.fromRoleId,
    reason: this.approvalForm.controls['reason']?.value,
    comment: this.approvalForm.controls['comments']?.value,
  };

  this.memberService.MemberData_Approve(d).subscribe((x) => {

    if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: x.message
      });

    } else if (x) {

if (selectedText.toLowerCase().includes('reject')) {
  this.successMessage = 'Application Rejected successfully';
}
else if (selectedText.toLowerCase().includes('approve')) {
  this.successMessage = 'Application Approved successfully';
}
else {
  this.successMessage = 'Application Returned successfully';
}
// session store
 sessionStorage.setItem('approvalDone', 'true');

      this.showSuccessPopup = true;
//       setTimeout(() => {
//   this.goHome();
// }, 3000);
    }

  });
}

  back() {
    // this.router.navigate(['officers/applications']);
    this.location.back();
  }

  dcwt(val: any) {
    if (!val) return '-';
    try {
      const [datePart, timePart, ampm] = val.split(' ');
      const [day, month, year] = datePart.split('-');
      let [hour, minute] = timePart.split(':');
      let h = parseInt(hour);

      if (ampm.toLowerCase() === 'pm' && h < 12) h += 12;
      if (ampm.toLowerCase() === 'am' && h === 12) h = 0;

      const date = new Date(Number(year), Number(month) - 1, Number(day), h, Number(minute));
      return date.toLocaleString('en-IN');
    } catch {
      return dateconvertion(val);
    }
  }

  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }

  generatePivotTable(oldObj: any, newObj: any) {
    const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    const result: any[] = [];
    keys.forEach(key => {
      result.push({
        field: key,
        oldValue: oldObj?.[key] ?? '',
        newValue: newObj?.[key] ?? '',
        hasChanged: oldObj?.[key] !== newObj?.[key]
      });
    });
    return result;
  }


  splitCamelCaseLabel(input: string): string {
    if (!input) return '';
    return input.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
                .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
                .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  getCanShow(rowData: any) {
    return !(rowData['oldValue'] == '' && rowData['newValue'] == '');
  }

  togglePreview() {
    this.openPreviewPopup();
  }

  openPreviewPopup() {
    if (!this.memberDetail) {
      console.error("memberDetail empty");
      return;
    }
    if (!this.MemberDiffViewModel) {
      console.error("MemberDiffViewModel empty");
      return;
    }

    const previewData = {
      personalDetail: {
        firstName: this.memberDetail.firstName || '',
        lastName: this.memberDetail.lastName || '',
        fathersName: this.memberDetail.fathersName || '',
        gender: this.memberDetail.gender || '',
        community: this.memberDetail.community || '',
        maritalStatus: this.memberDetail.maritalStatus || '',
        education: this.memberDetail.education || '',
        dob: this.memberDetail.dob || '',
        phoneNumber: this.memberDetail.phoneNumber || '',
        aadharNumber: this.memberDetail.aadharNumber || '',
        profile_Picture: this.memberDetail.profile_Picture || ''
      },
      permanentAddress: this.MemberDiffViewModel.permanentAddress_Temp || {},
      temporaryAddress: this.MemberDiffViewModel.temproraryAddress_Temp || {},
      bankDetail: this.MemberDiffViewModel.bankDetails_Temp || {},
      familyMemberList: this.MemberDiffViewModel.familyMembers || [],
      orgDetail: this.MemberDiffViewModel.organizationalDetail_Temp || {},
      memberDocuments: this.MemberDiffViewModel.memberDocuments_Temp || [],
      memberNonMandatoryDocuments: this.MemberDiffViewModel.memberNonMandatoryDocuments_Temp || [],
      declarationChecked: true
    };

    this.dialogService.open(MkkMemberViewComponent, {
      header: 'விண்ணப்ப முன்னோட்டம்',
      width: '95vw',
      height: '95vh',
      styleClass: 'mkk-popup',
      contentStyle: { padding: '0', overflow: 'auto' },
      data: previewData
    });
  }

  getDocumentsList(): any[] {
    const docs: any[] = [];
    if (this.documentsList && this.documentsList.length > 0) {
      this.documentsList.forEach((doc: any) => {
        docs.push({
          category: doc.get('documentCategoryName')?.value || 'Document',
          isRequired: doc.get('isRequired')?.value || false,
          files: doc.get('originalFileName')?.value ? 
            [{ id: doc.get('id')?.value, fileName: doc.get('originalFileName')?.value }] : []
        });
      });
    }
    return docs;
  }

  generatePivotTableColms(item: FamilyMemberEducation) {
    return this.generatePivotTable(
      this.MemberDiffViewModel.familyMembersWithEducation?.find(x => x.name === item.name),
      item
    );
  }

    generatePivotTableColmsforDocument(item: MemberDocumentMaster) {
      return this.generatePivotTable(
        this.MemberDiffViewModel.memberDocuments?.find(
          (x) => x.documentCategoryId == item.documentCategoryId
        ),
        item
      );
    }
    generatePivotTableColmsforDocumentNM(item: MemberDocumentMaster) {
      return this.generatePivotTable(
        this.MemberDiffViewModel.memberNonMandatoryDocuments?.find(
          (x) => x.documentCategoryId == item.documentCategoryId
        ),
        item
      );
    }
     downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }


openMore(member: any, index: number, isTemp: boolean, event: MouseEvent) {

  const rect = (event.target as HTMLElement).getBoundingClientRect();

  this.popupPosition = {
    top: rect.top + window.scrollY - 40,
    left: rect.right + window.scrollX + 10
  };

  this.selectedMember = member;
  this.selectedMemberIndex = index;
  this.selectedIsTemp = isTemp;

  this.showMorePopup = true;
}
closeMore() {
  this.showMorePopup = false;
}
getOldFamilyMember() {

  const newMember =
    this.MemberDiffViewModel?.familyMembersWithEducation_Temp?.[this.selectedMemberIndex];

  if (!newMember) return null;

  return this.MemberDiffViewModel?.familyMembersWithEducation
    ?.find((x: any) => x.name === newMember.name);
}

getNewFamilyMember() {
  return this.MemberDiffViewModel?.familyMembersWithEducation_Temp?.[this.selectedMemberIndex];
}

isEducationChanged(field: string): boolean {

  const newMember =
    this.MemberDiffViewModel?.familyMembersWithEducation_Temp?.[this.selectedMemberIndex] as any;

  if (!newMember) return false;

  const oldMember =
    this.MemberDiffViewModel?.familyMembersWithEducation
      ?.find((x: any) => x.id === newMember.id) as any;

  if (!oldMember) return false;

  const oldVal = oldMember?.[field] ?? '';
  const newVal = newMember?.[field] ?? '';

  return String(oldVal).trim() !== String(newVal).trim();
}
verificationDetails(){
  this.showVerificationPopup= true;
}

closeVerification(){
  this.showVerificationPopup = false;
}

Viewdwtails(){
  this.showProfilePopup = true;
}

closeProfilePopup(){
  this.showProfilePopup = false;
}


verfied(event: any) {

  this.verifiedclicked = event.target.checked;

  if (this.verifiedclicked) {
    this.declarationError = false;
  } else {
    this.buttoncliked = false;
  }

}

buttonclicked() {

  if (!this.verifiedclicked) {
    this.declarationError = true;
    return;
  }

  this.declarationError = false;
  this.buttoncliked = true;

}


hasTemp(data: any): boolean {

  if (!data) return false;

  if (Array.isArray(data)) {
    return data.some(x => x?.isTemp === true);
  }

  return data?.isTemp === true;
}

isOrgChanged(field: string): boolean {

  const oldObj: any = this.MemberDiffViewModel?.organizationalDetail;
  const newObj: any = this.MemberDiffViewModel?.organizationalDetail_Temp;

  if (!oldObj || !newObj) return false;

  const oldVal = (oldObj[field] ?? '').toString().trim();
  const newVal = (newObj[field] ?? '').toString().trim();

  return oldVal !== newVal;
}

isFamilyMemberChanged(index: number, field: string): boolean {

  const newMember: any =
    this.MemberDiffViewModel?.familyMembersWithEducation_Temp?.[index];

  if (!newMember) return false;

  const oldMember: any =
    this.MemberDiffViewModel?.familyMembersWithEducation
      ?.find((x: any) => x.name === newMember.name);

  if (!oldMember) return false;

  const oldVal = oldMember?.[field] ?? '';
  const newVal = newMember?.[field] ?? '';

  return String(oldVal).trim() !== String(newVal).trim();
}

setRoleFlag() {
  const role = this.approvalformDetail?.currentRoleName?.toLowerCase() || '';

  this.isHQ =
    role.includes('hq') || 
    role.includes('headquarters');
}
}