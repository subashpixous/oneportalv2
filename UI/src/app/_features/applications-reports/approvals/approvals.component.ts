import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  MemberDataApprovalFilterModel,
  MemberDataApprovalGridFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { MemberDataApprovalGridModel } from 'src/app/_models/MemberDetailsModel';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
})
export class ApprovalsComponent {
  configurationList!: MemberDataApprovalGridModel[];
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
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  selectedActiveStatuses: string = '1';
  selectedrecordTypes: string[] | [] = [];
  selectedDistricts: string[] | [] = [];
  selectedStatuses: string[] | [] = [];

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
    var appfilter = localStorage.getItem('ApprovalFilter');
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
        isBadge: true,
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
        isBadge: true,
      },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'changed_Detail_Record',
        header: 'Changed Detail ',
        sortablefield: 'changed_Detail_Record',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
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
  getApplications() {
    localStorage.setItem('ApprovalFilter', JSON.stringify(this.filtermodel));
    this.userService
      .MemberDataApprovalGridGet(this.filtermodel)
      .subscribe((c) => {
        this.configurationList = c.data;
        this.total = c.totalRecordCount;
        this.configurationList.map((x) => {
          x.canApprove = x.status != 'COMPLETED';
        });
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
    this.selectedActiveStatuses = '1';
    this.generate();
  }
  generate() {
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
        val.record.member_Id,
        '0',
      ]);
    } else if (val && val.type == 'APPROVE') {
      this.router.navigate([
        'officers',
        'applications',
        'update-approval',
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
