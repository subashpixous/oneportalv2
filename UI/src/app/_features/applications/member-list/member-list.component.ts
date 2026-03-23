import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription, take } from 'rxjs';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationFilterModel,
  MemberFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { MemberGridViewModel } from 'src/app/_models/MemberDetailsModel';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
})
export class MemberListComponent {
  @Input() filtermodel!: MemberFilterModel;
  @Input() isCalledFromApplication: boolean = false;
  @Input() showdata: boolean = false;
  isLoadingApplications = false;
  configurationList!: MemberGridViewModel[];
  cols!: Column[];
  localBodycols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;
  activeStatuses: TCModel[] = [
    { text: 'Active', value: '1' },
    { text: 'Expired', value: '0' },
  ];
  actions: Actions[] = [];
  title: string = 'Applications';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  exportInProgress: boolean = false;
  progress = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;
  private applicationsRequest$?: Subscription;

  selecteddatefilter: string = '';
  selectedDistricts: string[] | [] = [];
  selectedCardStatus: string[] | [] = [];
  value: string[] = [];
  navigationModel: NavigationModel | undefined;
  privleges = privileges;
  exportedData: any[] = []; //modified by Sivasankar on 31-10-2025 for export functionality
  exportCols: any[] = [];
  isExporting: boolean = false;
  pollingInterval: any;
  selectedRows: any[] = [];
selectedMemberIds: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private accountService: AccountService,
    private userService: UserService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private ngZone: NgZone,
      private http: HttpClient,
  ) {}
  dd: UserModel = this.accountService.userValue;

  local = this.dd.userDetails;

  ngOnInit() {
    var appfilter = localStorage.getItem('APPLICATION_FILTER_STATE');
    console.log('appfilter', appfilter);
    if (appfilter) {
      const parsed = JSON.parse(appfilter);
      // this.filtermodel = JSON.parse(appfilter);
      // this.filtermodel = {
      //   ...parsedFilter,
      //   // ...this.filtermodel,
      //    memberFilter: {
      //     ...parsedFilter.memberFilter,
      //     // ...this.filtermodel.memberFilter,
      //   // searchString: null,
      //   // columnSearch: null,
      //   // skip: 0,
      //   // take: 10,
      //   // sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
      //    }
      // };

       if (parsed.mainValue === 'MEMBER' && parsed.memberFilter) {
      this.filtermodel = {
        skip: parsed.memberFilter.skip ?? 0,
        take: parsed.memberFilter.take ?? 10,
        searchString: parsed.memberFilter.searchString ?? null,
        columnSearch: parsed.memberFilter.columnSearch ?? [],
        sorting: parsed.memberFilter.sorting ?? {
          fieldName: parsed.memberFilter.sorting.fieldName,
          sort: parsed.memberFilter.sorting.sort
        },
        where: {
          ...parsed.memberFilter.where
        }
      };
    }

      console.log('Initialized filtermodel from localStorage:', this.filtermodel);
    } else {
      this.filtermodel = {
        searchString: null,
        skip: 0,
        where: {
          districtIds: [],
          cardstatusId: this.selectedCardStatus,
          year: '',
          isActive: false,
          type_of_Work: null,
          core_Sanitary_Worker_Type: null,
          organization_Type: null,
          nature_of_Job: null,
          local_Body: null,
          name_of_Local_Body: null,
          zone: null,
          block: null,
          village_Panchayat: null,
          corporation: null,
          municipality: null,
          town_Panchayat: null,
          district_Id: null,
          isApprovalPending: false,
          collectedByPhoneNumber: '',
          collectedByName: '',
          fromDate: null,
          toDate: null,
          Application_Status: [],
          Approval_application_Status:null,
        },
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
        take: 10,
        columnSearch: null,
      };
    }
    this.cols = [
          {
        header: 'Member Id',
        field: 'member_Id',
        customExportHeader: 'Member Id',
        sortablefield: 'member_Id',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },
       {
    field: 'name',
    header: 'Member Name',
    sortablefield: 'name',
    isSortable: true,
    isSearchable: true,
  },
  {
    field: 'typeofWork',
    header: 'Type Of Worker',
    sortablefield: 'typeofWork',
    isSortable: true,
    isSearchable: true,
  },
  {
    field: 'organizationType',
    header: 'Organisation Type',
    sortablefield: 'organizationType',
    isSortable: true,
    isSearchable: true,
  },
    { field: 'status',
        header: 'Member Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: false,
      },  {
    field: 'aadhaarStatus',
    header: 'Aadhaar Verify',
    sortablefield: 'aadhaarStatus',
    isSortable: true,
    isBadge: true
  },

  {
    field: 'pdsStatus',
    header: 'PDS Verify',
    sortablefield: 'pdsStatus',
    isSortable: true,
    isBadge: true
  },
   {
        field: 'cardStatus',
        header: 'Card status',
        sortablefield: 'cardStatus',
        isSortable: true,
        isSearchable: false,
      },

    {
        field: 'district',
        header: 'District',
        sortablefield: 'district',
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
        field: 'collectedByName',
        header: 'Collected By Name',
        sortablefield: 'collectedByName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedByPhoneNumber',
        header: 'Collected By Phone Number',
        sortablefield: 'collectedByPhoneNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedOn',
        header: 'Collected On',
        sortablefield: 'collectedOn',
        isSortable: true,
        isSearchable: true,
      }
    ];

    this.localBodycols = [

      {
        field: 'name',
        header: 'Name',
        sortablefield: 'name',
        isSortable: true,
        isSearchable: true,
      },

     {
        field: 'organizationType',
        header: 'Organization Type',
        sortablefield: 'organizationType',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberFirstName',
        header: 'First Name',
        sortablefield: 'memberFirstName',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'memberLastName',
        header: 'Last Name',
        sortablefield: 'memberLastName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'remarks',
        header: 'Remarks',
        sortablefield: 'remarks',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },
      {
        field: 'memberFatherOrHusbandName',
        header: 'Father / Husband Name',
        sortablefield: 'memberFatherOrHusbandName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberBirthday',
        header: 'Birthday',
        sortablefield: 'memberBirthday',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'gender',
        header: 'Gender',
        sortablefield: 'gender',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'religion',
        header: 'Religion',
        sortablefield: 'religion',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberCommunity',
        header: 'Community',
        sortablefield: 'memberCommunity',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'caste',
        header: 'Caste',
        sortablefield: 'caste',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberMaritalStatus',
        header: 'Marital Status',
        sortablefield: 'memberMaritalStatus',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberAadhaarNumber',
        header: 'Aadhaar Number',
        sortablefield: 'memberAadhaarNumber',
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
        field: 'email',
        header: 'Email',
        sortablefield: 'email',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberRationCardNumber',
        header: 'Ration Card Number',
        sortablefield: 'memberRationCardNumber',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'isApprovalPending',
        header: 'Approval Pending',
        sortablefield: 'isApprovalPending',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'changedDetailRecord',
        header: 'Changed Detail Record',
        sortablefield: 'changedDetailRecord',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'approvedByRole',
        header: 'Approved By Role',
        sortablefield: 'approvedByRole',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'dmApproved',
        header: 'DM Approved',
        sortablefield: 'dmApproved',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'hqApproved',
        header: 'HQ Approved',
        sortablefield: 'hqApproved',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'isRejected',
        header: 'Rejected',
        sortablefield: 'isRejected',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'cardStatus',
        header: 'Card Status',
        sortablefield: 'cardStatus',
        isSortable: true,
        isSearchable: true,
      },


      {
        field: 'governmentOrganisationName',
        header: 'Government Organisation',
        sortablefield: 'governmentOrganisationName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'governmentDesignation',
        header: 'Government Designation',
        sortablefield: 'governmentDesignation',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'governmentNatureOfJob',
        header: 'Government Nature Of Job',
        sortablefield: 'governmentNatureOfJob',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'governmentAddress',
        header: 'Government Address',
        sortablefield: 'governmentAddress',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'privateOrganisationName',
        header: 'Private Organisation',
        sortablefield: 'privateOrganisationName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'privateDesignation',
        header: 'Private Designation',
        sortablefield: 'privateDesignation',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'privateAddress',
        header: 'Private Address',
        sortablefield: 'privateAddress',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'localBody',
        header: 'Local Body',
        sortablefield: 'localBody',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'block',
        header: 'Block',
        sortablefield: 'block',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'villagePanchayat',
        header: 'Village Panchayat',
        sortablefield: 'villagePanchayat',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'nameOfLocalBody',
        header: 'Name Of Local Body',
        sortablefield: 'nameOfLocalBody',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'corporation',
        header: 'Corporation',
        sortablefield: 'corporation',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'municipality',
        header: 'Municipality',
        sortablefield: 'municipality',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'townPanchayat',
        header: 'Town Panchayat',
        sortablefield: 'townPanchayat',
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
        field: 'newYellowCardNumber',
        header: 'New Yellow Card Number',
        sortablefield: 'newYellowCardNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'healthId',
        header: 'Health Id',
        sortablefield: 'healthId',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'permanentAddress',
        header: 'Permanent Address',
        sortablefield: 'permanentAddress',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'temporaryAddress',
        header: 'Temporary Address',
        sortablefield: 'temporaryAddress',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'collectedByName',
        header: 'Collected By Name',
        sortablefield: 'collectedByName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedByPhoneNumber',
        header: 'Collected By Phone Number',
        sortablefield: 'collectedByPhoneNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedOn',
        header: 'Collected On',
        sortablefield: 'collectedOn',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'updatedByUserName',
        header: 'Updated By UserName',
        sortablefield: 'updatedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'updatedDate',
        header: 'Updated Date',
        sortablefield: 'updatedDate',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'createdByUserName',
        header: 'Created By UserName',
        sortablefield: 'createdByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'createdDate',
        header: 'Created Date',
        sortablefield: 'createdDate',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'isAbleToCancelRequest',
        header: 'Can Cancel Request',
        sortablefield: 'isAbleToCancelRequest',
        isSortable: true,
        isSearchable: false,
      },
    ];

  this.actions = [
    {
    title: 'Edit',
    type: 'EDIT',
    isIcon: false,
    visibilityCheckFeild: 'canEdit',
    privilege: 'MEMBER_UPDATE'
  },
   {
    title: 'View',
    type: 'VIEW',
    isIcon: false,
    visibilityCheckFeild: 'canView',
    privilege: 'MEMBER_VIEW'
  },
    {
    title: 'Verify',
    type: 'VERIFY',
    isIcon: false,
    visibilityCheckFeild: 'canVerify',
    privilege: 'MEMBER_APPROVE'
  },
  {
    title: 'Review',
    type: 'REVIEW',
    isIcon: false,
    visibilityCheckFeild: 'canReview',
     privilege: 'MEMBER_APPROVE'
  },
  {
    title: 'CardView',
    type: 'CARDVIEW',
    isIcon: false,
    visibilityCheckFeild: 'CanIdcardView',
    privilege: 'MEMBER_UPDATE'
  },

];
  }
  ngOnChanges() {

    if (!this.filtermodel?.where) return;

  this.selectedDistricts = this.filtermodel.where.districtIds ?? [];
  this.selectedCardStatus = this.filtermodel.where.cardstatusId ?? [];
  this.generate();
  console.log('ngOnChanges');

  }
  createmeeting(val: string) {
    this.router.navigate(['officers', 'user-create', val, 'EDIT']);
  }


  changefilter(val: TableFilterModel) {
  const pageIndex = Math.floor((val.skip ?? 0) / this.rows);

    const sortingChanged =
    val.sorting &&
    (
      val.sorting.fieldName !== this.filtermodel.sorting?.fieldName ||
      val.sorting.sort !== this.filtermodel.sorting?.sort
    );

  this.filtermodel = {
    ...this.filtermodel,   // keep existing structure
    skip: pageIndex * this.rows,
    take: val.take ?? this.filtermodel.take,
    searchString: val.searchString ?? this.filtermodel.searchString,
    columnSearch: val.columnSearch ?? this.filtermodel.columnSearch,
    sorting: sortingChanged
      ? val.sorting
      : this.filtermodel.sorting,
    where: {
      ...this.filtermodel.where,
      // ...val.where,       // merge where ONLY
      zone: this.normalizeSingleSelect(this.filtermodel.where.zone),
      block: this.normalizeSingleSelect(this.filtermodel.where.block),
      village_Panchayat: this.normalizeSingleSelect(this.filtermodel.where.village_Panchayat),
      corporation: this.normalizeSingleSelect(this.filtermodel.where.corporation),
      municipality: this.normalizeSingleSelect(this.filtermodel.where.municipality),
      town_Panchayat: this.normalizeSingleSelect(this.filtermodel.where.town_Panchayat),
      districtIds: this.selectedDistricts,
      cardstatusId: this.selectedCardStatus,
      Application_Status: this.filtermodel.where.Application_Status ?? [],
      year: this.selecteddatefilter,
      isActive: true
    }
  };

  this.syncToLocalStorage();
  this.getApplications();
}

private normalizeSingleSelect(value: any): string | null {
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : null;
  }
  return value ?? null;
}


  changeStatus(val: boolean) {
    console.log('changeStatus');
    this.filtermodel = { ...this.filtermodel };
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          isIcon: true,
          visibilityCheckFeild: 'canEdit',
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

    this.syncToLocalStorage();
    this.getApplications();
  }

  getApplications() {
    // this.applicationsRequest$?.unsubscribe();
    this.isLoadingApplications = true;

    console.log('Fetching applications with filter:', this.filtermodel);


    if (this.showdata) {
      this.applicationsRequest$ = this.schemeService
        .Member_GetList(this.filtermodel)
        .pipe(take(1))
        .subscribe({
          next: (c) => {
            // Always ensure array
            const list = Array.isArray(c.data) ? c.data : [];


this.configurationList = list.map(x => {

  const aadhaarVerified =
    x.aadhaarVerified === true;

  const pdsVerified =
    x.pdsVerified === true;

  const bothVerified = aadhaarVerified && pdsVerified;
  // const isCompleted = x.status === 'COMPLETED' ;

  const isCompleted = x.canApprove == true && this.filtermodel?.where?.Approval_application_Status?.includes('Approvals');
  // const isView = x.status === 'COMPLETED' || x.status === 'RETURNED';
  const isView =!this.filtermodel?.where?.Approval_application_Status?.includes('Approvals');
  const isEdit =x.canEdit == true && x.status != 'COMPLETED';
  const isIdCardView = x.isApprovalCompleted === '1' && x.isApproved === '1' && x.isApprovalPending === 'No' && x.status === 'COMPLETED';
  return {

    ...x,  

    aadhaarStatus: aadhaarVerified ? 'Verified' : 'To Be Verified',

    pdsStatus: pdsVerified ? 'Verified' : 'To Be Verified',

    canReview: isCompleted && bothVerified,
    canVerify: isCompleted && !bothVerified,
    canView: isView,
    canEdit: isEdit,
    CanIdcardView:isIdCardView,

  };

});

            this.total = c.totalRecordCount;
          },
          error: (err) => console.error('Error loading applications:', err),
          complete: () => (this.isLoadingApplications = false),
        });
    }
  }

  syncToLocalStorage() {
  const state = {
    mainValue: 'MEMBER',
    memberFilter: this.filtermodel,
    schemeFilter: null
  };

  localStorage.setItem('APPLICATION_FILTER_STATE', JSON.stringify(state));
}

  onExportReques1t(type: string) {
    if (!this.isCalledFromApplication) return;
    if (this.isExporting) return; // prevent double-click
    const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };

    this.isExporting = true;
    this.messageService.add({
      severity: 'info',
      summary: 'Preparing...',
      detail: `Your ${type.toUpperCase()} export is being generated.`,
      life: 4000,
    });

    this.schemeService.startExport(exportFilter, type).subscribe({
      next: (res) => {
        const jobId = res.jobId;
        console.log('Export started:', jobId);

        this.pollingInterval = setInterval(() => {
          this.schemeService.getExportStatus(jobId).subscribe({
            next: (status) => {
              if (status.status === 'Completed') {
                clearInterval(this.pollingInterval);
                this.isExporting = false;

                this.messageService.add({
                  severity: 'success',
                  summary: 'Ready!',
                  detail: 'Your file has been generated successfully.',
                });

                // 3️⃣ Download file
                if (status.filePath) {
                  window.open(status.filePath, '_blank');
                }
              } else if (status.status === 'Failed') {
                clearInterval(this.pollingInterval);
                this.isExporting = false;
                this.messageService.add({
                  severity: 'error',
                  summary: 'Export Failed',
                  detail: status.errorMessage || 'Something went wrong.',
                });
              }
            },
            error: (err) => {
              console.error('Polling error:', err);
              clearInterval(this.pollingInterval);
              this.isExporting = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Could not check export status.',
              });
            },
          });
        }, 3000);
      },
      error: (err) => {
        console.error(err);
        this.isExporting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to start export job.',
        });
      },
    });
  }

  onExportRequest(type: string) {
    if (!this.isCalledFromApplication) return;
    if (this.isExporting) return;

    this.isExporting = true;
    const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };

    this.messageService.add({
      severity: 'info',
      summary: 'Preparing...',
      detail: `Your ${type.toUpperCase()} file is being generated.`,
      life: 3000,
    });

    this.schemeService.startExport(exportFilter, type).subscribe({
      next: (res: any) => {
        const downloadUrl = res.downloadUrl;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', '');
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.messageService.add({
          severity: 'success',
          summary: 'Started',
          detail:
            'Your file is being prepared and will download automatically.',
          life: 3000,
        });

        this.isExporting = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Export failed to start.',
          life: 3000,
        });
        this.isExporting = false;
      },
    });
  }

  generate() {
    this.getApplications();
  }
  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'member-view',
      val.record.id,
    ]);
  }
  actioInvoked(val: ActionModel) {

  if (!val || !val.record) return;

  // REVIEW button → MEMBER VIEW
  if (val.type === 'VERIFY') {

   this.router.navigate([
        'officers',
        'applications',
        'new-update-approvallay',
        val.record.dataApprovalId,
        val.record.id,
      ],
  {
      queryParams: {
        changedDetailRecord: val.record.changedDetailRecord
      }
    });


  }

  // VERIFY button → APPROVE screen
  else if (val.type === 'REVIEW') {
    this.router.navigate([
        'officers',
        'applications',
        'new-update-approvallay',
        val.record.dataApprovalId,
        val.record.id,
      ],
    {
      queryParams: {
        changedDetailRecord: val.record.changedDetailRecord
      }
    });

    

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

    // this.router.navigate([
    //   'officers',
    //   'applications',
    //   'member-edit',
    //   val.record.id,
    //   '0'
    // ]);

         this.router.navigate([
          'applicant',
          'mem-detail',
        val.record.id,
         '0',
      ],
        { queryParams: { isOfficerSave: true } });
    }

 
  else if (val.type === 'CARDVIEW') {

this.router.navigate([
      'officers',
      'applications',
      'member-card-view',
      val.record.id,
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

onSelectedApplications(selectedRows: any[]) {

  this.selectedRows = selectedRows || [];

  this.selectedMemberIds = selectedRows.map(x => x.dataApprovalId);

  console.log("Selected Member IDs:", this.selectedMemberIds);

}

multiApprove() {

  if (!this.selectedMemberIds.length) {

    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select members first'
    });

    return;
  }

  const payload = {
    requestId: this.selectedMemberIds,
    status: "Approve",
    SelectedRoleText: "Approve",
    reason: "",
    comment: ""
  };

  this.http.post(`${environment.apiUrl}/User/MemberData_BulkApprove`, payload)
    .subscribe((res: any) => {

      if (res.status === 'SUCCESS') {

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Bulk approval successful'
        });

        this.getApplications();
        this.selectedRows = [];
        this.selectedMemberIds = [];

      }

    });

}


showBulkApproveButton(): boolean {
  return this.selectedRows && this.selectedRows.length > 0;
}
}
