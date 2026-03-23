import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { AccountUserFormDetailModel } from 'src/app/_models/AccountUserViewModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { MemberCardApprovalFilterModel, MemberCardApprovalGridFilterModel, TableFilterModel } from 'src/app/_models/filterRequest';
import { Member_Card_Approval_Master_Grid_Model, PrintModuleReportModel } from 'src/app/_models/MemberDetailsModel';
import { ApproveStatusItemModel } from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { ReportService } from 'src/app/services/reportsService';
import { UserService } from 'src/app/services/user.service';
import { DatatablePaginationComponent } from 'src/app/shared/datatable-pagination/datatable-pagination.component';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
 
@Component({
  selector: 'app-print-inprogress',
  templateUrl: './print-inprogress.component.html',
  styleUrls: ['./print-inprogress.component.scss'],
})
export class PrintInprogressComponent implements OnInit {

    selectedRows: any[] = [];
  approvalStatuses: any[] = [];
  exportedData: any[] = []; //modified by Sivasankar on 31-10-2025 for export functionality
 
  @ViewChild('dt') dataTable!: DatatablePaginationComponent;
  title: string = 'Print InProgress';
  history: any;
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
 
  printingStatusId: any;
  completedStatusId: string = '';
  selectedMemberIds: string[] = [];
    districts: TCModel[] = [];
      selectedDistricts: string[] | [] = [];
            isExporting:boolean = false;
  pollingInterval: any;


        approvalForm!: FormGroup;
        reasons: TCModel[] = [];
  total: number = 0;
  //districts: { label: string; value: string }[] = [];
  // filtermodel!: MemberCardApprovalGridFilterModel;
  selectedDistrict: string[] = [];
  filteredRecords: PrintModuleReportModel[] = [];
 
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
    private reportService: ReportService,
    private messageService: MessageService,
    private userService: UserService,
    private router: Router,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
       private accountService: AccountService,
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
       status: new FormControl('Print In Progress', Validators.required),
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
    if (val === 'RETURNED' || val === 'REJECTED') {
      commentsControl?.setValidators([Validators.required]);
    } else {
      commentsControl?.clearValidators();
    }
    commentsControl?.updateValueAndValidity();
  });
    console.log('✅ PrintInprogressComponent loaded');
    this.loadHistory();
    this.getCardsStatus();
   // this.Completedreport();
   //  this.getApplications();
 
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
    // this.getApplications();
    
  }
  getCardsStatus() {
    this.userService.GetUserFormDD('').subscribe((x) => {
      var dds: AccountUserFormDetailModel = x.data;
      this.cardStatus = dds.cardPrintStatusList;
 
      const printingStatus = this.cardStatus.find(
        (s: any) => s.text.toLowerCase() === 'print in progress'
      );
 
      if (printingStatus) {
        this.printingStatusId = printingStatus.value;
      } else {
        this.printingStatusId = undefined;
      }
 
      const completedStatus = this.cardStatus.find(
        (s: any) => s.text.toLowerCase() === 'print completed'
      );
 
      if (completedStatus) {
        this.completedStatusId = completedStatus.value;
      }
 
      // ✅ Now that printingStatusId is set, call the report
     // this.Completedreport();
       this.getApplications();
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
  downloadReport() {
    console.log(this.printingStatusId);
    this.reportService
      .getReport(this.printingStatusId)
      .subscribe(async (res: any) => {
        const arrayData = res.data || [];
        if (arrayData.length === 0) return;
 
        // Use district name from first record
        const districtName = arrayData[0]?.district || 'Report';
        const safeDistrict = districtName.replace(/[^a-zA-Z0-9]/g, '_');
        const today = new Date();
        const formattedDate = today
          .toLocaleDateString('en-GB') // gives DD/MM/YYYY
          .replace(/\//g, ''); // remove slashes → DDMMYYYY
 
        const fileName = `${formattedDate}_${safeDistrict}_${arrayData.length}.xlsx`;
 
        // ✅ Pick only specific columns
        const selectedData = arrayData.map((row: any, index: number) => ({
           'SERIAL NO': index + 1,
  NAME: row.name?.toString().toUpperCase() || '',
  'FATHER/HUSBAND': row.father_Name?.toString().toUpperCase() || '',
  MMEMBER_ID: row.member_Id?.toString().toUpperCase() || '',
  DOB: row.date_Of_Birth?.toString().toUpperCase() || '',
  DISTRICT: row.district?.toString().toUpperCase() || '',
  'PROFILE IMG URL': row.profile_Picture_url?.toString().toUpperCase() || '',
  'PROFILE IMAGE': row.profileImage?.toString().toUpperCase() || '',
  'QR CODE URL': row.qrCodeURL || '',
  'FAMILY MEMBER': row.familyMembers?.toString().toUpperCase() || '',
  'ADDRESS': row.address?.toString().toUpperCase() || '',
  'ZONE IN ENGLISH': row.zoneinEnglish?.toString().toUpperCase() || '',
  'ZONE CODE': row.zoneCode?.toString().toUpperCase() || ''
        }));
 
        // Create Excel
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
        const wb: XLSX.WorkBook = {
          Sheets: { Report: ws },
          SheetNames: ['Report'],
        };
        const workbookArray = XLSX.write(wb, {
          bookType: 'xlsx',
          type: 'array',
        });
        const blob = new Blob([workbookArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
 
        // Upload to backend
        const formData = new FormData();
        formData.append('file', blob, fileName);
 
        this.http
          .post(
            `${environment.apiUrl}/Report/saveDownloadedPrintFile`,
            formData
          )
          .subscribe(
            () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'File downloaded successfully',
              });
              this.loadHistory();
            },
            () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to upload file. Please try again.',
              });
            }
          );
 
        // Download on client
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      });



    
            
      
  }
 
  loadHistory() {
    this.reportService.getFileHistory().subscribe((res) => {
      this.history = res.data;
    });
  }

  
  Completedreport() {
    this.reportService
      .getprintCompletedReport(this.printingStatusId)
      .subscribe((c) => {
        this.configurationList = c.data;
        this.total = c.totalRecordCount;
        this.filteredRecords = [...this.configurationList];
 
        // this.districts = Array.from(
        //   new Set(this.configurationList.map((r) => r.district))
        // ).map((v) => ({ label: v, value: v }));
      });
  }
  
 
  getApplications() {
    if (!this.printingStatusId) {
    
    return;
  }
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
       
        this.filteredRecords = [...this.configurationList];
         this.total = res.totalRecordCount ?? this.configurationList.length;
      },
      error: (err) => {
        console.error('Error fetching applications:', err);
        this.configurationList = [];
        this.total = 0;
      },
    });
  }

//modified by Sivasankar on 31-10-2025 for export functionality
//       onExportRequest(type: string) {
  

//   const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };
//    this.userService.MemberCardApprovalGridGet(exportFilter)
//       .subscribe((c) => {
//         this.exportedData = c.data;
        
       
//       });
        

// }

//modified by Sivasankar on 06-11-2025 for export functionality

onExportRequest(type: string) {
  if (this.isExporting) return;
  this.isExporting = true;

  const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };

  // 🔹 Show "Preparing..." message
  this.messageService.add({
    severity: 'info',
    summary: 'Preparing...',
    detail: `Your ${type.toUpperCase()} file is being generated.`,
    life: 3000
  });

  // 🔹 Call backend API for export
  this.userService.startMemberCardApprovalExport(exportFilter, type).subscribe({
    next: (res: any) => {
      const downloadUrl = res.downloadUrl;

      // ✅ Instead of iframe, use invisible <a> tag (more stable)
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';
      document.body.appendChild(link);

      // 🔸 Trigger download automatically
      link.click();

      // 🔸 Cleanup
      document.body.removeChild(link);

      // ✅ Notify user
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

  onClearDistricts() {
  this.selectedDistricts = [];
  this.getApplications(); // reload without district filter
}
  onDistrictChange() {
    if (this.selectedDistricts && this.selectedDistricts.length > 0) {
    //  this.filteredRecords = this.configurationList.filter((r) =>
    //     this.selectedDistricts.includes(r.district)
      //);
    } else {
      this.filteredRecords = [...this.configurationList];
    }
 
    this.total = this.filteredRecords.length; 
    this.getApplications();// update total for pagination/export
  }
 
  redownload(event: DropdownChangeEvent) {
    const selectedId = event.value; // now gives h.id
    const record = this.history.find((h: { id: any }) => h.id === selectedId);
    if (!record) return;
 
    this.http
      .get(`${environment.apiUrl}/Common/DownloadImage?fileId=${selectedId}`, {
        responseType: 'blob',
      })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = record.originalFileName || selectedId;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
 
  confirmUpdateStatus() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to mark all records as Printed?',
      header: 'Confirm Update',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-text',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.UpdatePrintstatus(); // call your existing method
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Update status was cancelled',
        });
      },
    });
  }
  UpdatePrintstatus() {
    this.reportService.updateCompletedStatus(this.printingStatusId).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Moved to Card Printed Successfully',
        });
       // this.Completedreport();
         this.getApplications();
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
 
  // bulkApprove() {
  //   if (!this.selectedMemberIds || this.selectedMemberIds.length === 0) {
  //     this.messageService.add({
  //       severity: 'warn',
  //       summary: 'Warning',
  //       detail: 'Please select at least one record.',
  //     });
  //     return;
  //   }
 
  //   this.http
  //     .post(`${environment.apiUrl}/User/MemberCard_BulkApprove`, {
  //       Member_Id: this.selectedMemberIds,
  //       SelectedStatus: 'APPROVED',
  //     })
  //     .subscribe(
  //       (res: any) => {
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Success',
  //           detail: 'Members approved successfully',
  //         });
  //         // Refresh data if needed
  //        // this.Completedreport();
  //         this.getApplications();
  //       },
  //       (error) => {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: 'Bulk approve failed. Please try again.',
  //         });
  //       }
  //     );
  // }
  // bulkreturn() {
  //   this.http
  //     .post(`${environment.apiUrl}/User/MemberCard_BulkApprove`, {
  //       Member_Id: this.selectedMemberIds,
  //       SelectedStatus: 'RETURNED',
  //     })
  //     .subscribe(
  //       (res: any) => {
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Success',
  //           detail: 'Members returned successfully',
  //         });
  //         // Refresh data if needed
  //        // this.Completedreport();
  //         this.getApplications();
  //       },
  //       (error) => {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: 'Bulk approve failed. Please try again.',
  //         });
  //       }
  //     );
  // }
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
 
  actionalAction(val: ActionModel) {
    this.router.navigate([
    'officers',
      'applications',
      'card-approval',
      val.record.id,
      val.record.member_Id,
    ]);
  }
  //[routerLink]="['/officers/applications/member-view', row?.member_Guidid]"
}
 
 