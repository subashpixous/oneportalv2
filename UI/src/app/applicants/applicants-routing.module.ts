import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EligibilityComponent } from './eligibility/eligibility.component';
import { SchemeComponent } from './scheme/scheme.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../_helpers/auth.guard';
import { MkkViewComponent } from '../shared/common/mkk-view/mkk-view.component';
import { ViewComponent } from './scheme/view/view.component';
import { UserLookupComponent } from './user-lookup/user-lookup.component';
import { OtpLoginComponent } from './otp-login/otp-login.component';
import { MemberDashboardComponent } from './member-dashboard/member-dashboard.component';
import { MemberDetailDashboardComponent } from './member-detail-dashboard/member-detail-dashboard.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { SchemeGroupsComponent } from './scheme-groups/scheme-groups.component';
import { SchemeListComponent } from './scheme-list/scheme-list.component';
import { DynamicSchemeComponent } from './scheme/dynamic-scheme/dynamic-scheme.component';
import { MemberHistoryComponent } from './member-history/member-history.component';
import { MemberIdCardComponent } from './member-id-card/member-id-card.component';
import { MemberDataUpdateComponent } from './member-data-update/member-data-update.component';
import { MemDetailViewComponent } from '../shared/common/mem-detail-view/mem-detail-view.component';
import { MemberEditComponent } from '../_features/applications/member-edit/member-edit.component';
import { WorkerloginComponent } from './workerlogin/workerlogin.component';
import { DatacheckerLoginComponent } from './datachecker-login/datachecker-login.component';
import { SchemeLoginComponent } from './scheme-login/scheme-login.component';
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'eligibility/:id',
    component: EligibilityComponent,
         data: {
    breadcrumb: 'Eligible Scheme'
  }
  },
  {
    path: 'scheme',
    component: SchemeComponent,
  },
  {
    path: 'lookup',
    component: UserLookupComponent,
  },
  {
    path: 'otp-login',
    component: OtpLoginComponent,
  },
  {
    path: 'mem-dashboard',
    component: MemberDashboardComponent,
  },
  {
    path: 'mem-detail-dashboard',
    component: MemberDetailDashboardComponent,
  },
  {
    path: 'mem-detail-view/:id',
    component: MemDetailViewComponent,
                data: {
    breadcrumb: 'Member Detail View'
  }
  },
  {
    path: 'mem-detail/:id/:index',
    component: MemberDetailComponent,
                 data: {
    breadcrumb: 'Member Data'
  }
  },
  {
    path: 'scheme-group',
    component: SchemeGroupsComponent,
  },
  {
    path: 'scheme-list/:id',
    component: SchemeListComponent,
  },
  {
    path: 'view/:id',
    component: ViewComponent,
                     data: {
    breadcrumb: 'Application View'
  }
  },
  {
    path: 'scheme/:id',
    component: SchemeComponent,
  },
  {
    path: 'scheme/:id/:index',
    component: SchemeComponent,
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent,
                 data: {
    breadcrumb: 'Availed Schemes'
  }
  },

  {
    path: 'd-scheme/:id',
    component: DynamicSchemeComponent,
             data: {
    breadcrumb: 'Eligible Scheme'
  }
  },
  {
    path: 'member-data-update/:id',
    component: MemberDataUpdateComponent,
         data: {
    breadcrumb: 'Member-Data-Update'
  }
  },
  {
    path: 'member-id-card/:id',
    component: MemberIdCardComponent,
         data: {
    breadcrumb: 'Member IDCard'
  }
  },
  {
    path: 'member-history/:id',
    component: MemberHistoryComponent,
         data: {
    breadcrumb: 'Member History'
  }
  },
    {
    path: 'workerlogin',
    component: WorkerloginComponent,
     data: {
    breadcrumb: 'Member Registration'
  }
  },
     {
    path: 'data-checker-login',
    component: DatacheckerLoginComponent,
     data: {
    breadcrumb: 'TNCWWB Login'
  }
  },
       {
    path: 'scheme-login',
    component: SchemeLoginComponent,
     data: {
    breadcrumb: 'Scheme-Login'
  }
  },

  {
    path: 'login',
    loadChildren: () =>
      import('../_auth/auth.module').then((m) => m.AuthModule),
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicantsRoutingModule {
  
}
