export interface AccountRoleViewModel {
  id: string;
  roleName: string;
  roleCode: string;
  isActive: boolean;
  isChangeable: boolean;

  lastUpdatedBy: string;
  lastUpdatedUserName: string;
  lastUpdatedDate: string;
}

export interface AccountRolePrivilegeViewModel {
  rolePrivilegeId: string;
  roleId: string;
  privilegeId: string;
}

export interface AccountPrivilegeViewModel {
  privilegeId: string;
  moduleName: string;
  privilegeCode: string;
  privilege: string;
  privilegeType: string;
  isActive: boolean;
}
