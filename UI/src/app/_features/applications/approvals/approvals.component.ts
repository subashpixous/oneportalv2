import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  MemberDataApprovalFilterModel,
  MemberDataApprovalGridFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import {
  MemberDataApprovalFormModel,
  MemberDataApprovalGridModel,
  PrintModuleReportModel,
} from 'src/app/_models/MemberDetailsModel';
import {
  ApplicationMainGridModel,
  ApproveStatusItemModel,
} from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';
import { DatatablePaginationComponent } from 'src/app/shared/datatable-pagination/datatable-pagination.component';
import { environment } from 'src/environments/environment';
//import { privileges } from '../shared/commonFunctions';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
})
export class ApprovalsComponent {


  @Input() isCalledFromApplication: boolean = false;
    exportedData: any[] = [];  //modified by Sivasankar on 31-10-2025 for export functionality
exportCols: any[] = [];
  configurationList!: MemberDataApprovalGridModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;
  privleges = privileges;
  activeStatuses: TCModel[] = [
    { text: 'Active', value: '1' },
    { text: 'Expired', value: '0' },
  ];
  mainOptions: any[] = [
    {
      name: 'Scheme',
      value: 'SCHEME',
    },
    {
      name: 'Member',
      value: 'MEMBER',
    },
  ];

  selectedRows: any[] = [];

  @ViewChild('dt') dataTable!: DatatablePaginationComponent;
  mainValue: string = 'MEMBER';
  generateMainFilter() {}
  recordTypes: TCModel[] = [];
  districts: TCModel[] = [];
  statuses: TCModel[] = [];
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  selectedActiveStatuses: string = '1';
  selectedrecordTypes: string[] | [] = [];
  selectedDistricts: string[] | [] = [];
  selectedStatuses: string[] | [] = [];
  selectedMemberIds: string[] = [];
  approvalformDetail!: MemberDataApprovalFormModel;

  approvalStatuses: any[] = [];
  approvalStatuses1: any[] = [];

  // approvalStatuses1: any[] = [
  //   { label: 'Approve', value: 'Approve' },
  //   { label: 'Return', value: 'Return' },
  //   { label: 'Reject', value: 'Reject' },
  // ];

  reasons: TCModel[] = [];

  approvalForm!: FormGroup;

  actions: Actions[] = [];
  title: string = 'Member Approvals';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;

  filtermodel!: MemberDataApprovalGridFilterModel;

  value: string[] = [];
  navigationModel: NavigationModel | undefined;
  showdata: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private messageService: MessageService,
    private memberService: MemberService,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private accountService: AccountService,
    private generalService: GeneralService,
    private userService: UserService,
    private roleService: RoleService,
    private cookieService: CookieService,

    private cdr: ChangeDetectorRef
  ) {
    var obj = this.router.getCurrentNavigation()?.extras?.state;
    this.navigationModel = obj ? obj['data'] : undefined;
    this.selectedDistricts = this.navigationModel?.districtId
      ? [this.navigationModel?.districtId]
      : [];
    this.selectedrecordTypes = this.navigationModel?.recordType
      ? [this.navigationModel?.recordType]
      : [];
    this.cdr.markForCheck();
  }
  dd: UserModel = this.accountService.userValue;

  local = this.dd.userDetails;

  get canshowreason() {
    const selectedstsId =
      this.approvalForm.controls['approvalRejectedstatus']?.value;
    if (selectedstsId === 'RETURNED' || selectedstsId === 'REJECTED') {
      this.approvalForm.controls['reason'].addValidators(Validators.required);
      this.approvalForm.controls['reason'].updateValueAndValidity();
      return true;
    }
    this.approvalForm.controls['reason'].removeValidators(Validators.required);
    this.approvalForm.controls['reason'].updateValueAndValidity();
    return false;
  }

  // Updated By Elanjsuriyan on 12-12-2025
  onStatusChange() {
    console.log("selectedStatuses--",this.selectedStatuses)
  const hasDelete = this.selectedStatuses.some((x: string) =>
    x?.toUpperCase().endsWith("_DELETED")
  );

  const hasHQDeleted = this.selectedStatuses.some((x: string) =>
  x?.toUpperCase() === "HQ_DELETED"
);


  if (hasDelete) {
    // this.approvalStatuses1 = this.statuses.filter(s =>
    //   s.text.toLowerCase().startsWith("delete") ||
    //   s.text.toLowerCase().startsWith("return")
    // );
   if(hasHQDeleted){
    this.approvalStatuses1 = [
    { label: 'Restore', value: 'Restore' },
  ];

   }else {
    this.approvalStatuses1 = [
    { label: 'Delete', value: 'Delete' },
    { label: 'Return', value: 'Return' },
  ];

  this.approvalForm.get('comments')?.addValidators(Validators.required);
  this.approvalForm.get('comments')?.updateValueAndValidity();
}
  } else {
    this.approvalStatuses1 = [
    { label: 'Approve', value: 'Approve' },
    { label: 'Return', value: 'Return' },
    { label: 'Reject', value: 'Reject' },
  ];
  }
}

  ngOnInit() {
    const dd: UserModel = this.accountService.userValue;
    var cookiePrivileges = this.cookieService.get('privillage');

    // console.log("cookiePrivileges--",cookiePrivileges);
    const privilegeList = cookiePrivileges.split(',');

   const canDelete = privilegeList.includes('MEMBER_DELETE');

    console.log("dd--",dd);

    this.approvalForm = new FormGroup({
      applicationIds: new FormControl('', Validators.required),
      applicationIdsText: new FormControl([]),
      statusfrom: new FormControl(''),
      status: new FormControl(''),
      date: new FormControl(new Date().toLocaleString()),
      approvalRejectedstatus: new FormControl('', Validators.required),
      jobTitle: new FormControl(dd.userDetails.roleName),
      reason: new FormControl(''),
      name: new FormControl(`${dd.firstName} ${dd.lastName}`),
      comments: new FormControl(''),
    });

    var appfilter = localStorage.getItem('ApprovalFilter');
    if (appfilter) {
      this.filtermodel = JSON.parse(appfilter);
      this.filtermodel = {
        ...this.filtermodel,
        searchString: null,
        columnSearch: null,
        skip: 0,
        take: this.rows,
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
      };
      //   this.selectedStatuses = this.filtermodel.where?.statusIds;
      //   if (!this.selectedStatuses || this.selectedStatuses.length === 0) {
      //   //this.selectedStatuses = ['IN_PROGRESS'];
      // }

      this.selectedDistricts =
        this.selectedDistricts && this.selectedDistricts.length > 0
          ? this.selectedDistricts
          : this.filtermodel.where?.districtIds;
      this.selectedrecordTypes =
        this.selectedrecordTypes && this.selectedrecordTypes.length > 0
          ? this.selectedrecordTypes
          : this.filtermodel.where?.memberDataChangeRequestTypes;
      this.selectedActiveStatuses = this.filtermodel.where?.isActive
        ? '0'
        : '1';
      this.selecteddatefilter = this.filtermodel.where?.year;
    } else {
      this.filtermodel = {
        searchString: null,
        skip: 0,
        where: {
          memberDataChangeRequestTypes: [],
          districtIds: [],
          statusIds: [],
          roleId: '',
          memberId: '',
          isActive: false,
          year: '',
          getAll: false,
        },
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
        take: 10,
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

    this.userService.MemberDataApprovalGridFilter().subscribe((x) => {
      if (x) {
        this.recordTypes = (
          x.data as MemberDataApprovalFilterModel
        ).changed_Detail_Record_Types;
        this.districts = x.data.districtList;
        this.statuses = x.data.statusList;
      }
    });
    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;

    this.cols = [
      {
        field: 'member_Id_Text',
        header: 'Member Id',
        customExportHeader: 'Member Id',
        sortablefield: 'member_Id_Text',
        isSortable: true,
        isActionable: true,
        isSearchable: true,
      },
      {
        field: 'name',
        header: 'Name',
        customExportHeader: 'Name',
        sortablefield: 'name',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'approvedByRole',
        header: 'Last Approved Role',
        sortablefield: 'approvedByRole',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'lastApprovalReason',
        header: 'Last Approved Reason',
        sortablefield: 'lastApprovalReason',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'nextApprovalRole',
        header: 'Next Approval Role',
        sortablefield: 'nextApprovalRole',
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
        field: 'changed_Detail_Record',
        header: 'Changed Detail ',
        sortablefield: 'changed_Detail_Record',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'phone',
        header: 'Phone',
        sortablefield: 'phone',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'district',
        header: 'District',
        sortablefield: 'district',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'changed_Date',
        header: 'Changed Date',
        sortablefield: 'changed_Date',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'changed_Time',
        header: 'Changed Time',
        sortablefield: 'changed_Time',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'updatedByUserName',
        header: 'Updated By',
        sortablefield: 'updatedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'updatedDate',
        header: 'Updated Date',
        sortablefield: 'updatedDate',
        isSortable: true,
        isSearchable: false,
      },
    ];
    if(canDelete == true){
      this.actions = [
      {
        icon: 'pi pi-trash',
        title: 'Delete',
        type: 'DELETE',
        isIcon: true,
        visibilityCheckFeild: 'canDelete',
      },
      {
        icon: 'pi pi-arrow-right',
        title: 'Approve',
        type: 'APPROVE',
        isIcon: true,
        visibilityCheckFeild: 'canApprove',
      },
    ];
    }else {
      this.actions = [
        // {
        //   icon: 'pi pi-arrow-right',
        //   title: 'Approve',
        //   type: 'APPROVE',
        //   isIcon: true,
        //   visibilityCheckFeild: 'canApprove',
        // },
          {
    title: 'Verify',
    type: 'VERIFY',
    isIcon: false,
    visibilityCheckFeild: 'canVerify'
  },
  {
    title: 'Review',
    type: 'REVIEW',
    isIcon: false,
    visibilityCheckFeild: 'canReview'
  },
  {
    title: 'View',
    type: 'VIEW',
    isIcon: false,
    visibilityCheckFeild: 'View'
  }
      ];
    }
  }
  changescheme(event: any) {
    if (event) {
      this.roleService
        .Get_Status_Select_List_By_Scheme(event)
        .subscribe((x) => {
          this.statuses = x.data;
        });
    } else {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
        .subscribe((x) => {
          this.statuses = x.data;
        });
    }
  }
  createmeeting(val: string) {
    this.router.navigate(['officers', 'user-create', val, 'EDIT']);
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = {
      ...this.filtermodel,
      ...val,
      where: {
        districtIds: this.selectedDistricts,
        memberDataChangeRequestTypes: this.selectedrecordTypes,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        roleId: '',
        memberId: '',
        isActive: true,
        getAll: false,
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

  submit() {

        if (this.approvalForm.invalid || this.selectedMemberIds.length === 0) {
      this.approvalForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select members and fill required fields.',
      });
      return;
    }

    const selectedStatus = this.approvalForm.value.approvalRejectedstatus;

    const payload = {
      requestId: this.selectedMemberIds,
      status: selectedStatus,
      SelectedRoleText: selectedStatus,
      reason: this.approvalForm.value.reason || '',
      comment: this.approvalForm.value.comments || '',
    };

    this.messageService.add({
      severity: 'info',
      summary: 'Processing',
      detail: 'Please wait while approving...',
      life: 0,
      key: 'approval',
    });



       console.log('Payload:', payload);
    // return;


    this.http
      .post(`${environment.apiUrl}/User/MemberData_BulkApprove`, payload)
      .subscribe({
        next: (res: any) => {
          // remove waiting toaster
          this.messageService.clear('approval');

          if (res.status === 'SUCCESS') {
            this.getApplications();
            this.resetApprovalForm();
            this.selectedRows = [];
            this.cdr.detectChanges();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: res.message || 'Bulk approval successful',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res.message || 'Approval failed',
            });
          }
        },
        error: () => {
          // remove waiting toaster
          this.messageService.clear('approval');

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Approval failed due to server error',
          });
        },
      });
  }

  resetApprovalForm() {
    // Reset form fields to defaults
    this.approvalForm.reset({
      applicationIds: '',
      applicationIdsText: [],
      statusfrom: '',
      status: 'Member Approval',
      date: new Date().toLocaleString(),
      approvalRejectedstatus: '',
      jobTitle: `${this.accountService.userValue.userDetails.roleName}`,
      reason: '',
      name: `${this.accountService.userValue.firstName} ${this.accountService.userValue.lastName}`,
      document: '',
      comments: '',
    });

    // Clear internal selections
    this.selectedMemberIds = [];
    this.approvalStatuses = [];
    this.reasons = [];

    // Enable the chips input again in case it was disabled
    this.approvalForm.controls['applicationIdsText'].enable();

    // Trigger UI update
    this.cdr.detectChanges();

    console.log('Approval form has been reset.');
  }
  getApplications() {
    localStorage.setItem('ApprovalFilter', JSON.stringify(this.filtermodel));
    if (this.showdata) {
      this.userService
        .MemberDataApprovalGridGet(this.filtermodel)
        .subscribe((c) => {
          this.configurationList = c.data;
          this.total = c.totalRecordCount;
          this.configurationList.map((x) => {
            // x.canApprove = x.status != 'COMPLETED';
            // x.canDelete = x.cardStatus !== true;

            
          });
        });
    }
  }
//modified by Sivasankar on 31-10-2025 for export functionality
    onExportRequest(type: string) {


  const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };
    this.userService
      .MemberDataApprovalGridGet(exportFilter)
      .subscribe((c) => {
        this.exportedData = c.data;


      });


}
  onPageChange(event: any) {
    this.first = event.first; // starting index of page
    this.rows = event.rows; // rows per page
  }


  onSelectedApplications(selectedRows: MemberDataApprovalGridModel[]) {
    const MAX_LIMIT = 50;
    console.log('Selected Rows:', selectedRows);

    // Reset selections
    this.selectedMemberIds = [];

    // 🚦 If nothing selected
    if (!selectedRows.length) {
      this.approvalForm.patchValue({
        applicationIds: [],
        applicationIdsText: [],
      });
      this.approvalForm.controls['applicationIdsText'].disable();
      this.approvalStatuses = []; // or keep defaults
      return;
    }

    // 🚦 Enforce max selection
    if (selectedRows.length > MAX_LIMIT) {
      const validRows = selectedRows.slice(0, MAX_LIMIT);
      const extraRows = selectedRows.slice(MAX_LIMIT);

      // Show warning (only show first 5 extra codes to keep short)
      const extraCodes = extraRows
        .slice(0, 5)
        .map((r) => r.member_Id_Text || '')
        .join(', ');
      this.messageService.add({
        severity: 'warn',
        summary: 'Selection Limit',
        detail: `You can only select up to ${MAX_LIMIT} applications. Extra selections removed: ${extraCodes}${
          extraRows.length > 5 ? ', ...' : ''
        }`,
        life: 5000,
      });

      // Replace with only valid rows
      selectedRows = validRows;
    }
    setTimeout(() => {
      if (this.dataTable?.clearSelection) {
        this.dataTable.clearSelection();
      }

      // After clearing, set only first 5 rows as selected
      setTimeout(() => {
        this.selectedRows = selectedRows.slice(0, MAX_LIMIT);

        // Pass to child table for visual checkbox update
        if (this.dataTable?.selectRows) {
          const rowsToSelect = this.selectedRows.map((r) => ({
            id: r.id,
            member_Id: r.member_Id,
          }));
          this.dataTable.selectRows(rowsToSelect);
        }
        this.cdr.detectChanges();
      }, 0); // second timeout ensures clearSelection completes first
    }, 0); //
    // Extract codes + IDs
    const codes = selectedRows.map((row) => row.member_Id_Text || '');
    this.selectedMemberIds = selectedRows.map((row) => row.id);

    // Update form
    this.approvalForm.patchValue({
      applicationIds: this.selectedMemberIds,
      applicationIdsText: codes,
    });
    this.approvalForm.controls['applicationIdsText'].disable();

    //  Use static statuses
    this.approvalStatuses = this.approvalStatuses1;

    console.log('Selected member IDs:', this.selectedMemberIds);
  }

  reset() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
      .subscribe((x) => {
        this.statuses = x.data;
      });
    this.selectedrecordTypes = [];
    this.selectedDistricts = [];
    this.selectedStatuses = [];
    this.selectedActiveStatuses = '1';
    this.generate();
  }
  generate() {
    this.showdata = true;
    this.filtermodel = {
      ...this.filtermodel,
      where: {
        districtIds: this.selectedDistricts,
        memberDataChangeRequestTypes: this.selectedrecordTypes,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        roleId: '',
        memberId: '',
        isActive: true,
        getAll: false,
      },
    };
    this.getApplications();
  }
  actionalAction(val: ActionModel) {
    console.log(val);
    this.router.navigate([
      'officers',
      'applications',
      'member-view',
      val.record.member_Id,
    ]);
  }
  // actioInvoked(val: ActionModel) {
  //   if (val && val.type == 'VIEW') {
  //     this.router.navigate([
  //       'officers',
  //       'applications',
  //       'view',
  //       val.record.applicationId,
  //     ]);
  //   } else if (val && val.type == 'EDIT') {
  //     this.router.navigate([
  //       'officers',
  //       'applications',
  //       'edit',
  //       val.record.member_Id,
  //       '0',
  //     ]);
  //   } else if (val && val.type == 'APPROVE') {
  //     this.router.navigate([
  //       'officers',
  //       'applications',
  //       'update-approval',
  //       val.record.id,
  //       val.record.member_Id,
  //     ]);
  //   } else if (val && val.type == 'PRINT') {
  //     this.router.navigate([
  //       'officers',
  //       'applications',
  //       'view-print',
  //       val.record.applicationId,
  //     ]);
  //   }else if (val && val.type == 'DELETE') {
  //     this.router.navigate([
  //       'officers',
  //       'applications',
  //       'delete-approval',
  //       val.record.id,
  //       val.record.member_Id,
  //     ]);
  //   }
  // }
    actioInvoked(val: ActionModel) {

  if (!val || !val.record) return;

  // REVIEW button → MEMBER VIEW
  if (val.type === 'VERIFY') {

    this.router.navigate([
      'officers',
      'applications',
      'member-view',
      val.record.id
    ]);

  }

  // VERIFY button → APPROVE screen
  else if (val.type === 'REVIEW') {
    this.router.navigate([
        'officers',
        'applications',
        'new-update-approvallay',
        val.record.id,
        val.record.member_Id
      ]);
  }

  else if (val.type === 'VIEW') {

    this.router.navigate([
      'officers',
      'applications',
      'member-view',
      val.record.id
    ]);

  }

  // existing EDIT
  else if (val.type === 'EDIT') {

    this.router.navigate([
      'officers',
      'applications',
      'member-edit',
      val.record.id,
      '0'
    ]);

  }

  // existing APPROVE
  else if (val.type === 'APPROVE') {

    this.router.navigate([
      'officers',
      'applications',
      'approve',
      val.record.id
    ]);

  }

}
  cf() {
    this.router.navigate(['officers', 'applications', 'update-approval', 'd']);
  }
}
