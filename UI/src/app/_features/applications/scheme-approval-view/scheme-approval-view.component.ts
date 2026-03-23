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
import { MemberDocumentMasterModelExisting, MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
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
import { convertoWords, dateconvertion, dateconvertionwithOnlyDate, triggerValueChangesForAll } from 'src/app/shared/commonFunctions';
import { environment } from 'src/environments/environment';
import { DialogService } from 'primeng/dynamicdialog';
import { MkkViewComponent } from '../../../shared/common/mkk-view/mkk-view.component';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { privileges } from 'src/app/shared/commonFunctions';
@UntilDestroy()
@Component({
  selector: 'app-scheme-approval-view',
  templateUrl: './scheme-approval-view.component.html',
  styleUrls: ['./scheme-approval-view.component.scss'],
  providers: [DialogService]
})
export class SchemeApprovalViewComponent {
  title: string = 'Scheme Approval';
  schemeDetails!: ApplicationDetailViewModel1;
  memberDetail!: MemberViewModelExisting;
  routeSub!: Subscription;
  applicationId!: string;
  applicationid: string = '';
  approvalForm!: FormGroup;
  schemeForm!: FormGroup;
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
  checked: boolean = false;

  showDecError: boolean = false;
  approvalId: string = Guid.raw();
userRole: string = '';
      showPreview: boolean = false;
      showSchemeDetailsPopup: boolean = false;
schemeCateDetail: any;
displayStatusPopup: boolean = false;
  isSuccessPopup: boolean = true;
  statusPopupMessage: string = '';
  selectedApprovalStatus: any;
isVerified: boolean = false;
isAdditionalInfo: boolean = false;
hasSchemeVerifyPrivilege: boolean = false;
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
      get schemeFormArray() {
      return this.schemeForm.controls['scategories'] as FormArray;
    }
  get documentsList() {
    return this.documentsFormArray.controls as FormGroup[];
  }
  // 1. Check if documents are uploaded to show the Verify button
get allDocumentsUploaded(): boolean {
  if (this.schemeDetails?.applicationDocument && this.schemeDetails.applicationDocument.length > 0) {
    return this.schemeDetails.applicationDocument.some((grp: any) => grp.documents && grp.documents.length > 0);
  }
  return false;
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
    private dialogService: DialogService,
    private http: HttpClient,
    private schemeConfigService: SchemeConfigService,
    private cookieService: CookieService
  ) {}
  ngOnInit() {


  const privilegeRaw = this.cookieService.get('privillage') || '';

  // ✅ Must decode
  const decodedPrivilege = decodeURIComponent(privilegeRaw);

  console.log('Decoded:', decodedPrivilege);

  this.hasSchemeVerifyPrivilege = decodedPrivilege
    .split(',')
    .map(p => p.trim())
    .includes('SCHEME_VERIFY');

  console.log('Has Verify Privilege:', this.hasSchemeVerifyPrivilege);


    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'REASON' })
      .subscribe((c) => {
        this.reasons = c.data;
      });
    var dd: UserModel = this.accountService.userValue;
    this.userRole = dd?.userDetails?.roleName;


          this.schemeForm = new FormGroup({
        scategories: new FormArray([]),

        id: new FormControl(''),
        member_Id: new FormControl(''), // TODO
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
console.log('API Response Scheme Details:', this.schemeDetails); // <-- Check this in browser console
            this.schemeConfigService.Application_Scheme_Form({
        applicationId: this.schemeDetails.applicationId,
        schemeId: this.schemeDetails.schemeId,
    }).subscribe((x) => {
        if (x) {
            this.schemeCateDetail = x.data;
        }
    });

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
    console.log("Is Form Valid? : ", this.approvalForm.valid); // Itha add panni console la paarunga (false nu vantha neenga reason select pannalanu artham)
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
        if (res[0].data.length <= 0 && this.isForm3Required && appstats && appstats.status == 'APPROVED') {
          this.confirmationService.confirm({
            message:
              'Please provide the Form 3 details to complete the approval process.',
            header: 'Information',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
          return;
        } else if (res[1].data.length <= 0 && this.isUcRequired && appstats && appstats.status == 'APPROVED') {
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
          // Ithu thaan namma maathina edam bro.
          this.selectedApprovalStatus = df;
          
if (appstats && (appstats.status == 'RETURNED' || appstats.status == 'REJECTED')) {

  this.isSuccessPopup = false;

  if (appstats.status == 'RETURNED') {
    this.statusPopupMessage = 'Do you want to return the selected Scheme application?';
  } else if (appstats.status == 'REJECTED') {
    this.statusPopupMessage = 'Do you want to reject the selected Scheme application?';
  }

  this.displayStatusPopup = true;
} else {
            this.submitfnAlone(df);
          }
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
      this.http.post(`${environment.apiUrl}/User/Application_Approve`, formData).subscribe(
        (response) => {
          // Success aana udane direct a Green popup kaaturom bro
          this.isSuccessPopup = true;
          this.statusPopupMessage = 'Scheme Application Approved successfully';
          this.displayStatusPopup = true;
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

    // ✅ Show success popup for ALL statuses
    this.isSuccessPopup = true;

    if (df.status === 'APPROVED') {
      this.statusPopupMessage = 'Scheme Application Approved Successfully';
    }
    else if (df.status === 'RETURNED') {
      this.statusPopupMessage = 'Scheme Application Returned Successfully';
    }
    else if (df.status === 'REJECTED') {
      this.statusPopupMessage = 'Scheme Application Rejected Successfully';
    }

    this.displayStatusPopup = true;

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
  confirmReturnAction() {
    this.displayStatusPopup = false;
    if (this.selectedApprovalStatus) {
      this.submitfnAlone(this.selectedApprovalStatus);
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
downloadFile(original: string, saved: string) {
  this.generalService.approvalFiledownloads(saved, original ?? 'File.png');
}
    approvalFiledownloads(original: string, saved: string) {
    this.generalService.approvalFiledownloads(saved, original ?? 'File.png');
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
  // Handles the click for the dynamic action buttons
  // processAction(statusId: string) {
  //   // 1. Set the selected status value in the form control
  //   this.approvalForm.controls['approvalRejectedstatus'].setValue(statusId);
  //   this.changeApproveStatus(); 
    
  //   // 2. Check if the form needs more info (like 'Reason' for Reject/Return)
  //   if (this.approvalForm.invalid) {
  //     this.approvalForm.markAllAsTouched(); // Highlights the missing fields in red
  //     this.messageService.add({ 
  //       severity: 'warn', 
  //       summary: 'Missing Details', 
  //       detail: 'Please fill in the required fields (like Reason) before proceeding.' 
  //     });
  //     return; // Stop submission until they fill it out
  //   }
    
  //   // 3. If everything is valid, submit!
  //   this.submit();
  // }

  // Gives the green class for Approve and red/orange class for Return/Reject
  // getButtonClass(statusString: string): string {
  //   if (!statusString) return 'btn-approve';
    
  //   const s = statusString.toUpperCase();
  //   if (s.includes('APPROVE')) {
  //     return 'btn-approve'; // Your existing green button class
  //   } else if (s.includes('RETURN') || s.includes('REJECT')) {
  //     return 'btn-return'; // Your existing red button class
  //   }
  //   return 'btn-approve'; // Default fallback
  // }
  togglePreview() {
  this.openPreviewPopup();
}
  dcwt(val: any) {
    return dateconvertion(val);
  }
openPreviewPopup() {
  // Get selected sub scheme
  const selectedSubScheme = this.getSelectedSubScheme();
  // FIX 1: Extract actual uploaded scheme documents from schemeDetails
    let schemeDocs: any[] = [];
    if (this.schemeDetails?.applicationDocument && this.schemeDetails.applicationDocument.length > 0) {
      this.schemeDetails.applicationDocument.forEach((grp: any) => {
        if (grp.documents && grp.documents.length > 0) {
          schemeDocs = [...schemeDocs, ...grp.documents];
        }
      });
    }

    // FIX 2: Ensure amount is calculated correctly
    let finalAmount = this.getAmount();
  // Prepare data for popup - USING CORRECT PROPERTY NAMES from your model
  const previewData = {
    schemeDetails: {
      applicationId: this.applicationid,
      memberId: this.memberDetail?.memberDetail?.memberId,
      schemeGroupName: this.schemeDetails?.schemeGroupName,
      scheme: this.schemeDetails?.scheme ,
      subScheme: selectedSubScheme,
      applicantName: this.schemeDetails?.name || '',
      memberName: this.schemeDetails?.memberName,
      beneficiaryName: this.schemeDetails?.beneficiaryName || '',
      relationship: this.schemeDetails?.relationship || '',
amount: finalAmount + '/-',
        amountInWords: this.CtoWords(finalAmount),
      aadharNumber: this.schemeDetails?.applicantAadharNumber || '',
      mobileNumber: this.schemeDetails?.mobile || ''
    },
    // FIXED: Changed 'personalDetail' to 'memberDetail' based on your interface
    personalDetail: {
      firstName: this.memberDetail?.memberDetail?.firstName || '',
      lastName: this.memberDetail?.memberDetail?.lastName || '',
      fathersName: this.memberDetail?.memberDetail?.fathersName || '',
      gender: this.memberDetail?.memberDetail?.gender || '',
      community: this.memberDetail?.memberDetail?.community || '',
      // caste: this.memberDetail?.memberDetail?.caste || '',
      maritalStatus: this.memberDetail?.memberDetail?.maritalStatus || '',
      education: this.memberDetail?.memberDetail?.education || '',
      dob: this.memberDetail?.memberDetail?.dob || '',
      phoneNumber: this.memberDetail?.memberDetail?.phoneNumber || '',
      aadharNumber: this.memberDetail?.memberDetail?.aadharNumber || '',
      profilePicture: this.memberDetail?.memberDetail?.profile_Picture || '' // mapped profile_Picture
    },
    permanentAddress: {
      doorNo: this.memberDetail?.permanentAddress?.doorNo || '',
      streetName: this.memberDetail?.permanentAddress?.streetName || '',
      villageorCity: this.memberDetail?.permanentAddress?.villageorCity || '',
      talukName: this.memberDetail?.permanentAddress?.talukName || '',
      district: this.memberDetail?.permanentAddress?.district || '',
      pincode: this.memberDetail?.permanentAddress?.pincode || '',
      isConfirmed: true
    },
    temporaryAddress: {
      doorNo: this.memberDetail?.temproraryAddress?.doorNo || '',
      streetName: this.memberDetail?.temproraryAddress?.streetName || '',
      villageorCity: this.memberDetail?.temproraryAddress?.villageorCity || '',
      talukName: this.memberDetail?.temproraryAddress?.talukName || '',
      district: this.memberDetail?.temproraryAddress?.district || '',
      pincode: this.memberDetail?.temproraryAddress?.pincode || '',
      isConfirmed: true
    },
    bankDetail: {
      accountHolderName: this.memberDetail?.bankDetails?.accountHolderName || '',
      accountNumber: this.memberDetail?.bankDetails?.accountNumber || '',
      ifsc: this.memberDetail?.bankDetails?.ifsc || '',
      branchName: this.memberDetail?.bankDetails?.branchName || '',
      bankName: this.memberDetail?.bankDetails?.bankName || '',
      note: 'திட்ட நலன்களை பெற, உங்கள் வங்கி கணக்கு ஆதாருடன் இணைக்கப்பட்டிருக்க வேண்டும்.'
    },
    familyMemberList: this.memberDetail?.familyMembers || [],
    orgDetail: {
      typeOfWork: this.memberDetail?.organizationalDetail?.typeOfWork || '',
      typeOfCoreSanitoryWorker: this.memberDetail?.organizationalDetail?.typeOfCoreSanitoryWorker || '',
      organizationType: this.memberDetail?.organizationalDetail?.organizationType || '',
      natureOfJob: this.memberDetail?.organizationalDetail?.natureOfJob || '',
      workOrganisationName: this.memberDetail?.organizationalDetail?.workOrganisationName || '',
      distritName: this.memberDetail?.organizationalDetail?.distritName || '',
      localBody: this.memberDetail?.organizationalDetail?.localBody || '',
      nameoftheLocalBody: this.memberDetail?.organizationalDetail?.nameoftheLocalBody || '',
      townPanchayat: this.memberDetail?.organizationalDetail?.townPanchayat || ''
    },
    documentsList: schemeDocs, // Pass the form array directly
    memberDocuments: this.memberDetail?.memberDocuments || [],
    memberNonMandatoryDocuments: this.memberDetail?.memberNonMandatoryDocuments || [],
    declarationChecked: true,
    isSubmitted: true
  };

  console.log('Preview Data:', previewData);
const ref = this.dialogService.open(MkkViewComponent, {
width: '1000px',             // Kept from your original <p-dialog>
      closable: true,            // Hides the default close icon (clossabel falso)
      showHeader: false,          // Hides the header completely
      dismissableMask: true,      // Closes when clicking outside (from your original)
      styleClass: 'mkk-popup',    // Added from your DialogService example
      contentStyle: { padding: '0', overflow: 'auto' },
  data: previewData
});
}

// Helper method to get documents list
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
    getSelectedSubScheme(): string {
  if (!this.schemeFormArray || !this.schemeFormArray.controls) return 'N/A';
  
  // Find the selected scheme from the form array
  const selected = this.schemeFormArray.controls.find(c => c.get('isSelected')?.value === true);
  return selected ? selected.get('subCategory')?.value : 'N/A';
}
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
    getCategories(mandoc: MemberDocumentMasterModelExisting[]) {
      return mandoc.filter((x) => x.savedFileName && x.savedFileName != '');
    }
getAmount() {
    var totl = 0;
    if (this.schemeCateDetail && this.schemeCateDetail.schemeSubCategory) {
        this.schemeCateDetail.schemeSubCategory.forEach((x: any) => {
            if (x.isSelected) {
                totl += Number(x.amount);
            }
        });
    }
    return totl;
}
        CtoWords(amt: any) {
          return convertoWords(amt);
        }


onVerifyClick() {
  if (!this.hasSchemeVerifyPrivilege) return;

  this.isVerified = true;
  this.isAdditionalInfo = false;

  // ✅ Auto-fill Verified By with Role
  this.approvalForm.controls['verifiedby'].setValue(this.userRole);

  this.messageService.add({
    severity: 'success',
    summary: 'Verified',
    detail: 'Documents verified successfully',
    life: 3000
  });
}

  onAdditionalInfoClick() {
    this.isAdditionalInfo = true;
    this.isVerified = false; 
    
    // Clear the verified by value if they switch to Additional Info
    this.approvalForm.controls['verifiedby'].setValue('');
  }
}
