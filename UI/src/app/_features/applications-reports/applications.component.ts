import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationFilterModel,
  MemberFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent {
  configurationList!: ApplicationMainGridModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;
  showSelect: boolean = false;

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
  // mainValue: string = 'MEMBER';
  mainValue: string = '';
  generateMainFilter() {}
  schemes: TCModel[] = [];
  districts: TCModel[] = [];
  statuses: TCModel[] = [];
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  selectedActiveStatuses: string = '1';
  selectedSchemes: string[] | [] = [];
  selectedDistricts: string[] | [] = [];
  selectedStatuses: string[] | [] = [];

  actions: Actions[] = [];
  title: string = 'Applications';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;

  filtermodel!: ApplicationFilterModel;
  memberfilter!: MemberFilterModel;
  value: string[] = [];
  navigationModel: NavigationModel | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private userService: UserService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {
    var obj = this.router.getCurrentNavigation()?.extras?.state;
    this.navigationModel = obj ? obj['data'] : undefined;
    this.selectedDistricts = this.navigationModel?.districtId
      ? [this.navigationModel?.districtId]
      : [];
    this.selectedSchemes = this.navigationModel?.schemeId
      ? [this.navigationModel?.schemeId]
      : [];
    this.cdr.markForCheck();
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.mainValue = params['mainvalue'] || 'MEMBER';
      console.log('Main value from URL:', this.mainValue);
      this.title = this.mainValue === 'MEMBER' ? 'Member Report' : 'Scheme Report';
    });
    var appfilter = localStorage.getItem('ApplicationFilter');
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
      this.selectedSchemes =
        this.selectedSchemes && this.selectedSchemes.length > 0
          ? this.selectedSchemes
          : this.filtermodel.where?.schemeIds;
      this.selectedActiveStatuses = this.filtermodel.where?.isExpired
        ? '0'
        : '1';
      this.selecteddatefilter = this.filtermodel.where?.year;

      this.memberfilter = {
        ...this.filtermodel,
        where: {
          districtIds: this.selectedDistricts,
          cardstatusId:null,
          year: this.selecteddatefilter,
          isActive: true,
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
        },
      };
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
          isBulkApprovalGet: false,
          year: '',
        },
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
        take: 10,
        columnSearch: null,
      };

      this.memberfilter = {
        ...this.filtermodel,
        where: {
          districtIds: this.selectedDistricts,
          cardstatusId:null,
          year: this.selecteddatefilter,
          isActive: true,
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
        },
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
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
      .subscribe((x) => {
        this.statuses = x.data;
      });
    this.cols = [
      {
        field: 'applicationNumber',
        header: 'Id',
        customExportHeader: 'Id',
        sortablefield: 'applicationNumber',
        isSortable: true,
        isSearchable: true,
        isActionable: true


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
        isBadge: true,
        badgeCheckfield: 'lastAction',
      },
      {
        field: 'observation',
        header: 'Observation',
        sortablefield: 'observation',
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
        isExpired: this.selectedActiveStatuses == '1' ? false : true,
        userId: '',
        schemeIds: this.selectedSchemes,
        districtIds: this.selectedDistricts,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        isBulkApprovalGet: false,
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
    localStorage.setItem('ApplicationFilter', JSON.stringify(this.filtermodel));
    this.schemeService
      .User_Application_GetList(this.filtermodel)
      .subscribe((c) => {
        this.configurationList = c.data;
        this.total = c.totalRecordCount;
      });
  }
  reset() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
      .subscribe((x) => {
        this.statuses = x.data;
      });
    this.selectedSchemes = [];
    this.selectedDistricts = [];
    this.selectedStatuses = [];
    this.selectedActiveStatuses = '1';
    this.generate();
  }
  generate() {
    this.filtermodel = {
      ...this.filtermodel,
      where: {
        districtIds: this.selectedDistricts,
        schemeIds: this.selectedSchemes,
        statusIds: this.selectedStatuses,
        isExpired: this.selectedActiveStatuses == '1' ? false : true,
        year: this.selecteddatefilter,
        userId: '',
        isBulkApprovalGet: false,
      },
    };
    this.memberfilter = {
      ...this.filtermodel,
      where: {
        districtIds: this.selectedDistricts,
        cardstatusId:null,
        year: this.selecteddatefilter,
        isActive: true,
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
      },
    };
    this.getApplications();
  }
  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'view',
      val.record.applicationId,
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
        'edit',
        val.record.applicationId,
        '0',
      ]);
    } else if (val && val.type == 'APPROVE') {
      this.router.navigate([
        'officers',
        'applications',
        'approve',
        val.record.applicationId,
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
