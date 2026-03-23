export interface AccountPrivilegeFormModel {
  privilegeId: string;
  privilege: string;
  privilegeCode: string;
  privilegeType: string;
  isActive: boolean;
  isSelected: boolean;
  moduleName: string;
  orderNumber: number;
}

export interface AccountPrivilegeByGroupModel {
  roleId: string;
  moduleName: string;
  privilege: AccountPrivilegeFormModel[];
}

export interface AccountPrivilegeSaveViewModel {
  roleId: string;
  privilegeId: string;
  isSelected: boolean;
}

export interface AccountPrivilegeSaveModel {
  rolePrivilegeId: string;
  roleId: string;
  privilegeId: string;
  isSelected: boolean;
  savedBy: string;
  savedByUserName: string;
  savedDate: string;
}
