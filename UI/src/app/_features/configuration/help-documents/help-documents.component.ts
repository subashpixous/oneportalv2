import { TitleCasePipe } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { AccountRoleViewModel } from 'src/app/_models/AccountRoleViewModel';
import { ConfigHelpDocumentSaveModel } from 'src/app/_models/ConfigurationModel';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { FileUpload } from 'primeng/fileupload';
import { LoaderService } from 'src/app/_helpers/loader';

import {
  privileges,
  triggerValueChangesForAll,
} from 'src/app/shared/commonFunctions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-help-documents',
  templateUrl: './help-documents.component.html',
  styleUrls: ['./help-documents.component.scss'],
})
export class HelpDocumentsComponent {
  @ViewChild('filechosen') someInput!: ElementRef;
  @ViewChild('filechosen') filechosen!: FileUpload;


  configurationList!: AccountRoleViewModel[];
  cols!: Column[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Help Document Configuration';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'roleName';
  defaultSortOrder: number = 1;

  //new 
  acceptedTypes: string = '';
  isTypeSelected: boolean = false; // initially disabled

  privleges = privileges;
  helpDocForm!: FormGroup;

  types: TCModel[] = [];
  roles: TCModel[] = [];
  catgories: TCModel[] = [];
  schemes: TCModel[] = [];

  filee!: any;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private generalService: GeneralService,
    private http: HttpClient,
    private loader: LoaderService
  ) {}
  ngOnInit() {
    this.getHelpDocuments();
    this.generalService.Config_Help_Document_Form().subscribe((x) => {
      if (x) {
        this.schemes = x.data.schemeList;
        this.roles = x.data.roleList;
        this.types = x.data.typeList;
        this.catgories = x.data.categoryList;
      }
    });
    this.helpDocForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      documentName: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(3),
      ]),
      documentType: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]),
      roleIds: new FormControl(''),
      schemeIds: new FormControl(''),
      description: new FormControl('', [Validators.required]),
      link: new FormControl(''),
      filedetails: new FormControl('', [Validators.required]),
      isActive: new FormControl(true),
    });
    this.cols = [
      {
        field: 'documentName',
        header: 'Name',
        customExportHeader: 'Name',
        sortablefield: 'documentName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'documentType',
        header: 'Document Type',
        sortablefield: 'documentType',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'category',
        header: 'Category',
        sortablefield: 'category',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'description',
        header: 'Description',
        sortablefield: 'description',
        isSortable: true,
        isSearchable: true,
      },
      // {
      //   field: 'roleIds',
      //   header: 'Roles',
      //   sortablefield: 'roleIds',
      //   isSortable: true,
      //   isSearchable: true,
      // },
      // {
      //   field: 'schemeIds',
      //   header: 'Schemes',
      //   sortablefield: 'schemeIds',
      //   isSortable: true,
      //   isSearchable: true,
      // },
    ];
    this.searchableColumns = this.cols
      .filter((x) => x.isSearchable == true)
      .flatMap((x) => x.field);

    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        privilege: privileges.CONFIG_DELETE,
      },
    ];
  }
  getHelpDocuments() {
    this.generalService
      .Config_Help_Document_Get('', '', '', '')
      .subscribe((x) => {
        if (x) {
          this.configurationList = x.data;
        }
      });
  }
  changecate(event: any) {
    if (event == 'role') {
      this.helpDocForm.get('roleIds')?.addValidators(Validators.required);
      this.helpDocForm.get('schemeIds')?.removeValidators(Validators.required);
      this.helpDocForm.get('roleIds')?.updateValueAndValidity();
      this.helpDocForm.get('schemeIds')?.updateValueAndValidity();
    } else if (event == 'scheme') {
      this.helpDocForm.get('schemeIds')?.addValidators(Validators.required);
      this.helpDocForm.get('roleIds')?.removeValidators(Validators.required);
      this.helpDocForm.get('roleIds')?.updateValueAndValidity();
      this.helpDocForm.get('schemeIds')?.updateValueAndValidity();
      this.helpDocForm.updateValueAndValidity();
    } else {
      this.helpDocForm.get('roleIds')?.removeValidators(Validators.required);
      this.helpDocForm.get('schemeIds')?.removeValidators(Validators.required);
      this.helpDocForm.get('roleIds')?.updateValueAndValidity();
      this.helpDocForm.get('schemeIds')?.updateValueAndValidity();
      this.helpDocForm.updateValueAndValidity();
    }
  }
  changeStatus(val: boolean) {
    this.getHelpDocuments();
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          visibilityCheckFeild: 'isChangeable',
        },
        {
          icon: 'pi pi-times',
          title: 'In-Activate',
          type: 'INACTIVATE',
          visibilityCheckFeild: 'isChangeable',
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
        },
      ];
    }
  }
  // resetForm() {
  //   this.helpDocForm.reset();
  //   this.filee = null;
  //   this.helpDocForm.get('id')?.patchValue(Guid.raw());
  // }
   resetForm() {
    this.helpDocForm.reset();
    this.filee = null;
    this.filechosen.clear();
    this.helpDocForm.get('id')?.patchValue(Guid.raw());
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.generalService
        .Config_Help_Document_Delete(val.record.id)
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
            this.getHelpDocuments();
          }
        });
    } else
    //    if (val && val.type == 'EDIT') {
    //   this.helpDocForm.get('id')?.patchValue(val.record.id);
    //   this.helpDocForm.get('category')?.patchValue(val.record.category);
    //   this.helpDocForm.get('documentName')?.patchValue(val.record.documentName);
    //   this.helpDocForm.get('documentType')?.patchValue(val.record.documentType);
    //   this.helpDocForm.get('roleIds')?.patchValue(val.record.roleIds);
    //   this.helpDocForm.get('schemeIds')?.patchValue(val.record.schemeIds);
    //   this.helpDocForm.get('description')?.patchValue(val.record.description);
    //   this.helpDocForm.get('filedetails')?.patchValue(val.record.savedFile);
    // }
    if (val && val.type === 'EDIT') {
        this.loader.showLoader();
        this.helpDocForm.patchValue({
          id: val.record.id,
          category: val.record.category,
          documentName: val.record.documentName,
          documentType: val.record.documentType,
          roleIds: val.record.roleIds,
          schemeIds: val.record.schemeIds,
          description: val.record.description,
          filedetails: val.record.savedFile
        });

        const fileUrl = `${environment.apiUrl}/Common/File?fileName=${val.record.savedFile.savedFileName}`;

        fetch(fileUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File(
              [blob],
              val.record.savedFile.originalFileName,
              { type: blob.type || 'application/octet-stream' }
            );

            (this.filechosen as any).files = [file];

            const fakeEvent: any = {
              originalEvent: new Event('manual'),
              files: [file],
              currentFiles: [file]
            };

            (this.filechosen as any).onSelect.emit(fakeEvent);
          })
          .catch(err => console.error('File fetch error:', err))
          .finally(() => {
            this.loader.hideLoader();
          });

        this.filee = null;
      }
     else if (val && val.type == 'ACTIVATE') {
    }
  }
  submit() {
    if (this.helpDocForm.valid) {
      var d: ConfigHelpDocumentSaveModel = {
        category: this.helpDocForm.get('category')?.value,
        id: this.helpDocForm.get('id')?.value,
        documentName: this.helpDocForm.get('documentName')?.value,
        documentType: this.helpDocForm.get('documentType')?.value,
        roleIds: this.helpDocForm.get('roleIds')?.value,
        schemeIds: this.helpDocForm.get('schemeIds')?.value,
        description: this.helpDocForm.get('description')?.value,
        link: this.helpDocForm.get('link')?.value,
        isActive: true,
        file: null,
      };
      const formData = new FormData();
      formData.append('file', this.filee ?? null);
      formData.append('id', d.id);
      formData.append('category', d.category);
      formData.append('documentName', d.documentName);
      formData.append('documentType', d.documentType);

      if (d.roleIds) {
        d.roleIds?.forEach((x) => {
          formData.append('roleIds', x);
        });
      }
      if (d.schemeIds) {
        d.schemeIds?.forEach((x) => {
          formData.append('schemeIds', x);
        });
      }

      formData.append('description', d.description);
      formData.append('link', d.link);
      formData.append('description', d.description);
      formData.append('isActive', 'true');
      this.http
        .post(
          `${environment.apiUrl}/Settings/Config_Help_Document_SaveUpdate`,
          formData
        )
        .subscribe(
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Uploaded Successfully',
            });
            this.resetForm();
            this.filee = null;
            (this.someInput as any).files = [];
            this.getHelpDocuments();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to Upload! Please try again',
            });
          }
        );
    } else {
      triggerValueChangesForAll(this.helpDocForm);
    }
  }
  setPrivileges() {
    this.router.navigateByUrl('/officers/configuration/role-privilege');
  }
  ngOnDestroy() {}

  onTypeChange(event: any) {
  const selectedType = event.value;

  if (selectedType === 'pdf') {
    this.acceptedTypes = '.pdf'; 
    this.isTypeSelected = true;
  } else if (selectedType === 'video') {
    this.acceptedTypes = 'video/*'; 
    this.isTypeSelected = true;
  } else {
    this.acceptedTypes = '';
    this.isTypeSelected = false; // disable again if cleared
  }
}

  onSelectDocumentFile(event: any) {
    if (event.files && event.files[0]) {
      const formData = new FormData();
      this.filee = event.files[0];
      this.helpDocForm.get('filedetails')?.patchValue('avaliable');
    } else {
      this.filee = null;
      this.helpDocForm.get('filedetails')?.patchValue(null);
    }
  }
  removefile(event: any) {
    this.filee = null;
    this.helpDocForm.get('filedetails')?.patchValue(null);
  }
}
