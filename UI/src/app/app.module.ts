import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  CommonModule,
  DatePipe,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { AuthRoutingModule } from './_auth/auth-routing.module';
import { FeatureModule } from './_features/feature.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { PipeModuleModule } from './shared/pipe-module/pipe-module.module';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { HomefooterComponent } from './shared/homelayout/homefooter/homefooter.component';
import { HomeheaderComponent } from './shared/homelayout/homeheader/homeheader.component';
import { HomelayoutComponent } from './shared/homelayout/homelayout.component';
import { ApplicantsModule } from './applicants/applicants.module';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { LoaderInterceptor } from './_helpers/loader.interceptor';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { NgxPrintModule } from 'ngx-print';
import { MkkViewComponent } from './shared/common/mkk-view/mkk-view.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { InputTextModule } from 'primeng/inputtext';
import { ErrMsgCompComponent } from './shared/homelayout/err-msg-comp/err-msg-comp.component';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from "primeng/menu";
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    HomefooterComponent,
    HomeheaderComponent,
    HomelayoutComponent,
    ErrMsgCompComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PipeModuleModule,
    AppRoutingModule,
    HttpClientModule,
    AppLayoutModule,
    MessagesModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ProgressSpinnerModule,
    NgxPermissionsModule.forRoot(),
    AuthRoutingModule,
    RadioButtonModule,
    FormsModule,
    ButtonModule,
    ApplicantsModule,
    RadioButtonModule,
    NgxPrintModule,
    NgApexchartsModule,
    DialogModule,
    MenuModule,
    DynamicDialogModule
],
  exports: [HomelayoutComponent, HomefooterComponent, HomeheaderComponent],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    DatePipe, // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
