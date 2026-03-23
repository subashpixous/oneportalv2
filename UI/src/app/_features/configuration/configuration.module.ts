import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationComponent } from './configuration.component';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { DatatableModule } from '../../shared/datatable/datatable.module';
import { RoleComponent } from './role/role.component';
import { RolePrivilegeComponent } from './role-privilege/role-privilege.component';
import { ApprovalFlowComponent } from './approval-flow/approval-flow.component';
import { DocumentConfigurationComponent } from './document-configuration/document-configuration.component';
import { SubsidyConfigurationComponent } from './subsidy-configuration/subsidy-configuration.component';
import { AreaConfigurationComponent } from './area-configuration/area-configuration.component';
import { ApplicationPrivilegeComponent } from './application-privilege/application-privilege.component';
import { BankBranchComponent } from './bank-branch/bank-branch.component';
import { SchemeConfigComponent } from './scheme-config/scheme-config.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { DistrictConfigComponent } from './district-config/district-config.component';
import { SchemeConfigurationComponent } from './scheme-configuration/scheme-configuration.component';
import { SchemeConfigDetailsComponent } from './scheme-configuration/scheme-config-details/scheme-config-details.component';
import { SchemeGeneralConfigComponent } from './scheme-configuration/scheme-general-config/scheme-general-config.component';
import { SchemeCostConfigComponent } from './scheme-configuration/scheme-cost-config/scheme-cost-config.component';
import { SchemeFeildConfigComponent } from './scheme-configuration/scheme-feild-config/scheme-feild-config.component';
import { SchemeSubsidyLimitComponent } from './scheme-configuration/scheme-subsidy-limit/scheme-subsidy-limit.component';
import { HelpDocumentsComponent } from './help-documents/help-documents.component';
import { ApprovalStatusConfigComponent } from './approval-status-config/approval-status-config.component';
import { SchemeScholarshipComponent } from './scheme-configuration/scheme-scholarship/scheme-scholarship.component';
import { SchemeGroupComponent } from './scheme-group/scheme-group.component';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    ConfigurationComponent,
    RoleComponent,
    RolePrivilegeComponent,
    ApprovalFlowComponent,
    DocumentConfigurationComponent,
    SubsidyConfigurationComponent,
    AreaConfigurationComponent,
    ApplicationPrivilegeComponent,
    BankBranchComponent,
    SchemeConfigComponent,
    DistrictConfigComponent,
    SchemeConfigurationComponent,
    SchemeConfigDetailsComponent,
    SchemeGeneralConfigComponent,
    SchemeCostConfigComponent,
    SchemeFeildConfigComponent,
    SchemeSubsidyLimitComponent,
    HelpDocumentsComponent,
    ApprovalStatusConfigComponent,
    SchemeScholarshipComponent,
    SchemeGroupComponent,
  ],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    UiModule,
    DatatableModule,
    NgxPermissionsModule.forChild(),
  ],
  providers: [MessageService],
})
export class ConfigurationModule {}
