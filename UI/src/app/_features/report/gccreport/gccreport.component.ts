import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GccReport } from 'src/app/_models/ReportMode';
import { ReportService } from 'src/app/services/reportsService';
import { Column } from 'src/app/_models/datatableModel';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface GccActionModel {
  type: string;
  record: any;
  column: string;
}


@Component({
  selector: 'app-gccreport',
  templateUrl: './gccreport.component.html',
  styleUrls: ['./gccreport.component.scss'],
})
export class GccreportComponent implements OnInit {
  title = 'GCC Report';
  reports: GccReport[] = [];
  filteredReports: GccReport[] = [];
  selectedZone = '';
  zones: { label: string; value: string }[] = [];
  displayDialog: boolean = false;
  selectedRecord: any;
  selectedRecordDetails: any[] = []; // add this
  totalRow: GccReport | null = null;

  cols: Column[] = [
    {
      field: 'sNo',
      header: 'S.No',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'S.No',
      sortablefield: 'sNo',

    },
    {
      field: 'zoneName',
      header: 'Zone Name',
      sortable: true,
      isSortable: true,
      isSearchable: true,
      customExportHeader: 'Zone Name',
      sortablefield: 'zoneName',
    },
    {
      field: 'private',
      header: 'Private',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Private',
      sortablefield: 'private',
       isActionable: true,
    },
    {
      field: 'government',
      header: 'Government',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Government',
      sortablefield: 'government',
       isActionable: true,
    },
    {
      field: 'governmentandPrivate',
      header: 'Government & Private',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Government & Private',
      sortablefield: 'governmentandPrivate',
       isActionable: true,
    },
                {
      field: 'total',
      header: 'Total',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Total',
      sortablefield: 'total',
      isActionable: false,
    },
    {
      field: 'saved',
      header: 'Saved',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Saved',
      sortablefield: 'saved',
       isActionable: true,
    },
    {
      field: 'submitted',
      header: 'Submitted',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Submitted',
      sortablefield: 'submitted',
       isActionable: true,
    },

    {
      field: 'approvedCount',
      header: 'Approved',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Approved',
      sortablefield: 'approvedCount',
       isActionable: true,
    },
    {
      field: 'cardIssued',
      header: 'Card Issued',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Card Issued',
      sortablefield: 'cardIssued',
       isActionable: true,
    },
    {
      field: 'cardtobeIssued',
      header: 'Card To Be Issued',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Card To Be Issued',
      sortablefield: 'cardtobeIssued',
       isActionable: true,
    },
      {
      field: 'cardRejected',
      header: 'Card Rejected',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Card Rejected',
      sortablefield: 'cardRejected',
       isActionable: true,
    },
    {
      field: 'beneficiaries',
      header: 'Beneficiaries',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Beneficiaries',
      sortablefield: 'beneficiaries',
       isActionable: true,
    },

  ];

  badgeFields: string[] = [
  'total','saved','submitted',
];

  totalRecords = 0;
  rows = 10;
  first = 0;
  defaultSortField = 'district';
  defaultSortOrder = 1;
  searchText = '';
  searchableColumns = ['zoneName'];


  constructor(private http: HttpClient, private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  get globalFields(): string[] {
  return this.cols?.map(c => c.field) || [];
}

loadReport() {
  this.reportService.GccReport().subscribe((res) => {
    if (res.status === 'SUCCESS') {
      const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

      this.reports = res.data.map((r: any, idx: number) => ({
        sNo: idx + 1,
        zoneName: r.zoneName,
        zone: r.zone,
        organization_Type: r.organization_Type,
        private: toNum(r.private),
        government: toNum(r.government),
        governmentandPrivate: toNum(r.governmentandPrivate),
        saved: toNum(r.saved),
        submitted: toNum(r.submitted),
        cardRejected: toNum(r.cardRejected),
        approvedCount: toNum(r.approvedCount),
        cardIssued: toNum(r.cardIssued),
        cardtobeIssued: toNum(r.cardtobeIssued),
        beneficiaries: toNum(r.beneficiaries),
        total: toNum(r.total),
        // Make sure these IDs are properly mapped from the API response
        privateId: r.privateId || r.organization_Type || '', // Fallback to organization_Type if privateId not available
        governmentId: r.governmentId || r.organization_Type || '', // Fallback to organization_Type if governmentId not available
        governmentandPrivateId: r.governmentandPrivateId || r.organization_Type || '' // Fallback to organization_Type if governmentandPrivateId not available
      }));

        // Calculate totals and store separately
        this.totalRow = this.calculateTotals(this.reports);

        // Set filtered reports without the total row
        this.filteredReports = [...this.reports];
      this.totalRecords = this.filteredReports.length;

      this.zones = Array.from(
        new Set(this.reports.map((r) => r.zoneName))
      ).map((v) => ({ label: v, value: v }));

      this.applyFilter();
    }
  });
}

 private calculateTotals(list: GccReport[]): GccReport {
    const totals: GccReport = {
      sNo: 'Total',
      zoneName: '---',
      zone: '',
      organization_Type: '',
      private: 0,
      government: 0,
      governmentandPrivate: 0,
      saved: 0,
      submitted: 0,
      approvedCount: 0,
      cardIssued: 0,
      cardtobeIssued: 0,
      cardRejected: 0,
      beneficiaries: 0,
      total: 0,
      privateId: '',
      governmentId: '',
      governmentandPrivateId: ''
    };

    list.forEach((r) => {
      totals.private += r.private || 0;
      totals.government += r.government || 0;
      totals.governmentandPrivate += r.governmentandPrivate || 0;
      totals.saved += r.saved || 0;
      totals.submitted += r.submitted || 0;
      totals.approvedCount += r.approvedCount || 0;
      totals.cardIssued += r.cardIssued || 0;
      totals.cardtobeIssued += r.cardtobeIssued || 0;
      totals.cardRejected += r.cardRejected || 0;
      totals.beneficiaries += r.beneficiaries || 0;
      totals.total += r.total || 0;
    });

    return totals;
  }

  applyGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement | null;
    const value = inputElement?.value?.trim().toLowerCase() || '';

    let filtered = this.reports.filter(report =>
      Object.values(report).some(val =>
        val?.toString().toLowerCase().includes(value)
      )
    );

    // Recalculate totals for filtered data
    this.totalRow = this.calculateTotals(filtered);
    this.filteredReports = [...filtered];
    this.totalRecords = this.filteredReports.length;
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

  applyFilter() {
    let filtered = this.reports;

    if (this.selectedZone) {
      filtered = filtered.filter((r) => r.zoneName === this.selectedZone);
    }

    // Recalculate totals for filtered data
    this.totalRow = this.calculateTotals(filtered);
    this.filteredReports = [...filtered];
    this.totalRecords = this.filteredReports.length;
    this.first = 0;
  }


  handleColumnClick(event: MouseEvent, column: string, row: any) {
  event.preventDefault();
  event.stopPropagation();

  console.log('Column clicked:', column);
  console.log('Row data:', row);

  // Create the action object manually
  const actionData = {
    type: column,
    record: row,
    column: column
  };

  this.openActionDialog(actionData);
}


  generate() {
    this.applyFilter();
  }

  clearFilter() {
    this.selectedZone = '';
    this.filteredReports = [...this.reports];
    this.totalRecords = this.filteredReports.length;
    this.first = 0;
    this.applyFilter();
  }

  changefilter(event: any) {
    if (event.sortField) {
      this.defaultSortField = event.sortField;
      this.defaultSortOrder = event.sortOrder === 1 ? 1 : -1;

      this.filteredReports = this.filteredReports
        .filter((r) => r.zoneName !== 'Total')
        .sort((a, b) => {
          let value1 = a[this.defaultSortField as keyof GccReport];
          let value2 = b[this.defaultSortField as keyof GccReport];

          if (typeof value1 === 'number' && typeof value2 === 'number') {
            return (value1 - value2) * this.defaultSortOrder;
          }

          return (
            String(value1).localeCompare(String(value2)) * this.defaultSortOrder
          );
        });

      if (this.totalRow) {
        this.filteredReports.push(this.totalRow);
      }
    }
  }

    openActionDialog(event: any) {
      const record = event.record;
      const column = event.column;

      this.selectedRecord = { ...record, clickedColumn: column };
      this.selectedRecordDetails = [];

      let params: any = {
        Zone: record.zone
      };

    // Handle Card columns first (send single field only)
    if (column === 'cardIssued') {
      params.CardIssued = 1;      // only send this
    } else if (column === 'cardtobeIssued') {
      params.CardtobeIssued = 0;  // only send this
    } else if (column === 'cardRejected') {
      params.CardRejected = 1;    // only send this
    }

      // Handle organization-type columns
      else if (column === 'private') {
        params.Organization_Type = record.privateId;
      } else if (column === 'government') {
        params.Organization_Type = record.governmentId;
      } else if (column === 'governmentandPrivate') {
        params.Organization_Type = record.governmentandPrivateId;
      }
      // Handle status columns
    else if (column === 'approvedCount') {
        params.Status = 'approved';
      } else if (column === 'beneficiaries') {
        params.Status = 'approved'; // beneficiaries maps to approved
      } else if (column === 'saved') {
        params.Status = 'saved';
      } else if (column === 'submitted') {
        params.Status = 'submitted';
      } else if (column === 'rejected') {
        params.Status = 'rejected';
      }
      // If no match found
      else {
        console.warn('No valid param mapping for column:', column);
        return;
      }
      console.log('API params:', params);

      this.reportService.getMemberDetailedReport(params).subscribe({
        next: (res) => {
          if (res.status === 'SUCCESS') {
            this.selectedRecordDetails = res.data;
          }
        },
        error: (err) => console.error('API error:', err),
      });
    }


    isBadgeColumn(field: string): boolean {
  return this.badgeFields.includes(field);
}

getBadgeClass(field: string): string {
  switch (field) {
    case 'total': return 'bg-blue-500 text-white';
    // case 'private': return 'bg-blue-500 text-white';
    // case 'government': return 'bg-blue-500 text-white';
    // case 'governmentandPrivate': return 'bg-blue-500 text-white';
    case 'saved': return 'bg-orange-500 text-white';
    case 'submitted': return 'bg-orange-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
}


  actionInvoked(event: any) {
    console.log('Action invoked:', event);
  }


}
