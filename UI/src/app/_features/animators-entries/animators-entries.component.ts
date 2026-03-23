import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionModel } from 'src/app/_models/datatableModel';
import { UserService } from 'src/app/services/user.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberFilterModel } from 'src/app/_models/filterRequest';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-animators-entries',
  templateUrl: './animators-entries.component.html',
  styleUrls: ['./animators-entries.component.scss']
})

// [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries

export class AnimatorsEntriesComponent implements OnInit {
  // filtermodel!: any;
  @Input() isCalledFromApplication: boolean = false;
    exportedData: any[] = [];
exportCols: any[] = [];

  mainOptions = [
    { name: 'Scheme', value: 'application' },
    { name: 'Members', value: 'member' }
  ];
  mainValue: string = 'application'; // default tab

  configurationList: any[] = [];
  total: number = 0;
  rows: number = 10;
  cols: any[] = [];
  defaultSortField = 'createdDate';
  defaultSortOrder = -1;

  filtermodel: any = {};
  districts: any[] = [];
  selectedDistricts: any[] = [];
      isExporting:boolean = false;
  pollingInterval: any;

  
  // ✅ new dropdown variables
  schemes: any[] = [];
  statuses: any[] = [];
  cardStatus: any[] = [];
  selectedSchemes: any[] = [];
  selectedStatuses: any[] = [];
  selecteddatefilter: any;

  datefilter = [
    { name: 'Today', value: 'TODAY' },
    { name: 'This Week', value: 'WEEK' },
    { name: 'This Month', value: 'MONTH' },
    { name: 'All', value: 'ALL' }
  ];
 

  constructor(
       private router: Router,
    private userService: UserService,
    private datePipe: DatePipe,
    private generalService: GeneralService,
    private messageService:MessageService,

  ) {}

  ngOnInit() {
    this.initializeColumns();
    this.initializeFilterModel();
    this.loadDropdowns();
    this.loadDistricts();
    this.loadData();
  }

  initializeColumns() {
    if (this.mainValue === 'application') {
      this.cols = [
        { field: 'temporaryNumber', header: 'Id', sortablefield: 'temporaryNumber', isSortable: true,isActionable: true ,type:'VIEW_APPLICATION_DETAILS'},
        { field: 'scheme', header: 'Scheme', sortablefield: 'scheme', isSortable: true },
        { field: 'status', header: 'Status', sortablefield: 'status', isSortable: true, isBadge: true },
        { field: 'districtName', header: 'District', sortablefield: 'districtName', isSortable: true },
        { field: 'createdByUserName', header: 'createdByUserName ', sortablefield: 'createdByUserName', isSortable: true },
        { field: 'mobile', header: 'Mobile', sortablefield: 'mobile', isSortable: true },
        { field: 'createdDate', header: 'CreatedDate', sortablefield: 'createdDate', isSortable: true }
        
      ];
    } else {
      this.cols = [
        { field: 'member_Id', header: 'Member Id', sortablefield: 'member_Id', isSortable: true ,isActionable: true,type:'VIEW_MEMBER_DETAILS'},
        { field: 'name', header: 'Name', sortablefield: 'name', isSortable: true },
        { field: 'phone', header: 'Phone', sortablefield: 'phone', isSortable: true },
        { field: 'district', header: 'District', sortablefield: 'district', isSortable: true },
        { field: 'isApproved', header: 'is Approval Pending', sortablefield: 'isApproved', isSortable: true },
        { field: 'status', header: 'Status', sortablefield: 'Status', isSortable: true },
        { field: 'cardStatus', header: 'CardStatus', sortablefield: 'CardStatus', isSortable: true },
        { field: 'cardDisbursedStatus', header: 'cardDisbursedStatus', sortablefield: 'cardDisbursedStatus', isSortable: true },
        { field: 'collectedByName', header: 'Collected By', sortablefield: 'collectedByName', isSortable: true },
        { field: 'collectedByPhoneNumber', header: 'Collected By Phone', sortablefield: 'collectedByPhoneNumber', isSortable: true },
        { field: 'collectedOn', header: 'Collected On', sortablefield: 'collectedOn', isSortable: true }


      ];
       
    }
  }

initializeFilterModel() {
  if (this.mainValue === 'application') {
    // For Application API
    this.filtermodel = {
      where: {
        applicationNumber: '',
        mobile: '',
        memberId: '',
        district: '',
        scheme: '',
        status: ''
      },
      sorting: { fieldName: this.defaultSortField, sort: 'DESC' },
      searchString: '',
      skip: 0,
      take: this.rows
    };
  } else {
    // For Member API
    this.filtermodel = {
      where: {
        memberId: '',
        name: '',
        phone: '',
        district: ''
      },
      sorting: { fieldName: this.defaultSortField, sort: 'DESC' },
      searchString: '',
      skip: 0,
      take: this.rows
    };
  }
}


 
generateMainFilter() {
  this.initializeColumns();
  this.initializeFilterModel();
  this.selectedSchemes = [];
  this.selectedStatuses = [];
  this.selectedDistricts = [];
  this.loadData();
}

  onDistrictChange() {
    this.filtermodel.where.district = this.selectedDistricts;
    // this.loadData();
  }

changescheme(val: any) {
  this.selectedSchemes = val || [];
  if (this.filtermodel.where) {
    this.filtermodel.where.scheme = Array.isArray(val) && val.length ? val.join(',') : '';
  }
}

changestatus(val: any) {
  this.selectedStatuses = val || [];
  if (this.filtermodel.where) {
    this.filtermodel.where.status = Array.isArray(val) && val.length ? val.join(',') : '';
  }
}

  generate() {
    this.loadData();
  }

  reset() {
    this.selectedSchemes = [];
    this.selectedStatuses = [];
    this.selectedDistricts = [];
    this.initializeFilterModel();
    this.loadData();
  }

  changefilter(val: any) {
    this.filtermodel.skip = val.skip ?? 0;
    this.filtermodel.take = val.take ?? 10;
    this.filtermodel.searchString = val.searchString || '';
    this.filtermodel.sorting = val.sorting || { fieldName: this.defaultSortField, sort: 'DESC' };
    this.loadData();
  }

  loadDistricts() {
    this.userService.MemberCardApprovalGridFilter().subscribe((res) => {
      if (res && res.data) this.districts = res.data.districtList || [];
    });
   
  }




actionalAction(event: ActionModel) {
  const type = event.record.actionType;
  
  if (type === 'VIEW_MEMBER_DETAILS') {
    this.router.navigate(['officers', 'applications', 'member-view', event.record.id]);
  } else {
    this.router.navigate(['officers', 'applications', 'view', event.record.applicationId]);
  }
}
  

 loadDropdowns() {
    this.userService.User_Filter_Dropdowns().subscribe((x) => {
      if (x) {
        this.schemes = x.data.schemeSelectList;
        this.districts = x.data.districtSelectList;
        this.cardStatus = x.data.cardStatusSelectList;
      }
    });

    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;

    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
      .subscribe((x) => {
        this.statuses = x.data;
      });
  }

loadData() {
  if (this.mainValue === 'application') {
    this.userService.GetApplicationListByAnimator(this.filtermodel).subscribe({
      next: (res: any) => {
        this.configurationList = (res.data ?? []).map((x: any) => ({
          ...x,
          actionType: 'VIEW_APPLICATION_DETAILS',
          createdDate: x.createdDate
            ? this.datePipe.transform(x.createdDate, 'dd-MMM-yyyy, hh:mm a')
            : null
        }));
        this.total = res.totalCount ?? 0;
      },
      error: (err) => {
        console.error('Error loading application list', err);
        this.configurationList = [];
        this.total = 0;
      }
    });
  } else {
    this.userService.GetMemberListByAnimator(this.filtermodel).subscribe({
      next: (res: any) => {
        this.configurationList = (res.data ?? []).map((x: any) => ({
          ...x,
          actionType: 'VIEW_MEMBER_DETAILS',
          collectedOn: x.collectedOn
            ? this.datePipe.transform(x.collectedOn, 'dd-MMM-yyyy, hh:mm a')
            : null
        }));
        this.total = res.totalCount ?? 0;
      },
      error: (err) => {
        console.error('Error loading member list', err);
        this.configurationList = [];
        this.total = 0;
      }
    });
  }
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

  // 🔹 Choose correct API call based on `mainValue`
  const exportCall =
    this.mainValue === 'application'
      ? this.userService.startApplicationListExport(exportFilter, type)
      : this.userService.startMemberListExport(exportFilter, type);

  exportCall.subscribe({
    next: (res: any) => {
      const downloadUrl = res.downloadUrl;

      // ✅ Use an <a> element instead of iframe (no popup, no block)
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click(); // 👈 triggers browser download
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




}
