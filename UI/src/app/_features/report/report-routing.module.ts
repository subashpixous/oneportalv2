import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportChartsComponent } from './report-charts/report-charts.component';
import { SummaryReportComponent } from './summary-report/summary-report.component';
import { GccreportComponent } from './gccreport/gccreport.component';
import { DistrictWiseCountreportComponent } from './district-wise-countreport/district-wise-countreport.component';
import { CoreSanitaryWorkersReportComponent } from './core-sanitary-workers-report/core-sanitary-workers-report.component';
import { BlockWiseReportComponent } from './block-wise-report/block-wise-report.component';
import { CorporationReportComponent } from './corporation-report/corporation-report.component';
import { VillagePanchayatReportComponent } from './village-panchayat-report/village-panchayat-report.component';
import { ReportsTabViewComponent } from './reports-tab-view/reports-tab-view.component';
import { PrintInprogressComponent } from './print-inprogress/print-inprogress.component';
import { MemberApplySchemeCountComponent } from './member-apply-scheme-count/member-apply-scheme-count.component';
import { SchemeGccReportComponent } from './scheme-gcc-report/scheme-gcc-report.component';
import { SchemeCostReportComponent } from './scheme-cost-report/scheme-cost-report.component';
import { CardDisbursedComponent } from './card-disbursed/card-disbursed.component';
import { CardsSentComponent } from './cards-sent/cards-sent.component';
import { CardCollectionReportComponent } from './card-collection-report/card-collection-report.component';
import { PrintModuleReportComponent } from './print-module-report/print-module-report.component';
import { CardApprovalHistoryComponent } from './card-approval-history/card-approval-history.component';
import { DatewiseApprovalReportComponent } from './datewise-approval-report/datewise-approval-report.component';

const routes: Routes = [
  { path: '', component: ReportFiltersComponent },
  { path: 'charts', component: ReportChartsComponent },
  { path: 'summary', component: SummaryReportComponent },
  { path: 'gccreport', component: GccreportComponent },
  { path: 'districtwisecount', component: DistrictWiseCountreportComponent },
  {
    path: 'coresanitaryworkers',
    component: CoreSanitaryWorkersReportComponent,
  },
  { path: 'blockwise', component: BlockWiseReportComponent },
  { path: 'corporation', component: CorporationReportComponent },
  { path: 'village', component: VillagePanchayatReportComponent },
  { path: 'reports', component: ReportsTabViewComponent },
  { path: 'report-inprogress', component: PrintInprogressComponent },
  { path: 'PrintCompleted', component: CardDisbursedComponent },
  { path: 'card-collection', component: CardCollectionReportComponent },
  { path: 'printcard', component: PrintModuleReportComponent },
  { path: 'Cardssent', component: CardsSentComponent },
  { path: 'memberapplyscheme', component: MemberApplySchemeCountComponent },
  { path: 'gccscheme', component: SchemeGccReportComponent },
  { path: 'gcccost', component: SchemeCostReportComponent },
  { path: 'card-approval-history', component: CardApprovalHistoryComponent },
  {
    path: 'Date-wise-approval-history',
    component: DatewiseApprovalReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
