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
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import {
  ConfirmationService,
  ConfirmEventType,
  MessageService,
} from 'primeng/api';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { ApplicationApprovalFileModel } from 'src/app/_models/ConfigurationModel';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import {
  ApplicationDetailViewModel,
  ApplicationDetailViewModel1,
  ApplicationDocumentFormModel,
  ApprovalModel,
  ApproveStatusItemModel,
  ApproveStatusViewModel,
} from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { triggerValueChangesForAll } from 'src/app/shared/commonFunctions';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-scheme-approval-view',
  templateUrl: './scheme-approval-view.component.html',
  styleUrls: ['./scheme-approval-view.component.scss'],
})
export class SchemeApprovalViewComponent {
  title: string = 'Application Approval';
  schemeDetails!: ApplicationDetailViewModel1;
  memberDetail!: MemberViewModelExisting;
  routeSub!: Subscription;
  applicationId!: string;
  approvalForm!: FormGroup;
  reasons: TCModel[] = [];
  showCheckMeetingTimePopup: boolean = false;
  isDocumentRequired: boolean = false;
  showAssertVerfication: boolean = false;
  isForm3Required: boolean = false;
  isUcRequired: boolean = false;

  documentFieldLabel!: string;
  approvalStatuses: ApproveStatusItemModel[] = [];
  filee!: any;
  endDate = moment(new Date()).toDate();

  showDecError: boolean = false;
  approvalId: string = Guid.raw();
  get canshowreason() {
    var selectedstsId =
      this.approvalForm.controls['approvalRejectedstatus']?.value;
    var appstats: ApproveStatusItemModel | undefined =
      this.approvalStatuses.find((x) => x.statusId == selectedstsId);
    if (
      appstats &&
      (appstats.status == 'RETURNED' || appstats.status == 'REJECTED')
    ) {
      this.approvalForm.controls['reason'].addValidators(Validators.required);
      this.approvalForm.controls['reason'].updateValueAndValidity();
      return true;
    } else if (appstats && appstats.status == 'APPROVED') {
    }
    this.approvalForm.controls['reason'].removeValidators(Validators.required);
    this.approvalForm.controls['reason'].updateValueAndValidity();
    return false;
  }

  get documentsFormArray() {
    return this.approvalForm.controls['documents'] as FormArray;
  }
  get documentsList() {
    return this.documentsFormArray.controls as FormGroup[];
  }
  get fileUploadErrorMsg() {
    var error: any;
    if (this.documentsList) {
      this.documentsList.map((x) => {
        if (x.controls['savedFileName'].errors) {
          error = x.controls['savedFileName'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
    }

    return null;
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
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'REASON' })
      .subscribe((c) => {
        this.reasons = c.data;
      });
    var dd: UserModel = this.accountService.userValue;
    this.approvalForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      statusfrom: new FormControl(''),
      status: new FormControl(''),
      date: new FormControl(new Date().toLocaleString()),
      approvalRejectedstatus: new FormControl('', [Validators.required]),
      jobTitle: new FormControl(dd.userDetails.roleName),
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
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.applicationId = params['id']; //log the value of id
        if (this.applicationId !== '0') {
        }
        this.schemeService
          .Application_Get(this.applicationId)
          .subscribe((c) => {
            this.schemeDetails = c.data[0];

            this.memberService
              .Get_Member_All_Details_By_MemberId(c.data[0].memberId)
              .subscribe((x) => {
                if (x) {
                  this.memberDetail = x.data;
                }
              });
          });
        this.schemeService
          .Application_Approve_Get_Status_List(this.applicationId)
          .subscribe((c) => {
            var dat: ApproveStatusViewModel = c.data;
            this.approvalStatuses = dat.statusList;
            this.showCheckMeetingTimePopup = dat.showCheckMeetingTimePopup;
            this.showAssertVerfication = dat.showAssertVerfication;
            this.isDocumentRequired = dat.isDocumentRequired;
            this.isUcRequired = dat.isUcRequired;
            this.isForm3Required = dat.isForm3Required;
            this.reasons = dat.reason;
            this.documentFieldLabel =
              dat.documentFieldLabel && dat.documentFieldLabel != ''
                ? dat.documentFieldLabel
                : 'Document';
            this.approvalForm.controls['status'].patchValue(
              c.data.currentStatusName
            );
            this.approvalForm.controls['statusfrom'].patchValue(
              c.data.currentStatus
            );
            if (this.showAssertVerfication) {
              this.approvalForm.controls[
                'assertVerificationDate'
              ].addValidators(Validators.required);
              this.approvalForm.controls[
                'assertVerificationVenue'
              ].addValidators(Validators.required);
              this.approvalForm.controls['verifiedby'].addValidators(
                Validators.required
              );
              this.approvalForm.controls[
                'assertVerificationDeclaration'
              ].addValidators(Validators.required);
            }
          });
      });
  }
  changeApproveStatus() {
    var selectedstsId =
      this.approvalForm.controls['approvalRejectedstatus']?.value;
    var appstats: ApproveStatusItemModel | undefined =
      this.approvalStatuses.find((x) => x.statusId == selectedstsId);
    if (appstats && appstats.status == 'APPROVED') {
      this.getDocuments(selectedstsId);
    }
  }
  updateError() {
    this.showDecError = false;
  }
  submit() {
    if (
      this.approvalForm.controls['assertVerificationDeclaration'].value != true
    ) {
      this.showDecError = true;
      return;
    }
    var df = this.approvalStatuses.find(
      (x) =>
        x.statusId == this.approvalForm.controls['approvalRejectedstatus'].value
    );
    if (df && this.approvalForm.valid) {
      const first = this.schemeService.Application_Form_3_Get(
        '',
        this.schemeDetails.applicationId
      );
      const second = this.schemeService.Application_Utilisation_Certificate_Get(
        '',
        this.schemeDetails.applicationId
      );

      forkJoin([first, second]).subscribe((res: any[]) => {
        const combinedData = { ...res[0], ...res[1] };

        var selectedstsId =
          this.approvalForm.controls['approvalRejectedstatus']?.value;
        var appstats: ApproveStatusItemModel | undefined =
          this.approvalStatuses.find((x) => x.statusId == selectedstsId);
        if (
          res[0].data.length <= 0 &&
          this.isForm3Required &&
          appstats &&
          appstats.status == 'APPROVED'
        ) {
          this.confirmationService.confirm({
            message:
              'Please provide the Form 3 details to complete the approval process.',
            header: 'Information',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
          return;
        } else if (
          res[1].data.length <= 0 &&
          this.isUcRequired &&
          appstats &&
          appstats.status == 'APPROVED'
        ) {
          this.confirmationService.confirm({
            message:
              'Please provide the Utilization Certificate details to complete the approval process.',
            header: 'Information',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
          return;
        } else {
          this.submitfnAlone(df);
        }
      });
    } else {
      triggerValueChangesForAll(this.approvalForm);
    }
  }
  submitfnAlone(df: any) {
    var d: ApprovalModel = {
      id: this.approvalId,
      approvalComment: this.approvalForm.controls['comments'].value,
      applicationId: this.applicationId,
      statusIdFrom: this.approvalForm.controls['statusfrom'].value,
      statusIdTo: this.approvalForm.controls['approvalRejectedstatus'].value,
      reason: this.approvalForm.controls['reason'].value,
      file: this.approvalForm.controls['document'].value,
      schemeId: df.schemeId,
      status: df.status,
      assertVerificationDate:
        this.approvalForm.controls['assertVerificationDate'].value,
      assertVerificationVenue:
        this.approvalForm.controls['assertVerificationVenue'].value,
      verifiedby: this.approvalForm.controls['verifiedby'].value,
      assertVerificationDeclaration:
        this.approvalForm.controls['assertVerificationDeclaration'].value,
    };
    const formData = new FormData();
    formData.append('id', d.id);
    formData.append('file', this.filee);
    formData.append('approvalComment', d.approvalComment);
    formData.append('statusIdFrom', d.statusIdFrom);
    formData.append('applicationId', d.applicationId);
    formData.append('statusIdTo', d.statusIdTo);
    formData.append('reason', d.reason);
    if (d.assertVerificationDate) {
      formData.append(
        'assertVerificationDate',
        moment(d.assertVerificationDate).format('YYYY-MM-DD')
      );
    }
    formData.append('assertVerificationVenue', d.assertVerificationVenue);
    formData.append('verifiedby', d.verifiedby);
    formData.append(
      'assertVerificationDeclaration',
      d.assertVerificationDeclaration ? 'True' : 'False'
    );
    formData.append('schemeId', d.schemeId);
    formData.append('status', d.status);
    if (df.status == 'APPROVED' && this.showCheckMeetingTimePopup) {
      this.http
        .post(`${environment.apiUrl}/User/Application_Approve`, formData)
        .subscribe(
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Uploaded Successfully',
            });
            this.router.navigate(['/officers/applications']);
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to Upload! Please try again',
            });
          }
        );
    } else {
      this.http
        .post(`${environment.apiUrl}/User/Application_Approve`, formData)
        .subscribe(
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Uploaded Successfully',
            });
            this.router.navigate(['/officers/applications']);
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to Upload! Please try again',
            });
          }
        );
    }
  }
  back() {
    this.router.navigate(['officers', 'applications']);
  }

  onSelectDocumentFile(event: any) {
    if (event.files && event.files[0]) {
      const formData = new FormData();
      this.filee = event.files[0];
      this.approvalForm.controls['document'].setValue(event.files[0]);
    } else {
      this.filee = null;
    }
  }

  removeFile(itemrow: any) {
    this.schemeService
      .Application_Approval_File_Delete(itemrow.controls['id'].value)
      .subscribe((v) => {
        this.getDocuments(
          this.approvalForm.controls['approvalRejectedstatus']?.value
        );
      });
  }
  generateDefaultRows(docs: ApplicationApprovalFileModel[]) {
    if (docs) {
      docs.forEach((x) => {
        this.documentsFormArray.push(
          this.formBuilder.group({
            id: [!x.ida || x.ida == '' ? Guid.raw() : x.ida],
            applicationId: [
              this.schemeDetails.applicationId,
              [Validators.required],
            ],
            statusId: [
              this.approvalForm.controls['approvalRejectedstatus'].value,
              [Validators.required],
            ],
            docCategoryId: [x.docCategoryId],
            docCategory: [x.docCategory],
            isRequired: [x.isRequired],
            savedFileName: [
              x.savedFileName,
              x.isRequired ? [Validators.required] : [],
            ],
            originalFileName: [x.originalFileName],
          })
        );
      });
    }
  }
  getDocuments(selectedstsId: string) {
    this.schemeService
      .Application_Approval_Doc_Category_Get(
        this.schemeDetails.schemeId,
        this.schemeDetails.applicationId,
        selectedstsId,
        this.approvalId
      )
      .subscribe((c) => {
        if (c.data) {
          var d: ApplicationApprovalFileModel[] = c.data;
          if (d) {
            this.documentsFormArray.clear();
            this.generateDefaultRows(d);
          }
        }
      });
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.SchemeFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  approvalStatusFiledownloads(original: string, id: string) {
    this.generalService.approvalStatusFiledownloads(original ?? 'File.png', id);
  }
  onSelectDocumentFileuploadMul(event: any, id: string) {
    if (event.files && event.files[0]) {
      var df = this.documentsList.find((x) => x.controls['id'].value == id);
      if (df) {
        var applicationId = df.controls['applicationId'].value;
        const formData = new FormData();
        formData.append('file', event.files[0]);
        formData.append(
          'statusId',
          this.approvalForm.controls['approvalRejectedstatus'].value
        );
        formData.append('docCategoryId', df.controls['docCategoryId'].value);
        formData.append('ida', id);
        formData.append('approvalCommentId', this.approvalId);
        formData.append('applicationId', applicationId);
        formData.append('isActive', 'True');
        this.http
          .post(
            `${environment.apiUrl}/User/Application_Approval_File_Upload`,
            formData
          )
          .subscribe(
            (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Uploaded Successfully',
              });
              this.getDocuments(
                this.approvalForm.controls['approvalRejectedstatus']?.value
              );
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to Upload! Please try again',
              });
            }
          );
      }
    }
  }
  removefile(event: any) {
    this.filee = null;
  }
}
