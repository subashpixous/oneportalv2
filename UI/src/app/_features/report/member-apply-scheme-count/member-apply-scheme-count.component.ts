import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReportService } from 'src/app/services/reportsService';
import { Column } from 'src/app/_models/datatableModel';
import { MemberApplySchemeCountReport } from 'src/app/_models/ReportMode';

@Component({
  selector: 'app-member-apply-scheme-count',
  templateUrl: './member-apply-scheme-count.component.html',
  styleUrls: ['./member-apply-scheme-count.component.scss']
})
export class MemberApplySchemeCountComponent implements OnInit {
  title: string = 'Member Scheme Application Report';
  reports: MemberApplySchemeCountReport[] = [];
  filteredReports: MemberApplySchemeCountReport[] = [];
  selectedDistrict = '';
  selectedScheme = '';
  districts: { label: string; value: string }[] = [];
  schemes: { label: string; value: string }[] = [];
    selectedDistricts: string[] = [];
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
      field: 'district',
      header: 'District',
      sortable: true,
      isSortable: true,
      isSearchable: true,
      customExportHeader: 'District',
      sortablefield: 'district',
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
  defaultSortField = 'district';
  defaultSortOrder = 1;
  searchText = '';
  searchableColumns = ['district', 'schemeName'];
  totalRow: any = {};

  constructor(private http: HttpClient, private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.reportService.MemberApplySchemeCountReport().subscribe({
      next: (res: any) => {
        if (res?.status === 'SUCCESS' && Array.isArray(res.data)) {
          this.reports = res.data.map((r: any, idx: number) => ({
            sNo: idx + 1,
            district: r.district,
            schemeName: r.schemeName,
            total: Number(r.total) || 0,
            saved: Number(r.saved) || 0,
            submitted: Number(r.submitted) || 0,
            dmApproved: Number(r.dmApproved) || 0,
            hoApproved: Number(r.hoApproved || r.hqApproved) || 0, // safe mapping
          }));

          this.filteredReports = this.calculateColumnTotals(this.reports);
          this.totalRecords = this.filteredReports.length;

          this.districts = Array.from(new Set(this.reports.map(r => r.district)))
            .map(v => ({ label: v, value: v }));

          this.schemes = Array.from(new Set(this.reports.map(r => r.schemeName)))
            .map(v => ({ label: v, value: v }));

          this.applyFilter();
        }
      },
      error: (err) => {
        console.error('Error loading report:', err);
      }
    });
  }

  private calculateColumnTotals(list: MemberApplySchemeCountReport[]): MemberApplySchemeCountReport[] {
    if (!list.length) return list;

    const totals: any = {
      sNo: 'Total',
      district: '---',
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
  let filtered = this.reports.filter((r) => r.district !== 'Total');

  if (this.selectedDistricts?.length) {
    filtered = filtered.filter((r) => this.selectedDistricts.includes(r.district));
  }

  if (this.selectedSchemes?.length) {
    filtered = filtered.filter((r) => this.selectedSchemes.includes(r.schemeName));
  }

  this.filteredReports = this.calculateColumnTotals(filtered);
  this.totalRecords = this.filteredReports.length;
  this.first = 0;
}

generate() {
  this.applyFilter();
}

clearFilter() {
  this.selectedDistricts = [];
  this.selectedSchemes = [];
  this.applyFilter();
}


  changefilter(event: any) {
    if (event.sortField) {
      this.defaultSortField = event.sortField;
      this.defaultSortOrder = event.sortOrder === 1 ? 1 : -1;

      this.filteredReports = this.filteredReports
        .filter((r) => r.district !== 'Total')
        .sort((a, b) => {
          let value1 = a[this.defaultSortField as keyof MemberApplySchemeCountReport];
          let value2 = b[this.defaultSortField as keyof MemberApplySchemeCountReport];

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
