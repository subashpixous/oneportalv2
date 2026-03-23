import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-village-panchayat-report',
  template: `
    <app-report-viewer
      reportType="village"
       apiUrl="${environment.apiUrl}/Report/ByVillagePanchayatReport"
      title="VillagePanchayat Wise Report"
    ></app-report-viewer>
  `
})
export class VillagePanchayatReportComponent {

}