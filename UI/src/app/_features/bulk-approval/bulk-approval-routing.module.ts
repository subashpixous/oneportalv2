import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_helpers/auth.guard';
import { privileges } from 'src/app/shared/commonFunctions';
import { ApplicationsComponent } from '../applications/applications.component';
import { BulkApprovalComponent } from './bulk-approval.component';

const routes: Routes = [
  {
    path: '',
    data: {
      privileges: [privileges.APPLICATION_VIEW],
    },
    canActivate: [AuthGuard],
    component: BulkApprovalComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkApprovalRoutingModule {}
