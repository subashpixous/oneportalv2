export interface ApplicationPrivilegeViewModel {
  status: string;
  statusId: string;
  statusCode: string;
  schemeId: string;
  sortOrder: number;
  options: RolePrivilegeModel[];
}
export interface RolePrivilegeModel {
  id: string;
  role: string;
  roleId: string;
  schemeId: string;
  statusId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canView: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canGetMail: boolean;
  canGetSMS: boolean;
  canReturn: boolean;
  ucView: boolean;
  ucUpload: boolean;
  form3View: boolean;
  form3Upload: boolean;
}
