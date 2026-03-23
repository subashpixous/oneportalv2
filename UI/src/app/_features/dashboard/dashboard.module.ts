import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { DatatableModule } from 'src/app/shared/datatable/datatable.module';
import { DatatablePaginationModule } from '../../shared/datatable-pagination/datatable-pagination.module';
import { CommonViewModule } from '../../shared/common/common.module';
import { NgxPermissionsModule } from 'ngx-permissions';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    UiModule,
    DatatableModule,
    DatatablePaginationModule,
    CommonViewModule,
    NgxPermissionsModule.forChild(),
  ],
})
export class DashboardModule {}
