import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReportService } from 'src/app/services/reportsService';
import { Column } from 'src/app/_models/datatableModel';
import { SchemeCostReport } from 'src/app/_models/ReportMode';

@Component({
  selector: 'app-scheme-cost-report',
  templateUrl: './scheme-cost-report.component.html',
  styleUrls: ['./scheme-cost-report.component.scss']
})
export class SchemeCostReportComponent implements OnInit {
  title = 'Scheme Cost Report';
  reports: SchemeCostReport[] = [];
  filteredReports: SchemeCostReport[] = [];
  selectedDistrict = '';
  selectedScheme = '';
  selectedCategory = '';
  selectedCommunity = '';
  districts: { label: string; value: string }[] = [];
  schemes: { label: string; value: string }[] = [];
  categories: { label: string; value: string }[] = [];
  communities: { label: string; value: string }[] = [];
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
    // {
    //   field: 'category',
    //   header: 'Category',
    //   sortable: true,
    //   isSortable: true,
    //   isSearchable: true,
    //   customExportHeader: 'Category',
    //   sortablefield: 'category',
    // },
    // {
    //   field: 'community',
    //   header: 'Community',
    //   sortable: true,
    //   isSortable: true,
    //   isSearchable: true,
    //   customExportHeader: 'Community',
    //   sortablefield: 'community',
    // },
    {
      field: 'totalAppliedAmount',
      header: 'Total',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Total',
      sortablefield: 'total',
      isActionable: false,
    },
    {
      field: 'totalPaidAmount',
      header: 'Not Paid',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Not Paid',
      sortablefield: 'notPaid',
      isActionable: false,
    },
    {
      field: 'pendingAmount',
      header: 'Paid',
      sortable: true,
      isSortable: true,
      isSearchable: false,
      customExportHeader: 'Paid',
      sortablefield: 'paid',
      isActionable: false,
    },
  ];

  totalRecords = 0;
  rows = 10;
  first = 0;
  defaultSortField = 'district';
  defaultSortOrder = 1;
  searchText = '';
  searchableColumns = ['district', 'schemeName', 'category', 'community'];
  totalRow: any = {};

  constructor(private http: HttpClient, private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.reportService.getSchemeCostReport().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.reports = res.data.map((r: any, idx: number) => ({
            sNo: idx + 1,
            district: r.district,
            schemeName: r.schemeName,
            category: r.category,
            community: r.community,
            totalAppliedAmount: r.totalAppliedAmount || 0,
            totalPaidAmount: r.totalPaidAmount || 0,
            pendingAmount: r.pendingAmount || 0,
          }));

          this.filteredReports = [...this.reports];
          this.totalRecords = this.filteredReports.length;

          // Dropdown values
          this.districts = Array.from(
            new Set(this.reports.map((r) => r.district))
          ).map((v) => ({ label: v, value: v }));

          this.schemes = Array.from(
            new Set(this.reports.map((r) => r.schemeName))
          ).map((v) => ({ label: v, value: v }));

          this.categories = Array.from(
            new Set(this.reports.map((r) => r.category))
          ).map((v) => ({ label: v, value: v }));

          this.communities = Array.from(
            new Set(this.reports.map((r) => r.community))
          ).map((v) => ({ label: v, value: v }));
        }

      },
      error: (err) => {
        console.error('Error fetching Scheme Cost Report:', err);
      },
    });
  }

  private calculateColumnTotals(list: SchemeCostReport[]): SchemeCostReport[] {
    if (!list.length) return list;

    const totals: any = {
      sNo: 'Total',
      district: '---',
      schemeName: '---',
      category: '---',
      community: '---',
      total: 0,
      notPaid: 0,
      paid: 0,
    };

    list.forEach((r) => {
      totals.total += r.total || 0;
      totals.notPaid += r.notPaid || 0;
      totals.paid += r.paid || 0;
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
          let value1 = a[this.defaultSortField as keyof SchemeCostReport];
          let value2 = b[this.defaultSortField as keyof SchemeCostReport];

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
