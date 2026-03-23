import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import {
  ConfigSchemeGroupModel,
  ConfigSchemeGroupSaveModel,
} from 'src/app/_models/schemeConfigModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { privileges } from 'src/app/shared/commonFunctions';
import fileList from '../../../../assets/group-images/file-list.json';

@UntilDestroy()
@Component({
  selector: 'app-scheme-group',
  templateUrl: './scheme-group.component.html',
  styleUrls: ['./scheme-group.component.scss'],
})
export class SchemeGroupComponent {
  configurationList!: ConfigSchemeGroupModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  schemeIcons: TCModel[] = [];
  schemeList: TCModel[] = [];

  actions: Actions[] = [];
  title: string = 'Group';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'groupName';
  defaultSortOrder: number = 1;

  privleges = privileges;
  icons = fileList;
  groupForm!: FormGroup;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private schemeConfigService: SchemeConfigService,
    private generalService: GeneralService
  ) {}
  ngOnInit() {
    this.getgroups(this.currentStatus);
    this.groupForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      groupName: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(3),
      ]),
      groupNameTamil: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(3),
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.maxLength(2000),
        Validators.minLength(3),
      ]),
      schemeIds: new FormControl(null, [Validators.required]),
      groupImage: new FormControl(null, [Validators.required]),
    });
    this.cols = [
      {
        field: 'groupName',
        header: 'group Name',
        customExportHeader: 'group Name',
        sortablefield: 'groupName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'groupNameTamil',
        header: 'Group Name (Tamil)',
        sortablefield: 'groupNameTamil',
        isSortable: true,
        isSearchable: true,
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
        // TODO  privilege: privileges.group_UPDATE,
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        // TODO privilege: privileges.group_Delete,
      },
    ];
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'SCHEME',
      })
      .subscribe((x) => {
        this.schemeList = x.data;
      });
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'SCHEME',
      })
      .subscribe((x) => {
        this.schemeList = x.data;
      });
  }
  getgroups(status: boolean) {
    this.schemeConfigService.Config_Scheme_Group_Get(status).subscribe((x) => {
      if (x) {
        this.configurationList = x.data;
      }
    });
  }
  changeStatus(val: boolean) {
    this.getgroups(!val);
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          // TODO privilege: privileges.group_UPDATE,
        },
        {
          icon: 'pi pi-times',
          title: 'In-Activate',
          type: 'INACTIVATE',
          // TODO privilege: privileges.group_Delete,
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
          // TODO  privilege: privileges.group_UPDATE,
        },
      ];
    }
  }
  resetForm() {
    this.groupForm.reset();
    this.groupForm.get('id')?.patchValue(Guid.raw());
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.savegroup({
        ...val.record,
        isActive: false,
      });
    } else if (val && val.type == 'EDIT') {
      this.groupForm.get('id')?.patchValue(val.record.id);
      this.groupForm
        .get('groupNameTamil')
        ?.patchValue(val.record.groupNameTamil);
      this.groupForm.get('groupName')?.patchValue(val.record.groupName);
      this.groupForm.get('description')?.patchValue(val.record.description);
      this.groupForm.get('schemeIds')?.patchValue(val.record.schemeIdsList);
      this.groupForm.get('groupImage')?.patchValue(val.record.groupImage);
    } else if (val && val.type == 'ACTIVATE') {
      this.savegroup({
        ...val.record,
        isActive: true,
      });
    }
  }
  submit() {
    this.savegroup({
      id: this.groupForm.get('id')?.value,
      groupName: this.groupForm.get('groupName')?.value,
      groupNameTamil: this.groupForm.get('groupNameTamil')?.value,
      isActive: true,
      schemeIdsList: this.groupForm.get('schemeIds')?.value,
      groupImage: this.groupForm.get('groupImage')?.value,
      schemeIds: undefined,
      description: this.groupForm.get('description')?.value,
    });
  }
  savegroup(obj: ConfigSchemeGroupSaveModel) {
    this.schemeConfigService.Config_Scheme_Group_Save(obj).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.groupForm.get('id')?.patchValue(Guid.raw());
        this.groupForm.get('groupName')?.reset();
        this.groupForm.get('groupNameTamil')?.reset();
        this.groupForm.get('description')?.reset();
        this.groupForm.get('schemeIds')?.reset();
        this.groupForm.get('groupImage')?.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: x?.message,
        });
        this.getgroups(this.currentStatus);
      }
    });
  }
  ngOnDestroy() {}
}
