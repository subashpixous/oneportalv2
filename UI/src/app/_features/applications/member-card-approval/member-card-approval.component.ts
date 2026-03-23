
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  MemberDataApprovalGridFilterModel,
  NavigationModel,
  MemberDataApprovalFilterModel,
  TableFilterModel,
  MemberCardApprovalFilterModel,
  MemberCardApprovalGridFilterModel,
} from 'src/app/_models/filterRequest';
import { Member_Card_Approval_Master_Grid_Model } from 'src/app/_models/MemberDetailsModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import {
  ApplicationMainGridModel,
  ApprovalModel,
  ApproveStatusItemModel,
  ApproveStatusViewModel,
  BulkApprovalModel,
} from 'src/app/_models/schemeModel';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import { UserModel } from 'src/app/_models/user';
import {
  Member_Card_Approval_Master_From,
  MemberDataApprovalFormModel,
  MemberDataApprovalFromSubmitModel,
} from 'src/app/_models/MemberDetailsModel';
import { MessageService } from 'primeng/api';
import { DatatableComponent } from 'src/app/shared/datatable/datatable.component';
import { DatatablePaginationComponent } from 'src/app/shared/datatable-pagination/datatable-pagination.component';
@Component({
  selector: 'app-member-card-approval',
  templateUrl: './member-card-approval.component.html',
  styleUrls: ['./member-card-approval.component.scss'],
})
export class MemberCardApprovalComponent {
   
  selectedRows: any[] = [];
  approvalStatuses: any[] = [];
 
  @ViewChild('dt') dataTable!: DatatablePaginationComponent;
 
  configurationList!: Member_Card_Approval_Master_Grid_Model[];
  //modified by Sivasankar on 31-10-2025 for export functionality
   exportedData: any[] = [];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;
  selectedMemberIds: string[] = [];
  activeStatuses: TCModel[] = [
    { text: 'Active', value: '1' },
    { text: 'Expired', value: '0' },
  ];
       isExporting:boolean = false;
  pollingInterval: any;
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
  mainValue: string = 'MEMBER';
  generateMainFilter() {}
  recordTypes: TCModel[] = [];
  districts: TCModel[] = [];
  statuses: TCModel[] = [];
  roles: TCModel[] = [];
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  selectedActiveStatuses: string = '1';
  selectedrecordTypes: string[] | [] = [];
  selectedDistricts: string[] | [] = [];
  selectedStatuses: string[] | [] = [];
  selectedroles: string = '';
  selectedStatus: string = '';

  actions: Actions[] = [];
  title: string = 'Requested For Print';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;
selectedCardDisbursedStatus : boolean | null = null; // null means no filter applied
  filtermodel!: any
// dropdown options
cardDisbursedStatusOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
];
 
  approvaldetail!: Member_Card_Approval_Master_From;
  value: string[] = [];
  navigationModel: NavigationModel | undefined;

  approvalForm!: FormGroup;
  reasons: TCModel[] = [];
 

  selectedStatusId: string = '';
  selectedSchemeId: string = '';

  requestedStatusId = '6f9f79ab-4c91-3711-de51-e29ec55c4c74';
  @ViewChild('dt') dt: any;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private userService: UserService,
    private accountService: AccountService,
    private roleService: RoleService,
    private messageService: MessageService,
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
  ngOnInit() {
    var dd: UserModel = this.accountService.userValue;
    this.approvalForm = new FormGroup({
      applicationIds: new FormControl('', Validators.required),
      applicationIdsText: new FormControl(),
      statusfrom: new FormControl(''),
      status: new FormControl('Requested for Print', Validators.required),
      date: new FormControl(new Date().toLocaleString()),
      approvalRejectedstatus: new FormControl('', Validators.required),
      jobTitle: new FormControl(dd.userDetails.roleName),
      reason: new FormControl(''),
      name: new FormControl(`${dd.firstName} ${dd.lastName}`),
      document: new FormControl(''),
      comments: new FormControl(''),
    });
//Updated by sivasankar on 08-09-2025
      this.approvalForm.get('approvalRejectedstatus')?.valueChanges.subscribe(value => {
    const commentsControl = this.approvalForm.get('comments');
 
    if (value === 'REJECTED') {
      commentsControl?.setValidators([Validators.required]);
    } else {
      commentsControl?.clearValidators();
    }
 
    commentsControl?.updateValueAndValidity();
  });

    var appfilter = localStorage.getItem('ApprovalCardFilter');
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
      this.selectedStatuses = this.filtermodel.where?.statusIds;

      this.selectedDistricts =
        this.selectedDistricts && this.selectedDistricts.length > 0
          ? this.selectedDistricts
          : this.filtermodel.where?.districtIds;
      this.selectedActiveStatuses = this.filtermodel.where?.isActive
        ? '0'
        : '1';
      this.selecteddatefilter = this.filtermodel.where?.year;
    } else {
      this.filtermodel = {
        searchString: null,
        skip: 0,
        where: {
          districtIds: [],
          statusIds: [],
          isActive: false,
          year: '',
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

    this.userService.MemberCardApprovalGridFilter().subscribe((x) => {
      if (x) {
        const d: MemberCardApprovalFilterModel = x.data;

        this.districts = d.districtList;

        // ✅ Forcefully override statuses to only "Requested for Print"
        this.statuses = [
          {
            text: 'Requested for Print',
            value: this.requestedStatusId,
            selected: true,
          },
        ];

        // ✅ Preselect it for all internal filters
        this.selectedStatuses = [this.requestedStatusId];
        this.selectedStatus = this.requestedStatusId;

        // ✅ Apply this value to your filter model directly
        this.filtermodel = {
          ...this.filtermodel,
          where: {
            ...this.filtermodel.where,
            statusIds: [this.requestedStatusId],
            isActive: true,
            districtIds: this.selectedDistricts ?? [],
            year: this.selecteddatefilter ?? '',
          },
          skip: 0,
          take: 10,
          searchString: null,
          columnSearch: null,
          sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
        };

        // ✅ Fetch data immediately with filtered status
        this.getApplications();
      }
    });

    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;

    this.cols = [
      {
        field: 'district',
        header: 'District',
        customExportHeader: 'District',
        sortablefield: 'district',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberCode',
        header: 'Member Id',
        customExportHeader: 'Member Id',
        sortablefield: 'memberCode',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
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
        field: 'organizationType',
        header: 'Organization Type',
        customExportHeader: 'organizationType',
        sortablefield: 'organizationType',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'phoneNumber',
        header: 'Phone Number',
        sortablefield: 'phoneNumber',
        isSortable: true,
        isSearchable: true,
      },
      // {
      //   field: 'memberCode',
      //   header: 'Member Code',
      //   sortablefield: 'memberCode',
      //   isSortable: true,
      //   isSearchable: true,
      //   isBadge: true,
      // },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
            {
        field: 'cardDisbursedStatus',
        header: 'Card Disburse Status',
        sortablefield: 'CardDisbursedStatus',
        isSortable: true,
   
        isBadge: true,
      },
      // {
      //   field: 'lastActionStatus',
      //   header: 'Last Action Status',
      //   sortablefield: 'lastActionStatus',
      //   isSortable: true,
      //   isSearchable: true,
      //   isBadge: true,
      // },
      {
        field: 'modifiedByUserName',
        header: 'Approved By',
        sortablefield: 'modifiedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'modifiedDate',
        header: 'Approved Date',
        sortablefield: 'modifiedDate',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'localBody',
        header: 'Local Body',
        sortablefield: 'localBody',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'zone',
        header: 'Zone',
        sortablefield: 'zone',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'fatherName',
        header: 'Father Name',
        sortablefield: 'fatherName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'dob',
        header: 'Date of Birth',
        sortablefield: 'dob',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'address',
        header: 'Address',
        sortablefield: 'address',
        isSortable: true,
        isSearchable: true,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-arrow-right',
        title: 'Approve',
        type: 'APPROVE',
        isIcon: true,
        visibilityCheckFeild: 'canApprove',
      },
    ];
    
  }

//Updated by Sivasankar on 08-09-2025
  onCancel() {
 
  this.approvalForm.get('applicationIdsText')?.reset();
  this.approvalForm.get('reason')?.reset();
  this.approvalForm.get('approvalRejectedstatus')?.reset();
  this.approvalForm.get('comments')?.reset();
  this.approvalForm.get('applicationIds')?.reset();
 
  // If chips were disabled, enable them back
  this.approvalForm.get('applicationIdsText')?.enable();
 
  // Also clear datatable selection if needed
  if (this.dataTable?.clearSelection) {
    this.dataTable.clearSelection();
  }
 
  this.approvalStatuses = [];
  this.reasons = [];
 
}
  submit() {
    console.log('Submit triggered...');
    console.log('Selected Member IDs:', this.selectedMemberIds);
    console.log('Form Value:', this.approvalForm.value);
    if (this.approvalForm.invalid) {
      this.approvalForm.markAllAsTouched();
      return;
    }

    var waitMsg = this.messageService.add({
    severity: 'info',
    summary: 'Please Wait',
    detail: 'Submitting approval...',
    life: 300000,
  });
  
     waitMsg = this.messageService.add({
    severity: 'info',
    summary: 'Please Wait',
    detail: 'It may take few minutes...',
    life: 300000,
  });

    const payload = {
      member_Id: this.selectedMemberIds,
      approvalComment: this.approvalForm.value.comments || '',
      reason: this.approvalForm.value.reason || '',
      selectedStatus: this.approvalForm.value.approvalRejectedstatus || '',
    };

    this.userService.MemberCard_BulkApprove(payload).subscribe({
      next: (res) => {
        this.messageService.clear();

        if (res.status === 'SUCCESS') {
          const totals =
            res.totalRecordCount && res.totalRecordCount.length > 0
              ? res.totalRecordCount[0]
              : { totalSuccess: 0, totalFailed: 0 };

          this.messageService.add({
            severity: 'success',
            summary: 'Approval Submitted!',
            detail: `Approved: ${totals.totalSuccess}, Returned To DM: ${totals.totalFailed}`,
            life: 10000,
          });
          this.getApplications();
          this.resetApprovalForm();
          this.selectedRows = [];
               this.cdr.detectChanges();

          console.log('Submitting payload:', payload);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.message || 'Approval failed.',
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while submitting.',
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
      status: 'Requested for Print',
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
    console.log('Filter changed:', val);

    // Build updated filter model
    this.filtermodel = {
      ...this.filtermodel,
      skip: val.skip ?? 0,
      take: val.take ?? 10,
      searchString: val.searchString?.trim() || null,
      columnSearch: val.columnSearch || null,
      sorting: val.sorting || { fieldName: 'applicationNumber', sort: 'DESC' },
      where: {
        ...this.filtermodel.where,
        statusIds: [this.requestedStatusId], // Always enforce Requested for Print
        districtIds: this.selectedDistricts ?? [],
        year: this.selecteddatefilter ?? '',
        isActive: true,
      },
    };

    console.log('Final filter sent to API:', this.filtermodel);

    // Call API with updated filter
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

  onStatusChanged(event: any) {
    const selected = this.statuses.find((s) => s.value === event.value);
    this.approvalForm.patchValue({
      status: selected ? selected.text : '',
      applicationIds: '', // Clear selection
      applicationIdsText: [], // Clear chips
    });
    this.configurationList = []; // Optional: clear grid until fetch
  }

  // onSelectedApplications(
  //   selectedRows: Member_Card_Approval_Master_Grid_Model[]
  // ) {
  //   console.log('Selected Rows:', selectedRows);

  //   // Reset IDs first
  //   this.selectedMemberIds = [];

  //   // Collect member codes for the UI
  //   const codes = selectedRows.map((row) => row.memberCode || '');

  //   // Patch the chips input with member codes
  //   this.approvalForm.patchValue({
  //     applicationIds: [],
  //     applicationIdsText: codes,
  //   });

  //   // Disable manual editing of the chips
  //   this.approvalForm.controls['applicationIdsText'].disable();

  //   // If no rows selected, exit early
  //   if (!selectedRows.length) {
  //     console.warn('No rows selected');
  //     return;
  //   }

  //   const firstRow = selectedRows[0];

  //   // If the grid already has member_Id values
  //   if (firstRow.member_Id && firstRow.member_Id.trim() !== '') {
  //     this.selectedMemberIds = selectedRows.map((row) => row.member_Id);
  //     this.approvalForm.patchValue({
  //       applicationIds: this.selectedMemberIds,
  //     });

  //     // Load approval details for the first selected row
  //     this.loadApprovalDetails(firstRow.id, firstRow.member_Id);
  //     console.log('Member IDs directly from grid:', this.selectedMemberIds);
  //   }
  //   // If member_Id is missing in grid, fetch it from API
  //   else {
  //     console.warn('Member ID missing in grid data. Fetching from API...');
  //     this.userService
  //       .MemberCardApprovalForm(firstRow.id, '')
  //       .subscribe((response) => {
  //         if (response?.data?.member_Id) {
  //           const correctMemberId = response.data.member_Id;

  //           // Apply the fetched member ID to all selected rows
  //           this.selectedMemberIds = selectedRows.map(() => correctMemberId);

  //           // Update form values with the corrected IDs
  //           this.approvalForm.patchValue({
  //             applicationIds: this.selectedMemberIds,
  //           });

  //           // Populate status and reasons dropdowns
  //           this.approvalStatuses = response.data.statusList.map(
  //             (status: any) => ({
  //               statusName: status.text,
  //               statusId: status.value,
  //             })
  //           );
  //           this.reasons = response.data.reasonList || [];

  //           console.log('Fetched Member IDs from API:', this.selectedMemberIds);
  //         } else {
  //           console.error('API did not return a valid member ID');
  //         }
  //       });
  //   }
  // }
  // Elanjsuriyan - 09092025
//   onSelectedApplications(selectedRows: Member_Card_Approval_Master_Grid_Model[]) {
//   const MAX_LIMIT = 2000;
 
//   // Automatically trim selection if it exceeds MAX_LIMIT
//   if (selectedRows.length > MAX_LIMIT) {
//     this.messageService.add({
//       severity: 'warn',
//       summary: 'Selection Limit',
//       detail: `You can only select up to ${MAX_LIMIT} applications at a time.`,
//       life: 5000,
//     });
 
//     // Keep only first MAX_LIMIT rows
//     this.selectedRows = selectedRows.slice(0, MAX_LIMIT);
 
//     // Emit trimmed selection to update checkboxes in the table
//     // if (this.dt?.selectedApplications) {
//     //   this.dt.selectedApplications.emit(this.selectedRows);
//     // }
//      setTimeout(() => {
//       if (this.dt?.selectedApplications) {
//         // Emit only the trimmed selection
//         this.dt.selectedApplications.emit(this.selectedRows);
//       }
//     }, 100);
 
//     console.log('Trimmed Selection:', this.selectedRows);
 
//   } else {
//     // Normal selection
//     this.selectedRows = selectedRows;
//   }
 
//   // Update form values
//   const codes = this.selectedRows.map((row) => row.memberCode || '');
//   this.approvalForm.patchValue({
//     applicationIdsText: codes,
//     applicationIds: this.selectedRows.map((row) => row.member_Id),
//   });
 
//   // Update selected IDs
//   this.selectedMemberIds = this.selectedRows.map((row) => row.member_Id);
 
//   console.log('Selected Member IDs:', this.selectedMemberIds);
 
//   // Disable the text field
//   this.approvalForm.controls['applicationIdsText'].disable();
 
//   // Detect changes to refresh the UI
//   this.cdr.detectChanges();
 
//   if (!this.selectedRows.length) {
//     console.warn('No rows selected');
//     return;
//   }
 
//   const firstRow = this.selectedRows[0];
 
//   if (firstRow.member_Id?.trim()) {
//     // Load approval details for the first selected row
//     this.loadApprovalDetails(firstRow.id, firstRow.member_Id);
//   } else {
//     // Fetch member ID if missing
//     this.userService.MemberCardApprovalForm(firstRow.id, '').subscribe((response) => {
//       if (response?.data?.member_Id) {
//         const correctMemberId = response.data.member_Id;
 
//         // Update selected IDs for all selected rows
//         this.selectedMemberIds = this.selectedRows.map(() => correctMemberId);
 
//         this.approvalForm.patchValue({
//           applicationIds: this.selectedMemberIds,
//         });
 
//         // Update status list and reasons
//         this.approvalStatuses = response.data.statusList.map((status: any) => ({
//           statusName: status.text,
//           statusId: status.value,
//         }));
//         this.reasons = response.data.reasonList || [];
//       }
//     });
//   }
// }
onSelectedApplications(selectedRows: Member_Card_Approval_Master_Grid_Model[]) {
  const MAX_LIMIT = 500;
 
  // Case when selection exceeds limit
  if (selectedRows.length > MAX_LIMIT) {
    const extraRows = selectedRows.slice(MAX_LIMIT);
    const extraCodes = extraRows.map(r => r.memberCode || '').join(', ');
 
    // Show warning
    this.messageService.add({
      severity: 'warn',
      summary: 'Selection Limit',
      detail: `You can only select up to ${MAX_LIMIT} applications. Extra selections removed: ${extraCodes}`,
      life: 5000,
    });
 
    // First clear table selection visually using setTimeout
    setTimeout(() => {
      if (this.dataTable?.clearSelection) {
        this.dataTable.clearSelection();
      }
 
      // After clearing, set only first 5 rows as selected
      setTimeout(() => {
        this.selectedRows = selectedRows.slice(0, MAX_LIMIT);
 
        // Pass to child table for visual checkbox update
        if (this.dataTable?.selectRows) {
          const rowsToSelect = this.selectedRows.map(r => ({
            id: r.id,
            member_Id: r.member_Id
          }));
          this.dataTable.selectRows(rowsToSelect);
        }
 
        // Update form and internal arrays
        const codes = this.selectedRows.map(r => r.memberCode || '');
        this.selectedMemberIds = this.selectedRows.map(r => r.member_Id);
 
        this.approvalForm.patchValue({
          applicationIdsText: codes,
          applicationIds: this.selectedMemberIds,
          reason: '',
          approvalRejectedstatus: '',
          comments: ''
        });
 
        this.approvalForm.get('applicationIdsText')?.enable();
 
        // Set static approval statuses
        this.approvalStatuses = [
          { statusId: 'APPROVED', statusName: 'Approve' },
          { statusId: 'RETURNED', statusName: 'Return' }
        ];
 
        this.reasons = []; // optional, empty or you can set defaults
 
        // Detect changes
        this.cdr.detectChanges();
      }, 0); // second timeout ensures clearSelection completes first
    }, 0); // first timeout triggers the clear
  } else {
    // Normal selection within limit
    this.selectedRows = selectedRows;
    const codes = this.selectedRows.map(r => r.memberCode || '');
    this.selectedMemberIds = this.selectedRows.map(r => r.member_Id);
 
    this.approvalForm.patchValue({
      applicationIdsText: codes,
      applicationIds: this.selectedMemberIds,
      reason: '',
      approvalRejectedstatus: '',
      comments: ''
    });
 
    this.approvalForm.get('applicationIdsText')?.enable();
 
    // Update child table visual selection
    if (this.dataTable?.selectRows) {
      const rowsToSelect = this.selectedRows.map(r => ({
        id: r.id,
        member_Id: r.member_Id
      }));
      this.dataTable.selectRows(rowsToSelect);
    }
 
    // Set static approval statuses
    this.approvalStatuses = [
      { statusId: 'APPROVED', statusName: 'Approve' },
      { statusId: 'RETURNED', statusName: 'Return' }
    ];
    this.reasons = [];
 
    // Detect changes
    this.cdr.detectChanges();
  }
}

  getApplications() {
    localStorage.setItem(
      'ApprovalCardFilter',
      JSON.stringify(this.filtermodel)
    );

    this.userService.MemberCardApprovalGridGet(this.filtermodel).subscribe({
      next: (res) => {
        this.configurationList = res.data ?? [];
        this.total = res.totalRecordCount ?? this.configurationList.length;
      },
      error: (err) => {
        console.error('Error fetching applications:', err);
        this.configurationList = [];
        this.total = 0;
      },
    });
  }
  //modified by Sivasankar on 06-11-2025 for export functionality
onExportRequest(type: string) {
  if (this.isExporting) return;
  this.isExporting = true;

  const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };

  this.messageService.add({
    severity: 'info',
    summary: 'Preparing...',
    detail: `Your ${type.toUpperCase()} file is being generated.`,
    life: 3000
  });

  // 🔹 Call background export API
  this.userService.startMemberCardApprovalExport(exportFilter, type).subscribe({
    next: (res: any) => {
      const downloadUrl = res.downloadUrl;

      // ✅ Use <a> instead of iframe — works better in all browsers
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click(); // 👈 instantly triggers the file download
      document.body.removeChild(link);

      this.messageService.add({
        severity: 'success',
        summary: 'Started',
        detail: 'Your file is being prepared. It will download automatically.',
        life: 3000
      });

      this.isExporting = false;
    },
    error: (err) => {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Export failed to start.',
        life: 3000
      });
      this.isExporting = false;
    }
  });
}


  loadApprovalDetails(requestId: string, memberId: string) {
    this.userService
      .MemberCardApprovalForm(requestId, memberId)
      .subscribe((x) => {
        if (x && x.data) {
          // Convert API format to your dropdown model
          this.approvalStatuses = x.data.statusList.map((s: any) => ({
            statusName: s.text,
            statusId: s.value,
          }));
          this.reasons = x.data.reasonList || [];

          // Set defaults in form
          this.approvalForm.patchValue({
            statusfrom: x.data.status,
            approvalRejectedstatus: '', // reset selection
            reason: '',
          });
        }
      });
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
    this.selectedroles = '';
    this.selectedActiveStatuses = '1';
     
  this.selectedCardDisbursedStatus = null;
    this.generate();
  }
  // generate() {
  //   this.selectedStatus = this.requestedStatusId;
  //   this.selectedStatuses = [this.requestedStatusId];
  //   this.statuses = [
  //     {
  //       text: 'Requested for Print',
  //       value: this.requestedStatusId,
  //     },
  //   ];

  //   this.filtermodel = {
  //     ...this.filtermodel,
  //     where: {
  //       districtIds: this.selectedDistricts,
  //       statusIds: [this.requestedStatusId],
  //       year: this.selecteddatefilter,
  //       isActive: true,
  //     },
  //     skip: 0,
  //     take: 10,
  //     searchString: null,
  //     columnSearch: null,
  //     sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
  //   };

  //   this.getApplications();

  //   // Clear selection in the table after regeneration
  //   if (this.dataTable) {
  //     this.dataTable.clearSelection();
  //   }

  //   this.approvalForm.patchValue({
  //     applicationIds: [],
  //     applicationIdsText: [],
  //   });
  //   this.approvalForm.controls['applicationIdsText'].enable(); // Re-enable editing if needed
  // }
  generate() {
  this.selectedStatus = this.requestedStatusId;
  this.selectedStatuses = [this.requestedStatusId];
  this.statuses = [
    {
      text: 'Requested for Print',
      value: this.requestedStatusId,
    },
  ];
 
  this.filtermodel = {
    ...this.filtermodel,
    where: {
      districtIds: this.selectedDistricts,
      statusIds: [this.requestedStatusId],
      year: this.selecteddatefilter,
      isActive: true,
      isCompleted: this.selectedCardDisbursedStatus === null ? null
                   : !!this.selectedCardDisbursedStatus// Ensure only pending applications are fetched
     
    },
    skip: 0,
    take: 10,
    searchString: null,
    columnSearch: null,
    sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
  };
 
  this.getApplications();
 
  // Clear selection in the table after regeneration
  if (this.dataTable) {
    this.dataTable.clearSelection();
  }
 
  this.approvalForm.patchValue({
    applicationIds: [],
    applicationIdsText: [],
  });
  this.approvalForm.controls['applicationIdsText'].enable(); // Re-enable editing if needed
}
 

  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'card-approval',
      val.record.id,
      val.record.member_Id,
    ]);
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'VIEW') {
      this.router.navigate([
        'officers',
        'applications',
        'view',
        val.record.applicationId,
      ]);
    } else if (val && val.type == 'EDIT') {
      this.router.navigate([
        'officers',
        'applications',
        'card-approval',
        val.record.id,
        val.record.member_Id,
      ]);
    } else if (val && val.type == 'APPROVE') {
      this.router.navigate([
        'officers',
        'applications',
        'card-approval',
        val.record.id,
        val.record.member_Id,
      ]);
    } else if (val && val.type == 'PRINT') {
      this.router.navigate([
        'officers',
        'applications',
        'view-print',
        val.record.applicationId,
      ]);
    }
  }
  cf() {
    this.router.navigate(['officers', 'applications', 'update-approval', 'd']);
  }
}
