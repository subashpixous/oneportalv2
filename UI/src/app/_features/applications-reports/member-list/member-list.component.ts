import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationFilterModel,
  MemberFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { MemberGridViewModel } from 'src/app/_models/MemberDetailsModel';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
})
export class MemberListComponent {
  @Input() filtermodel!: MemberFilterModel;

  configurationList!: MemberGridViewModel[];
  cols!: Column[];
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
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;

  selecteddatefilter: string = '';
  selectedDistricts: string[] | [] = [];
    selectedCardStatus: string[] | [] = [];
  value: string[] = [];
  navigationModel: NavigationModel | undefined;
       isExporting:boolean = false;
  pollingInterval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private userService: UserService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef,
     private messageService:MessageService,
  ) {}
  ngOnInit() {
    // var appfilter = localStorage.getItem('ApplicationFilter');
    // if (appfilter) {
    //   this.filtermodel = JSON.parse(appfilter);
    //   this.filtermodel = {
    //     ...this.filtermodel,
    //     searchString: null,
    //     columnSearch: null,
    //     skip: 0,
    //     take: 10,
    //     sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
    //   };
    // } else {
    //   this.filtermodel = {
    //     searchString: null,
    //     skip: 0,
    //     where: {
    //       districtIds: [],
    //       year: '',
    //       isActive: false,
    //       type_of_Work: null,
    //       core_Sanitary_Worker_Type: null,
    //       organization_Type: null,
    //       nature_of_Job: null,
    //       local_Body: null,
    //       name_of_Local_Body: null,
    //       zone: null,
    //       block: null,
    //       village_Panchayat: null,
    //       corporation: null,
    //       municipality: null,
    //       town_Panchayat: null,
    //       district_Id: null,
    //       isApprovalPending: false,
    //       collectedByPhoneNumber: '',
    //       collectedByName: '',
    //       fromDate: null,
    //       toDate: null,
    //     },
    //     sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
    //     take: 10,
    //     columnSearch: null,
    //   };
    // }
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
        header: 'Name ',
        customExportHeader: 'Name',
        sortablefield: 'name',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'phone',
        header: 'Phone ',
        sortablefield: 'phone',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
        badgeCheckfield: 'lastAction',
      },
      {
        field: 'district',
        header: 'District',
        sortablefield: 'district',
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
        field: 'isApprovalPending',
        header: 'Is Approval Pending',
        sortablefield: 'isApprovalPending',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'updatedDate',
        header: 'Date',
        sortablefield: 'updatedDate',
        isSortable: true,
        isSearchable: false,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        isIcon: true,
        visibilityCheckFeild: 'canEdit',
      },
      {
        icon: 'pi pi-eye',
        title: 'View',
        type: 'VIEW',
        isIcon: true,
      },
    ];
  }
  ngOnChanges() {
    if (this.filtermodel) {
      this.selectedDistricts = this.filtermodel.where.districtIds ?? [];
      console.log('ngOnChanges');
      this.generate();
    }
  }
  createmeeting(val: string) {
    this.router.navigate(['officers', 'user-create', val, 'EDIT']);
  }
  changefilter(val: TableFilterModel) {
    console.log('changefilter');
    this.filtermodel = {
      ...this.filtermodel,
      ...val,
      where: {
        districtIds: this.selectedDistricts,
        cardstatusId:this.selectedCardStatus,
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
    this.getApplications();
  }
  getApplications() {
    localStorage.setItem('MemberListFilter', JSON.stringify(this.filtermodel));
    this.schemeService.Member_GetList(this.filtermodel).subscribe((c) => {
      this.configurationList = c.data;
      this.total = c.totalRecordCount;
      this.configurationList.map((x) => {
        x.isApprovalPending = x.isApprovalPending == '1' ? 'YES' : 'NO';
      });
    });
  }
  generate() {
    this.getApplications();
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

  // 🔹 Call backend export API
  this.schemeService.startMemberListExport(exportFilter, type).subscribe({
    next: (res: any) => {
      const downloadUrl = res.downloadUrl;

      // ✅ Replace iframe with invisible <a> download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click(); // 👈 triggers file download
      document.body.removeChild(link);

      this.messageService.add({
        severity: 'success',
        summary: 'Started',
        detail: 'Your file is being prepared and will download automatically.',
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


  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'member-view',
      val.record.id,
    ]);
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'VIEW') {
      this.router.navigate([
        'officers',
        'applications',
        'member-view',
        val.record.id,
      ]);
    } else if (val && val.type == 'EDIT') {
      this.router.navigate([
        'officers',
        'applications',
        'member-edit',
        val.record.id,
        '0',
      ]);
    } else if (val && val.type == 'APPROVE') {
      this.router.navigate([
        'officers',
        'applications',
        'approve',
        val.record.id,
      ]);
    } else if (val && val.type == 'PRINT') {
      this.router.navigate([
        'officers',
        'applications',
        'view-print',
        val.record.id,
      ]);
    }
  }
}
