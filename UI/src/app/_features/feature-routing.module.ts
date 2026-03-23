import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserCreateComponent } from './user/user-create/user-create.component';
import { UserComponent } from './user/user.component';
import { privileges } from '../shared/commonFunctions';
import { KeyContactsComponent } from './key-contacts/key-contacts.component';
import { UserUploadComponent } from './user/user-upload/user-upload.component';
import { FeedbackComponent } from './user/feedback/feedback.component';
import { MemberUploadComponent } from './user/member-upload/member-upload.component';
import { FindDuplicatesComponent } from './find-duplicates/find-duplicates.component';
import { AnimatorsEntriesComponent } from './animators-entries/animators-entries.component';
import { UserLogReportComponent } from './user-log-report/user-log-report.component';
import { LogReportComponent } from './log-report/log-report.component';
import { SavedDeletionComponent } from './saved-deletion/saved-deletion.component';
import { FamilymemberUploadComponent } from './user/familymember-upload/familymember-upload.component';

const routes: Routes = [
  {
    path: '',
    data: {
      privileges: [privileges.DASHBOARD_VIEW],
    },
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'id-card-status',
    data: {
      privileges: [privileges.CARD_DASHBOARD_VIEW],
    },
    loadChildren: () =>
      import('./id-card-status/id-card-status.module').then(
        (m) => m.IdCardStatusModule
      ),
  },

  {
    path: 'applications',
    data: {
      privileges: [privileges.APPLICATION_VIEW],
    },
    loadChildren: () =>
      import('./applications/applications.module').then(
        (m) => m.ApplicationsModule
      ),
  },
  {
    path: 'bulk-approvals',
    data: {
      privileges: [privileges.APPLICATION_VIEW],
    },
    loadChildren: () =>
      import('./bulk-approval/bulk-approval-routing.module').then(
        (m) => m.BulkApprovalRoutingModule
      ),
  },
  {
    path: 'call-letter',
    data: {
      privileges: [privileges.CALLLETTER_VIEW],
    },
    loadChildren: () =>
      import('./call-letter/call-letter.module').then(
        (m) => m.CallLetterModule
      ),
  },
  {
    path: 'key-contacts',
    component: KeyContactsComponent,
  },
  {
     path: 'saved-deletion',
     component: SavedDeletionComponent,
  },
  {
    path: 'report',
    data: {
      privileges: [privileges.REPORT_VIEW],
    },
    loadChildren: () =>
      import('./report/report.module').then((m) => m.ReportModule),
  },
  {
    path: 'duplicates',
    data: {
      privileges: [privileges.Remove_Duplicates],
    },
    component: FindDuplicatesComponent,
  },
  {
    path: 'Animator-Entries', // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries
    data: {
      privileges: [privileges.ANIMATOR_REPORT_VIEW],
    },
    component: AnimatorsEntriesComponent,
  },
    {
    path: 'User-log-report',   // Updated by sivasankar On 11/12/2025 for user log report
    data: {
      privileges: [privileges.REPORT_VIEW],
    },
    component: UserLogReportComponent,
  },
     {
    path: 'Log-report',   // Updated by sivasankar On 11/12/2025 for user log report
    data: {
      privileges: [privileges.REPORT_VIEW],
    },
    component: LogReportComponent,
  },
  {
    path: 'Card status',
    data: {
      privileges: [privileges.CARD_STATUS_REPORT],
    },
    loadChildren: () =>
      import('./report/report.module').then((m) => m.ReportModule),
  },
  {
    path: 'configuration',
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
    loadChildren: () =>
      import('./configuration/configuration.module').then(
        (m) => m.ConfigurationModule
      ),
  },
  {
    path: 'user',
    data: {
      privileges: [privileges.USER_VIEW],
    },
    component: UserComponent,
  },
  {
    path: 'user-upload',
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
    component: UserUploadComponent,
  },
  {
    path: 'member-upload',
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
    component: MemberUploadComponent,
  },
  {
    path: 'familymember-upload',
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
    component: FamilymemberUploadComponent,
  },
  {
    path: 'feedback',
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
    component: FeedbackComponent,
  },
  {
    path: 'user-create/:id/:type',
    data: {
      privileges: [privileges.USER_CREATE],
    },
    component: UserCreateComponent,
  },
  {
    path: 'applications-reports',
    loadChildren: () =>
      import('./applications-reports/applications.module').then(
        (m) => m.ApplicationsModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeatureRoutingModule {}
