import { TitleCasePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { Editor } from 'primeng/editor';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { ConfigurationSchemeCostFieldModel } from 'src/app/_models/schemeConfigModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-scheme-feild-config',
  templateUrl: './scheme-feild-config.component.html',
  styleUrls: ['./scheme-feild-config.component.scss'],
})
export class SchemeFeildConfigComponent {
  configurationList!: ConfigurationSchemeCostFieldModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = '';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'fieldName';
  defaultSortOrder: number = 1;

  privleges = privileges;
  fieldForm!: FormGroup;
  feilds!: TCModel[];
  schemeId!: string;
  @ViewChild('editor') editor!: Editor;
  constructor(
    private schemeConfigService: SchemeConfigService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.schemeId = params.get('id') ?? Guid.createEmpty().toString();
    });
    this.schemeConfigService
      .Scheme_Config_Form_Get(this.schemeId)
      .subscribe((x) => {
        this.feilds = x.data.costFields;
      });
    this.getFields();
    this.fieldForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      fieldName: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(3),
      ]),
      isRequired: new FormControl(true),
      isVisible: new FormControl(true),
      tooltip: new FormControl('', [Validators.required]),
    });
    this.cols = [
      {
        field: 'field',
        header: 'Field Name',
        customExportHeader: 'Field Name',
        sortablefield: 'field',
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
        field: 'isVisibleStr',
        header: 'Is Visible',
        sortablefield: 'isVisibleStr',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'tooltip',
        header: 'Tooltip',
        sortablefield: 'tooltip',
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
  getFields() {
    this.schemeConfigService
      .Config_Scheme_Cost_Fields_Get(this.schemeId)
      .subscribe((x) => {
        if (x) {
          this.configurationList = x.data;
          this.configurationList.map((x) => {
            x.isRequiredStr = x.isRequired ? 'YES' : 'NO';
            x.isVisibleStr = x.isVisible ? 'YES' : 'NO';
          });
        }
      });
  }
  changeStatus(val: boolean) {
    this.getFields();
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
    this.fieldForm.reset();
    this.fieldForm.get('id')?.patchValue(Guid.raw());
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.savefield({
        ...val.record,
        isActive: false,
      });
    } else if (val && val.type == 'EDIT') {
      this.fieldForm.get('id')?.patchValue(val.record.id);
      this.fieldForm.get('fieldName')?.patchValue(val.record.fieldId);
      this.fieldForm.get('isRequired')?.patchValue(val.record.isRequired);
      this.fieldForm.get('isVisible')?.patchValue(val.record.isVisible);
      this.fieldForm.get('tooltip')?.setValue(val.record.tooltip);
      this.fieldForm.get('tooltip')?.updateValueAndValidity();
      setTimeout(() => {
        if (this.editor) {
          this.editor.writeValue(val.record.tooltip);
          this.editor.quill.setText(val.record.tooltip);
          if (this.editor?.quill) {
            this.editor.quill.clipboard.dangerouslyPasteHTML(
              val.record.tooltip
            );
          }
        }
      }, 0);
    } else if (val && val.type == 'ACTIVATE') {
      this.savefield({
        ...val.record,
        isActive: true,
      });
    }
  }
  submit() {
    this.savefield({
      id: this.fieldForm.get('id')?.value,
      isActive: true,
      schemeId: this.schemeId,
      fieldId: this.fieldForm.get('fieldName')?.value,
      isRequired: this.fieldForm.get('isRequired')?.value,
      isVisible: this.fieldForm.get('isVisible')?.value,
      tooltip: this.fieldForm.get('tooltip')?.value,
    });
  }
  savefield(obj: ConfigurationSchemeCostFieldModel) {
    this.schemeConfigService
      .Config_Scheme_Cost_Fields_SaveUpdate(obj)
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.fieldForm.reset();
          this.fieldForm.get('id')?.patchValue(Guid.raw());
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: x?.message,
          });
          this.getFields();
        }
      });
  }
  ngOnDestroy() {}
}
