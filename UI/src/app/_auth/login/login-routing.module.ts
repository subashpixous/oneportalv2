import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { ApplicantLoginComponent } from './applicant-login/applicant-login.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'applicant',
        component: ApplicantLoginComponent,
                 data: {
    breadcrumb: 'Member Login'
  }
      },
         {
        path: 'applicant/:param',   // <-- accept path parameter
        component: ApplicantLoginComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
