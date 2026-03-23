import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccountUserFormDetailModel } from 'src/app/_models/AccountUserViewModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { MemberCardApprovalFilterModel, MemberCardApprovalGridFilterModel, TableFilterModel } from 'src/app/_models/filterRequest';
import { PrintModuleReportModel } from 'src/app/_models/MemberDetailsModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { ReportService } from 'src/app/services/reportsService';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-cards-sent',
  templateUrl: './cards-sent.component.html',
  styleUrls: ['./cards-sent.component.scss']
})
export class CardsSentComponent {
   exportedData: any[] = [];
    title: string = 'Card Disbursed';
  cardStatus: TCModel[] = [];
    configurationList!: PrintModuleReportModel[];
    visible: boolean = false;
    defaultSortField: string = 'createdDate';
      defaultSortOrder: number = 0;
      first: number = 0;
      rows: number = 10;
       actions: Actions[] = [];
     currentStatus: boolean = true;
     searchableColumns!: string[];
       cols!: Column[];
              isExporting:boolean = false;
  pollingInterval: any;

    printingStatusId: any;
    completedStatusId: string ="";
    total: number=0;
   // districts: { label: string, value: string }[] = [];
     selectedDistrict: string[] = [];
     filteredRecords: PrintModuleReportModel[] = [];
       districts: TCModel[] = [];
      selectedDistricts: string[] | [] = [];

         filtermodel: MemberCardApprovalGridFilterModel = {
    searchString: null,
    skip: 0,
    take: 10,
    sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
    columnSearch: null,
    where: {
      districtIds: [],
      statusIds: [],
      isActive: true,
      year: ''
    }
  };
 constructor(private reportService: ReportService,
        private messageService: MessageService,
        private userService: UserService,
        private router: Router,
         private http: HttpClient,
          private confirmationService: ConfirmationService,

  ) {}
     ngOnInit() {
        
      this.cols = [
      {
        field: 'district',
        header: 'District',
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
        header: 'organization Type',
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
        isSearchable: true,
        isBadge: true,
      },
      // {
      //   field: 'localBody',
      //   header: 'Local Body',
      //   sortablefield: 'localBody',
      //   isSortable: true,
      //   isSearchable: true,
      //   isBadge: true,
      // },
      // {
      //   field: 'zone',
      //   header: 'Zone',
      //   sortablefield: 'zone',
      //   isSortable: true,
      //   isSearchable: true,
      // },
      {
        field: 'fatherName',
        header: 'Father Name',
        sortablefield: 'fatherName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'dob',
        header: 'Date Of Birth',
        sortablefield: 'dob',
        isSortable: true,
        isSearchable: false,
      },
 
      {
        field: 'address',
        header: 'Address',
        sortablefield: 'address',
        isSortable: true,
        isSearchable: true,
      },
       {
        field: 'approvalComment',
        header: 'Approval Comment',
        sortablefield: 'approvalComment',
        isSortable: true,
        isSearchable: true,
      },
    ];
    this.userService.MemberCardApprovalGridFilter().subscribe((x) => {
                if (x) {
                  const d: MemberCardApprovalFilterModel = x.data;
          
                  this.districts = d.districtList;
                }});
      this.getCardsStatus();
  }
  getCardsStatus() {
    this.userService.GetUserFormDD("").subscribe((x) => {
      var dds: AccountUserFormDetailModel = x.data;
      this.cardStatus = dds.cardPrintStatusList;

      const printingStatus = this.cardStatus.find(
        (s: any) => s.text.toLowerCase() === "card disbursed"
      );

      if (printingStatus) {
        this.printingStatusId = printingStatus.value;
      } else {
        this.printingStatusId = undefined;
      }

      const completedStatus = this.cardStatus.find(
        (s: any) => s.text.toLowerCase() === "card disbursed"
      );

      if (completedStatus) {
        this.completedStatusId = completedStatus.value;
      }

      // ✅ Now that printingStatusId is set, call the report
      //this.Completedreport();
      this.getApplications();

    });
  }
onClearDistricts() {
  this.selectedDistricts = [];
  this.getApplications(); // reload without district filter
}
  onDistrictChange() {
    if (this.selectedDistricts && this.selectedDistricts.length > 0) {
     // this.filteredRecords = this.configurationList.filter((r) =>
        //this.selectedDistricts.includes(r.district)
      //);
    } else {
      this.filteredRecords = [...this.configurationList];
    }
 
    this.total = this.filteredRecords.length; 
    this.getApplications();// update total for pagination/export
  }


   Completedreport(){
    this.reportService.getprintCompletedReport(this.printingStatusId).subscribe((c) => {
   this.configurationList = c.data;
this.filteredRecords = [...this.configurationList];
    this.total = c.totalRecordCount;
    //  this.districts = Array.from(new Set(this.configurationList.map(r => r.district)))
    //         .map(v => ({ label: v, value: v }));

  });
}


  getApplications() {
if (!this.printingStatusId) {
    
    return;
  }

    localStorage.setItem(
      'ApprovalCardFilter',
      JSON.stringify(this.filtermodel)
    );
this.filtermodel.where = {
  ...this.filtermodel.where,
  statusIds: this.printingStatusId ? [this.printingStatusId] : [],
  districtIds: this.selectedDistricts ?? [],   // 🔹 include districts
    isActive: true,
    year: this.filtermodel.where.year || ''
};
    this.userService.MemberCardApprovalGridGet(this.filtermodel).subscribe({
      next: (res) => {
        this.configurationList = res.data ?? [];
        this.total = res.totalRecordCount ?? this.configurationList.length;
         this.filteredRecords = [...this.configurationList];
      },
      error: (err) => {
        console.error('Error fetching applications:', err);
        this.configurationList = [];
        this.total = 0;
      },
    });
  }
    changefilter(val: TableFilterModel) {
     
   
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
  statusIds: this.printingStatusId ? [this.printingStatusId] : [],
  districtIds: this.selectedDistricts ?? [],
  year: '',
  isActive: true,
         },
       };

   
       // Call API with updated filter
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

  // 🔹 Call the backend export API
  this.userService.startMemberCardApprovalExport(exportFilter, type).subscribe({
    next: (res: any) => {
      const downloadUrl = res.downloadUrl;

      // ✅ Replaced iframe with invisible <a> for seamless, silent download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click(); // 👈 triggers the actual download
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

     onPageChange(event: any) {

  this.first = event.first;
  this.rows = event.rows;
  this.filtermodel.skip = this.first;
  this.filtermodel.take = this.rows;
  this.getApplications();
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
}