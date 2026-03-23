import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-scheme-configuration',
  templateUrl: './scheme-configuration.component.html',
  styleUrls: ['./scheme-configuration.component.scss'],
})
export class SchemeConfigurationComponent {
  configurationList!: any[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Scheme Detail Configuration';
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
    private generalService: GeneralService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.getSchemes('', this.currentStatus);
    this.cols = [
      {
        field: 'text',
        header: 'Scheme Name',
        customExportHeader: 'Role Name',
        sortablefield: 'text',
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
        privilege: privileges.CONFIG_VIEW,
      },
    ];
  }
  getSchemes(roleid: string, status: boolean) {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'SCHEME' })
      .subscribe((x) => {
        if (x) {
          this.configurationList = x.data;
        }
      });
  }
  changeStatus(val: boolean) {
    this.getSchemes('', !val);
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          privilege: privileges.CONFIG_UPDATE,
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
          privilege: privileges.CONFIG_UPDATE,
        },
      ];
    }
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
    } else if (val && val.type == 'EDIT') {
      this.router.navigate([
        'officers/configuration/scheme-detail-config',
        val.record.value,
      ]);
    } else if (val && val.type == 'ACTIVATE') {
    }
  }
  ngOnDestroy() {}
}
