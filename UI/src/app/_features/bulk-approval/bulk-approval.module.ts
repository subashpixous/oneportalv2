import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BulkApprovalRoutingModule } from './bulk-approval-routing.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxPrintModule } from 'ngx-print';
import { CommonViewModule } from 'src/app/shared/common/common.module';
import { DatatablePaginationModule } from 'src/app/shared/datatable-pagination/datatable-pagination.module';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { BulkApprovalComponent } from './bulk-approval.component';
import { DatatableModule } from 'src/app/shared/datatable/datatable.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, BulkApprovalRoutingModule, UiModule, DatatableModule],
})
export class BulkApprovalModule {}
