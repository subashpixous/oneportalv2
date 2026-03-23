import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { AccountPrivilegeByGroupModel } from 'src/app/_models/AccountPrivilegeFormModel';
import {
  ApplicationPrivilegeViewModel,
  RolePrivilegeModel,
} from 'src/app/_models/Application.PrivelegeModel';
import { ApprovalFlowViewMaster } from 'src/app/_models/ApprovalFlowViewMaster';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-application-privilege',
  templateUrl: './application-privilege.component.html',
  styleUrls: ['./application-privilege.component.scss'],
})
export class ApplicationPrivilegeComponent {
  title: string = 'Application Privileges';
  schemes!: ApprovalFlowViewMaster[];
  selectedscheme!: string;
  privileges!: ApplicationPrivilegeViewModel[];
  userPermissions!: string[];
  privleges = privileges;
  constructor(
    private messageService: MessageService,
    private generalService: GeneralService,
    private roleService: RoleService,
    private cookieService: CookieService,
    private router: Router
  ) {}
  ngOnInit() {
    const privillage: any = this.cookieService.get('privillage');
    if (privillage) {
      this.userPermissions = privillage.split(',');
    }
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'SCHEME' })
      .subscribe((x) => {
        if (x) {
          this.schemes = x.data;
          if (x.data.length > 0) {
            this.getPrivileges(x.data[0].value);
            this.selectedscheme = x.data[0].value;
          }
        }
      });
  }
  getPrivileges(schemeid: string) {
    this.roleService.ApplicationPrivilegeFormGet(schemeid).subscribe((x) => {
      this.selectedscheme = schemeid;
      this.privileges = x.data;
    });
  }
  savePrivileges(obj: RolePrivilegeModel) {
    this.roleService.ApplicationPrivilegeForm_Save(obj).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
        this.getPrivileges(this.selectedscheme);
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
  changeEvent(val: any, rec: RolePrivilegeModel) {
    this.savePrivileges({
      id: rec.id,
      role: rec.role,
      roleId: rec.roleId,
      schemeId: rec.schemeId,
      statusId: rec.statusId,
      canCreate: rec.canCreate,
      canUpdate: rec.canUpdate,
      canView: rec.canView,
      canDelete: rec.canDelete,
      canApprove: rec.canApprove,
      canGetMail: rec.canGetMail,
      canGetSMS: rec.canGetSMS,
      canReturn: rec.canReturn,
      ucView: rec.ucView,
      ucUpload: rec.ucUpload,
      form3View: rec.form3View,
      form3Upload: rec.form3Upload,
    });
  }
  back() {
    this.router.navigateByUrl('/officers/configuration/role');
  }
  ngOnDestroy() {}

  getPerm(privleges: any) {
    if (typeof privleges == 'string') {
      return this.userPermissions.includes(privleges);
    } else if (typeof privleges == 'object') {
      return this.userPermissions.find((x) => privleges.includes(x));
    } else {
      return true;
    }
  }
}
