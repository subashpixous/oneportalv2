import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicantsRoutingModule } from './applicants-routing.module';
import { HomeComponent } from './home/home.component';
import { EligibilityComponent } from './eligibility/eligibility.component';
import { UiModule } from '../shared/ui/ui.module';
import { SchemeComponent } from './scheme/scheme.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DatatableModule } from '../shared/datatable/datatable.module';
import { NgxPrintModule } from 'ngx-print';
import { ViewComponent } from './scheme/view/view.component';
import { CommonViewModule } from '../shared/common/common.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UserLookupComponent } from './user-lookup/user-lookup.component';
import { OtpLoginComponent } from './otp-login/otp-login.component';
import { MemberDashboardComponent } from './member-dashboard/member-dashboard.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberDetailDashboardComponent } from './member-detail-dashboard/member-detail-dashboard.component';
import { SchemeListComponent } from './scheme-list/scheme-list.component';
import { SchemeGroupsComponent } from './scheme-groups/scheme-groups.component';
import { DynamicSchemeComponent } from './scheme/dynamic-scheme/dynamic-scheme.component';
import { MemberDataUpdateComponent } from './member-data-update/member-data-update.component';
import { MemberIdCardComponent } from './member-id-card/member-id-card.component';
import { MemberHistoryComponent } from './member-history/member-history.component';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { WorkerloginComponent } from './workerlogin/workerlogin.component';
import { DatacheckerLoginComponent } from './datachecker-login/datachecker-login.component';
import { SchemeLoginComponent } from './scheme-login/scheme-login.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';


@NgModule({
  declarations: [
    HomeComponent,
    EligibilityComponent,
    SchemeComponent,
    DashboardComponent,
    ViewComponent,
    UserLookupComponent,
    OtpLoginComponent,
    MemberDashboardComponent,
    MemberDetailComponent,
    MemberDetailDashboardComponent,
    SchemeListComponent,
    SchemeGroupsComponent,
    DynamicSchemeComponent,
    MemberDataUpdateComponent,
    MemberIdCardComponent,
    MemberHistoryComponent,
    WorkerloginComponent,
    DatacheckerLoginComponent,
    SchemeLoginComponent,

  ],
  imports: [
    CommonModule,
    ApplicantsRoutingModule,
    UiModule,
    DatatableModule,
    ConfirmDialogModule,
    NgxPrintModule,
    CommonViewModule,
    AvatarModule,
    BadgeModule,
    DialogModule
  ],
   
  exports: [
    MemberIdCardComponent  
  ],
  providers: [ConfirmationService, DialogService],
})
export class ApplicantsModule {}
