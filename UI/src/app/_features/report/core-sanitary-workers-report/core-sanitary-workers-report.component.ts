import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CoreSanitaryWorkersReport } from 'src/app/_models/ReportMode';
import { ReportService } from 'src/app/services/reportsService';
import { Column } from 'src/app/_models/datatableModel';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-core-sanitary-workers-report',
  templateUrl: './core-sanitary-workers-report.component.html',
  styleUrls: ['./core-sanitary-workers-report.component.scss'],
})
export class CoreSanitaryWorkersReportComponent implements OnInit {
  title: string = 'Core Sanitary Workers Report';
  currentStatus = true;
  reports: CoreSanitaryWorkersReport[] = [];
  filteredReports: CoreSanitaryWorkersReport[] = [];
  districts: { label: string; value: string }[] = [];
  selectedDistrict: string = '';
selectedRecord: any = null;
selectedRecordDetails: any[] = [];
  totalRecords = 0;
  totalRow: CoreSanitaryWorkersReport | null = null; // Add this property

  cols: Column[] = [
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
      field: 'sanitaryWorkers',
      header: 'Sanitary Workers',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'Sanitary Workers',
      sortablefield: 'sanitaryWorkers',
      isActionable: true
    },
    {
      field: 'stpfstpMaintenance',
      header: 'STP/FSTP Maintenance',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'STP/FSTP Maintenance',
      sortablefield: 'stpfstpMaintenance',
      isActionable: true
    },
    {
      field: 'multiple',
      header: 'Multiple',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'Multiple',
      sortablefield: 'multiple',
      isActionable: true
    },
    {
      field: 'septicTankDeSludging',
      header: 'Septic Tank De-Sludging',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'Septic Tank De-Sludging',
      sortablefield: 'septicTankDeSludging',
      isActionable: true
    },
    {
      field: 'toiletCleaning',
      header: 'Toilet Cleaning',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'Toilet Cleaning',
      sortablefield: 'toiletCleaning',
      isActionable: true
    },
    {
      field: 'sewerMaintenance',
      header: 'Sewer Maintenance',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'Sewer Maintenance',
      sortablefield: 'sewerMaintenance',
      isActionable: true
    },
    {
      field: 'drainCleaning',
      header: 'Drain Cleaning',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'Drain Cleaning',
      sortablefield: 'drainCleaning',
      isActionable: true
    },
    {
      field: 'omWastewaterTreatment',
      header: 'O&M Wastewater Treatment',
      sortable: true,
      isSortable: true,
      highlight: true,
      customExportHeader: 'O&M Wastewater Treatment',
      sortablefield: 'omWastewaterTreatment',
      isActionable: true
    },
  ];

  rows = 10;
  first = 0;
  defaultSortField = 'district';
  defaultSortOrder = 1;

  searchText = '';
  searchableColumns = ['district'];
  constructor(private http: HttpClient, private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.reportService.CoreSanitaryWorkersReport().subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
      this.reports = res.data.map((item: any, index: number) => ({
  sNo: index + 1,
  district: item.district,
  district_Id: item.district_Id || '',

  sanitaryWorkers: Number(item.sanitaryWorkers) || 0,
  sanitaryWorkersId: item.sanitaryWorkersId || '',

  stpfstpMaintenance: Number(item.stpfstpMaintenance) || 0,
  stpfstpMaintenanceId: item.stpfstpMaintenanceId || '',

  multiple: Number(item.multiple) || 0,
  multipleId: item.multipleId || '',

  septicTankDeSludging: Number(item.septicTankDeSludging) || 0,
  septicTankDeSludgingId: item.septicTankDeSludgingId || '',

  toiletCleaning: Number(item.toiletCleaning) || 0,
  toiletCleaningId: item.toiletCleaningId || '',

  sewerMaintenance: Number(item.sewerMaintenance) || 0,
  sewerMaintenanceId: item.sewerMaintenanceId || '',

  drainCleaning: Number(item.drainCleaning) || 0,
  drainCleaningId: item.drainCleaningId || '',

  omWastewaterTreatment: Number(item.omWastewaterTreatment) || 0,
  omWastewaterTreatmentId: item.omWastewaterTreatmentId || '',

  core_Sanitary_Worker_Type: item.core_Sanitary_Worker_Type || ''
}));


                  this.totalRow = this.calculateTotals(this.reports);

          // Set filtered reports without the total row
          this.filteredReports = [...this.reports];
          this.totalRecords = this.filteredReports.length;

          this.districts = Array.from(
            new Set(this.reports.map((r) => r.district))
          ).map((d) => ({ label: d, value: d }));
        }
      },
      error: () => {
        console.error('Failed to load report data');
      },
    });
  }

 private calculateTotals(list: CoreSanitaryWorkersReport[]): CoreSanitaryWorkersReport {
    const totals: CoreSanitaryWorkersReport = {
      sNo: 'Total',
      district: 'Total',
      district_Id: '',
      sanitaryWorkers: 0,
      sanitaryWorkersId: '',
      stpfstpMaintenance: 0,
      stpfstpMaintenanceId: '',
      multiple: 0,
      multipleId: '',
      septicTankDeSludging: 0,
      septicTankDeSludgingId: '',
      toiletCleaning: 0,
      toiletCleaningId: '',
      sewerMaintenance: 0,
      sewerMaintenanceId: '',
      drainCleaning: 0,
      drainCleaningId: '',
      omWastewaterTreatment: 0,
      omWastewaterTreatmentId: '',
      core_Sanitary_Worker_Type: '',
    };

    list.forEach((r) => {
      totals.sanitaryWorkers += r.sanitaryWorkers || 0;
      totals.stpfstpMaintenance += r.stpfstpMaintenance || 0;
      totals.multiple += r.multiple || 0;
      totals.septicTankDeSludging += r.septicTankDeSludging || 0;
      totals.toiletCleaning += r.toiletCleaning || 0;
      totals.sewerMaintenance += r.sewerMaintenance || 0;
      totals.drainCleaning += r.drainCleaning || 0;
      totals.omWastewaterTreatment += r.omWastewaterTreatment || 0;
    });

    return totals;
  }



  applyFilter() {
    let filtered = this.reports;

    if (this.selectedDistrict) {
      filtered = filtered.filter((r) => r.district === this.selectedDistrict);
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
    this.selectedDistrict = '';
    this.searchText = '';
    this.filteredReports = [...this.reports];
    this.totalRecords = this.filteredReports.length;
    this.first = 0;
    this.applyFilter();
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
// Export Excel (without ID fields)
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

   openDetailsTable(event: any) {
  console.log('=== OPEN INLINE DETAILS TABLE ===', event);

  const record = event.record;
  const column = event.column; // e.g., "sanitaryWorkers"

  if (!record || !column) {
    console.error('Invalid event payload:', event);
    return;
  }

  // Map column field EXACTLY as in your cols definition
  const coreTypeMap: { [key: string]: string } = {
    sanitaryWorkers: record.sanitaryWorkersId,
    stpfstpMaintenance: record.stpfstpMaintenanceId,
    multiple: record.multipleId,
    septicTankDeSludging: record.septicTankDeSludgingId,
    toiletCleaning: record.toiletCleaningId,
    sewerMaintenance: record.sewerMaintenanceId,
    drainCleaning: record.drainCleaningId,
    omWastewaterTreatment: record.omWastewaterTreatmentId
  };

  // Check mapping
  if (!coreTypeMap[column]) {
    console.warn('No matching Core Sanitary Worker Type for column:', column);
    return;
  }

  // Prepare params for API
  const params = {
    DistrictId: record.district_Id,
    Core_Sanitary_Worker_Type: coreTypeMap[column]
  };

  console.log('API Params Prepared:', params);

  // Call API
  this.reportService.getMemberDetailedReport(params).subscribe({
    next: (res) => {
      console.log('API Response:', res);
      this.selectedRecordDetails = res.status === 'SUCCESS' ? res.data : [];
    },
    error: (err) => {
      console.error('API Error:', err);
      this.selectedRecordDetails = [];
    }
  });
}




  changefilter(event: any) {
    if (event.sortField) {
      this.defaultSortField = event.sortField;
      this.defaultSortOrder = event.sortOrder === 1 ? 1 : -1;

      this.filteredReports = this.filteredReports
        .filter((r) => r.district !== 'Total')
        .sort((a, b) => {
          let value1 =
            a[this.defaultSortField as keyof CoreSanitaryWorkersReport];
          let value2 =
            b[this.defaultSortField as keyof CoreSanitaryWorkersReport];

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
