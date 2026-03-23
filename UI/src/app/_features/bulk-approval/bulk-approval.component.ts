import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import {
  ConfirmationService,
  ConfirmEventType,
  MessageService,
} from 'primeng/api';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import {
  ApplicationMainGridModel,
  ApprovalModel,
  ApproveStatusItemModel,
  ApproveStatusViewModel,
  BulkApprovalModel,
} from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { triggerValueChangesForAll } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-bulk-approval',
  templateUrl: './bulk-approval.component.html',
  styleUrls: ['./bulk-approval.component.scss'],
})
export class BulkApprovalComponent {
  configurationList!: ApplicationMainGridModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  activeStatuses: TCModel[] = [
    { text: 'Active', value: '1' },
    { text: 'Expired', value: '0' },
  ];
  schemes: TCModel[] = [];
  districts: TCModel[] = [];
  statuses: TCModel[] = [];
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  selectedActiveStatuses: string = '1';
  selectedSchemes: string = '';
  selectedDistricts: string = '';
  selectedStatuses: string = '';

  actions: Actions[] = [];
  title: string = 'Bulk Approval';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;

  filtermodel!: ApplicationFilterModel;

  value: string[] = [];
  navigationModel: NavigationModel | undefined;

  approvalForm!: FormGroup;
  reasons: TCModel[] = [];
  approvalStatuses: ApproveStatusItemModel[] = [];

  get canshowreason() {
    var selectedstsId =
      this.approvalForm.controls['approvalRejectedstatus']?.value;
    var appstats: ApproveStatusItemModel | undefined =
      this.approvalStatuses.find((x) => x.statusId == selectedstsId);
    if (
      appstats &&
      (appstats.status == 'RETURNED' || appstats.status == 'REJECTED')
    ) {
      return true;
    }
    return false;
  }

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private userService: UserService,
    private roleService: RoleService,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {
    var obj = this.router.getCurrentNavigation()?.extras?.state;
    this.navigationModel = obj ? obj['data'] : undefined;
    this.selectedDistricts = this.navigationModel?.districtId ?? '';
    this.selectedSchemes = this.navigationModel?.schemeId ?? '';
    this.cdr.markForCheck();
  }
  ngOnInit() {
    var dd: UserModel = this.accountService.userValue;
    this.approvalForm = new FormGroup({
      applicationIds: new FormControl('', Validators.required),
      applicationIdsText: new FormControl(),
      statusfrom: new FormControl(''),
      status: new FormControl(''),
      date: new FormControl(new Date().toLocaleString()),
      approvalRejectedstatus: new FormControl('', Validators.required),
      jobTitle: new FormControl(dd.userDetails.roleName),
      reason: new FormControl(''),
      name: new FormControl(`${dd.firstName} ${dd.lastName}`),
      document: new FormControl(''),
      comments: new FormControl(''),
    });

    var appfilter = localStorage.getItem('BulkApprovalFilter');
    if (appfilter) {
      this.filtermodel = JSON.parse(appfilter);
      this.filtermodel = {
        ...this.filtermodel,
        searchString: null,
        columnSearch: null,
        skip: 0,
        take: 10,
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
      };
      this.selectedStatuses = this.filtermodel.where?.statusIds
        ? this.filtermodel.where?.statusIds[0]
        : '';
      this.selectedDistricts = this.filtermodel.where?.districtIds
        ? this.filtermodel.where?.districtIds[0]
        : '';
      this.selectedSchemes = this.filtermodel.where?.schemeIds
        ? this.filtermodel.where?.schemeIds[0]
        : '';
      this.selectedActiveStatuses = this.filtermodel.where?.isExpired
        ? '0'
        : '1';
      this.selecteddatefilter = this.filtermodel.where?.year;

      if (this.selectedSchemes) {
        this.schemeService
          .GetStatusListByScheme(this.selectedSchemes, true)
          .subscribe((x) => {
            this.statuses = x.data;
          });
      }
      this.getApplications();
    } else {
      this.filtermodel = {
        searchString: null,
        skip: 0,
        where: {
          userId: '',
          schemeIds: [],
          districtIds: [],
          statusIds: [],
          isExpired: false,
          isBulkApprovalGet: true,
          year: '',
        },
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
        take: 50,
        columnSearch: null,
      };
    }
    var curentyr = new Date().getFullYear();
    var curentmnt = new Date().getMonth();
    var startyr = 2023;
    do {
      this.datefilter = [
        ...this.datefilter,
        {
          text: `Apr ${startyr} - March ${startyr + 1}`,
          value: `${startyr}-${startyr + 1}`,
        },
      ];
      startyr = startyr + 1;
    } while (
      curentyr >= startyr &&
      ((curentyr == startyr && curentmnt > 2) || curentyr != startyr)
    );

    this.userService.User_Filter_Dropdowns().subscribe((x) => {
      if (x) {
        this.schemes = x.data.schemeSelectList;
        this.districts = x.data.districtSelectList;
        // this.statuses = x.data.statusSelectList;
      }
    });
    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;

    this.cols = [
      {
        field: 'applicationNumber',
        header: 'Id',
        customExportHeader: 'Id',
        sortablefield: 'applicationNumber',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },
      {
        field: 'scheme',
        header: 'Scheme',
        customExportHeader: 'Scheme',
        sortablefield: 'scheme',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'districtName',
        header: 'District',
        sortablefield: 'districtName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'date',
        header: 'Date',
        sortablefield: 'date',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'firstName',
        header: 'Name',
        sortablefield: 'firstName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'submittedDate',
        header: 'Submitted Date',
        sortablefield: 'submittedDate',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'bulkApprovedDate',
        header: 'Approved Date',
        sortablefield: 'bulkApprovedDate',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'bulkApprovedByUserName',
        header: 'Approved By',
        sortablefield: 'bulkApprovedByUserName',
        isSortable: true,
        isSearchable: true,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        isIcon: true,
        visibilityCheckFeild: 'canUpdate',
      },
      {
        icon: 'pi pi-arrow-right',
        title: 'Approve',
        type: 'APPROVE',
        isIcon: true,
        visibilityCheckFeild: 'canApprove',
      },
    ];
  }
  changescheme(event: any) {
    if (event) {
      this.schemeService.GetStatusListByScheme(event, true).subscribe((x) => {
        this.statuses = x.data;
      });
    } else {
      this.schemeService.GetStatusListByScheme(event, true).subscribe((x) => {
        this.statuses = x.data;
      });
    }
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = {
      ...this.filtermodel,
      ...val,
      where: {
        isExpired: this.selectedActiveStatuses == '1' ? false : true,
        userId: '',
        schemeIds: this.selectedSchemes != '' ? [this.selectedSchemes] : [],
        districtIds:
          this.selectedDistricts != '' ? [this.selectedDistricts] : [],
        statusIds: this.selectedStatuses != '' ? [this.selectedStatuses] : [],
        year: this.selecteddatefilter,
        isBulkApprovalGet: true,
      },
    };
    this.getApplications();
  }
  changeStatus(val: boolean) {
    this.filtermodel = { ...this.filtermodel };
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          isIcon: true,
        },
        {
          icon: 'pi pi-times',
          title: 'In-Activate',
          type: 'INACTIVATE',
          isIcon: true,
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
          isIcon: true,
        },
      ];
    }
    this.getApplications();
  }
  getApplications() {
    localStorage.setItem(
      'BulkApprovalFilter',
      JSON.stringify(this.filtermodel)
    );
    this.schemeService
      .User_Application_GetList(this.filtermodel)
      .subscribe((c) => {
        this.configurationList = c.data;
        this.total = c.totalRecordCount;
      });

    this.schemeService
      .Application_Bulk_Approve_Get_Status_List(
        this.selectedStatuses,
        this.selectedSchemes
      )
      .subscribe((c) => {
        var dat: ApproveStatusViewModel = c.data;
        this.approvalStatuses = dat.statusList;
        this.reasons = dat.reason;
        this.approvalForm.controls['status'].patchValue(
          c.data.currentStatusName
        );
        this.approvalForm.controls['statusfrom'].patchValue(
          c.data.currentStatus
        );
      });
  }
  reset() {
    this.schemeService.GetStatusListByScheme('', true).subscribe((x) => {
      this.statuses = x.data;
    });
    this.selectedSchemes = '';
    this.selectedDistricts = '';
    this.selectedStatuses = '';
    this.selectedActiveStatuses = '1';
    this.generate();
  }
  generate() {
    this.filtermodel = {
      ...this.filtermodel,
      where: {
        schemeIds: this.selectedSchemes != '' ? [this.selectedSchemes] : [],
        districtIds:
          this.selectedDistricts != '' ? [this.selectedDistricts] : [],
        statusIds: this.selectedStatuses != '' ? [this.selectedStatuses] : [],
        isExpired: this.selectedActiveStatuses == '1' ? false : true,
        year: this.selecteddatefilter,
        userId: '',
        isBulkApprovalGet: true,
      },
    };
    this.getApplications();
  }
  actioInvoked(val: ActionModel) {}

  submit() {
    if (this.approvalForm.valid) {
      var df = this.approvalStatuses.find(
        (x) =>
          x.statusId ==
          this.approvalForm.controls['approvalRejectedstatus'].value
      );
      if (df) {
        var d: BulkApprovalModel = {
          approvalComment: this.approvalForm.controls['comments'].value,
          statusIdFrom: this.approvalForm.controls['statusfrom'].value,
          statusIdTo:
            this.approvalForm.controls['approvalRejectedstatus'].value,
          reason: this.approvalForm.controls['reason'].value,
          schemeId: df.schemeId,
          status: df.status,
          applicationIds: this.approvalForm.controls['applicationIds'].value,
          originalFileName: '',
          savedFileName: '',
        };

        if (d.applicationIds.length == 0) {
          this.confirmationService.confirm({
            message:
              'Please select at least one application to proceed. You can select up to 20 applications.',
            header: 'No Applications Selected!',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
        } else if (d && d.applicationIds.length > 20) {
          this.confirmationService.confirm({
            message:
              'You have exceeded the maximum allowed applications (20). Please review and select only the top 20 applications.',
            header: 'Application Selection Limit!',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {},
            reject: (type: ConfirmEventType) => {},
          });
        } else {
          this.schemeService.Application_BulkApprove(d).subscribe((x) => {
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
                detail: 'Updated Successfully',
              });
              this.approvalForm.controls['applicationIds'].patchValue(null);
              this.approvalForm.controls['applicationIdsText'].patchValue(null);
              this.approvalForm.controls['reason'].patchValue('');
              this.approvalForm.controls['comments'].patchValue('');
              this.approvalForm.controls['approvalRejectedstatus'].patchValue(
                ''
              );
              this.getApplications();
            }
          });
        }
      }
    } else {
      this.approvalForm.markAllAsTouched();
      this.approvalForm.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
      triggerValueChangesForAll(this.approvalForm);
    }
  }
  selectedApplications(event: any[]) {
    this.approvalForm.controls['applicationIds'].patchValue(
      event.map((x) => x.applicationId)
    );
    this.approvalForm.controls['applicationIdsText'].patchValue(
      event.map((x) => x.applicationNumber)
    );
    this.approvalForm.controls['applicationIdsText'].disable();
  }
}
