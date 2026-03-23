import { ChangeDetectorRef, Component } from '@angular/core';
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

@Component({
  selector: 'app-member-card-approval',
  templateUrl: './member-card-approval.component.html',
  styleUrls: ['./member-card-approval.component.scss'],
})
export class MemberCardApprovalComponent {
  configurationList!: Member_Card_Approval_Master_Grid_Model[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

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

  actions: Actions[] = [];
  title: string = 'Member Card Approval';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;

  filtermodel!: MemberCardApprovalGridFilterModel;

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
    this.selectedrecordTypes = this.navigationModel?.recordType
      ? [this.navigationModel?.recordType]
      : [];
    this.cdr.markForCheck();
  }
  ngOnInit() {
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
        var d: MemberCardApprovalFilterModel = x.data;
        this.districts = d.districtList;
        this.statuses = d.statusList;
      }
    });
    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;

    this.cols = [
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
        field: 'phoneNumber',
        header: 'Phone Number',
        sortablefield: 'phoneNumber',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
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
        field: 'lastActionStatus',
        header: 'Last Action Status',
        sortablefield: 'lastActionStatus',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
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
        isSearchable: false,
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
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        isActive: true,
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
      'ApprovalCardFilter',
      JSON.stringify(this.filtermodel)
    );
    this.userService
      .MemberCardApprovalGridGet(this.filtermodel)
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
    this.selectedrecordTypes = [];
    this.selectedDistricts = [];
    this.selectedStatuses = [];
    this.selectedroles = '';
    this.selectedActiveStatuses = '1';
    this.generate();
  }
  generate() {
    this.filtermodel = {
      ...this.filtermodel,
      where: {
        districtIds: this.selectedDistricts,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        isActive: true,
      },
    };
    this.getApplications();
  }
  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'member-view',
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
