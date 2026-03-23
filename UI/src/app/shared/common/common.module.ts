import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MkkViewComponent } from './mkk-view/mkk-view.component';
import { UiModule } from '../ui/ui.module';
import { NgxPrintModule } from 'ngx-print';
import { MkkViewPrintComponent } from './mkk-view-print/mkk-view-print.component';
import { MapViewComponent } from './map-view/map-view.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapView1Component } from './map-view1/map-view1.component';
import { UcUploadComponent } from './uc-upload/uc-upload.component';
import { FormThreeComponent } from './form-three/form-three.component';
import { DatatableModule } from '../datatable/datatable.module';
import { IconButtonComponent } from './icon-button/icon-button.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { OrganizationDetailComponent } from './organization-detail/organization-detail.component';
import { MemTempAddressComponent } from './mem-temp-address/mem-temp-address.component';
import { MemPermanentAddressComponent } from './mem-permanent-address/mem-permanent-address.component';
import { MemBankDetailComponent } from './mem-bank-detail/mem-bank-detail.component';
import { MemDocumentDetailComponent } from './mem-document-detail/mem-document-detail.component';
import { OrganizationDetailViewComponent } from './organization-detail-view/organization-detail-view.component';
import { MemTempAddressViewComponent } from './mem-temp-address-view/mem-temp-address-view.component';
import { MemPermanentAddressViewComponent } from './mem-permanent-address-view/mem-permanent-address-view.component';
import { MemBankDetailViewComponent } from './mem-bank-detail-view/mem-bank-detail-view.component';
import { MemDocumentDetailViewComponent } from './mem-document-detail-view/mem-document-detail-view.component';
import { MemPersonalDetailViewComponent } from './mem-personal-detail-view/mem-personal-detail-view.component';
import { MemPersonalDetailComponent } from './mem-personal-detail/mem-personal-detail.component';
import { MemFamilyDetailComponent } from './mem-family-detail/mem-family-detail.component';
import { MemFamilyDetailViewComponent } from './mem-family-detail-view/mem-family-detail-view.component';
import { CurrentUserTimeComponent } from './current-user-time/current-user-time.component';
import { MemWorkAddressViewComponent } from './mem-work-address-view/mem-work-address-view.component';
import { MemSchemeDetailViewComponent } from './mem-scheme-detail-view/mem-scheme-detail-view.component';
import { MemSchemeViewComponent } from './mem-scheme-view/mem-scheme-view.component';
import { MemSchemeViewPrintComponent } from './mem-scheme-view-print/mem-scheme-view-print.component';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MemPreReqComponent } from './mem-pre-req/mem-pre-req.component';
import { MemDetailViewComponent } from './mem-detail-view/mem-detail-view.component';
import { MemDetailViewPrintComponent } from './mem-detail-view-print/mem-detail-view-print.component';
import { DashboardCountCardComponent } from './dashboard-count-card/dashboard-count-card.component';
import { LoginPopupComponent } from './login-popup/login-popup.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { MemDetailQrviewComponent } from './mem-detail-qrview/mem-detail-qrview/mem-detail-qrview.component';
import { CardApprovalHistoryComponent } from 'src/app/_features/report/card-approval-history/card-approval-history.component';
import { DatatablePaginationModule } from 'src/app/shared/datatable-pagination/datatable-pagination.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MkkMemberViewComponent } from './mkk-member-view/mkk-member-view.component';
import { AddFamilyPopupComponent } from './add-family-popup/add-family-popup.component';
import { MemberCardPopupComponent } from './member-card-popup/member-card-popup.component';

@NgModule({
  declarations: [
    MkkViewComponent,
    MkkViewPrintComponent,
    MapViewComponent,
    MapView1Component,
    UcUploadComponent,
    FormThreeComponent,
    IconButtonComponent,
    BreadcrumbComponent,
    OrganizationDetailComponent,
    MemTempAddressComponent,
    MemPermanentAddressComponent,
    MemBankDetailComponent,
    MemDocumentDetailComponent,
    OrganizationDetailViewComponent,
    MemTempAddressViewComponent,
    MemPermanentAddressViewComponent,
    MemBankDetailViewComponent,
    MemDocumentDetailViewComponent,
    MemPersonalDetailViewComponent,
    MemPersonalDetailComponent,
    MemFamilyDetailComponent,
    MemFamilyDetailViewComponent,
    CurrentUserTimeComponent,
    MemWorkAddressViewComponent,
    MemSchemeDetailViewComponent,
    MemSchemeViewComponent,
    MemSchemeViewPrintComponent,

    MemPreReqComponent,
    MemDetailViewComponent,
    MemDetailViewPrintComponent,
    DashboardCountCardComponent,
    LoginPopupComponent,
    PdfViewerComponent,
    MemDetailQrviewComponent,
    CardApprovalHistoryComponent,
    MkkMemberViewComponent,
    AddFamilyPopupComponent,
    MemberCardPopupComponent
  ],
  imports: [
    CommonModule,
    UiModule,
    NgxPrintModule,
    GoogleMapsModule,
    ImageCropperModule,
    DatatableModule,
    TabViewModule,
    BadgeModule,
    AvatarModule,
    DatatablePaginationModule,
  ],
  exports: [
    MkkViewComponent,
    MkkViewPrintComponent,
    MapViewComponent,
    FormThreeComponent,
    IconButtonComponent,
    BreadcrumbComponent,
    OrganizationDetailComponent,
    MemTempAddressComponent,
    MemPermanentAddressComponent,
    MemBankDetailComponent,
    MemDocumentDetailComponent,
    OrganizationDetailViewComponent,
    MemTempAddressViewComponent,
    MemPermanentAddressViewComponent,
    MemBankDetailViewComponent,
    MemDocumentDetailViewComponent,
    MemPersonalDetailViewComponent,
    MemPersonalDetailComponent,
    MemFamilyDetailComponent,
    MemFamilyDetailViewComponent,
    CurrentUserTimeComponent,
    MemWorkAddressViewComponent,
    MemSchemeDetailViewComponent,
    MemSchemeViewComponent,
    MemSchemeViewPrintComponent,
    MemPreReqComponent,
    DashboardCountCardComponent,
    LoginPopupComponent,
    MemDetailViewPrintComponent,
    MemDetailQrviewComponent,
    CardApprovalHistoryComponent,
    AddFamilyPopupComponent,
    MemberCardPopupComponent   
  
  ],
})
export class CommonViewModule {}
export interface MemberInitSaveModel {
  id: string;
  first_Name: string;
  last_Name: string;
  email: string;
  phone_Number: string;
  otp: string;
  primaryDistrict: string;
}
