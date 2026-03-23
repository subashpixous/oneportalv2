import { HttpClient, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AccountUserFormDetailModel } from 'src/app/_models/AccountUserViewModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { Member_Card_Approval_Master_Grid_Model, PrintModuleReportModel } from 'src/app/_models/MemberDetailsModel';

import { UserUploadViewModel } from 'src/app/_models/ReportMode';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { ReportService } from 'src/app/services/reportsService';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MemberCardApprovalFilterModel, MemberCardApprovalGridFilterModel, TableFilterModel } from 'src/app/_models/filterRequest';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApproveStatusItemModel } from 'src/app/_models/schemeModel';
import { AccountService } from 'src/app/services/account.service';
import { UserModel } from 'src/app/_models/user';
import { DatatablePaginationComponent } from 'src/app/shared/datatable-pagination/datatable-pagination.component';

@Component({
  selector: 'app-card-disbursed',
  templateUrl: './card-disbursed.component.html',
  styleUrls: ['./card-disbursed.component.scss']
})
export class CardDisbursedComponent {
exportedData: any[] = []; //modified by Sivasankar On 31-10-2025 for export functionality
  cols!: Column[];
  configurationList!: PrintModuleReportModel[];
    title: string = 'User Upload';
    visible: boolean = false;
    total:number=0;
    errorRes: UserUploadViewModel[] = [];
  defaultSortField: string = 'createdDate';
  defaultSortOrder: number = 0;
  first: number = 0;
  rows: number = 10;
   actions: Actions[] = [];
 currentStatus: boolean = true;
 searchableColumns!: string[];
 comments: string = '';
  printingStatusId: string="";
  disbursedStatusId: string="";
   //districts: { label: string, value: string }[] = [];
     selectedDistrict: string[] = [];
     filteredRecords: PrintModuleReportModel[] = [];
      districts: TCModel[] = [];
      selectedDistricts: string[] | [] = [];

selectedMemberIds: string[] = [];
 approvalStatuses: any[] = [];
   reasons: TCModel[] = [];
  
  selectedRows: any[] = [];
       isExporting:boolean = false;
  pollingInterval: any;
 
  @ViewChild('dt') dataTable!: DatatablePaginationComponent;

approvalForm!: FormGroup;

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
    constructor(
      private messageService: MessageService,
      private userService: UserService,
      private router: Router,
     private reportService:ReportService,
      private accountService: AccountService,
      private generalService: GeneralService,
      private http: HttpClient,
      private cdr: ChangeDetectorRef


    ) {}
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
            status: new FormControl('Print Completed', Validators.required),
            date: new FormControl(new Date().toLocaleString()),
            approvalRejectedstatus: new FormControl('', Validators.required),
            jobTitle: new FormControl(dd.userDetails.roleName),
            reason: new FormControl(''),
            name: new FormControl(`${dd.firstName} ${dd.lastName}`),
            document: new FormControl(''),
            comments: new FormControl(''),
          });

          this.approvalForm.get('approvalRejectedstatus')?.valueChanges.subscribe((val) => {
    const commentsControl = this.approvalForm.get('comments');
    if (val === 'RETURNED') {
      commentsControl?.setValidators([Validators.required]);
    } else {
      commentsControl?.clearValidators();
    }
    commentsControl?.updateValueAndValidity();
  });
   

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
    removeFile() {

    }
    cardStatus: TCModel[] = [];
   getCardsStatus() {
        this.userService.GetUserFormDD("").subscribe((x) => {
    var dds: AccountUserFormDetailModel = x.data;
    this.cardStatus = dds.cardPrintStatusList;

    const printingStatus = this.cardStatus.find(
      (s: any) => s.text.toLowerCase() === "print completed".toLowerCase()
       );

       if (printingStatus) {
         this.printingStatusId = printingStatus.value; // ✅ save only the Id
       }

        const disrburedStatus = this.cardStatus.find(
         (s: any) => s.text.toLowerCase() === "card disbursed".toLowerCase()
       );

       if (disrburedStatus) {
         this.disbursedStatusId = disrburedStatus.value; // ✅ save only the Id
       }
       //this.Completedreport();
       this.getApplications();

   });
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
submit() {
    console.log('Submit triggered...');
    console.log('Selected Member IDs:', this.selectedMemberIds);
    console.log('Form Value:', this.approvalForm.value);
    if (this.approvalForm.invalid) {
      this.approvalForm.markAllAsTouched();
      return;
    }

    const payload = {
      member_Id: this.selectedMemberIds,
      approvalComment: this.approvalForm.value.comments || '',
      reason: this.approvalForm.value.reason || '',
      selectedStatus: this.approvalForm.value.approvalRejectedstatus || '',
    };

    this.userService.MemberCard_BulkApprove(payload).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          const totals =
            res.totalRecordCount && res.totalRecordCount.length > 0
              ? res.totalRecordCount[0]
              : { totalSuccess: 0, totalFailed: 0 };

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Action Completed Successfully`,
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
  statusIds: this.printingStatusId ? [this.printingStatusId] : [],
  districtIds: this.selectedDistricts ?? [],
  year: '',
  isActive: true,
},
     };
 
     console.log('Final filter sent to API:', this.filtermodel);
 
     // Call API with updated filter
     this.getApplications();
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

    DocumentsDownload(fileUrl: string) {
      return this.http.get(fileUrl, {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      });
    }
    checkStatus() {
this.reportService.updateDisbursedStatus(this.printingStatusId).subscribe(
    (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Moved to Card Disbursed Successfully',
      });

    },
    (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to Upload! Please try again',
      });
    }
  );
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
  // modified by Sivasankar On 06-11-2025 for export functionality
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

  // 🔹 Call your export API
  this.userService.startMemberCardApprovalExport(exportFilter, type).subscribe({
    next: (res: any) => {
      const downloadUrl = res.downloadUrl;

      // ✅ Replace iframe with invisible <a> for cleaner, silent download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();  // 👈 triggers download automatically
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


    // onSelectDocumentFile(event: any) {
    //   if (event.files && event.files[0]) {
    //     const formData = new FormData();
    //     formData.append('file', event.files[0]);
    //     formData.append('comments', this.comments);

    //     this.http
    //       .post(`${environment.apiUrl}/Report/DeleteByFile`, formData)
    //       .subscribe(
    //         (response: any) => {
    //           // (this.someInput as any).files = [];
    //           if (response && response.status == FailedStatus) {
    //             this.visible = true;
    //             this.errorRes = response.data;
    //           } else if (response && response.status == ErrorStatus) {
    //             this.messageService.add({
    //               severity: 'error',
    //               summary: 'Error',
    //               detail: 'Failed to Upload! Please try again',
    //             });
    //           } else {
    //             this.messageService.add({
    //               severity: 'success',
    //               summary: 'Success',
    //               detail: 'Returned Successfully',
    //             });
    //           }
    //         },
    //         (error) => {
    //           this.messageService.add({
    //             severity: 'error',
    //             summary: 'Error',
    //             detail: 'Failed to Upload! Please try again',
    //           });
    //         }
    //       );
    //   }
    // }
    bulkApprove() {
  if (!this.selectedMemberIds || this.selectedMemberIds.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select at least one record.'
    });
    return;
  }

  this.http.post(`${environment.apiUrl}/User/MemberCard_BulkApprove`, {
    Member_Id: this.selectedMemberIds,
    SelectedStatus:"APPROVED"
  }).subscribe(
    (res: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Members approved successfully'
      });
      // Refresh data if needed
      //this.Completedreport();
      this.getApplications();
       this.resetApprovalForm();
    },
    (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Bulk approve failed. Please try again.'
      });
    }
  );


}
bulkreturn(){
 this.http.post(`${environment.apiUrl}/User/MemberCard_BulkApprove`, {
    Member_Id: this.selectedMemberIds,
    SelectedStatus:"RETURNED"
  }).subscribe(
    (res: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Members returned successfully'
      });
      // Refresh data if needed
     // this.Completedreport();
     this.getApplications();
    },
    (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Bulk approve failed. Please try again.'
      });
    }
  );
}

    uploadFile(fileUpload: any) {
  const files: File[] = fileUpload.files;

  if (!files || files.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select a file before submitting'
    });
    return;
  }

  const formData = new FormData();
  formData.append('file', files[0]);
  //formData.append('comments', this.comments);

  this.http.post(`${environment.apiUrl}/Report/DeleteByFile`, formData)
    .subscribe(
      (response: any) => {
        if (response && response.status == FailedStatus) {
          this.visible = true;
          this.errorRes = response.data;
        } else if (response && response.status == ErrorStatus) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to Upload! Please try again'
          });
        } else {
          this.messageService.add({
               severity: response.message.includes('failed') ? 'warn' : 'success',
      summary: response.message.includes('failed') ? 'Failed' : 'Success',
      detail: response.message
          });
          fileUpload.clear();
          //this.Completedreport(); 
           this.getApplications();
          // // clear after upload
        }
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please upload correct file'
        });
      }
    );
}

download() {

  const data = [
    { memberId: "CSW/GOV&PVT/CHN/U/5784", comment: "Sample comment" }
  ];

  // Convert to worksheet
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

  // Create workbook and add worksheet
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Template': worksheet },
    SheetNames: ['Template']
  };

  // Generate Excel buffer
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  // Save as file
  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(file, 'Template.xlsx');
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


//    onSelectedApplications(selectedRows: Member_Card_Approval_Master_Grid_Model[]) {
//   console.log('Selected Rows:', selectedRows);

//   // Reset IDs
//   this.selectedMemberIds = [];

//   // Collect member codes for UI chips
//   const codes = selectedRows.map((row) => row.memberCode || '');
//   this.approvalForm.patchValue({
//     applicationIds: [],
//     applicationIdsText: codes,
//   });
//   this.approvalForm.controls['applicationIdsText'].disable();

//   if (!selectedRows.length) {
//     console.warn('No rows selected');
//     return;
//   }

//   // Assign IDs from grid
//   const firstRow = selectedRows[0];
//   if (firstRow.member_Id && firstRow.member_Id.trim() !== '') {
//     this.selectedMemberIds = selectedRows.map((row) => row.member_Id);
//     this.approvalForm.patchValue({
//       applicationIds: this.selectedMemberIds,
//     });

//     // ✅ Instead of API, directly set statuses
//     this.approvalStatuses = [
//       { statusId: 'APPROVED', statusName: 'Approve' },
      
//       { statusId: 'RETURNED', statusName: 'Return' }
//     ];

//     // If you still want reasons, you can define them statically too
    

//     console.log('Member IDs from grid:', this.selectedMemberIds);
//   } else {
//     console.warn('Member ID missing in grid data. Skipping API.');
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


onPageChange(event: any) {

  this.first = event.first;
  this.rows = event.rows;
  this.filtermodel.skip = this.first;
  this.filtermodel.take = this.rows;
  this.getApplications();
}
 
     // Load dropdown data based on first selected row


       actioInvoked(val: ActionModel) {

         if (val && val.type == 'VIEW') {
           this.router.navigate([
             'officers',
      'applications',
      'card-approval',
      val.record.id,
      val.record.member_Id,
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

}