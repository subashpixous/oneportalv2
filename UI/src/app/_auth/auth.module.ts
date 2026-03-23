import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { Message, MessageService } from 'primeng/api';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { RouterModule } from '@angular/router';
import { HelpDocumentComponent } from './help-document/help-document.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { UiModule } from '../shared/ui/ui.module';
import { FormsModule } from '@angular/forms';
import { FilterDocsPipe } from './help-document/filter-docs.pipe';

@NgModule({
  imports: [CommonModule, AuthRoutingModule, RouterModule, UiModule],
  providers: [MessageService],
  declarations: [
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    HelpDocumentComponent,
    DocumentViewerComponent,
    FilterDocsPipe
  ],
})
export class AuthModule {
  msgs: Message[] = [];
}
