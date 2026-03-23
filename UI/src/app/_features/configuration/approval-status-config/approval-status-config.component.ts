import { Component } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { AccountRoleViewModel } from 'src/app/_models/AccountRoleViewModel';
import { ConfigApprovalDocCategorySaveModel } from 'src/app/_models/ConfigurationModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-approval-status-config',
  templateUrl: './approval-status-config.component.html',
  styleUrls: ['./approval-status-config.component.scss'],
})
export class ApprovalStatusConfigComponent {
  title: string = 'Status Document Configuration';
  schemes!: TCModel[];
  selectedscheme!: string;
  statuses!: ApprovalDocConfigViewModel[];
  userPermissions!: string[];
  privleges = privileges;
  statusForm!: FormGroup;
  visible: boolean = false;

  defaultstatus = false;
  roleForm!: FormGroup;
  documentCategories!: string[];
  configurationList!: any[];

  cols!: Column[];
  searchableColumns!: string[];
  currentStatus: boolean = true;
  actions: Actions[] = [];
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'roleName';
  defaultSortOrder: number = 1;

  get f() {
    return this.statusForm.controls;
  }
  get t() {
    return this.f['statuses'] as FormArray;
  }
  get statusList() {
    return this.t.controls as FormGroup[];
  }
  constructor(
    private messageService: MessageService,
    private generalService: GeneralService,
    private schemeConfigService: SchemeConfigService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private router: Router
  ) {}
  ngOnInit() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'DOCUMENTCATEGORY',
      })
      .subscribe((x) => {
        this.documentCategories = x.data;
      });
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'SCHEME',
      })
      .subscribe((x) => {
        this.schemes = x.data;
        this.selectedscheme = x.data[0];
      });
    const privillage: any = this.cookieService.get('privillage');
    if (privillage) {
      this.userPermissions = privillage.split(',');
    }
    this.statusForm = this.formBuilder.group({
      statuses: new FormArray([]),
    });
    this.schemeConfigService
      .Config_Scheme_Approval_Doc_Config_Get(this.selectedscheme)
      .subscribe((x) => {
        this.generateDefaultRows(x.data);
      });

    this.roleForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      schemeId: new FormControl('', [Validators.required]),
      statusId: new FormControl('', [Validators.required]),
      docCategoryId: new FormControl('', [Validators.required]),
      isRequired: new FormControl(true, [Validators.required]),
    });
    this.cols = [
      {
        field: 'docCategory',
        header: 'Document Category',
        sortablefield: 'docCategory',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'isRequiredStr',
        header: 'Is Required',
        sortablefield: 'isRequiredStr',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'modifiedByUserName',
        header: 'Updated By',
        sortablefield: 'modifiedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'modifiedDate',
        header: 'Updated Date',
        sortablefield: 'modifiedDate',
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
        privilege: privileges.CONFIG_UPDATE,
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        privilege: privileges.CONFIG_DELETE,
      },
    ];
  }
  getRoles(statusId: string, schemeId: string) {
    this.generalService
      .Config_Approval_Doc_Category_Get(schemeId, statusId, '')
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.configurationList = x.data;
          this.configurationList.map((x) => {
            x.isRequiredStr = x.isRequired ? 'YES' : 'NO';
          });
        }
      });
  }
  showform(statusId: string, schemeId: string) {
    this.visible = true;
    this.roleForm.get('statusId')?.patchValue(statusId);
    this.roleForm.get('id')?.patchValue(Guid.raw());
    this.roleForm.get('schemeId')?.patchValue(schemeId);
    this.getRoles(statusId, schemeId);
  }
  resetForm() {
    this.roleForm.reset();
    this.roleForm.get('id')?.patchValue(Guid.raw());
    this.roleForm.get('isRequired')?.patchValue(true);
  }
  submit() {
    var obj: ConfigApprovalDocCategorySaveModel = {
      id: this.roleForm.get('id')?.value,
      schemeId: this.roleForm.get('schemeId')?.value,
      statusId: this.roleForm.get('statusId')?.value,
      docCategoryId: this.roleForm.get('docCategoryId')?.value,
      isRequired: this.roleForm.get('isRequired')?.value,
      isActive: true,
    };
    this.saveDocumenttype(obj);
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.saveDocumenttype({
        ...val.record,
        isActive: false,
      });
    } else if (val && val.type == 'EDIT') {
      this.roleForm.get('id')?.patchValue(val.record.id);
      this.roleForm.get('scheme')?.patchValue(val.record.schemeId);
      this.roleForm.get('statusId')?.patchValue(val.record.statusId);
      this.roleForm.get('docCategoryId')?.patchValue(val.record.docCategoryId);
      this.roleForm.get('isRequired')?.patchValue(val.record.isRequired);
    } else if (val && val.type == 'ACTIVATE') {
      this.saveDocumenttype({
        ...val.record,
        isActive: true,
      });
    }
  }
  saveDocumenttype(obj: ConfigApprovalDocCategorySaveModel) {
    this.generalService
      .Config_Approval_Doc_Category_Save({
        id: obj.id,
        schemeId: obj.schemeId,
        statusId: obj.statusId,
        docCategoryId: obj.docCategoryId,
        isRequired: obj.isRequired,
        isActive: obj.isActive,
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: x?.message,
          });
          this.roleForm.get('docCategoryId')?.patchValue('');
          this.roleForm.get('id')?.patchValue(Guid.raw());
          this.getRoles(obj.statusId, obj.schemeId);
        }
      });
  }

  save(itemrow: any) {
    this.schemeConfigService
      .Config_Scheme_Approval_Doc_Config_Save(itemrow.value)
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: x?.message,
          });
        }
      });
  }
  changeScheme(event: any) {
    this.schemeConfigService
      .Config_Scheme_Approval_Doc_Config_Get(event)
      .subscribe((x) => {
        this.generateDefaultRows(x.data);
      });
  }
  generateDefaultRows(templateMilestones: ApprovalDocConfigViewModel[]) {
    if (this.t) {
      this.t.clear();
    }
    if (templateMilestones) {
      templateMilestones.forEach((x) => {
        this.t.push(
          this.formBuilder.group({
            mappingId: [x.mappingId, Validators.required],
            statusId: [x.statusId, [Validators.required]],
            statusName: [x.statusName, [Validators.required]],
            documentLabel: [x.documentLabel, [Validators.required]],
            isAssertVerificationStatus: [x.isAssertVerificationStatus],
            isDocumentRequired: [x.isDocumentRequired],
            sortOrder: [x.sortOrder],
          })
        );
      });
    }
  }
}
export interface ApprovalDocConfigViewModel {
  mappingId: string;
  statusId: string;
  statusName: string;
  documentLabel: string;
  isAssertVerificationStatus: boolean;
  isDocumentRequired: boolean;
  sortOrder: number;
}
