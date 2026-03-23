import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationComponent } from './configuration.component';
import { RoleComponent } from './role/role.component';
import { RolePrivilegeComponent } from './role-privilege/role-privilege.component';
import { ApprovalFlowComponent } from './approval-flow/approval-flow.component';
import { AreaConfigurationComponent } from './area-configuration/area-configuration.component';
import { DocumentConfigurationComponent } from './document-configuration/document-configuration.component';
import { SubsidyConfigurationComponent } from './subsidy-configuration/subsidy-configuration.component';
import { ApplicationPrivilegeComponent } from './application-privilege/application-privilege.component';
import { BankBranchComponent } from './bank-branch/bank-branch.component';
import { SchemeConfigComponent } from './scheme-config/scheme-config.component';
import { privileges } from 'src/app/shared/commonFunctions';
import { DistrictConfigComponent } from './district-config/district-config.component';
import { SchemeConfigurationComponent } from './scheme-configuration/scheme-configuration.component';
import { SchemeConfigDetailsComponent } from './scheme-configuration/scheme-config-details/scheme-config-details.component';
import { SchemeGeneralConfigComponent } from './scheme-configuration/scheme-general-config/scheme-general-config.component';
import { SchemeSubsidyLimitComponent } from './scheme-configuration/scheme-subsidy-limit/scheme-subsidy-limit.component';
import { SchemeCostConfigComponent } from './scheme-configuration/scheme-cost-config/scheme-cost-config.component';
import { SchemeFeildConfigComponent } from './scheme-configuration/scheme-feild-config/scheme-feild-config.component';
import { HelpDocumentsComponent } from './help-documents/help-documents.component';
import { ApprovalStatusConfigComponent } from './approval-status-config/approval-status-config.component';
import { SchemeGroupComponent } from './scheme-group/scheme-group.component';
import { SchemeScholarshipComponent } from './scheme-configuration/scheme-scholarship/scheme-scholarship.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'role',
    component: RoleComponent,
    data: {
      privileges: [privileges.ROLE_VIEW],
    },
  },
  {
    path: 'district',
    component: DistrictConfigComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'role-privilege',
    component: RolePrivilegeComponent,
    data: {
      privileges: [privileges.ROLE_SET_PRIVILEGE],
    },
  },
  {
    path: 'app-privilege',
    component: ApplicationPrivilegeComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'scheme-configuration',
    component: SchemeConfigComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'status-doc',
    component: ApprovalStatusConfigComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'scheme-detail-config',
    component: SchemeConfigurationComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'help-doc-config',
    component: HelpDocumentsComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'scheme-group',
    component: SchemeGroupComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'scheme-detail-config/:id',
    component: SchemeConfigDetailsComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: 'general', component: SchemeGeneralConfigComponent },
      { path: 'subsidy-limit', component: SchemeSubsidyLimitComponent },
      { path: 'manage-feild', component: SchemeFeildConfigComponent },
      { path: 'cost-Validation', component: SchemeCostConfigComponent },
      {
        path: 'scheme-scholarship',
        component: SchemeScholarshipComponent,
      },
    ],
  },
  {
    path: 'bank-branch',
    component: BankBranchComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'approval-flow',
    component: ApprovalFlowComponent,
    data: {
      privileges: [privileges.APPROVALFLOW_VIEW],
    },
  },
  {
    path: 'general',
    component: AreaConfigurationComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'document',
    component: DocumentConfigurationComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
  {
    path: 'subsidy',
    component: SubsidyConfigurationComponent,
    data: {
      privileges: [privileges.CONFIG_VIEW],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigurationRoutingModule {}
