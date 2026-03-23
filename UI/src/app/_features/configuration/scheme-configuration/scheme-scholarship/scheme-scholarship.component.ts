import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import {
  SchemeSubCategoryConfigurationDateWiseModel,
  SchemeSubCategoryConfigurationFormContainerModel,
  SchemeSubCategoryConfigurationModel,
  SchemeSubCategoryConfigurationSaveContainerModel,
} from 'src/app/_models/schemeConfigModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-scheme-scholarship',
  templateUrl: './scheme-scholarship.component.html',
  styleUrls: ['./scheme-scholarship.component.scss'],
})
export class SchemeScholarshipComponent {
  configurationList!: SchemeSubCategoryConfigurationDateWiseModel[];
  schemeSubCategoryConfigurationDateWiseModel!: SchemeSubCategoryConfigurationFormContainerModel;
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Cost Config';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'scholarshipName';
  defaultSortOrder: number = 1;

  defaultDate = moment(new Date()).toDate();
  endDate = moment(new Date()).toDate();
  schemeId!: string;
  privleges = privileges;
  scholarshipForm!: FormGroup;
  recurrenceList!: TCModel[];
  recurrenceIdsList!: string[];
  occurecr: string = '';
  defaultstatus = false;
  patn = new RegExp('^[0-9]+$');
  get f() {
    return this.scholarshipForm.controls;
  }
  get t() {
    return this.f['costs'] as FormArray;
  }
  get costList() {
    return this.t.controls as FormGroup[];
  }
  get maxPojectCostErrorMsg() {
    var error: any;
    this.costList.map((x) => {
      if (x.controls['amount'].errors) {
        error = x.controls['amount'].errors;
      }
    });

    if (this.defaultstatus) {
      return null;
    }
    if (error && error['required']) {
      return 'Required';
    } else if (error && error['pattern']) {
      return 'In-valid';
    }

    return null;
  }
  get recurrenceErrorMsg() {
    var error: any;
    this.costList.map((x) => {
      if (x.controls['recurrence'].errors) {
        error = x.controls['recurrence'].errors;
      }
    });

    if (this.defaultstatus) {
      return null;
    }
    if (error && error['required']) {
      return 'Required';
    } else if (error && error['pattern']) {
      return 'In-valid';
    }

    return null;
  }
  get occurrenceErrorMsg() {
    var error: any;
    this.costList.map((x) => {
      if (x.controls['occurrence'].errors) {
        error = x.controls['occurrence'].errors;
      }
    });

    if (this.defaultstatus) {
      return null;
    }
    if (error && error['required']) {
      return 'Required';
    } else if (error && error['pattern']) {
      return 'In-valid';
    }

    return null;
  }
  constructor(
    private messageService: MessageService,
    private router: Router,
    private generalService: GeneralService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.schemeId = params.get('id') ?? Guid.createEmpty().toString();
    });
    this.getScholarships('', this.currentStatus);
    this.scholarshipForm = new FormGroup({
      groupId: new FormControl(Guid.raw()),
      fromDate: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(3),
      ]),
      toDate: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(2),
      ]),
      costs: new FormArray([]),
    });
    this.cols = [
      {
        field: 'fromDate',
        header: 'From Date',
        sortablefield: 'fromDate',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'toDate',
        header: 'To Date',
        sortablefield: 'toDate',
        isSortable: true,
        isSearchable: true,
      },
    ];
    this.searchableColumns = this.cols
      .filter((x) => x.isSearchable == true)
      .flatMap((x) => x.field);

    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        // TODO: privilege: privileges.ROLE_UPDATE,
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        // TODO: privilege: privileges.ROLE_Delete,
      },
    ];
    this.getForm(this.schemeId, '');
  }
  getScholarships(scholarshipid: string, status: boolean) {
    this.generalService
      .Config_Scheme_Sub_Category_Get_List(this.schemeId)
      .subscribe((x) => {
        if (x) {
          this.configurationList = x.data;
        }
      });
  }
  changeStatus(val: boolean) {
    this.getScholarships('', !val);
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          // TODO:privilege: privileges.ROLE_UPDATE,
        },
        {
          icon: 'pi pi-times',
          title: 'In-Activate',
          type: 'INACTIVATE',
          // TODO:privilege: privileges.ROLE_Delete,
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
          privilege: privileges.ROLE_UPDATE,
        },
      ];
    }
  }
  resetForm() {
    this.scholarshipForm.reset();
    this.scholarshipForm.get('id')?.patchValue(Guid.raw());
    this.getForm(this.schemeId, '');
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.generalService
        .Config_Scheme_Sub_category_Delete(val.record.groupId)
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
              detail: x?.message,
            });
            this.getScholarships('', this.currentStatus);
          }
        });
    } else if (val && val.type == 'EDIT') {
      this.getForm(this.schemeId, val.record.groupId);
    } else if (val && val.type == 'ACTIVATE') {
      this.savescholarship({
        ...val.record,
        isActive: true,
      });
    }
  }
  getForm(schemeId: string, groupId: string) {
    this.generalService
      .Config_Scheme_Sub_Category_Form_Get(schemeId, groupId)
      .subscribe((x) => {
        if (x) {
          this.schemeSubCategoryConfigurationDateWiseModel = x.data;
          this.recurrenceList =
            this.schemeSubCategoryConfigurationDateWiseModel.congurationList[0]
              .recurrenceList ?? [];
          this.generateDefaultRows(
            this.schemeSubCategoryConfigurationDateWiseModel.congurationList
          );
          this.scholarshipForm
            .get('fromDate')
            ?.patchValue(
              moment(
                new Date(
                  this.schemeSubCategoryConfigurationDateWiseModel.fromDateString ? new Date(this.schemeSubCategoryConfigurationDateWiseModel.fromDateString) : new Date()
                )
              ).toDate()
            );
          this.scholarshipForm
            .get('toDate')
            ?.patchValue(
              moment(
                new Date(
                  this.schemeSubCategoryConfigurationDateWiseModel.toDateString ? new Date(this.schemeSubCategoryConfigurationDateWiseModel.toDateString) : new Date()
                )
              ).toDate()
            );
            console.log(this.schemeSubCategoryConfigurationDateWiseModel);
        }
      });
  }
  submit() {
    this.savescholarship({
      congurationList: this.scholarshipForm.get('costs')?.value,
      fromDate: moment(this.scholarshipForm.get('fromDate')?.value).format(
        'YYYY-MM-DD'
      ),
      toDate: moment(this.scholarshipForm.get('toDate')?.value).format(
        'YYYY-MM-DD'
      ),
      fromDateString: '',
      toDateString: '',
      groupId: this.schemeSubCategoryConfigurationDateWiseModel.groupId,
      schemeId: this.schemeId,
    });
  }
  savescholarship(obj: SchemeSubCategoryConfigurationSaveContainerModel) {
    this.generalService.Config_Scheme_Sub_Category_Save(obj).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.scholarshipForm.get('id')?.patchValue(Guid.raw());
        this.scholarshipForm.get('scholarshipName')?.reset();
        this.scholarshipForm.get('code')?.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: x?.message,
        });
        this.getScholarships('', this.currentStatus);
        this.getForm(this.schemeId, '');
      }
    });
  }
  setPrivileges() {
    this.router.navigateByUrl('/officers/configuration/scholarship-privilege');
  }
  ngOnDestroy() {}

  generateDefaultRows(
    templateMilestones: SchemeSubCategoryConfigurationModel[]
  ) {
    this.t.clear();
    if (templateMilestones) {
      templateMilestones.forEach((x) => {
        this.t.push(
          this.formBuilder.group({
            groupId: [x.groupId == '' ? Guid.raw() : x.groupId],
            schemeId: [x.schemeId == '' ? Guid.raw() : x.schemeId],
            amount: [
              x.amount,
              [Validators.required, Validators.pattern(new RegExp('^[0-9]+$'))],
            ],
            community: [x.community],
            communityId: [x.communityId],
            occurrence: [
              x.occurrence,
              [Validators.pattern(new RegExp('^[0-9]+$'))],
            ],
            occurrenceList: [x.recurrenceList],
            recurrence: [x.recurrence],
            subCategory: [x.subCategory],
            subCategoryId: [x.subCategoryId],
          })
        );
      });
    }
  }
  changerecc(eve: any) {
    this.costList.forEach((x) => {
      x.controls['recurrence'].patchValue(eve.value);
    });
  }
  changeOcc(eve: any) {
    this.costList.forEach((x) => {
      x.controls['occurrence'].patchValue(eve.target.value);
    });
  }
  changeCost(eve: any) {
    this.costList.forEach((x) => {
      x.controls['amount'].patchValue(eve.target.value);
    });
  }
}
