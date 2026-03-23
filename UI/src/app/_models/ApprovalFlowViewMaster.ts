export interface ApprovalFlowViewMaster {
  id: string;
  roleId: string;
  orderNumber: number;
  isNA: boolean;
  approvalFlowId: string;
  returnFlowId: string;
  isFinal: boolean;
  isActive: boolean;
  roleName: string;
  roleCode: string;
  approvalFlowRoleName: string;
  approvalFlowRoleCode: string;
  returnFlowRoleName: string;
  returnFlowRoleCode: string;
  lastUpdatedBy: string;
  lastUpdatedUserName: string;
  lastUpdatedDate: string | null;
}
export interface ApprovalFlowAddRoleModel {
  roleIds: string[];
  schemeId: string;
}
export interface ApprovalFlowNewViewMaster {
  id: string;
  roleId: string;
  schemeId: string;
  orderNumber: number;
}
export interface ApprovalFlowNewViewMaster {
  id: string;
  roleId: string;
  orderNumber: number;
}
export interface SchemeStatusMappingViewModel {
  schemeId: string;
  statusId: string;
  status: string;
  sortOrder: number;
  isDisabled: boolean;
}

export interface SchemeStatusMappingSaveModel {
  schemeId: string;
  statusIds: string[];
}

export interface ConfigSchemeStatusMappingModel {
  id: string;
  schemeId: string;
  statusId: string;
  sortOrder: number;
  schemeName: string;
  schemeCode: string;
  statusName: string;
  statusCode: string;
  isDisabled: boolean;
}
export interface DocumentGroupConfigurationOrderModel {
  schemeId: string;
  documentGroupId: string;
  documentGroupName: string;
  sortOrder: number;
}
export interface SchemeGroupOrderingModel {
  id: string;
  groupName: string;
  groupNameTamil: string;
  groupNameEnglish: string;
  sortOrder: number;
}

export interface SchemeOrderingModel {
  id: string;
  schemeName: string;
  schemeNameEnglish: string;
  schemeNameTamil: string;
  sortOrder: number;
}
export interface CardPrintStatusOrderModel {
  id: string;
  sortOrder: number;
}
