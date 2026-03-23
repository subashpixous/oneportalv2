import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PrintModuleReport } from 'src/app/_models/ReportMode';
import { ReportService } from 'src/app/services/reportsService';
import { environment } from 'src/environments/environment';
import { SelectItem } from 'primeng/api';

interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  isActionable?: boolean;
}

@Component({
  selector: 'app-print-module-report',
  templateUrl: './print-module-report.component.html',
  styleUrls: ['./print-module-report.component.scss']
})
export class PrintModuleReportComponent implements OnInit {
  reports: PrintModuleReport[] = [];
  filteredReports: PrintModuleReport[] = [];
  loading = false;
  displayImageDialog = false;
  displayQRDialog = false;
  selectedImage = '';
  selectedQRCode = '';
  selectedStatus: string = '';
  statusOptions: SelectItem[] = [];

  // Dynamic column configuration
  cols: TableColumn[] = [
    { field: 'member_Id', header: 'Member ID', sortable: true, width: '180px', isActionable: true },
    { field: 'name', header: 'Name', sortable: true, width: '150px' },
    { field: 'phone_Number', header: 'Phone', sortable: true, width: '120px' },
    { field: 'father_Name', header: 'Father\'s Name', sortable: true, width: '150px' },
    { field: 'district', header: 'District', sortable: true, width: '120px' },
    { field: 'date_Of_Birth', header: 'DOB', sortable: true, width: '120px' },
    { field: 'status', header: 'Status', sortable: true, width: '150px' },
    { field: 'familyMembers', header: 'Family Members', sortable: true, width: '200px' },
    { field: 'profileImage', header: 'Profile Image', width: '100px' },
    { field: 'qrCodeURL', header: 'QR Code', width: '100px' }
  ];

  globalFilterFields: string[] = this.cols.map(c => c.field);

  constructor(private http: HttpClient, private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  getInputValue(event: any): string {
    return event.target?.value || '';
  }

  loadReport() {
    this.loading = true;
    this.reportService.getPrintModuleReport().subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.reports = res.data;
          this.filteredReports = [...this.reports];

          // Extract unique status values for dropdown
          const statuses = [...new Set(this.reports.map(item => item.status))];
          this.statusOptions = statuses.map(status => ({
            label: status,
            value: status
          }));
        } else {
          this.reports = [];
          this.filteredReports = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('API error:', err);
        this.reports = [];
        this.filteredReports = [];
        this.loading = false;
      },
    });
  }

  filterByStatus() {
    if (!this.selectedStatus) {
      this.filteredReports = [...this.reports];
    } else {
      this.filteredReports = this.reports.filter(
        report => report.status === this.selectedStatus
      );
    }
  }

  getProfileImageUrl(profilePictureUrl: string, profileImage: string): string {
    // First try to use profile_Picture_url if available
    if (profilePictureUrl && profilePictureUrl.trim() !== '') {
      return profilePictureUrl;
    }

    // Fallback to constructing URL from profileImage
    if (profileImage && profileImage.trim() !== '') {
      return `${environment.apiUrl.replace('/api/', '')}/images/${profileImage}`;
    }

    // Default avatar if no image available
    return 'https://www.w3schools.com/howto/img_avatar.png';
  }

  exportExcel() {
    const exportData = this.filteredReports.map(row => ({
      'Member ID': row.member_Id,
      'Name': row.name,
      'Phone Number': row.phone_Number,
      'Father Name': row.father_Name,
      'District': row.district,
      'Date of Birth': row.date_Of_Birth,
      'Status': row.status,
      'Family Members': row.familyMembers,
      'Address': row.address,
      'Zone': row.zoneCode
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `Print_Module_Report_${new Date().getTime()}.xlsx`);
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((c) => c.header)],
      body: this.filteredReports.map((row) => this.cols.map((c) => {
        // Handle special fields
        if (c.field === 'profileImage' || c.field === 'qrCodeURL') {
          return ''; // Skip images in PDF
        }
        return row[c.field] || '-';
      })),
      theme: 'grid',
      styles: { fontSize: 8 },
    });
    doc.save(`GCC_Report_${new Date().getTime()}.pdf`);
  }

  viewImage(imageUrl: string) {
    this.selectedImage = imageUrl;
    this.displayImageDialog = true;
  }

  viewQRCode(qrCodeUrl: string) {
    this.selectedQRCode = qrCodeUrl;
    this.displayQRDialog = true;
  }

  generateQRCodeLink(memberId: string): string {
  // Construct Angular route URL for QR
  return `${window.location.origin}/officers/applications/member-view/${memberId}`;
}
}
