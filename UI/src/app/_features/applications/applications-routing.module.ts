import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MkkViewComponent } from 'src/app/shared/common/mkk-view/mkk-view.component';
import { ApplicationsComponent } from './applications.component';
import { MkkViewPrintComponent } from 'src/app/shared/common/mkk-view-print/mkk-view-print.component';
import { SchemeViewComponent } from './scheme-view/scheme-view.component';
import { SchemeApprovalViewComponent } from './scheme-approval-view/scheme-approval-view.component';
import { SchemeComponent } from 'src/app/applicants/scheme/scheme.component';
import { AuthGuard } from 'src/app/_helpers/auth.guard';
import { privileges } from 'src/app/shared/commonFunctions';
import { DynamicSchemeComponent } from 'src/app/applicants/scheme/dynamic-scheme/dynamic-scheme.component';
import { MemSchemeViewPrintComponent } from 'src/app/shared/common/mem-scheme-view-print/mem-scheme-view-print.component';
import { MemberUpdateApprovalComponent } from './member-update-approval/member-update-approval.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { MemberViewComponent } from './member-view/member-view.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { MemberApprovalHistoryComponent } from './member-approval-history/member-approval-history.component';
import { MemberCardApprovalComponent } from './member-card-approval/member-card-approval.component';
import { MemberCardApprovalEditComponent } from './member-card-approval-edit/member-card-approval-edit.component';
import { ApplicationReportComponent } from './application-report/application-report.component';
import { MemberApprovalLayoutComponent } from './application-report/member-approval-layout/member-approval-layout.component';
import { MemCardApproveViewComponent } from './application-report/mem-card-approve-view/mem-card-approve-view.component';

const routes: Routes = [
  {
    path: 'view/:id',
    component: SchemeViewComponent,
    data: {
      privileges: [privileges.APPLICATION_VIEW],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/:id/:index',
    component: DynamicSchemeComponent,
    data: {
      privileges: [privileges.APPLICATION_VIEW],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'approve/:id',
    component: SchemeApprovalViewComponent,
    data: {
      privileges: [privileges.APPLICATION_VIEW],
    },
    canActivate: [AuthGuard],
  },
    {
  path: 'member-card-view/:id',
  component: MemCardApproveViewComponent
},
  {
    path: 'view-print/:id',
    component: MemSchemeViewPrintComponent,
    data: {
      privileges: [privileges.APPLICATION_VIEW],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'update-approval/:id/:memberid',
    component: MemberUpdateApprovalComponent,
    data: {
      privileges: [privileges.MEMBER_APPROVE],
    },
    canActivate: [AuthGuard],
  },
      {
      path: 'new-update-approvallay/:id/:memberid',
      component: MemberApprovalLayoutComponent,
      data: {
        privileges: [privileges.MEMBER_APPROVE],
      },
      canActivate: [AuthGuard],
    },
  {
    path: 'delete-approval/:id/:memberid',
    component: MemberUpdateApprovalComponent,
    data: {
      privileges: [privileges.MEMBER_APPROVE],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'member-view/:id',
    component: MemberViewComponent,
    data: {
      privileges: [privileges.MEMBER_VIEW],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'member-edit/:id/:index',
    component: MemberEditComponent,
    data: {
      privileges: [privileges.MEMBER_UPDATE],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'approval',
    component: ApprovalsComponent,
    data: {
      privileges: [privileges.MEMBER_APPROVE],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'daily-report',
    component: ApplicationReportComponent,
    data: {
      privileges: [privileges.MEMBER_DAILY_ENTRY],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'approval-history',
    component: MemberApprovalHistoryComponent,
    data: {
      privileges: [privileges.MEMBER_APPROVAL_HISTORY],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'card-approval/:id/:memberid',
    component: MemberCardApprovalEditComponent,
    data: {
      privileges: [privileges.CARD_APPROVAL_APPROVE],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'card-approval',
    component: MemberCardApprovalComponent,
    data: {
      privileges: [privileges.CARD_APPROVAL_VIEW],
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'applications',
    data: {
      privileges: [privileges.APPLICATION_VIEW,privileges.APPLICATION_MEMBER_VIEW],
    },
    canActivate: [AuthGuard],
    component: ApplicationsComponent,
  },

  {
    path: '',
    redirectTo: 'applications',
    pathMatch: 'full',
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationsRoutingModule {}
