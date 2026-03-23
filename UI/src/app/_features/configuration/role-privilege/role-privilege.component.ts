import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { AccountPrivilegeByGroupModel } from 'src/app/_models/AccountPrivilegeFormModel';
import { ApprovalFlowViewMaster } from 'src/app/_models/ApprovalFlowViewMaster';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { RoleService } from 'src/app/services/role.service';

@UntilDestroy()
@Component({
  selector: 'app-role-privilege',
  templateUrl: './role-privilege.component.html',
  styleUrls: ['./role-privilege.component.scss'],
})
export class RolePrivilegeComponent {
  title: string = 'Privileges';
  roles!: ApprovalFlowViewMaster[];
  selectedRoles!: string;
  privileges!: AccountPrivilegeByGroupModel[];
  constructor(
    private messageService: MessageService,
    private roleService: RoleService,
    private router: Router
  ) {}
  ngOnInit() {
    this.roleService.Role_Get('', true).subscribe((x) => {
      if (x) {
        this.roles = x.data;
        if (x.data.length > 0) {
          this.getPrivileges(x.data[0].id);
          this.selectedRoles = x.data[0].id;
        }
      }
    });
  }
  getPrivileges(roleid: string) {
    this.roleService.getRolePrivileges(roleid).subscribe((x) => {
      this.selectedRoles = roleid;
      this.privileges = x.data;
    });
  }
  savePrivileges(obj: any) {
    this.roleService.saveRolePrivilege(obj).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
        this.getPrivileges(this.selectedRoles);
      } else if (x) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: x?.message,
        });
      }
    });
  }
  changeRole(val: any) {
    this.getPrivileges(val.value);
  }
  changeEvent(val: any, id: string) {
    if (val.checked) {
      this.savePrivileges({
        privilegeId: id,
        roleId: this.selectedRoles,
        isSelected: true,
      });
    } else {
      this.savePrivileges({
        privilegeId: id,
        roleId: this.selectedRoles,
        isSelected: false,
      });
    }
  }
  back() {
    this.router.navigateByUrl('/officers/configuration/role');
  }
  ngOnDestroy() {}
}
