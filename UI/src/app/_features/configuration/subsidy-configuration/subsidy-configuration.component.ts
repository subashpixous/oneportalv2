import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { AccountRoleViewModel } from 'src/app/_models/AccountRoleViewModel';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { DocumentService } from 'src/app/services/document.Service';
import { GeneralService } from 'src/app/services/general.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-subsidy-configuration',
  templateUrl: './subsidy-configuration.component.html',
  styleUrls: ['./subsidy-configuration.component.scss'],
})
export class SubsidyConfigurationComponent {
  configurationList!: AccountRoleViewModel[];
  cols!: Column[];
  schemes!: any[];
  religions!: any[];
  communities!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Subsidy Configuration';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'subsidyName';
  defaultSortOrder: number = 1;

  privleges = privileges;
  subsidyForm!: FormGroup;

  defaultDate = moment(new Date()).toDate();
  endDate = moment(new Date()).toDate();

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
        CategoryCode: 'RELIGION',
      })
      .subscribe((x) => {
        this.religions = x.data;
      });
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'SCHEME',
      })
      .subscribe((x) => {
        this.schemes = x.data;
      });
    this.subsidyForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      scheme: new FormControl('', [Validators.required]),
      religion: new FormControl('', [Validators.required]),
      community: new FormControl('', [Validators.required]),
      percentage: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required]),
      from: new FormControl('', [Validators.required]),
      to: new FormControl('', [Validators.required]),
    });
    this.subsidyForm.controls['religion'].valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            CategoryCode: 'COMMUNITY',
            parentConfigId: x,
          })
          .subscribe((x) => {
            this.communities = x.data;
          });
      } else {
        this.communities = [];
        this.subsidyForm.controls['community'].patchValue('');
      }
    });
    this.cols = [
      {
        field: 'scheme',
        header: 'Scheme Name',
        customExportHeader: 'Scheme Name',
        sortablefield: 'scheme',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'religion',
        header: 'Religion',
        sortablefield: 'religion',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'community',
        header: 'Cummunity',
        sortablefield: 'community',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'subsidyPercentage',
        header: 'Subsidy Percentage',
        sortablefield: 'subsidyPercentage',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'subsidyCost',
        header: 'Subsidy Cost',
        sortablefield: 'subsidyCost',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'fromDate',
        header: 'From Date',
        sortablefield: 'fromDate',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'toDate',
        header: 'To Date',
        sortablefield: 'toDate',
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
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
      },
    ];
    this.getsubsidys('', '', '', this.currentStatus);
  }
  getsubsidys(
    id: string,
    schemeid: string,
    communtyid: string,
    status: boolean
  ) {
    this.generalService
      .Subsidy_Configuration_Get(id, schemeid, communtyid, status)
      .subscribe((x) => {
        this.configurationList = x.data;
      });
  }
  changeStatus(val: boolean) {
    this.getsubsidys('', '', '', !val);
    this.currentStatus = !val;
    if (!val) {
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
  resetForm() {
    this.subsidyForm.reset();
    this.subsidyForm.get('id')?.patchValue(Guid.raw());
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.savesubsidy({
        ...val.record,
        isActive: false,
      });
    } else if (val && val.type == 'EDIT') {
      this.subsidyForm.get('id')?.patchValue(val.record.id);
      this.subsidyForm.get('scheme')?.patchValue(val.record.schemeId);
      this.subsidyForm
        .get('to')
        ?.patchValue(moment(val.record.toDate).toDate());
      this.subsidyForm
        .get('from')
        ?.patchValue(moment(val.record.fromDate).toDate());
      this.subsidyForm
        .get('percentage')
        ?.patchValue(val.record.subsidyPercentage);
      this.subsidyForm.get('cost')?.patchValue(val.record.subsidyCost);
      this.subsidyForm.get('community')?.patchValue(val.record.communityId);
      this.subsidyForm.get('religion')?.patchValue(val.record.religionId);
    } else if (val && val.type == 'ACTIVATE') {
      this.savesubsidy({
        ...val.record,
        isActive: true,
      });
    }
  }
  submit() {
    this.savesubsidy({
      id: this.subsidyForm.get('id')?.value,
      scheme: this.subsidyForm.get('scheme')?.value,
      communityId: this.subsidyForm.get('community')?.value,
      percentage: this.subsidyForm.get('percentage')?.value,
      religionId: this.subsidyForm.get('religion')?.value,
      cost: this.subsidyForm.get('cost')?.value,
      from: this.subsidyForm.get('from')?.value,
      to: this.subsidyForm.get('to')?.value,
      isActive: true,
    });
  }
  savesubsidy(obj: any) {
    // this.generalService
    //   .Subsidy_Configuration_SaveUpdate({
    //     id: obj.id,
    //     schemeId: obj.scheme,
    //     isActive: obj.isActive,
    //     communityId: obj.communityId,
    //     subsidyCost: obj.cost,
    //     subsidyPercentage: obj.percentage,
    //     fromDate: obj.from,
    //     toDate: obj.to,
    //     religionId: obj.religionId,
    //   })
    //   .subscribe((x) => {
    //     if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Error',
    //         life: 2000,
    //         detail: x.message,
    //       });
    //       this.getsubsidys('', '', '', this.currentStatus);
    //     } else if (x) {
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Success',
    //         detail: 'Saved Successfully',
    //       });
    //       this.resetForm();
    //       this.getsubsidys('', '', '', this.currentStatus);
    //     }
    //   });
  }
  ngOnDestroy() {}
}
