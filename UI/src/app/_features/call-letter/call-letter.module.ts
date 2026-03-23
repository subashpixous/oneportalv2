import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallLetterComponent } from './call-letter.component';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { DatatablePaginationModule } from 'src/app/shared/datatable-pagination/datatable-pagination.module';
import { CallLetterCreateComponent } from './call-letter-create/call-letter-create.component';
import { CallLetterRoutingModule } from './call-letter-routing.module';
import { DatatableModule } from '../../shared/datatable/datatable.module';
import { CallLetterPrintComponent } from './call-letter-print/call-letter-print.component';
import { NgxPrintModule } from 'ngx-print';
import { NgxPermissionsModule } from 'ngx-permissions';

@NgModule({
  declarations: [
    CallLetterComponent,
    CallLetterCreateComponent,
    CallLetterPrintComponent,
  ],
  imports: [
    CommonModule,
    CallLetterRoutingModule,
    UiModule,
    DatatablePaginationModule,
    DatatableModule,
    NgxPrintModule,
    NgxPermissionsModule.forChild(),
  ],
})
export class CallLetterModule {}
