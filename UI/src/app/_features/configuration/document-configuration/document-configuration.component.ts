import { group } from '@angular/animations';
import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { AccountRoleViewModel } from 'src/app/_models/AccountRoleViewModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { DocumentService } from 'src/app/services/document.Service';
import { GeneralService } from 'src/app/services/general.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-document-configuration',
  templateUrl: './document-configuration.component.html',
  styleUrls: ['./document-configuration.component.scss'],
})
export class DocumentConfigurationComponent {
  configurationList!: AccountRoleViewModel[];
  cols!: Column[];
  schemes!: any[];
  groups!: any[];
  documentCategories!: string[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Document Configuration';
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
    private documentService: DocumentService,
    private generalService: GeneralService,
    private route: ActivatedRoute
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
        CategoryCode: 'DOCUMENTGROUP',
      })
      .subscribe((x) => {
        this.groups = x.data;
      });
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'SCHEME',
      })
      .subscribe((x) => {
        this.schemes = x.data;
      });
    this.roleForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      scheme: new FormControl('', [Validators.required]),
      group: new FormControl('', [Validators.required]),
      documentCategory: new FormControl('', [Validators.required]),
      isRequired: new FormControl(true, [Validators.required]),
    });
    this.cols = [
      {
        field: 'documentGroupName',
        header: 'Document Group',
        customExportHeader: 'Document Group',
        sortablefield: 'documentGroupName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'documentCategory',
        header: 'Document Category',
        sortablefield: 'documentCategory',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'isRequired',
        header: 'Is Required',
        sortablefield: 'isRequired',
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
    this.roleForm.controls['scheme'].valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .Document_Configuration_Get('', x, '', this.currentStatus)
          .subscribe((x) => {
            this.configurationList = x.data;
          });
      }
    });
    this.getRoles();
  }
  getRoles() {
    this.generalService
      .Document_Configuration_Get(
        '',
        this.roleForm.get('scheme')?.value,
        '',
        this.currentStatus
      )
      .subscribe((x) => {
        this.configurationList = x.data;
      });
  }
  changeStatus(val: boolean) {
    this.getRoles();
    this.currentStatus = !val;
    if (!val) {
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
  resetForm() {
    this.roleForm.reset();
    this.roleForm.get('id')?.patchValue(Guid.raw());
    this.roleForm.get('isRequired')?.patchValue(true);
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.saverole({
        ...val.record,
        isActive: false,
      });
    } else if (val && val.type == 'EDIT') {
      this.roleForm.get('id')?.patchValue(val.record.id);
      this.roleForm.get('scheme')?.patchValue(val.record.schemeId);
      this.roleForm.get('group')?.patchValue(val.record.documentGroupId);
      this.roleForm
        .get('documentCategory')
        ?.patchValue(val.record.documentCategoryId);
      this.roleForm.get('isRequired')?.patchValue(val.record.isRequired);
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
      isActive: true,
      schemeId: this.roleForm.get('scheme')?.value,
      documentGroupId: this.roleForm.get('group')?.value,
      documentCategoryId: this.roleForm.get('documentCategory')?.value,
      isRequired: this.roleForm.get('isRequired')?.value,
    });
  }
  saverole(obj: any) {
    this.generalService
      .Document_Configuration_SaveUpdate({
        id: obj.id,
        isActive: obj.isActive,
        schemeId: obj.schemeId,
        documentGroupId: obj.documentGroupId,
        documentCategoryId: obj.documentCategoryId,
        isRequired: obj.isRequired,
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
          this.getRoles();
        } else if (x) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Saved Successfully',
          });
          this.resetForm();
          this.roleForm.get('scheme')?.patchValue(obj.schemeId);
          this.getRoles();
        }
      });
  }
  ngOnDestroy() {}
}
