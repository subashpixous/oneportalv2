import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ReportService } from 'src/app/services/reportsService';
import { DistrictApproveCount } from 'src/app/_models/ReportMode';
import { Column } from 'src/app/_models/datatableModel';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DialogRecord {
  data: DistrictApproveCount;
  clickedColumn: string;
}

@Component({
  selector: 'app-district-wise-countreport',
  templateUrl: './district-wise-countreport.component.html',
  styleUrls: ['./district-wise-countreport.component.scss'],
  providers: [MessageService]
})
export class DistrictWiseCountreportComponent implements OnInit {
  title = 'District Wise Approve Count';
  reports: DistrictApproveCount[] = [];
  filteredReports: DistrictApproveCount[] = [];
  totalRecords = 0;

  displayDialog: boolean = false;
  selectedRecord!: DistrictApproveCount;
  selectedRecordDetails: any[] = [];

  totalRow: DistrictApproveCount | null = null;

  cols: Column[] = [
    { field: 'sNo', header: 'S.No', sortable: true, isSortable: true, customExportHeader: 'S.No', sortablefield: 'sNo' },
    { field: 'district', header: 'District', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Zone Name', sortablefield: 'district' },
    { field: 'private', header: 'Private', sortable: true, isSortable: true, highlight: true, customExportHeader: 'Private', sortablefield: 'private', isActionable: true },
    { field: 'government', header: 'Government', sortable: true, isSortable: true, highlight: true, customExportHeader: 'Government', sortablefield: 'government', isActionable: true },
    { field: 'governmentAndPrivate', header: 'Government And Private', sortable: true, isSortable: true, highlight: true, customExportHeader: 'Government And Private', sortablefield: 'governmentAndPrivate', isActionable: true },
    { field: 'total', header: 'Total', sortable: true, isSortable: true, highlight: true, customExportHeader: 'Total', sortablefield: 'total' },
    { field: 'saved', header: 'Saved', sortable: true, isSortable: true, highlight: true, customExportHeader: 'Saved', sortablefield: 'saved' , isActionable: true},
    { field: 'submitted', header: 'Submitted', sortable: true, isSortable: true, highlight: true, customExportHeader: 'Submitted', sortablefield: 'submitted', isActionable: true },
    { field: 'approvedCount', header: 'Approved', sortable: true, isSortable: true, customExportHeader: 'Approved', sortablefield: 'approvedCount' , isActionable: true},
    { field: 'cardIssued', header: 'Card Issued', sortable: true, isSortable: true, customExportHeader: 'Card Issued', sortablefield: 'cardIssued', isActionable: true },
    { field: 'cardToBeIssued', header: 'Card To Be Issued', sortable: true, isSortable: true, customExportHeader: 'Card To Be Issued', sortablefield: 'cardToBeIssued', isActionable: true },
    { field: 'cardRejected', header: 'Card Rejected', sortable: true, isSortable: true, customExportHeader: 'Card Rejected', sortablefield: 'cardRejected' , isActionable: true},
  ];

  badgeFields: string[] = [
  'total','saved','submitted',
];

  // Pagination
  rows = 10;
  first = 0;
  defaultSortField = 'district';
  defaultSortOrder = 1; // 1 for asc, -1 for desc

  // Search
  searchText = '';
  searchableColumns = ['district'];

  // Dropdown selections
 selectedDistrict: string[] = [];
  selectedOrgType = '';
  districts: { label: string, value: string }[] = [];
  orgTypes: { label: string, value: string }[] = [];

  constructor(private http: HttpClient, private messageService: MessageService, private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

    get globalFields(): string[] {
  return this.cols?.map(c => c.field) || [];
}

loadReport() {
    this.reportService.DistrictWiseCountReport()
    .subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.reports = res.data.map((item: any, index: number) => ({
            sNo: index + 1,
            district: item.district || item.district,
            district_Id: item.district_Id || '',
private: Number(item.private) || 0,
  privateId: item.privateId || '',               // ✅ Add private ID
  government: Number(item.government) || 0,
  governmentId: item.governmentId || '',         // ✅ Add government ID
  governmentAndPrivate: Number(item.governmentAndPrivate || item.governmentandPrivate) || 0,
  governmentandPrivateId: item.governmentandPrivateId || '', // ✅ Add gov+private ID
            saved: Number(item.saved) || 0,
            submitted: Number(item.submitted) || 0,
            approvedCount: Number(item.approvedCount) || 0,
            cardIssued: Number(item.cardIssued) || 0,
            cardToBeIssued: Number(item.cardToBeIssued || item.cardtobeIssued) || 0,
            cardRejected: Number(item.cardRejected) || 0,
            total: Number(item.total) || 0
          }));

          // ❌ remove this line (don’t push totalRow into reports)
          this.totalRow = this.calculateTotals(this.reports);

          // ✅ Instead, always recalc totals for filteredReports
         this.filteredReports = [...this.reports];
          this.totalRecords = this.filteredReports.length;

          this.districts = Array.from(new Set(this.reports.map(r => r.district)))
            .map(v => ({ label: v, value: v }));
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load report data'
        });
      }
    });
}


private calculateTotals(list: DistrictApproveCount[]): DistrictApproveCount {
  const totals: DistrictApproveCount = {
    sNo: 'Total',
    district: '---',
    private: 0,
    government: 0,
    governmentAndPrivate: 0,
    saved: 0,
    submitted: 0,
    approvedCount: 0,
    cardIssued: 0,
    cardToBeIssued: 0,
    cardRejected: 0,
    total: 0,
    district_Id: '',
    privateId: '',
    governmentId: '',
    governmentandPrivateId: ''
  };

  list.forEach((r) => {
    totals.private += r.private || 0;
    totals.government += r.government || 0;
    totals.governmentAndPrivate += r.governmentAndPrivate || 0;
    totals.saved += r.saved || 0;
    totals.submitted += r.submitted || 0;
    totals.approvedCount += r.approvedCount || 0;
    totals.cardIssued += r.cardIssued || 0;
    totals.cardToBeIssued += r.cardToBeIssued || 0;
    totals.cardRejected += r.cardRejected || 0;
    totals.total += r.total || 0;
  });

  return totals;
}



applyGlobalFilter(event: Event) {
  const inputElement = event.target as HTMLInputElement | null;
  const value = inputElement?.value?.trim().toLowerCase() || '';

  this.filteredReports = this.reports.filter(report =>
    Object.values(report).some(val =>
      val?.toString().toLowerCase().includes(value)
    )
  );
}


  // Export Excel
exportExcel() {
  // Prepare only the visible/displayed columns for export
  const exportData = this.filteredReports.map((row) => {
    const obj: any = {};
    this.cols.forEach((col) => {
      obj[col.header] = row[col.field];  // use header as column name
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, `GCC_Report_${new Date().getTime()}.xlsx`);
}


  // Export PDF
  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((c) => c.header)],
      body: this.filteredReports.map((row) => this.cols.map((c) => row[c.field])),
      theme: 'grid',
      styles: { fontSize: 8 },
    });
    doc.save(`GCC_Report_${new Date().getTime()}.pdf`);
  }


// Update applyFilter method
applyFilter() {
  let filtered = this.reports;

  if (this.selectedDistrict && this.selectedDistrict.length > 0) {
    filtered = filtered.filter(r => this.selectedDistrict.includes(r.district));
  }

  // Recalculate totals for filtered data
  this.totalRow = this.calculateTotals(filtered);
  this.filteredReports = [...filtered];
  this.totalRecords = this.filteredReports.length;
  this.first = 0;
}

  generate() {
    this.applyFilter();
  }

  clearFilter() {
    this.selectedDistrict = [];
    this.selectedOrgType = '';
    this.searchText = '';
    this.filteredReports = [...this.reports];
    this.totalRecords = this.filteredReports.length;
    this.first = 0;
        this.applyFilter();
  }

changefilter(event: any) {
  if (event.sortField) {
    this.defaultSortField = event.sortField;
    this.defaultSortOrder = event.sortOrder === 1 ? 1 : -1;

    this.filteredReports = this.filteredReports.sort((a, b) => {
      let value1 = a[this.defaultSortField as keyof DistrictApproveCount];
      let value2 = b[this.defaultSortField as keyof DistrictApproveCount];

      if (typeof value1 === 'number' && typeof value2 === 'number') {
        return (value1 - value2) * this.defaultSortOrder;
      }

      return String(value1).localeCompare(String(value2)) * this.defaultSortOrder;
    });
  }
}

openActionDialog(event: any) {
  console.log('=== OPEN ACTION DIALOG ===');
  console.log('Event received:', event);

  const record = event.record;
  const column = event.column;

  if (!record || !column) {
    console.error('Invalid event payload:', event);
    return;
  }

  this.selectedRecord = { ...record, clickedColumn: column };
  this.selectedRecordDetails = [];

  // Base params
  let params: any = {
    DistrictId: record.district_Id,
    Zone: record.zone
  };

  // Organization-type columns
  if (column === 'private') {
    params.Organization_Type = record.privateId;
  } else if (column === 'government') {
    params.Organization_Type = record.governmentId;
  } else if (column === 'governmentAndPrivate') {
    params.Organization_Type = record.governmentandPrivateId;
  }
  // Status columns
else if (['saved', 'submitted', 'approvedCount'].includes(column)) {
  const statusMap: { [key: string]: string } = {
    saved: 'saved',
    submitted: 'submitted',
    approvedCount: 'approved'
  };
  params.Status = statusMap[column] || column.toLowerCase();
}

  // Card columns (single-field only)
  else if (column === 'cardIssued') {
    params.CardIssued = 1;
  } else if (column === 'cardToBeIssued') {
    params.CardtobeIssued = 0;
  } else if (column === 'cardRejected') {
    params.CardRejected = 1;
  }
  // Invalid column
  else {
    console.warn('No valid param mapping for column:', column);
    return;
  }

  console.log('API params prepared:', params);

  // Call API
  this.reportService.getMemberDetailedReport(params).subscribe({
    next: (res) => {
      console.log('API response:', res);
      if (res.status === 'SUCCESS') {
        this.selectedRecordDetails = res.data;
      }
    },
    error: (err) => console.error('API error:', err),
  });
}


isBadgeColumn(field: string): boolean {
  if (!field) return false;
  return this.badgeFields.map(f => f.toLowerCase()).includes(field.toLowerCase());
}

getBadgeClass(field: string): string {
  const key = (field || '').toLowerCase();
  switch (key) {
    case 'total': return 'bg-blue-500 text-white';
    case 'saved': return 'bg-orange-500 text-white';
    case 'submitted': return 'bg-orange-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
}

  actionInvoked(event: any) {
    console.log('Action invoked:', event);
  }
}


