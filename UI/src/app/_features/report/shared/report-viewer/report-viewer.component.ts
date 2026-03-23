// src/app/features/report/shared/report-viewer/report-viewer.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Column } from 'src/app/_models/datatableModel';
import { ReportData } from 'src/app/_models/ReportMode';
import { environment } from 'src/environments/environment';
import { ReportService } from 'src/app/services/reportsService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DropdownOption {
  label: string;
  value: string;
}

// strongly-typed helper so we don't send wrong keys
type DetailParams = {
  DistrictId: string;
  BlockId?: string;
  CorporationId?: string;
  MunicipalityId?: string;
  VillagePanchayatId?: string;
};

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss'],
})
export class ReportViewerComponent implements OnInit {
  @Input() reportType: 'block' | 'corporation' | 'village' | 'municipality' =
    'block';
  @Input() apiUrl = '';
  @Input() title = '';

  reports: ReportData[] = [];
  filteredReports: ReportData[] = [];
  selectedData: ReportData | null = null;
  displayDialog = false;
  loading = true;
  dialogRecords: any[] = [];
  memberDetails: any[] = [];
  loadingDetails = false;


  // Dropdown options
  districts: DropdownOption[] = [];
  blocks: DropdownOption[] = [];
  corporations: DropdownOption[] = [];
  villages: DropdownOption[] = [];
  municipalities: DropdownOption[] = [];

  // Selected filters
  selectedDistrict: string[] = [];
  selectedBlock  :string[] = [];
  selectedCorporation  :string[] = [];
  selectedVillage :string[] = [];
  selectedMunicipality  :string[] = [];

  // Table configuration
  cols: Column[] = [];
  rows = 10;
  totalRecords = 0;
  defaultSortField = 'district';
  defaultSortOrder = 1; // 1 for asc, -1 for desc
  searchableColumns: string[] = [];
  globalFilter = '';
  constructor(
    private http: HttpClient,
    private reportService: ReportService
  )
  {}

  ngOnInit() {
    this.setupColumns();
    this.loadReport();
  }

  private setupColumns() {
    this.searchableColumns = ['district'];

    switch (this.reportType) {
      case 'block':
        this.cols = [
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
            field: 'block',
            header: 'Block',
            sortable: true,
            isSortable: true,
            customExportHeader: 'Block',
            sortablefield: 'block',
          },
          {
            field: 'total',
            header: 'Total',
            highlight: true,
            sortable: true,
            isSortable: true,
            customExportHeader: 'Total',
            sortablefield: 'total',
            isActionable: true,
          },
        ];
        this.searchableColumns.push('block');
        break;
      case 'corporation':
        this.cols = [
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
            field: 'corporation',
            header: 'Corporation',
            sortable: true,
            isSortable: true,
            customExportHeader: 'Corporation',
            sortablefield: 'corporation',
          },
          {
            field: 'total',
            header: 'Total',
            highlight: true,
            sortable: true,
            isSortable: true,
            customExportHeader: 'Total',
            sortablefield: 'total',
            isActionable: true,
          },
        ];
        this.searchableColumns.push('corporation');
        break;
      case 'village':
        this.cols = [
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
            field: 'block',
            header: 'Block',
            sortable: true,
            isSortable: true,
            customExportHeader: 'Block',
            sortablefield: 'block',
          },
          {
            field: 'villagePanchayat',
            header: 'Village Panchayat',
            sortable: true,
            isSortable: true,
            customExportHeader: 'Village Panchayat',
            sortablefield: 'villagePanchayat',
          },
          {
            field: 'total',
            header: 'Total',
            highlight: true,
            sortable: true,
            isSortable: true,
            customExportHeader: 'Total',
            sortablefield: 'total',
            isActionable: true,
          },
        ];
        this.searchableColumns.push('block', 'villagePanchayat');
        break;
      case 'municipality':
        this.cols = [
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
            field: 'municipality',
            header: 'Municipality',
            sortable: true,
            isSortable: true,
            customExportHeader: 'Municipality',
            sortablefield: 'municipality',
          },
          {
            field: 'total',
            header: 'Total',
            highlight: true,
            sortable: true,
            isSortable: true,
            customExportHeader: 'Total',
            sortablefield: 'total',
            isActionable: true,
          },
        ];
        this.searchableColumns.push('municipality');
        break;
    }
  }

  loadReport() {
    this.loading = true;
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.reports = res.data;
          this.filteredReports = [...this.reports];
          this.totalRecords = this.filteredReports.length;
          this.populateDropdowns();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private populateDropdowns() {
    this.districts = Array.from(new Set(this.reports.map((r) => r.district)))
      .filter((d): d is string => !!d)
      .map((v) => ({ label: v, value: v }));

    if (this.reportType === 'block' || this.reportType === 'village') {
      this.blocks = Array.from(new Set(this.reports.map((r) => r.block)))
        .filter((b): b is string => !!b)
        .map((v) => ({ label: v, value: v }));
    }

    if (this.reportType === 'corporation') {
      this.corporations = Array.from(
        new Set(this.reports.map((r) => r.corporation))
      )
        .filter((c): c is string => !!c)
        .map((v) => ({ label: v, value: v }));
    }

    if (this.reportType === 'village') {
      this.villages = Array.from(
        new Set(this.reports.map((r) => r.villagePanchayat))
      )
        .filter((v): v is string => !!v)
        .map((v) => ({ label: v, value: v }));
    }

    if (this.reportType === 'municipality') {
      this.municipalities = Array.from(
        new Set(this.reports.map((r) => r.municipality))
      )
        .filter((m): m is string => !!m)
        .map((v) => ({ label: v, value: v }));
    }
  }

  // applyFilter() {
  //   this.filteredReports = this.reports.filter((r) => {
  //     let match = true;

  //     if (this.selectedDistrict) {
  //       match = match && this.selectedDistrict.includes(r.district);
  //     }
    

  //     if (this.reportType === 'block' && this.selectedBlock) {
  //       match = match && this.selectedBlock.includes(r.block??'');
  //     }

  //     if (this.reportType === 'corporation' && this.selectedCorporation) {
  //       match = match &&  this.selectedCorporation.includes(r.corporation??'');
  //     }

  //     if (this.reportType === 'village') {
  //       if (this.selectedBlock) {
  //         match = match && this.selectedBlock.includes(r.block??''
  //         );
  //       }
  //       if (this.selectedVillage) {
  //         match = match && this.selectedVillage.includes(r.villagePanchayat??'');
  //       }
  //     }

  //     if (this.reportType === 'municipality' && this.selectedMunicipality) {
  //       match = match && this.selectedMunicipality.includes(r.municipality??'');
  //     }

  //     return match;
  //   });

  //   this.totalRecords = this.filteredReports.length;
  // }

applyFilter() {
  this.filteredReports = this.reports.filter((r) => {
    let match = true;

    // District filter
    if (this.selectedDistrict?.length) {
      match = match && this.selectedDistrict.includes(r.district ?? '');
    }

    // Block filter
    if (this.selectedBlock?.length) {
      match = match && this.selectedBlock.includes(r.block ?? '');
    }

    // Corporation filter
    if (this.selectedCorporation?.length) {
      match = match && this.selectedCorporation.includes(r.corporation ?? '');
    }

    // Village filter
    if (this.selectedVillage?.length) {
      match = match && this.selectedVillage.includes(r.villagePanchayat ?? '');
    }

    // Municipality filter
    if (this.selectedMunicipality?.length) {
      match = match && this.selectedMunicipality.includes(r.municipality ?? '');
    }

    return match;
  });

  this.totalRecords = this.filteredReports.length;


   const source = this.selectedDistrict?.length
    ? this.filteredReports
    : this.reports;

  this.rebuildDependentDropdowns(source);
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


  clearFilter() {
   this.selectedDistrict = [];
    this.selectedBlock = [];
    this.selectedCorporation = [];
    this.selectedVillage = [];
    this.selectedMunicipality = [];
    this.filteredReports = [...this.reports];
    this.totalRecords = this.filteredReports.length;
  }

    showDetails(row: ReportData) {
      this.selectedData = row;
      this.dialogRecords = [];
      this.loadingDetails = true;

      // Always require district
      if (!row?.district_Id) {
        console.error('Row has no district_Id:', row);
        this.loadingDetails = false;
        return;
      }

      // Base params
      const params: any = { DistrictId: row.district_Id };

      // Match API expected keys (Swagger)
      switch (this.reportType) {
        case 'block':
          if (row.block_Id) params.Block = row.block_Id; // ✅ API expects "Block"
          break;

        case 'corporation':
          if (row.corporation_Id) params.pByCorporation = row.corporation_Id; // ✅ API expects "pByCorporation"
          break;

        case 'municipality':
          if (row.municipality_Id) params.Municipality = row.municipality_Id; // ✅ API expects "Municipality"
          break;

        case 'village':
          if (row.village_Panchayat_Id) {
            params.VillagePanchayat = row.village_Panchayat_Id; // ✅ API expects "VillagePanchayat"
          }
          break;
      }

      console.log("Calling MemberdetailedReport with params:", params);

      // Safety check (prevent district-only queries)
      if (
        this.reportType === 'block' && !params.Block ||
        this.reportType === 'corporation' && !params.pByCorporation ||
        this.reportType === 'municipality' && !params.Municipality ||
        this.reportType === 'village' && !params.VillagePanchayat
      ) {
        console.error('Missing required ID for report type:', this.reportType, row);
        this.loadingDetails = false;
        return;
      }

      // Call API
      this.reportService.getMemberDetailedReport(params).subscribe({
        next: (res) => {
          this.dialogRecords = res?.data || [];
          this.loadingDetails = false;

          // Sanity check: compare with total in grid
          if (typeof row.total === 'number' && this.dialogRecords.length !== row.total) {
            console.warn(
              `Total mismatch: grid=${row.total}, api=${this.dialogRecords.length}`,
              params
            );

            // Extra safeguard: narrow down for village rows if mismatch
            if (this.reportType === 'village' && row.villagePanchayat) {
              this.dialogRecords = this.dialogRecords.filter(
                record => record.villagePanchayat === row.villagePanchayat
              );
              console.log(
                `Filtered to ${this.dialogRecords.length} records for village: ${row.villagePanchayat}`
              );
            }
          }
        },
        error: (err) => {
          console.error('MemberDetailedReport error', err, params);
          this.dialogRecords = [];
          this.loadingDetails = false;
        },
      });
    }





  changefilter(event: any) {
    if (event.sortField) {
      this.defaultSortField = event.sortField;
      this.defaultSortOrder = event.sortOrder === 1 ? 1 : -1;

      this.filteredReports = this.filteredReports.sort((a, b) => {
        let value1 = a[this.defaultSortField as keyof ReportData];
        let value2 = b[this.defaultSortField as keyof ReportData];

        if (typeof value1 === 'number' && typeof value2 === 'number') {
          return (value1 - value2) * this.defaultSortOrder;
        }

        return (
          String(value1).localeCompare(String(value2)) * this.defaultSortOrder
        );
      });
    }
  }

actionInvoked(event: any) {
  console.log("Clicked cell:", event);
  if (event.col.isActionable) {
    this.showDetails(event.row);
  }
}


private rebuildDependentDropdowns(source: ReportData[]) {

  if (this.reportType === 'block' || this.reportType === 'village') {
    this.blocks = Array.from(new Set(source.map(r => r.block)))
      .filter((b): b is string => !!b)
      .map(v => ({ label: v, value: v }));
  }

  if (this.reportType === 'corporation') {
    this.corporations = Array.from(new Set(source.map(r => r.corporation)))
      .filter((c): c is string => !!c)
      .map(v => ({ label: v, value: v }));
  }

  if (this.reportType === 'village') {
    this.villages = Array.from(new Set(source.map(r => r.villagePanchayat)))
      .filter((v): v is string => !!v)
      .map(v => ({ label: v, value: v }));
  }

  if (this.reportType === 'municipality') {
    this.municipalities = Array.from(new Set(source.map(r => r.municipality)))
      .filter((m): m is string => !!m)
      .map(v => ({ label: v, value: v }));
  }
}



}
