import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApplicationsRoutingModule } from './applications-routing.module';
import { ApplicationsComponent } from './applications.component';
import { SchemeViewComponent } from './scheme-view/scheme-view.component';
import { CommonViewModule } from 'src/app/shared/common/common.module';
import { DatatablePaginationModule } from '../../shared/datatable-pagination/datatable-pagination.module';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { SchemeApprovalViewComponent } from './scheme-approval-view/scheme-approval-view.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxPrintModule } from 'ngx-print';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberUpdateApprovalComponent } from './member-update-approval/member-update-approval.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { MemberViewComponent } from './member-view/member-view.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { MemberApprovalHistoryComponent } from './member-approval-history/member-approval-history.component';
import { DatatableModule } from 'src/app/shared/datatable/datatable.module';
import { MemberCardApprovalComponent } from './member-card-approval/member-card-approval.component';
import { MemberCardApprovalEditComponent } from './member-card-approval-edit/member-card-approval-edit.component';
import { ApplicationReportComponent } from './application-report/application-report.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    ApplicationsComponent,
    SchemeViewComponent,
    SchemeApprovalViewComponent,
    MemberListComponent,
    MemberUpdateApprovalComponent,
    ApprovalsComponent,
    MemberViewComponent,
    MemberEditComponent,
    MemberApprovalHistoryComponent,
    MemberCardApprovalComponent,
    MemberCardApprovalEditComponent,
    ApplicationReportComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ApplicationsRoutingModule,
    CommonViewModule,
    UiModule,
    NgxPrintModule,
    DatatablePaginationModule,
    ConfirmDialogModule,
    NgxPermissionsModule.forChild(),
    DatatableModule,
    ButtonModule,
    SelectButtonModule,
  ],
})
export class ApplicationsModule {}
