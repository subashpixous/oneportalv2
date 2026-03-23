import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { ConfigurationSchemeCostValidationModel } from 'src/app/_models/schemeConfigModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-scheme-cost-config',
  templateUrl: './scheme-cost-config.component.html',
  styleUrls: ['./scheme-cost-config.component.scss'],
})
export class SchemeCostConfigComponent {
  configurationList!: ConfigurationSchemeCostValidationModel[];
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
  conditions!: TCModel[];
  conditionalUnits!: TCModel[];
  feilds!: TCModel[];
  schemeId!: string;
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
        this.feilds = x.data.costFieldsWithTotal;
        this.conditionalUnits = x.data.units;
        this.conditions = x.data.conditions;
      });
    this.getFields(this.schemeId);
    this.fieldForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      checkfieldName: new FormControl(null, [Validators.required]),
      basefieldName: new FormControl(null),
      condition: new FormControl('', [Validators.required]),
      conditionValue: new FormControl('', [Validators.required]),
      conditionUnit: new FormControl('', [Validators.required]),
    });
    this.cols = [
      {
        field: 'checkFields',
        header: 'Check Field',
        customExportHeader: 'Field Name',
        sortablefield: 'checkFields',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'baseFields',
        header: 'Base Field',
        customExportHeader: 'Field Name',
        sortablefield: 'baseFields',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'condition',
        header: 'Condition Type',
        sortablefield: 'condition',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'value',
        header: 'Condition Value',
        sortablefield: 'value',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'unit',
        header: 'Condition Unit',
        sortablefield: 'unit',
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
  getFields(schemeid: string) {
    this.schemeConfigService
      .Config_Scheme_Cost_Validation_Get(schemeid)
      .subscribe((x) => {
        if (x) {
          this.configurationList = x.data;
        }
      });
  }
  changeStatus(val: boolean) {
    this.getFields(this.schemeId);
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
      this.fieldForm.get('basefieldName')?.patchValue(val.record.baseFieldIds);
      this.fieldForm
        .get('checkfieldName')
        ?.patchValue(val.record.checkFieldIds);
      this.fieldForm.get('condition')?.patchValue(val.record.conditionId);
      this.fieldForm.get('conditionValue')?.patchValue(val.record.value);
      this.fieldForm.get('conditionUnit')?.patchValue(val.record.unitId);
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
      checkFieldIds: this.fieldForm.get('checkfieldName')?.value,
      baseFieldIds: this.fieldForm.get('basefieldName')?.value,
      conditionId: this.fieldForm.get('condition')?.value,
      value: this.fieldForm.get('conditionValue')?.value,
      unitId: this.fieldForm.get('conditionUnit')?.value,
    });
  }
  savefield(obj: ConfigurationSchemeCostValidationModel) {
    this.schemeConfigService
      .Config_Scheme_Cost_Validation_SaveUpdate(obj)
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
          this.getFields(this.schemeId);
        }
      });
  }
  setPrivileges() {}
  ngOnDestroy() {}
}
