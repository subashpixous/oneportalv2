// src/app/features/report/corporation-report/corporation-report.component.ts
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-corporation-report',
  template: `
    <app-report-viewer
      reportType="corporation"
      apiUrl="${environment.apiUrl}/Report/ByCorporationReport"
      title="Corporation Wise Report"
    ></app-report-viewer>
  `
})
export class CorporationReportComponent {}