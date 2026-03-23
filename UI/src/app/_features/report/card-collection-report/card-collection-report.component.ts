import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Table } from 'primeng/table';
import { CardCollection } from 'src/app/_models/ReportMode';
import { Column } from 'src/app/_models/datatableModel';
import { ReportService } from 'src/app/services/reportsService';
import { ResponseModel } from 'src/app/_models/ResponseStatus';
@Component({
  selector: 'app-card-collection-report',
  templateUrl: './card-collection-report.component.html',
  styleUrls: ['./card-collection-report.component.scss']
})
export class CardCollectionReportComponent implements OnInit {

  title: string = 'Card Collection Report';
  reports: CardCollection[] = [];
  filteredReports: CardCollection[] = [];
  districts: { label: string; value: string }[] = [];
  selectedDistrict: string = '';
  selectedRecord: any = null;
  selectedRecordDetails: any[] = [];
  totalRecords = 0;
  totalRow: CardCollection | null = null;
  loading: boolean = false;

  globalFilterFields: string[] = [
    'district', 'collectedByName', 'collectedByPhoneNumber',
    'totalMembers', 'saved', 'submitted', 'dmApproved',
    'hqApproved', 'cardRejected', 'approvedCount',
    'cardIssued', 'cardtobeIssued'
  ];

cols: Column[] = [
  { field: 'district', header: 'District', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'District', sortablefield: 'district', isActionable: false },
  { field: 'collectedByName', header: 'Collector Name', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Collector Name', sortablefield: 'collectedByName', isActionable: false },
  { field: 'collectedByPhoneNumber', header: 'Phone', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Phone', sortablefield: 'collectedByPhoneNumber', isActionable: false },
  //{ field: 'totalMembers', header: 'Total Members', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Total Members', sortablefield: 'totalMembers', isActionable: true },
  { field: 'saved', header: 'Saved', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Saved', sortablefield: 'saved', isActionable: true },
  { field: 'submitted', header: 'Submitted', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Submitted', sortablefield: 'submitted', isActionable: true },
  { field: 'dmApproved', header: 'DM Approved', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'DM Approved', sortablefield: 'dmApproved', isActionable: true },
  { field: 'hqApproved', header: 'HQ Approved', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'HQ Approved', sortablefield: 'hqApproved', isActionable: true },
  { field: 'cardRejected', header: 'Card Rejected', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Rejected', sortablefield: 'cardRejected', isActionable: true },
//  { field: 'approvedCount', header: 'Approved', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Approved', sortablefield: 'approvedCount', isActionable: true },
  { field: 'cardIssued', header: 'Card Issued', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'Issued', sortablefield: 'cardIssued', isActionable: true },
  { field: 'cardtobeIssued', header: 'Card To be Issued', sortable: true, isSortable: true, isSearchable: true, customExportHeader: 'To be Issued', sortablefield: 'cardtobeIssued', isActionable: true }
];

  rows = 10;
  first = 0;
  defaultSortField = 'district';
  defaultSortOrder = 1;

  searchText = '';
  searchableColumns = ['district'];

  constructor
  (private http: HttpClient,
     private router: Router,
     private reportService: ReportService
    ) {}

  ngOnInit() {
    this.loadReport();
  }

  // Helper function to safely get input value
  getInputValue(event: any): string {
    return event.target?.value || '';
  }

loadReport() {
  this.reportService.getCardCollectionReport().subscribe({
    next: (res: ResponseModel) => {
      if (res.status === 'SUCCESS') {
        this.reports = res.data as CardCollection[];
        this.totalRow = this.calculateTotals(this.reports);
        this.filteredReports = [...this.reports];
        this.totalRecords = this.filteredReports.length;

        this.districts = Array.from(
          new Set(this.reports.map((r) => r.district))
        ).map((d) => ({ label: d, value: d }));
      }
      this.loading = false;
    },
    error: (err) => {
      console.error('API error:', err);
      this.loading = false;
    },
  });
}

  private calculateTotals(list: CardCollection[]): CardCollection {
    const totals: CardCollection = {
      district: 'Total',
      collectedByPhoneNumber: '',
      district_Id: '',
      collectedByName: '',
      id: '',
      totalMembers: 0,
      saved: 0,
      submitted: 0,
      dmApproved: 0,
      hqApproved: 0,
      cardRejected: 0,
      
      cardIssued: 0,
      cardtobeIssued: 0
    };

    list.forEach((r) => {
      totals.totalMembers += r.totalMembers || 0;
      totals.saved += r.saved || 0;
      totals.submitted += r.submitted || 0;
      totals.dmApproved += r.dmApproved || 0;
      totals.hqApproved += r.hqApproved || 0;
      totals.cardRejected += r.cardRejected || 0;
     
      totals.cardIssued += r.cardIssued || 0;
      totals.cardtobeIssued += r.cardtobeIssued || 0;
    });

    return totals;
  }

  applyFilter() {
    let filtered = this.reports;

    if (this.selectedDistrict) {
      filtered = filtered.filter((r) => r.district === this.selectedDistrict);
    }

    this.totalRow = this.calculateTotals(filtered);
    this.filteredReports = [...filtered];
    this.totalRecords = this.filteredReports.length;
    this.first = 0;
  }

  clearFilter() {
    this.selectedDistrict = '';
    this.searchText = '';
    this.filteredReports = [...this.reports];
    this.totalRecords = this.filteredReports.length;
    this.first = 0;
    this.applyFilter();
  }

  // Export Excel
  exportExcel() {
    const exportData = this.filteredReports.map((row) => {
      const obj: any = {};
      this.cols.forEach((col) => {
        obj[col.header] = row[col.field];
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `Card_Collection_Report_${new Date().getTime()}.xlsx`);
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
    doc.save(`Card_Collection_Report_${new Date().getTime()}.pdf`);
  }



handleColumnClick(event: MouseEvent, column: string, row: CardCollection) {
  event.preventDefault();
  event.stopPropagation();

  console.log('Clicked Column:', column, 'Row:', row);

  const actionData = {
    type: column,
    record: row,
    column: column
  };

  this.openDetailsTable(actionData);
}

openDetailsTable(event: { record: CardCollection; column: string }) {
  const { record, column } = event;

  this.selectedRecord = { ...record, clickedColumn: column };
  this.selectedRecordDetails = [];

let params: any = {
  DistrictId: record.district_Id || null,
  collectedByName: record.collectedByName || null,
  collectedByPhoneNumber: record.collectedByPhoneNumber || null
};

  // Map column to API params dynamically
  switch (column) {
    case 'saved':
      params.Status = 'saved';
      break;
    case 'submitted':
      params.Status = 'submitted';
      break;
    case 'dmApproved':
      params.Status = 'dmApproved';
      break;
    case 'hqApproved':
      params.Status = 'approved';
      break;
    case 'approvedCount':
      params.Status = 'approved';
      break;
    case 'cardIssued':
      params.CardIssued = 1;
      break;
    case 'cardtobeIssued':
      params.CardtobeIssued = 0;
      break;
    case 'cardRejected':
      params.CardRejected = 1;
      break;
    case 'totalMembers':
      params.Status = 'all';
      break;
    default:
      console.warn('No parameter mapping found for:', column);
      return;
  }

  console.log('API Params:', params);

  // API Call
  this.reportService.getMemberDetailedReport(params).subscribe({
    next: (res) => {
      if (res.status === 'SUCCESS') {
        this.selectedRecordDetails = res.data;
      }
    },
    error: (err) => {
      console.error('Error fetching details:', err);
    },
  });
}


  onRowClick(row: CardCollection) {
    const queryParams = {
      DistrictId: row.district_Id,
      collectedByPhoneNumber:row.collectedByPhoneNumber,
      collectedByName:row.collectedByName


      // Add more params if needed (Municipality, Block, etc.)
    };

    const queryString = new URLSearchParams(queryParams).toString();
    window.open(`/api/Report/MemberdetailedReport?${queryString}`, '_blank');
  }
}
