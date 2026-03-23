import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AccessComponent } from './_auth/access/access.component';
import { PrivacyPolicyComponent } from './_auth/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './_auth/terms-conditions/terms-conditions.component';
import { HomelayoutComponent } from './shared/homelayout/homelayout.component';
import { AuthGuard } from './_helpers/auth.guard';
import { HelpDocumentComponent } from './_auth/help-document/help-document.component';
import { MemDetailQrviewComponent } from './shared/common/mem-detail-qrview/mem-detail-qrview/mem-detail-qrview.component';

const routes: Routes = [
  {
    path: '',
    component: HomelayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'applicant',
        pathMatch: 'full',
      },
      {
        path: 'applicant',
        loadChildren: () =>
          import('./applicants/applicants.module').then(
            (m) => m.ApplicantsModule
          ),
      },
      { path: 'help/:id', component: HelpDocumentComponent , data: {
    breadcrumb: 'Help-Documents'
  }},
     
    ],
  },
  {
    path: 'officers',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./_features/feature.module').then((m) => m.FeatureModule),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./_auth/auth.module').then((m) => m.AuthModule),
  },
  { path: 'notaccess', component: AccessComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: 'termsandconditions', component: TermsConditionsComponent },
  {
    path: 'member-qr-view/:id',
    component:MemDetailQrviewComponent
  },
  { path: '**', redirectTo: '/notfound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
