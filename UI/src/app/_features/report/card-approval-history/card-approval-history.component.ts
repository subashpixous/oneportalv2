
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TableFilterModel } from 'src/app/_models/filterRequest';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-card-approval-history',
  templateUrl: './card-approval-history.component.html',
  styleUrls: ['./card-approval-history.component.scss']
})
export class CardApprovalHistoryComponent implements OnInit {
  // filter & UI state
  filtermodel: any;
  selectedDistricts: any[] = [];
  selectedStatuses: any[] = [];
  selecteddatefilter: string = '';
  // fromDate: Date | undefined;
  // toDate: Date | undefined;
  fromDate?: Date;
toDate?: Date;

  // dropdown data + table
  title: string = 'Card Approval History';
  districts: any[] = [];
  statuses: any[] = [];
  datefilter: any[] = [];
  cols: any[] = [];
  configurationList: any[] = [];
  total: number = 0;
  rows: number = 10;
  isExporting:boolean = false;
  pollingInterval: any;
  // sorting / search config
  defaultSortField = 'applicationNumber';
  defaultSortOrder: number = -1;
  currentStatus: boolean = true;
  searchableColumns: string[] = ['memberCode', 'name', 'fromStatus', 'toStatus', 'status', 'outcome'];

  constructor(
    private userService: UserService,
    private generalService: GeneralService,
    private roleService: RoleService,
    private router: Router,
    private messageService:MessageService
  ) {}

  ngOnInit() {
    const appfilter = localStorage.getItem('ApprovalCardFilter');
    if (appfilter) {
      this.filtermodel = JSON.parse(appfilter);

      this.filtermodel = {
        ...this.filtermodel,
        skip: 0,
        take: 10,
        sorting: { fieldName: this.defaultSortField, sort: 'DESC' }
      };

      this.selectedStatuses = this.filtermodel.where?.statusIds || [];
      this.selectedDistricts = this.filtermodel.where?.districtIds || [];
      this.selecteddatefilter = this.filtermodel.where?.year || '';
      this.fromDate = this.filtermodel.where?.fromDate ? new Date(this.filtermodel.where.fromDate) : undefined;
      this.toDate = this.filtermodel.where?.toDate ? new Date(this.filtermodel.where.toDate) : undefined;
    } else {
      this.filtermodel = {
        searchString: null,
        skip: 0,
        where: {
          districtIds: [],
          statusIds: [],
          year: '',
          fromDate: null,
          toDate: null
        },
        sorting: { fieldName: this.defaultSortField, sort: 'DESC' },
        take: 10,
        columnSearch: null
      };
    }

    // build year filter (Apr - Mar)
    const curentyr = new Date().getFullYear();
    const curentmnt = new Date().getMonth();
    let startyr = 2023;
    do {
      this.datefilter = [
        ...this.datefilter,
        {
          text: `Apr ${startyr} - March ${startyr + 1}`,
          value: `${startyr}-${startyr + 1}`
        }
      ];
      startyr++;
    } while (
      curentyr >= startyr &&
      ((curentyr === startyr && curentmnt > 2) || curentyr !== startyr)
    );

    // load filter data
    this.userService.MemberCardApprovalGridFilter().subscribe((x) => {
      if (x) {
        this.districts = x.data?.districtList ?? [];
        this.statuses = x.data?.statusList ?? [];
      }
    });

    // default year
    this.selecteddatefilter = this.selecteddatefilter || (this.datefilter[this.datefilter.length - 1]?.value || '');
    if (this.selecteddatefilter) {
      this.onYearChange(this.selecteddatefilter);
    }

    this.cols = [
      { field: 'memberCode', 
        header: 'Member Id', 
        sortablefield: 'memberCode', 
        isSortable: true, 
        isSearchable: true },
        {field : 'district',
        header : 'District',
        sortablefield : 'district',
        isSortable : true,
        isSearchable : true

        },
      { field: 'name', 
        header: 'Name', 
        sortablefield: 'name', 
        isSortable: true, 
        isSearchable: true },
      { field: 'fromStatus', 
        header: 'From Status', 
        sortablefield: 'fromStatus', 
        isSortable: true, 
        isSearchable: true },
      { field: 'toStatus', 
        header: 'To Status', 
        sortablefield: 'toStatus', 
        isSortable: true, 
        isSearchable: true },
      { field: 'status', 
        header: 'Status', 
        sortablefield: 'status', 
        isSortable: true, 
        isSearchable: true },
      { field: 'outcome', 
        header: 'Outcome', 
        sortablefield: 'outcome', 
        isSortable: true, 
        isSearchable: true },
      { field: 'approvalComment', 
        header: 'Approval Comment', 
        sortablefield: 'createdDate', 
        isSortable: true, 
        isSearchable: true },
      { field: 'createdDate', 
        header: 'Created Date', 
        sortablefield: 'createdDate', 
        isSortable: true, 
        isSearchable: true }
    ];
  }

  /** Year selection → auto dates */
  onYearChange(selectedYear: string) {
    if (!selectedYear) {
      this.fromDate = undefined;
      this.toDate = undefined;
      return;
    }
    const [startYear, endYear] = selectedYear.split('-').map(Number);
    this.fromDate = new Date(startYear, 3, 1);
    this.toDate = new Date(endYear, 2, 31);
  }

  /** Accept the emitted event from child component */
  changefilter(val: TableFilterModel) {
    console.log('Filter event:', event); // optional debug
 
    this.filtermodel = {
      ...this.filtermodel,
       skip: val.skip ?? 0,
       take: val.take ?? 10,
       searchString: val.searchString?.trim() || null,
       columnSearch: val.columnSearch || null,
       sorting: val.sorting || { fieldName: 'applicationNumber', sort: 'DESC' },
      where: {
        districtIds: this.selectedDistricts,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        fromDate: this.fromDate ? this.toApiDate(this.fromDate) : null,
        toDate: this.toDate ? this.toApiDate(this.toDate) : null
      }
    };
 
    this.getApplications();
  }

  changeStatus(val: boolean) {
    this.currentStatus = !val;
    this.getApplications();
  }

  getApplications() {
    localStorage.setItem('ApprovalCardFilter', JSON.stringify(this.filtermodel));
    this.userService.MemberCardApprovalHistoryGet(this.filtermodel).subscribe((c) => {
      // this.configurationList = c.data ?? [];
          this.configurationList = (c.data ?? []).map((item:any) => ({
      ...item,
      // convert createdDate and any other date fields
      createdDate: new Date(item.createdDate),
      // you can add other date fields similarly
    }));
      this.total = c.totalRecordCount ?? (this.configurationList.length || 0);
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

  // 🔹 Trigger background export API
  this.userService.startMemberCardApprovalHistoryExport(exportFilter, type).subscribe({
    next: (res: any) => {
      const downloadUrl = res.downloadUrl;

      // ✅ Instead of iframe, use invisible <a> for silent download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click(); // 👈 this triggers the download automatically
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



  reset() {
    this.generalService.getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' }).subscribe((x) => {
      this.statuses = x.data ?? [];
    });
    this.selectedDistricts = [];
    this.selectedStatuses = [];
    this.fromDate = undefined;
    this.toDate = undefined;
    this.selecteddatefilter = '';
    this.generate();
  }

   generate() {
    this.filtermodel = {
      ...this.filtermodel,
      where: {
        districtIds: this.selectedDistricts,
        toStatusId: this.selectedStatuses,
        year: this.selecteddatefilter,
        fromDate: this.fromDate ? this.toApiDate(this.fromDate) : null,
        toDate: this.toDate ? this.toApiDate(this.toDate) : null
      }
    };
    this.getApplications();
  }

  /** Convert Date → yyyy-MM-dd string for API */
  private toApiDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

