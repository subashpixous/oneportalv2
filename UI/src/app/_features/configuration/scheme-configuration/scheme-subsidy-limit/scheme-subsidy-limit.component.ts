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
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { AccountRoleViewModel } from 'src/app/_models/AccountRoleViewModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import {
  ConfigurationdDistrictsWiseSubsidyModel,
  ConfigurationSchemeSubsidyModel,
} from 'src/app/_models/schemeConfigModel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-scheme-subsidy-limit',
  templateUrl: './scheme-subsidy-limit.component.html',
  styleUrls: ['./scheme-subsidy-limit.component.scss'],
})
export class SchemeSubsidyLimitComponent {
  configurationList!: ConfigurationSchemeSubsidyModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = '';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'limitName';
  defaultSortOrder: number = 1;

  privleges = privileges;
  limitForm!: FormGroup;
  defaultDate = moment(new Date()).toDate();
  endDate = moment(new Date()).toDate();
  schemeId!: string;
  visible: boolean = false;
  districtForm!: FormGroup;

  defaultstatus = false;
  get f() {
    return this.districtForm.controls;
  }
  get t() {
    return this.f['districts'] as FormArray;
  }
  get districtList() {
    return this.t.controls as FormGroup[];
  }
  get maxPojectCostErrorMsg() {
    var error: any;
    var maxPojectCost = this.limitForm.get('totalProjectCost')?.value;
    var totlsub = 0;
    this.districtList.map((x) => {
      if (x.controls['maxPojectCost'].errors) {
        error = x.controls['maxPojectCost'].errors;
      } else {
        totlsub = Number(totlsub) + Number(x.controls['maxPojectCost'].value);
      }
    });

    if (this.defaultstatus) {
      return null;
    }
    if (error && error['required']) {
      return 'Required';
    } else if (error && error['pattern']) {
      return 'In-valid';
    } else if (totlsub != maxPojectCost) {
      return `Sum of project cost should be ${maxPojectCost}`;
    }

    return null;
  }
  get maxApplicationCountErrorMsg() {
    var error: any;
    var maxApplicationCount = this.limitForm.get('maxApplicationCount')?.value;
    var totlsub = 0;
    this.districtList.map((x) => {
      if (x.controls['maxApplicationCount'].errors) {
        error = x.controls['maxApplicationCount'].errors;
      } else {
        totlsub =
          Number(totlsub) + Number(x.controls['maxApplicationCount'].value);
      }
    });

    if (this.defaultstatus) {
      return null;
    }
    if (error && error['required']) {
      return 'Required';
    } else if (error && error['pattern']) {
      return 'In-valid';
    } else if (totlsub != maxApplicationCount) {
      return `Sum of application count should be ${maxApplicationCount}`;
    }

    return null;
  }
  get maxSubsidyCostErrorMsg() {
    var error: any;
    var totalSubsidyCost = this.limitForm.get('totalSubsidyCost')?.value;
    var maxApplicationCount = this.limitForm.get('maxApplicationCount')?.value;
    var totlsub = 0;
    this.districtList.map((x) => {
      if (x.controls['maxSubsidyCost'].errors) {
        error = x.controls['maxSubsidyCost'].errors;
      } else {
        totlsub = Number(totlsub) + Number(x.controls['maxSubsidyCost'].value);
      }
    });

    if (this.defaultstatus) {
      return null;
    }
    if (error && error['required']) {
      return 'Required';
    } else if (error && error['pattern']) {
      return 'In-valid';
    } else if (totlsub != totalSubsidyCost) {
      return `Sum of subsidy cost should be ${totalSubsidyCost}`;
    }

    return null;
  }
  limitId!: string;
  constructor(
    private schemeConfigService: SchemeConfigService,
    private router: Router,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.schemeId = params.get('id') ?? Guid.createEmpty().toString();
    });
    this.districtForm = this.formBuilder.group({
      districts: new FormArray([]),
    });
    this.getLimits(this.currentStatus);
    this.limitId = Guid.create().toString();
    this.limitForm = new FormGroup({
      id: new FormControl(this.limitId),
      totalSubsidyCost: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      totalProjectCost: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      subsidyPercentage: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      maxProjectCost: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      maxsubsidyPerApplication: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      maxApplicationCount: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      from: new FormControl('', [Validators.required]),
      to: new FormControl('', [Validators.required]),
    });
    this.cols = [
      {
        field: 'totalSubsidyCost',
        header: 'Total Subsidy Cost',
        customExportHeader: 'Total Subsidy Cost',
        sortablefield: 'totalSubsidyCost',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'totalProjectCost',
        header: 'Total Cost',
        customExportHeader: 'Total Cost',
        sortablefield: 'totalProjectCost',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'subsidyPercentage',
        header: 'Subsidy Percentage',
        sortablefield: 'subsidyPercentage',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'subsidyCost',
        header: 'Max Subsidy per Application',
        sortablefield: 'subsidyCost',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'maxApplicationCount',
        header: 'Max Application Count',
        sortablefield: 'maxApplicationCount',
        isSortable: true,
        isSearchable: true,
      },
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
      {
        field: 'modifiedByUserName',
        header: 'Updated By',
        sortablefield: 'modifiedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'modifiedDate',
        header: 'Updated Date',
        sortablefield: 'modifiedDate',
        isSortable: true,
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
        privilege: privileges.CONFIG_UPDATE,
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        privilege: privileges.CONFIG_DELETE,
      },
    ];
    this.getDistrictLimits(this.limitId);
  }
  getDistrictLimits(configurationSchemeSubsidyId: string) {
    // this.schemeConfigService
    //   .Configuration_Scheme_District_Subsidy_Get(configurationSchemeSubsidyId)
    //   .subscribe((x) => {
    //     this.generateDefaultRows(x.data);
    //   });
  }
  getLimits(status: boolean) {
    this.schemeConfigService
      .Subsidy_Configuration_Get('', this.schemeId, status)
      .subscribe((x) => {
        if (x) {
          this.configurationList = x.data;
        }
      });
  }
  changeStatus(val: boolean) {
    this.getLimits(!val);
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          privilege: privileges.CONFIG_UPDATE,
        },
        {
          icon: 'pi pi-times',
          title: 'In-Activate',
          type: 'INACTIVATE',
          privilege: privileges.CONFIG_DELETE,
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
          privilege: privileges.CONFIG_UPDATE,
        },
      ];
    }
  }
  resetForm() {
    this.limitForm.reset();
    this.limitId = Guid.raw();
    this.limitForm.get('id')?.patchValue(this.limitId);
    this.getDistrictLimits(this.limitId);
    this.getLimits(true);
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.savelimit({
        ...val.record,
        isActive: false,
      });
    } else if (val && val.type == 'EDIT') {
      this.getDistrictLimits(val.record.id);
      this.limitForm.get('id')?.patchValue(val.record.id);
      this.limitForm
        .get('totalSubsidyCost')
        ?.patchValue(val.record.totalSubsidyCost);
      this.limitForm
        .get('totalProjectCost')
        ?.patchValue(val.record.totalProjectCost);
      this.limitForm
        .get('maxsubsidyPerApplication')
        ?.patchValue(val.record.subsidyCost);
      this.limitForm
        .get('maxProjectCost')
        ?.patchValue(val.record.maxProjectCost);
      this.limitForm
        .get('subsidyPercentage')
        ?.patchValue(val.record.subsidyPercentage);
      this.limitForm
        .get('maxApplicationCount')
        ?.patchValue(val.record.maxApplicationCount);
      this.limitForm
        .get('from')
        ?.patchValue(moment(val.record.fromDate).toDate());
      this.limitForm.get('to')?.patchValue(moment(val.record.toDate).toDate());
    } else if (val && val.type == 'ACTIVATE') {
      this.savelimit({
        ...val.record,
        isActive: true,
      });
    }
  }
  submit() {
    this.savelimit({
      id: this.limitForm.get('id')?.value,
      schemeId: this.schemeId,
      totalSubsidyCost: this.limitForm.get('totalSubsidyCost')?.value,
      totalProjectCost: this.limitForm.get('totalProjectCost')?.value,
      subsidyPercentage: this.limitForm.get('subsidyPercentage')?.value,
      subsidyCost: this.limitForm.get('maxsubsidyPerApplication')?.value,
      maxApplicationCount: this.limitForm.get('maxApplicationCount')?.value,
      fromDate: this.limitForm.get('from')?.value,
      toDate: this.limitForm.get('to')?.value,
      isActive: true,
      districtsWiseSubsidyModels: null, //this.districtForm.get('districts')?.value,
      maxProjectCost: this.limitForm.get('maxProjectCost')?.value,
    });
  }
  savelimit(obj: ConfigurationSchemeSubsidyModel) {
    this.schemeConfigService
      .Subsidy_Configuration_SaveUpdate(obj)
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.limitForm.reset();
          this.limitId = Guid.raw();
          this.limitForm.get('id')?.patchValue(this.limitId);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: x?.message,
          });
          this.getDistrictLimits(this.limitId);
          this.getLimits(true);
        }
      });
  }
  openDistricts() {
    this.visible = true;
  }
  ngOnDestroy() {}

  generateDefaultRows(
    templateMilestones: ConfigurationdDistrictsWiseSubsidyModel[]
  ) {
    this.t.clear();
    if (templateMilestones) {
      templateMilestones.forEach((x) => {
        this.t.push(
          this.formBuilder.group({
            id: [x.id == '' ? Guid.raw() : x.id],
            configurationSchemeSubsidyId: [
              x.configurationSchemeSubsidyId,
              [Validators.required],
            ],
            districtId: [x.districtId, [Validators.required]],
            district: [x.district, [Validators.required]],
            maxPojectCost: [
              x.maxPojectCost,
              [Validators.required, Validators.pattern(new RegExp('^[0-9]+$'))],
            ],
            maxSubsidyCost: [
              x.maxSubsidyCost,
              [Validators.required, Validators.pattern(new RegExp('^[0-9]+$'))],
            ],
            maxApplicationCount: [
              x.maxApplicationCount,
              [Validators.required, Validators.pattern(new RegExp('^[0-9]+$'))],
            ],
          })
        );
      });
    }
  }
}
