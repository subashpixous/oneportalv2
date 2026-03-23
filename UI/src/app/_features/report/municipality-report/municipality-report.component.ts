import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-municipality-report',
  template: `
    <app-report-viewer
      reportType="municipality"
       apiUrl="${environment.apiUrl}/Report/ByMunicipalityReport"
      title="Municipality Wise Report"
    ></app-report-viewer>
  `
})
export class MunicipalityReportComponent {

}