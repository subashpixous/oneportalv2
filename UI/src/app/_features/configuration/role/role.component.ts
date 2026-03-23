import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { privileges } from 'src/app/shared/commonFunctions';
import { AccountRoleViewModel } from 'src/app/_models/AccountRoleViewModel';
import { RoleService } from 'src/app/services/role.service';
import { UiModule } from '../../../shared/ui/ui.module';
import { DatatableModule } from '../../../shared/datatable/datatable.module';

@UntilDestroy()
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  providers: [TitleCasePipe],
})
export class RoleComponent {
  configurationList!: AccountRoleViewModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Role';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'roleName';
  defaultSortOrder: number = 1;

  privleges = privileges;
  roleForm!: FormGroup;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private titlecasePipe: TitleCasePipe
  ) {}
  ngOnInit() {
    this.getRoles('', this.currentStatus);
    this.roleForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      roleName: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(3),
      ]),
      code: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(2),
      ]),
      isUrbanRural: new FormControl(false), // ✅ default OFF
    });
    this.cols = [
      {
        field: 'roleName',
        header: 'Role Name',
        customExportHeader: 'Role Name',
        sortablefield: 'roleName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'roleCode',
        header: 'Role Code',
        sortablefield: 'roleCode',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'isUrbanRural',
        header: 'Urban/Rural Login', // Friendly column name
        sortablefield: 'isUrbanRural',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'lastUpdatedUserName',
        header: 'Updated By',
        sortablefield: 'lastUpdatedUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'lastUpdatedDate',
        header: 'Updated Date',
        sortablefield: 'lastUpdatedDate',
        isSortable: true,
      },
    ];
    this.searchableColumns = this.cols
      .filter((x) => x.isSearchable == true)
      .flatMap((x) => x.field);

    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        visibilityCheckFeild: 'isChangeable',
        privilege: privileges.ROLE_UPDATE,
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        visibilityCheckFeild: 'isChangeable',
        privilege: privileges.ROLE_Delete,
      },
    ];
  }
  getRoles(roleid: string, status: boolean) {
    this.roleService.Role_Get(roleid, status).subscribe((x) => {
      if (x) {
        this.configurationList = x.data.map((item: any) => ({
          ...item,
          isUrbanRural: item.isUrbanRural ? 'Yes' : 'No',
        }));
      }
    });
  }
  changeStatus(val: boolean) {
    this.getRoles('', !val);
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          visibilityCheckFeild: 'isChangeable',
          privilege: privileges.ROLE_UPDATE,
        },
        {
          icon: 'pi pi-times',
          title: 'In-Activate',
          type: 'INACTIVATE',
          visibilityCheckFeild: 'isChangeable',
          privilege: privileges.ROLE_Delete,
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
          privilege: privileges.ROLE_UPDATE,
        },
      ];
    }
  }
  resetForm() {
    this.roleForm.reset();
    this.roleForm.get('id')?.patchValue(Guid.raw());
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.saverole({
        ...val.record,
        isActive: false,
        isUrbanRural: val.record.isUrbanRural === 'Yes' ? true : false,
      });
    } else if (val && val.type == 'EDIT') {
      this.roleForm.get('id')?.patchValue(val.record.id);
      this.roleForm.get('roleName')?.patchValue(val.record.roleName);
      this.roleForm
        .get('isUrbanRural')
        ?.patchValue(val.record.isUrbanRural === 'Yes');
      this.roleForm.get('code')?.patchValue(val.record.roleCode);
    } else if (val && val.type == 'ACTIVATE') {
      this.saverole({
        ...val.record,
        isActive: true,
      });
    }
  }
  submit() {
    this.saverole({
      id: this.roleForm.get('id')?.value,
      roleName: this.roleForm.get('roleName')?.value,
      roleCode: this.roleForm.get('code')?.value?.toUpperCase(),
      isUrbanRural: this.roleForm.get('isUrbanRural')?.value,
      isActive: true,
      isChangeable: true,
    });
  }
  saverole(obj: any) {
    this.roleService.saveRole(obj).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.roleForm.get('id')?.patchValue(Guid.raw());
        this.roleForm.get('roleName')?.reset();
        this.roleForm.get('code')?.reset();
        this.roleForm.get('isUrbanRural')?.reset();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: x?.message,
        });
        this.getRoles('', this.currentStatus);
      }
    });
  }
  setPrivileges() {
    this.router.navigateByUrl('/officers/configuration/role-privilege');
  }
  ngOnDestroy() {}
}
