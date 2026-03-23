import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReportService } from 'src/app/services/reportsService';
import { Column } from 'src/app/_models/datatableModel';
import { SchemeGccReport } from 'src/app/_models/ReportMode';

@Component({
  selector: 'app-scheme-gcc-report',
  templateUrl: './scheme-gcc-report.component.html',
  styleUrls: ['./scheme-gcc-report.component.scss']
})
export class SchemeGccReportComponent implements OnInit {
  title = 'Scheme GCC Report';
  reports: SchemeGccReport[] = [];
  filteredReports: SchemeGccReport[] = [];
  selectedZone = '';
  selectedScheme = '';
  zones: { label: string; value: string }[] = [];
  schemes: { label: string; value: string }[] = [];
  selectedZones: string[] = [];
  selectedSchemes: string[] = [];

  


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
      field: 'schemeName',
      header: 'Scheme Name',
      sortable: true,
      isSortable: true,
      isSearchable: true,
      customExportHeader: 'Scheme Name',
      sortablefield: 'schemeName',
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
      isActionable: false,
    },
    {
      field: 'submitted',
      header: 'Submitted',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Submitted',
      sortablefield: 'submitted',
      isActionable: false,
    },
    {
      field: 'dmApproved',
      header: 'DM Approved',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'DM Approved',
      sortablefield: 'dmApproved',
      isActionable: false,
    },
    {
      field: 'hoApproved',
      header: 'HQ Approved',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'HQ Approved',
      sortablefield: 'hoApproved',
      isActionable: false,
    },
  ];

  totalRecords = 0;
  rows = 10;
  first = 0;
  defaultSortField = 'zoneName';
  defaultSortOrder = 1;
  searchText = '';
  searchableColumns = ['zoneName', 'schemeName'];
  totalRow: any = {};

  constructor(private http: HttpClient, private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.reportService.getSchemeGccReport().subscribe({
      next: (list) => {
        const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

        this.reports = list.map((r: any, idx: number) => ({
          sNo: idx + 1,
          zoneName: r.zone || r.zoneName,
          schemeName: r.schemeName,
          total: toNum(r.total),
          saved: toNum(r.saved),
          submitted: toNum(r.submitted),
          dmApproved: toNum(r.dmApproved),
          hoApproved: toNum(r.hoApproved ?? r.hqApproved),
        }));

        this.filteredReports = this.calculateColumnTotals(this.reports);
        this.totalRecords = this.filteredReports.length;

        this.zones = Array.from(new Set(this.reports.map((r) => r.zoneName)))
          .map((v) => ({ label: v, value: v }));

        this.schemes = Array.from(new Set(this.reports.map((r) => r.schemeName)))
          .map((v) => ({ label: v, value: v }));

        this.applyFilter();
      },
      error: (err) => console.error('Error fetching Scheme GCC Report:', err)
    });
  }

  private calculateColumnTotals(list: SchemeGccReport[]): SchemeGccReport[] {
    if (!list.length) return list;

    const totals: any = {
      sNo: 'Total',
      zoneName: '---',
      schemeName: '---',
      total: 0,
      saved: 0,
      submitted: 0,
      dmApproved: 0,
      hoApproved: 0,
    };

    list.forEach((r) => {
      totals.total += r.total || 0;
      totals.saved += r.saved || 0;
      totals.submitted += r.submitted || 0;
      totals.dmApproved += r.dmApproved || 0;
      totals.hoApproved += r.hoApproved || 0;
    });

    return [...list, totals];
  }
applyFilter() {
  let filtered = this.reports.filter((r) => r.zoneName !== 'Total');

  if (this.selectedZones && this.selectedZones.length) {
    filtered = filtered.filter((r) => this.selectedZones.includes(r.zoneName));
  }

  if (this.selectedSchemes && this.selectedSchemes.length) {
    filtered = filtered.filter((r) => this.selectedSchemes.includes(r.schemeName));
  }

  this.filteredReports = this.calculateColumnTotals(filtered);
  this.totalRecords = this.filteredReports.length;
  this.first = 0;
}


  clearFilter() {
    this.selectedZones = [];
    this.selectedSchemes = [];
    this.applyFilter();
  }
  generate() {
    this.applyFilter();
  }


  changefilter(event: any) {
    if (event.sortField) {
      this.defaultSortField = event.sortField;
      this.defaultSortOrder = event.sortOrder === 1 ? 1 : -1;

      this.filteredReports = this.filteredReports
        .filter((r) => r.zoneName !== 'Total')
        .sort((a, b) => {
          let value1 = a[this.defaultSortField as keyof SchemeGccReport];
          let value2 = b[this.defaultSortField as keyof SchemeGccReport];

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

  actionInvoked(event: any) {
    console.log('Action invoked:', event);
  }
}
