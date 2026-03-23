import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import {
  Member_Card_Approval_Master_From,
  MemberDataApprovalFormModel,
  MemberDataApprovalFromSubmitModel,
} from 'src/app/_models/MemberDetailsModel';
import { MemberDetailsViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { ApproveStatusItemModel } from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import {
  triggerValueChangesForAll,
  dateconvertionwithOnlyDate,
  dateconvertion,
} from 'src/app/shared/commonFunctions';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { MemPersonalDetailViewComponent } from "src/app/shared/common/mem-personal-detail-view/mem-personal-detail-view.component";

@UntilDestroy()
@Component({
  selector: 'app-member-card-approval-edit',
  templateUrl: './member-card-approval-edit.component.html',
  styleUrls: ['./member-card-approval-edit.component.scss'],
  
})
export class MemberCardApprovalEditComponent {
  approvalForm!: FormGroup;
  memberDetail!: MemberDetailsViewModelExisting;
  title: string = 'Member Card Approval';
  routeSub!: Subscription;
  memberId!: string;
  requestId!: string;
  approvalStatuses: ApproveStatusItemModel[] = [];
  approvaldetail!: Member_Card_Approval_Master_From;
  memberCardData: any;
  reasons: TCModel[] = [];
  url: any = '';
    apiUrl = environment.apiUrl;
  get trimmedApiUrl(): string {
     return environment.apiUrl.replace(/\/api\/?$/, '').trim();
   }
  get canshowreason() {
    var selectedstsId =
      this.approvalForm.controls['approvalRejectedstatus']?.value;
    if (selectedstsId == 'REJECTED' || selectedstsId == 'RETURNED') {
      this.approvalForm.controls['reason'].addValidators(Validators.required);
      this.approvalForm.controls['reason'].updateValueAndValidity();
      return true;
    }
    this.approvalForm.controls['reason'].removeValidators(Validators.required);
    this.approvalForm.controls['reason'].updateValueAndValidity();
    return false;
  }
  constructor(
    private memberService: MemberService,
    private userService: UserService,
    private accountService: AccountService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
       private location: Location,
    private generalService: GeneralService
  ) {}
  encodeURIComponent = encodeURIComponent;
  ngOnInit() {
    var dd: UserModel = this.accountService.userValue;
    this.approvalForm = new FormGroup({
      id: new FormControl(Guid.create()),
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
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.requestId = params['id']; //log the value of id
        this.memberId = params['memberid']; //log the value of id
        if (this.memberId !== '0') {
          this.userService
            .MemberCardApprovalForm(this.requestId, this.memberId)
            .subscribe((x) => {
              if (x) {
                this.approvaldetail = x.data;
                this.approvalForm
                  .get('status')
                  ?.patchValue(this.approvaldetail.status);
              }
            });
          this.memberService
            .Get_Member_Detail_View(this.memberId)
            .subscribe((x) => {
              if (x) {
                this.memberDetail = x.data;
              }
            });
          this.memberService
            .Get_Member_Id_Card(this.memberId)
            .subscribe((x) => {
              if (x) {
                this.memberCardData = x.data;
                this.url =
                  this.memberCardData.profile_Picture &&
                  this.memberCardData.profile_Picture != ''
                    ? `${environment.apiUrl.replace('/api/', '')}/images/${
                        this.memberCardData.profile_Picture
                      }`
                    : '';
              }
            });
        }
      });
  }
back() {
  
  if (this.router.navigated) {
    this.location.back();
  } else {
    this.router.navigate(['officers', 'applications', 'card-approval']);
  }
}

  submitfnAlone() {
    this.userService
      .MemberCardApproval({
        id: this.approvaldetail.id,
        member_Id: this.memberId,
        approvalComment: this.approvalForm.controls['comments'].value,
        reason: this.approvalForm.controls['reason'].value,
        selectedStatus:
          this.approvalForm.controls['approvalRejectedstatus'].value,
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
            detail: 'Saved Successfully',
          });
          this.router.navigate(['officers', 'applications', 'card-approval']);
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
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  getCommaSeparatedNamesFromFamily(
    members: { nameEnglish?: string; nameTamil?: string }[],
    language: 'English' | 'Tamil'
  ): string {
    const key = language === 'English' ? 'nameEnglish' : 'nameTamil';

    return members
      .map((member) => member[key]?.trim())
      .filter((name) => !!name)
      .join(', ');
  }

  getFormattedAddress(data: any): string {
    const parts: string[] = [];

    if (data.doorNo) {
      parts.push(`D.No ${data.doorNo}`);
    }

    if (data.streetName) {
      parts.push(data.streetName);
    }

    if (data.villlageTownCity) {
      parts.push(data.villlageTownCity);
    }

    if (data.districtEnglish) {
      parts.push(data.districtEnglish);
    }

    if (data.pincode) {
      parts.push(data.pincode);
    }

    return parts.join(', ');
  }
}
