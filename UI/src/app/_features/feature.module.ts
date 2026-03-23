import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureRoutingModule } from './feature-routing.module';
import { UiModule } from '../shared/ui/ui.module';
import { DatatablePaginationModule } from '../shared/datatable-pagination/datatable-pagination.module';
import { UserComponent } from './user/user.component';
import { UserCreateComponent } from './user/user-create/user-create.component';
import { CommonViewModule } from '../shared/common/common.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { KeyContactsComponent } from './key-contacts/key-contacts.component';
import { DatatableModule } from '../shared/datatable/datatable.module';
import { UserUploadComponent } from './user/user-upload/user-upload.component';
import { BulkApprovalComponent } from './bulk-approval/bulk-approval.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FeedbackComponent } from './user/feedback/feedback.component';
import { MemberUploadComponent } from './user/member-upload/member-upload.component';
import { FindDuplicatesComponent } from './find-duplicates/find-duplicates.component';
import { AnimatorsEntriesComponent } from './animators-entries/animators-entries.component';
import { UserLogReportComponent } from './user-log-report/user-log-report.component';
import { LogReportComponent } from './log-report/log-report.component';
import { SavedDeletionComponent } from './saved-deletion/saved-deletion.component';
import { FamilymemberUploadComponent } from './user/familymember-upload/familymember-upload.component';

@NgModule({
  declarations: [
    UserComponent,
    UserCreateComponent,
    KeyContactsComponent,
    UserUploadComponent,
    BulkApprovalComponent,
    FeedbackComponent,
    MemberUploadComponent,
    FindDuplicatesComponent,
    AnimatorsEntriesComponent,
    UserLogReportComponent,
    LogReportComponent,
    SavedDeletionComponent,
    FamilymemberUploadComponent
  ],
  imports: [
    CommonModule,
    FeatureRoutingModule,
    UiModule,
    DatatablePaginationModule,
    CommonViewModule,
    NgxPermissionsModule.forChild(),
    DatatableModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
})
export class FeatureModule {}
