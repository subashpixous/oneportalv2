import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomelayoutComponent } from '../shared/homelayout/homelayout.component';
@NgModule({
  imports: [
    // RouterModule.forChild([
    //   {
    //     path: 'error',
    //     loadChildren: () =>
    //       import('./error/error.module').then((m) => m.ErrorModule),
    //   },
    //   {
    //     path: 'access',
    //     loadChildren: () =>
    //       import('./access/access.module').then((m) => m.AccessModule),
    //   },
    //   {
    //     path: 'login',
    //     loadChildren: () =>
    //       import('./login/login.module').then((m) => m.LoginModule),
    //   },
    //   {
    //     path: 'forgetPassword',
    //     loadChildren: () =>
    //       import('./forget-password/forget-password.module').then(
    //         (m) => m.ForgetPasswordModule
    //       ),
    //   },
    //   { path: '**', redirectTo: '/notfound' },
    // ]),
    RouterModule.forChild([
  {
    path: '',
    component: HomelayoutComponent,
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'forgetPassword',
        loadChildren: () =>
          import('./forget-password/forget-password.module').then(
            (m) => m.ForgetPasswordModule
          ),
      }
    ]
  },

  // These will NOT show header/footer
  {
    path: 'error',
    loadChildren: () =>
      import('./error/error.module').then((m) => m.ErrorModule),
  },
  {
    path: 'access',
    loadChildren: () =>
      import('./access/access.module').then((m) => m.AccessModule),
  },

  { path: '**', redirectTo: '/notfound' },
]),
  ],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
