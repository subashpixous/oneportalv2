import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdCardStatusComponent } from './id-card-status.component';

const routes: Routes = [
  { path: '', component: IdCardStatusComponent }   
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdCardStatusRoutingModule { }

