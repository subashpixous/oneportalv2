import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MkkViewComponent } from 'src/app/shared/common/mkk-view/mkk-view.component';
import { CallLetterComponent } from './call-letter.component';
import { CallLetterCreateComponent } from './call-letter-create/call-letter-create.component';
import { CallLetterPrintComponent } from './call-letter-print/call-letter-print.component';
import { privileges } from 'src/app/shared/commonFunctions';

const routes: Routes = [
  {
    path: 'create',
    data: {
      privileges: [privileges.CALLLETTER_CREATE],
    },
    component: CallLetterCreateComponent,
  },
  {
    path: 'create/:id',
    data: {
      privileges: [privileges.CALLLETTER_CREATE, privileges.CALLLETTER_EDIT],
    },
    component: CallLetterCreateComponent,
  },
  {
    path: 'print/:id',
    component: CallLetterPrintComponent,
  },
  {
    path: 'create/:id/:type',
    data: {
      privileges: [privileges.CALLLETTER_CREATE, privileges.CALLLETTER_EDIT],
    },
    component: CallLetterCreateComponent,
  },
  {
    path: '',
    data: {
      privileges: [privileges.CALLLETTER_VIEW],
    },
    component: CallLetterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallLetterRoutingModule {}
