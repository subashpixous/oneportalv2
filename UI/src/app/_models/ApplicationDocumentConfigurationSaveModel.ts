import { AuditColumnsModel } from './utils';

export interface ApplicationDocumentConfigurationSaveModel {
  id: string;
  schemeId: string;
  documentGroupId: string;
  documentCategoryId: string;
  isRequired: boolean;
  isActive: boolean;
  scheme?: string;
  community?: string;
}
export interface ConfigurationGeneralModel extends AuditColumnsModel {
  id: string;
  configName: string;
  configDesc: string;
  configKey: string;
  configValue: string;
}
export interface MemberDocumentSaveModel {
  documentCategoryIds: string[];
}
