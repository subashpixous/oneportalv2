import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import {
  MemberDataApprovalFormModel,
  MemberDataApprovalFromSubmitModel,
  MemberDocumentMaster,
  MemberGetModels,
} from 'src/app/_models/MemberDetailsModel';
import {
  FamilyMemberEducation,
  MemberDetailsViewModelExisting,
  MemberDiffViewModel,
  MemberViewModelExisting,
} from 'src/app/_models/MemberViewModelExsisting';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { ApproveStatusItemModel } from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { MemBankDetailViewComponent } from 'src/app/shared/common/mem-bank-detail-view/mem-bank-detail-view.component';
import {
  dateconvertion,
  dateconvertionwithOnlyDate,
  triggerValueChangesForAll,
} from 'src/app/shared/commonFunctions';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-member-update-approval',
  templateUrl: './member-update-approval.component.html',
  styleUrls: ['./member-update-approval.component.scss'],
})
export class MemberUpdateApprovalComponent {
  title: string = '';
  memberDetail!: MemberDetailsViewModelExisting;
  MemberDiffViewModel!: MemberDiffViewModel;
  cols: any[] = [
    { field: 'field', header: 'Field' },
    { field: 'oldValue', header: 'Old Value' },
    { field: 'newValue', header: 'New Value' },
  ];
  products: DiffItem[] = [];
  routeSub!: Subscription;
  memberId!: string;
  requestId!: string;
  approvalForm!: FormGroup;
  approvalStatuses: ApproveStatusItemModel[] = [];
  approvalformDetail!: MemberDataApprovalFormModel;
  reasons: TCModel[] = [];
  get canshowreason() {
    var selectedstsId =
      this.approvalForm.controls['approvalRejectedstatus']?.value;
    if (selectedstsId == 'RETURNED_TO_MEMBER' || selectedstsId == 'REJECTED') {
      this.approvalForm.controls['reason'].addValidators(Validators.required);
      this.approvalForm.controls['reason'].updateValueAndValidity();
      return true;
    } else if (selectedstsId == 'APPROVED') {
    }
    this.approvalForm.controls['reason'].removeValidators(Validators.required);
    this.approvalForm.controls['reason'].updateValueAndValidity();
    return false;
  }
  constructor(
    private messageService: MessageService,
    private memberService: MemberService,
    private schemeService: SchemeService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {}
  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.requestId = params['id']; //log the value of id
        this.memberId = params['memberid']; //log the value of id
        if (this.memberId !== '0') {
          this.memberService
            .Get_Member_Detail_View(this.memberId)
            .subscribe((x) => {
              if (x) {
                this.memberDetail = x.data;
              }
            });
          this.memberService
            .Get_Member_All_Details_Diff_By_MemberId(this.memberId)
            .subscribe((x) => {
              if (x) {
                this.MemberDiffViewModel = x.data;
              }
            });
        }
      });
    var dd: UserModel = this.accountService.userValue;
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
      comments: new FormControl(''),
    });
    this.memberService.MemberDataApprovalForm(this.requestId).subscribe((x) => {
      if (x) {
        this.approvalformDetail = x.data;
        this.approvalForm
          .get('status')
          ?.patchValue(this.approvalformDetail.currentRoleName);
      }
    });
    this.products = this.generatePivotTable(
      {
        nameFirst: 'John',
        age: 30,
        city: 'New York',
      },
      {
        nameFirst: 'John Doe',
        age: 30,
        city: 'Los Angeles',
      }
    );
  }
  back() {
    this.router.navigate(['officers', 'applications', 'approval']);
  }
  generatePivotTable(oldObj: any, newObj: any): DiffItem[] {
    const keys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {}),
    ]);

    const result: DiffItem[] = [];

    keys.forEach((key) => {
      const oldValue = oldObj?.[key] ?? '';
      const newValue = newObj?.[key] ?? '';
      const hasChanged = oldValue !== newValue;

      result.push({ field: key, oldValue, newValue, hasChanged });
    });
    return result.filter(
      (x) =>
        x.field != 'isTemp' &&
        x.field != 'isSubmitted' &&
        x.field != 'isNewMember' &&
        x.field != 'isAlreadyMember' &&
        x.field != 'id' &&
        x.field != 'isApprovalPending' &&
        x.field != 'member_Id' &&
        x.field != 'documentCategoryId' &&
        x.field != 'acceptedDocumentTypeId' &&
        x.field != 'acceptedDocumentTypeSelectList' &&
        x.field != 'acceptedDocumentTypeSelectList'
    );
  }
  splitCamelCaseLabel(input: string): string {
    if (!input) return '';
    return (
      input
        // Insert space before all caps following lowercase or numbers
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        // Insert space between consecutive capital letters and the next word
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        // Capitalize first letter of each word
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  }
  getCanShow(rowData: any) {
    return !(rowData['oldValue'] == '' && rowData['newValue'] == '');
  }
  generatePivotTableColms(item: FamilyMemberEducation) {
    return this.generatePivotTable(
      this.MemberDiffViewModel.familyMembersWithEducation.find(
        (x) => x.name == item.name
      ),
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
  submit() {
    if (this.approvalForm.valid) {
      this.submitfnAlone();
    } else {
      triggerValueChangesForAll(this.approvalForm);
    }
  }
  changeApproveStatus() {
    var selectedstsId =
      this.approvalForm.controls['approvalRejectedstatus']?.value;
    var appstats: ApproveStatusItemModel | undefined =
      this.approvalStatuses.find((x) => x.statusId == selectedstsId);
    if (appstats && appstats.status == 'APPROVED') {
    }
  }
  submitfnAlone() {
    var appstats: TCModel | undefined = this.approvalformDetail.statusList.find(
      (x) =>
        x.value == this.approvalForm.controls['approvalRejectedstatus']?.value
    );
    var d: MemberDataApprovalFromSubmitModel = {
      requestId: this.requestId,
      selectedRoleText: appstats?.text ?? '',
      status: '',
      selectedRoleId:
        this.approvalForm.controls['approvalRejectedstatus']?.value,
      currentRoleId: this.approvalformDetail.fromRoleId,
      reason: this.approvalForm.controls['reason']?.value,
      comment: this.approvalForm.controls['comments']?.value,
    };
    this.memberService.MemberData_Approve(d).subscribe((x) => {
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
          detail: 'Saved Successfully',
        });
        this.router.navigate(['officers', 'applications', 'approval']);
      }
    });
  }
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
}
export interface DiffItem {
  field: string;
  oldValue: any;
  newValue: any;
  hasChanged: boolean;
}
