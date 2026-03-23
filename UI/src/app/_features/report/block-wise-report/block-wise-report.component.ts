import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-block-wise-report',
  template: `
    <app-report-viewer
      reportType="block"
       apiUrl="${environment.apiUrl}/Report/ByBlock"
      title="Block Wise Report"
    ></app-report-viewer>
  `
})
export class BlockWiseReportComponent {}