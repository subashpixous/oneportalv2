import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { ReportRoutingModule } from './report-routing.module';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportTablesComponent } from './report-tables/report-tables.component';
import { ReportChartsComponent } from './report-charts/report-charts.component';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartComponent } from './chart/chart.component';
import { ReportDocumentsComponent } from './report-documents/report-documents.component';
import { DatatablePaginationModule } from 'src/app/shared/datatable-pagination/datatable-pagination.module';
import { ReportStatusComponent } from './report-status/report-status.component';
import { ReportFormthreeComponent } from './report-formthree/report-formthree.component';
import { ReportUcComponent } from './report-uc/report-uc.component';
import { SummaryReportComponent } from './summary-report/summary-report.component';
import { DatatableModule } from '../../shared/datatable/datatable.module';
import { GccreportComponent } from './gccreport/gccreport.component';
import { DistrictWiseCountreportComponent } from './district-wise-countreport/district-wise-countreport.component';
import { CoreSanitaryWorkersReportComponent } from './core-sanitary-workers-report/core-sanitary-workers-report.component';
import { BlockWiseReportComponent } from './block-wise-report/block-wise-report.component';
import { CorporationReportComponent } from './corporation-report/corporation-report.component';
import { VillagePanchayatReportComponent } from './village-panchayat-report/village-panchayat-report.component';
import { ReportsTabViewComponent } from './reports-tab-view/reports-tab-view.component';
import { ReportViewerComponent } from './shared/report-viewer/report-viewer.component';
import { MunicipalityReportComponent } from './municipality-report/municipality-report.component';
import { PrintInprogressComponent } from './print-inprogress/print-inprogress.component';
import { MemberApplySchemeCountComponent } from './member-apply-scheme-count/member-apply-scheme-count.component';
import { SchemeGccReportComponent } from './scheme-gcc-report/scheme-gcc-report.component';
import { SchemeCostReportComponent } from './scheme-cost-report/scheme-cost-report.component';
import { CardDisbursedComponent } from './card-disbursed/card-disbursed.component';
import { CardsSentComponent } from './cards-sent/cards-sent.component';
import { CardCollectionReportComponent } from './card-collection-report/card-collection-report.component';
import { PrintModuleReportComponent } from './print-module-report/print-module-report.component';
import { IdCardStatusComponent } from '../id-card-status/id-card-status.component';
import { CommonViewModule } from "src/app/shared/common/common.module";
import { DatewiseApprovalReportComponent } from './datewise-approval-report/datewise-approval-report.component';


@NgModule({
  declarations: [
    ReportFiltersComponent,
    ReportTablesComponent,
    ReportChartsComponent,
    ChartComponent,
    ReportDocumentsComponent,
    ReportStatusComponent,
    ReportFormthreeComponent,
    ReportUcComponent,
    SummaryReportComponent,
    GccreportComponent,
    DistrictWiseCountreportComponent,
    CoreSanitaryWorkersReportComponent,
    BlockWiseReportComponent,
    CorporationReportComponent,
    VillagePanchayatReportComponent,
    ReportsTabViewComponent,
    ReportViewerComponent,
    MunicipalityReportComponent,
    PrintInprogressComponent,
    MemberApplySchemeCountComponent,
    SchemeGccReportComponent,
    SchemeCostReportComponent,
    CardDisbursedComponent,
    CardsSentComponent,CardCollectionReportComponent,
    PrintModuleReportComponent,
    IdCardStatusComponent,
    DatewiseApprovalReportComponent,
    

  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    UiModule,
    QRCodeModule,
    DatatablePaginationModule,
    NgxPermissionsModule.forChild(),
    NgApexchartsModule,
    DatatableModule,
    CommonViewModule
],
})
export class ReportModule {}
