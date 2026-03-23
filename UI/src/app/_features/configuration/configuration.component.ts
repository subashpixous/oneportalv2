import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Guid } from 'guid-typescript';
import { GeneralService } from 'src/app/services/general.service';
import {
  ConfigurationModel,
  ConfigCategoryModel,
} from 'src/app/_models/ConfigurationModel';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { privileges } from 'src/app/shared/commonFunctions';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent {
  configurationList!: ConfigurationModel[];
  cols!: Column[];
  schemes!: any[];
  catgories!: any[];
  originalcatgories!: any[];
  configurations!: any[];
  searchableColumns!: string[];

  actions: Actions[] = [];
  isDependent: boolean = false;
  title: string = 'Configuration';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  hasCode: boolean = false;
  defaultSortField: string = 'value';
  defaultSortOrder: number = 1;
  currentStatus: boolean = true;
  canShowAction: boolean = true;
  parentconfigtext!: string;

  privleges = privileges;
  configurationForm!: FormGroup;
  isRole: boolean = false;
  constructor(
    private messageService: MessageService,
    private generalService: GeneralService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.configurationForm = new FormGroup({
      department: new FormControl(''),
      scheme: new FormControl(''),
      category: new FormControl('', Validators.required),
      id: new FormControl(Guid.raw()),
      configuration: new FormControl(''),
      value: new FormControl('', [Validators.required]),
      valueTamil: new FormControl('', [Validators.required]),
      code: new FormControl(''),
    });
    this.cols = [
      {
        field: 'id',
        header: 'Id',
        customExportHeader: 'Id',
        sortablefield: 'id',
        isSortable: true,
      },
      {
        field: 'value',
        header: 'Configuration Value',
        customExportHeader: 'Configuration Value',
        sortablefield: 'value',
        isSortable: true,
      },
      {
        field: 'valueTamil',
        header: 'Configuration Value (Tamil)',
        customExportHeader: 'Configuration Value (Tamil)',
        sortablefield: 'valueTamil',
        isSortable: true,
      },
      {
        field: 'code',
        header: 'Code',
        sortablefield: 'code',
        isSortable: true,
      },
    ];
    this.searchableColumns = ['value', 'code'];

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
    this.configurationForm.get('configuration')?.valueChanges.subscribe((x) => {
      this.configurationList = [];
      this.total = 0;
      if (x) {
        this.generalService
          .getConfigurationDetailsbyId({
            parentConfigId: x,
            categoryId: this.configurationForm.get('category')?.value,
            SchemeId: this.configurationForm.get('scheme')?.value,
          })
          .subscribe((x) => {
            this.configurationList = x.data;
            this.total = x.data.length;
          });
        this.configurationForm.get('id')?.patchValue(Guid.raw());
        this.configurationForm.get('code')?.reset();
        this.configurationForm.get('value')?.reset();
        this.configurationForm.get('valueTamil')?.reset();
      }
    });

    this.configurationForm.get('category')?.valueChanges.subscribe((x) => {
      this.changeOfCategory(x);
    });

    this.configurationForm.get('scheme')?.valueChanges.subscribe((y) => {
      if (y) {
        this.generalService
          .Configuration_Get_Category_SelectList(y)
          .subscribe((x) => {
            if (x) {
              this.originalcatgories = x.data;
              this.isDependent = false;
              this.catgories = x.data.filter(
                (x: any) => x.isDependent == false
              );
              if (
                this.configurationForm.get('category')?.value &&
                this.configurationForm.get('category')?.value != ''
              ) {
                this.changeOfCategory(
                  this.configurationForm.get('category')?.value
                );
              } else {
                this.configurations = [];
                this.total = 0;
              }
            }
          });
      } else {
        //this.resetForm();
      }
    });

    this.generalService.Configuration_Get_Scheme_SelectList().subscribe((x) => {
      if (x) {
        this.schemes = x.data;
        this.isDependent = false;
        this.catgories = x.data.filter((x: any) => x.isDependent == false);
      }
    });
  }
  onRoleChange(event: any) {
  const selectedId = event.value;
  const selectedRole = this.configurations.find((r: any) => r.roleName === selectedId);

  if (selectedRole) {
    this.configurationForm.get('code')?.setValue(selectedRole.roleCode);
  } else {
    this.configurationForm.get('code')?.reset();
  }
}
  changeOfCategory(x: any) {
    this.configurations = [];
    if (x && this.isDependent) {
      this.configurationForm.get('configuration')?.reset();
      const curntvalue: ConfigCategoryModel = this.originalcatgories.find(
        (y: ConfigCategoryModel) => y.id == x
      );
      const parentvalue: ConfigCategoryModel = this.originalcatgories.find(
        (y: ConfigCategoryModel) => y.id == curntvalue.parentId
      );
      this.parentconfigtext = `(${parentvalue.category})`;
      if (parentvalue) {
        this.generalService
          .getConfigurationDetailsbyId({
            categoryId: parentvalue.id,
            SchemeId: this.configurationForm.get('scheme')?.value,
            ShowParent: true,
          })
          .subscribe((x) => {
            this.configurations = x.data;
            this.total = x.data.length;
          });
      } else {
        this.configurations = [];
      }
    } else if (!this.isDependent) {
      console.log("category selected : "+x);
      // Direct Form Submits
      if(x == 'c0e95ec6-9aa4-11f0-af2e-06040707f3b5') {
        this.isRole = true;
       this.roleService.Role_Get('', true).subscribe((x) => {
        this.configurations = x.data;
        this.total = x.data.length;
        console.log(x.data);
       })
      }
      this.generalService
        .getConfigurationDetailsbyId({
          categoryId: x,
          SchemeId: this.configurationForm.get('scheme')?.value,
        })
        .subscribe((x) => {
          this.configurationList = x.data;
          this.total = x.data.length;
        });
    }
    var category: ConfigCategoryModel = this.originalcatgories.find(
      (y: ConfigCategoryModel) => y.id == x
    );
    if (category) {
      this.hasCode = category.hasCode;
      this.canShowAction = category.isEditable;
    } else {
      this.hasCode = false;
    }
    if (this.hasCode) {
      this.configurationForm.get('code')?.addValidators(Validators.required);
      this.cols = [
        {
          field: 'id',
          header: 'Id',
          customExportHeader: 'Id',
          sortablefield: 'id',
          isSortable: true,
        },
        {
          field: 'value',
          header: 'Configuration Value',
          customExportHeader: 'Configuration Value',
          sortablefield: 'value',
          isSortable: true,
        },
        {
          field: 'valueTamil',
          header: 'Configuration Value (Tamil)',
          customExportHeader: 'Configuration Value (Tamil)',
          sortablefield: 'valueTamil',
          isSortable: true,
        },
        {
          field: 'code',
          header: 'Code',
          sortablefield: 'code',
          isSortable: true,
        },
      ];
      this.searchableColumns = ['value', 'code'];
    } else {
      this.configurationForm.get('code')?.removeValidators(Validators.required);
      this.cols = [
        {
          field: 'id',
          header: 'Id',
          customExportHeader: 'Id',
          sortablefield: 'id',
          isSortable: true,
        },
        {
          field: 'value',
          header: 'Configuration Value',
          customExportHeader: 'Configuration Value',
          sortablefield: 'value',
          isSortable: true,
        },
        {
          field: 'valueTamil',
          header: 'Configuration Value (Tamil)',
          customExportHeader: 'Configuration Value (Tamil)',
          sortablefield: 'valueTamil',
          isSortable: true,
        },
      ];
      this.searchableColumns = ['value'];
    }

    this.configurationForm.get('value')?.reset();
    this.configurationForm.get('valueTamil')?.reset();
    this.configurationForm.get('code')?.reset();
  }
  resetForm() {
    this.configurationForm.reset(null, {
      onlySelf: false,
      emitEvent: false,
    });
    this.configurationForm.get('id')?.patchValue(Guid.raw());
    this.configurations = [];
    this.originalcatgories = [];
    this.configurationList = [];
    this.catgories = [];
    this.total = 0;
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.generalService
        .saveConfiguration({
          ...val.record,
          isActive: false,
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
            this.configurationForm.get('id')?.patchValue(Guid.raw());
            this.configurationForm.get('code')?.reset();
            this.configurationForm.get('value')?.reset();
            this.configurationForm.get('valueTamil')?.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: x?.message,
            });
            const categoyvalue = this.configurationForm.get('category')?.value;
            const configurationvalue =
              this.configurationForm.get('configuration')?.value;
            const departmentValue =
              this.configurationForm.get('department')?.value;
            this.generalService
              .getConfigurationDetailsbyId({
                categoryId: categoyvalue,
                parentConfigId: configurationvalue ? configurationvalue : '',
                SchemeId: this.configurationForm.get('scheme')?.value,
              })
              .subscribe((x) => {
                this.configurationList = x.data;
                this.total = x.data.length;
              });
          }
        });
    } else if (val && val.type == 'EDIT') {
      this.configurationForm.get('id')?.patchValue(val.record.id);
      this.configurationForm
        .get('configurationId')
        ?.patchValue(val.record.configurationId);
      this.configurationForm.get('value')?.patchValue(val.record.value);
      this.configurationForm
        .get('valueTamil')
        ?.patchValue(val.record.valueTamil);
      this.configurationForm.get('code')?.patchValue(val.record.code);
    } else if (val && val.type == 'ACTIVATE') {
      this.generalService
        .saveConfiguration({
          ...val.record,
          isActive: true,
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
            this.configurationForm.get('id')?.patchValue(Guid.raw());
            this.configurationForm.get('code')?.reset();
            this.configurationForm.get('value')?.reset();
            this.configurationForm.get('valueTamil')?.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: x?.message,
            });
            const categoyvalue = this.configurationForm.get('category')?.value;
            const configurationvalue =
              this.configurationForm.get('configuration')?.value;
            const departmentValue =
              this.configurationForm.get('department')?.value;
            this.generalService.getConfigurationDetailsbyId({
              categoryId: categoyvalue,
              parentConfigId: configurationvalue ? configurationvalue : '',
              SchemeId: this.configurationForm.get('scheme')?.value,
            });
          }
        });
    }
  }
  changeEvent(val: any) {
    var scheme = this.configurationForm.get('scheme')?.value;
    this.configurationForm.reset(null, {
      onlySelf: false,
      emitEvent: false,
    });
    this.configurationForm.get('id')?.patchValue(Guid.raw());
    this.configurationForm.get('scheme')?.patchValue(scheme, {
      onlySelf: false,
      emitEvent: false,
    });

    this.configurationList = [];
    this.total = 0;
    this.parentconfigtext = '';
    if (val.checked) {
      this.title = 'Dependent Configuration';
      this.configurationForm
        .get('configuration')
        ?.addValidators(Validators.required);
      this.catgories = this.originalcatgories.filter(
        (x) => x.isDependent == true
      );
    } else {
      this.title = 'Configuration';
      this.configurationForm.get('configuration')?.clearValidators();
      this.catgories = this.originalcatgories.filter(
        (x) => x.isDependent == false
      );
    }
    this.configurationForm.get('configuration')?.updateValueAndValidity();
  }

  changeStatus(val: boolean) {
    const categoyvalue = this.configurationForm.get('category')?.value;
    const configurationvalue =
      this.configurationForm.get('configuration')?.value;
    const departmentValue = this.configurationForm.get('department')?.value;
    if (
      categoyvalue &&
      ((configurationvalue && this.isDependent) ||
        (!configurationvalue && !this.isDependent))
    ) {
      this.generalService.getConfigurationDetailsbyId({
        categoryId: categoyvalue,
        parentConfigId: configurationvalue ? configurationvalue : '',
        SchemeId: this.configurationForm.get('scheme')?.value,
      });
    }
    this.configurationList = [];
    this.total = 0;
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
  submit() {
    this.generalService
      .saveConfiguration({
        categoryId: this.configurationForm.get('category')?.value,
        id: this.configurationForm.get('id')?.value,
        configurationId: this.configurationForm.get('configuration')?.value,
        schemeId: this.configurationForm.get('scheme')?.value,
        value: this.configurationForm.get('value')?.value,
        code: this.configurationForm.get('code')?.value?.toUpperCase(),
        isActive: true,
        canDelete: false,
        isGeneral: false,
        valueTamil: this.configurationForm.get('valueTamil')?.value,
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
          this.configurationForm.get('id')?.patchValue(Guid.raw());
          this.configurationForm.get('code')?.reset();
          this.configurationForm.get('value')?.reset();
          this.configurationForm.get('valueTamil')?.reset();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: x?.message,
          });
          const categoyvalue = this.configurationForm.get('category')?.value;
          const configurationvalue =
            this.configurationForm.get('configuration')?.value;
          const departmentValue =
            this.configurationForm.get('department')?.value;
          this.generalService
            .getConfigurationDetailsbyId({
              categoryId: categoyvalue,
              parentConfigId: configurationvalue ? configurationvalue : '',
              SchemeId: this.configurationForm.get('scheme')?.value,
            })
            .subscribe((x) => {
              this.configurationList = x.data;
              this.total = x.data.length;
            });
        }
      });
  }
}
