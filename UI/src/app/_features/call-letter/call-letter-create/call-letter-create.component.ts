import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AccountUserFormDetailModel } from 'src/app/_models/AccountUserViewModel';
import {
  CallletterApplicationModel,
  CallletterMasterSaveModel,
} from 'src/app/_models/CallletterApplicationModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { CallLetterService } from 'src/app/services/call-letter.Service';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-call-letter-create',
  templateUrl: './call-letter-create.component.html',
  styleUrls: ['./call-letter-create.component.scss'],
})
export class CallLetterCreateComponent {
  title: string = 'Call Letter Schedule';
  title1: string = 'Applications';
  callLetterId!: string;
  callLetterForm!: FormGroup;
  callLetterDetails!: CallletterMasterSaveModel | null;

  isNewForm: boolean = false;
  defaultDate = moment(new Date()).toDate();

  routeSub!: Subscription;

  districts: TCModel[] = [];
  schemes: TCModel[] = [];
  statuses: TCModel[] = [];
  applications: TCModel[] = [];

  configurationList!: CallletterApplicationModel[];
  cols!: Column[];
  searchableColumns!: string[];
  actions: Actions[] = [];
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'value';
  defaultSortOrder: number = 1;
  privleges = privileges;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private generalService: GeneralService,
    private schemeService: SchemeService,
    private callLetterService: CallLetterService,
    private userService: UserService
  ) {}

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.callLetterForm.reset();
  }

  ngOnInit() {
    this.cols = [
      {
        field: 'isSentString',
        header: 'Status',
        customExportHeader: 'Status',
        sortablefield: 'isSent',
        isSortable: true,
      },
      {
        field: 'applicantName',
        header: 'Applicant Name',
        sortablefield: 'applicantName',
        isSortable: true,
      },
      {
        field: 'applicationNumber',
        header: 'Application Number',
        sortablefield: 'applicationNumber',
        isSortable: true,
      },
      {
        field: 'email',
        header: 'Email',
        sortablefield: 'email',
        isSortable: true,
      },
      {
        field: 'mobile',
        header: 'Mobile',
        sortablefield: 'code',
        isSortable: true,
      },
    ];

    this.searchableColumns = [
      'mobile',
      'email',
      'applicantName',
      'applicationNumber',
    ];

    this.actions = [
      {
        icon: 'pi pi-send',
        title: 'Send a meeting invite',
        type: 'EDIT',
        visibilityCheckFeild: 'canSent',
        privilege: [privileges.CALLLETTER_SEND_INVITE],
      },
    ];

    this.userService.User_Filter_Dropdowns().subscribe((x) => {
      if (x) {
        this.schemes = x.data.schemeSelectList;
        this.districts = x.data.districtSelectList;
      }
    });
    this.callLetterForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      scheme: new FormControl('', [
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(1),
      ]),
      district: new FormControl('', [
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(1),
      ]),
      status: new FormControl('', [
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(1),
      ]),
      callletterName: new FormControl('', [
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(1),
      ]),
      callletterSubject: new FormControl('', [
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(1),
      ]),
      meetingDate: new FormControl('', [Validators.required]),
      applicationIds: new FormControl('', [Validators.required]),
      meetingTimeFrom: new FormControl('', [Validators.required]),
      meetingTimeTo: new FormControl('', [Validators.required]),
      comments: new FormControl('', [Validators.required]),
      venue: new FormControl('', [Validators.required]),
      isActive: new FormControl(true),
    });
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.callLetterId = params['id']; //log the value of id
        if (this.callLetterId !== '0') {
          this.callLetterService
            .Callletter_GetById(this.callLetterId)
            .subscribe((x: any) => {
              if (x) {
                this.callLetterForm.disable();
                this.callLetterDetails = x.data;
                this.updateData();
                this.cdr.detectChanges();
                this.callLetterService
                  .Callletter_Application_Get('', this.callLetterId, '', true)
                  .subscribe((x) => {
                    var d: CallletterApplicationModel[] = x.data;
                    if (d) {
                      d.map((y) => {
                        var t = this.isATimeGreater(
                          moment(
                            this.callLetterDetails?.meetingTimeTo
                          ).toDate(),
                          moment(this.callLetterDetails?.meetingDate).toDate()
                        );
                        if (t) {
                          y.canSent = true;
                        } else {
                          y.canSent = false;
                        }
                        y.isSentString = y.isSent ? 'Sent' : 'Not Sent';
                      });
                      this.callLetterForm
                        .get('applicationIds')
                        ?.patchValue(
                          d.flatMap(
                            (x: any) =>
                              x.applicationNumber + ' - ' + x.applicantName
                          )
                        );
                    }
                    this.configurationList = x.data;
                  });
              } else {
                this.callLetterDetails = null;
                this.callLetterForm.reset();
                this.callLetterForm.get('id')?.patchValue(Guid.raw());
              }
            });
        } else {
          this.isNewForm = true;
          this.configurationList = [];
          this.callLetterForm.reset();
          this.callLetterForm.get('id')?.patchValue(Guid.raw());
        }
      });
    this.callLetterForm.controls['scheme'].valueChanges.subscribe((x) => {
      var district = this.callLetterForm.controls['district'].value;
      var scheme = this.callLetterForm.controls['scheme'].value;
      var status = this.callLetterForm.controls['status'].value;
      if (district && scheme && status) {
        this.callLetterService
          .Callletter_Application_SelectList_Get(district, scheme, status)
          .subscribe((c) => {
            this.applications = c.data;
          });
      }
      if (x) {
        this.callLetterService
          .Callletter_Status_SelectList(x)
          .subscribe((x) => {
            if (x) {
              this.statuses = x.data;
            }
          });
      }
    });
    this.callLetterForm.controls['district'].valueChanges.subscribe((x) => {
      var district = this.callLetterForm.controls['district'].value;
      var scheme = this.callLetterForm.controls['scheme'].value;
      var status = this.callLetterForm.controls['status'].value;
      if (district && scheme && status) {
        this.callLetterService
          .Callletter_Application_SelectList_Get(district, scheme, status)
          .subscribe((c) => {
            this.applications = c.data;
          });
      }
    });
    this.callLetterForm.controls['status'].valueChanges.subscribe((x) => {
      var district = this.callLetterForm.controls['district'].value;
      var scheme = this.callLetterForm.controls['scheme'].value;
      var status = this.callLetterForm.controls['status'].value;
      if (district && scheme && status) {
        this.callLetterService
          .Callletter_Application_SelectList_Get(district, scheme, status)
          .subscribe((c) => {
            this.applications = c.data;
          });
      }
    });
  }

  isATimeGreater(meeeingTime: Date, meeeingDate: Date) {
    // You can now compare this time with another time
    const anotherTime = meeeingTime;
    const anotherHours = anotherTime.getHours();
    const anotherMinutes = anotherTime.getMinutes();
    const anotherSeconds = anotherTime.getSeconds();

    var mDateyer = moment(meeeingDate).toDate().getFullYear();
    var mDateymt = moment(meeeingDate).toDate().getMonth();
    var mDateydt = moment(meeeingDate).toDate().getDate();

    var meetingdatetime = moment()
      .year(mDateyer)
      .month(mDateymt)
      .date(mDateydt)
      .hour(anotherHours)
      .minute(anotherMinutes)
      .second(anotherSeconds);
    var currentTime = moment();

    if (meetingdatetime > currentTime) {
      return true;
    }
    return false;
  }
  updateData() {
    this.callLetterForm.get('id')?.patchValue(this.callLetterDetails?.id ?? '');
    this.callLetterForm
      .get('scheme')
      ?.patchValue(this.callLetterDetails?.schemeId ?? '');
    this.callLetterForm
      .get('district')
      ?.patchValue(this.callLetterDetails?.districtId ?? '');
    this.callLetterForm
      .get('status')
      ?.patchValue(this.callLetterDetails?.meetingStatusId ?? '');
    this.callLetterForm
      .get('callletterName')
      ?.patchValue(this.callLetterDetails?.callletterName ?? '');
    this.callLetterForm
      .get('callletterSubject')
      ?.patchValue(this.callLetterDetails?.callletterSubject ?? '');
    this.callLetterForm
      .get('meetingDate')
      ?.patchValue(moment(this.callLetterDetails?.meetingDate).toDate());
    this.callLetterForm
      .get('meetingTimeFrom')
      ?.patchValue(moment(this.callLetterDetails?.meetingTimeFrom).toDate());
    this.callLetterForm
      .get('meetingTimeTo')
      ?.patchValue(moment(this.callLetterDetails?.meetingTimeTo).toDate());
    this.callLetterForm
      .get('comments')
      ?.patchValue(this.callLetterDetails?.comments ?? '');
    this.callLetterForm
      .get('venue')
      ?.patchValue(this.callLetterDetails?.venue ?? '');
  }
  submit() {
    if (this.callLetterForm.valid) {
      this.callLetterService
        .Callletter_Application_SaveUpdate({
          id: this.callLetterForm.controls['id']?.value,
          schemeId: this.callLetterForm.controls['scheme']?.value,
          districtId: this.callLetterForm.controls['district']?.value,
          callletterName: this.callLetterForm.controls['callletterName']?.value,
          meetingStatusId: this.callLetterForm.controls['status']?.value,
          callletterSubject:
            this.callLetterForm.controls['callletterSubject']?.value,
          applicationIds: this.callLetterForm.controls['applicationIds']?.value,
          meetingDate: this.callLetterForm.controls['meetingDate']?.value,
          meetingTimeFrom:
            this.callLetterForm.controls['meetingTimeFrom']?.value,
          meetingTimeTo: this.callLetterForm.controls['meetingTimeTo']?.value,
          comments: this.callLetterForm.controls['comments']?.value,
          isActive: true,
          venue: this.callLetterForm.controls['venue']?.value,
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
            this.router.navigate([
              'officers',
              'call-letter',
              'create',
              this.callLetterForm.controls['id']?.value,
              'EDIT',
            ]);
            this.isNewForm = false;
          }
        });
    } else {
      this.callLetterForm.markAllAsTouched();
      this.callLetterForm.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
      this.triggerValueChangesForAll(this.callLetterForm);
    }
  }
  triggerValueChangesForAll(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control) {
        const value = control.value; // Get current value
        if (value && value != '') {
          control.setValue(value, {
            emitEvent: false,
          }); // Re-set the same value to trigger valueChanges
        } else {
          control.setValue(value); // Re-set the same value to trigger valueChanges
        }
      }
    });
  }
  resetForm() {
    this.router.navigate(['officers', 'call-letter', 'create', '0', 'EDIT']);
  }
  back() {
    this.router.navigate(['/officers/call-letter']);
  }
  print() {}

  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
    } else if (val && val.type == 'EDIT') {
      this.callLetterService
        .Callletter_Send_Meeting_Invite_Application(
          this.callLetterId,
          val.record.applicationId
        )
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
            this.callLetterService
              .Callletter_Application_Get('', this.callLetterId, '', true)
              .subscribe((x) => {
                var d: CallletterApplicationModel[] = x.data;
                if (d) {
                  d.map((y) => {
                    y.isSentString = y.isSent ? 'Sent' : 'Not Sent';
                  });
                }
                this.configurationList = d;
              });
          }
        });
    } else if (val && val.type == 'ACTIVATE') {
    }
  }
}
