import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import {
  ApplicationForm3Model,
  ApplicationForm3SaveModel,
} from 'src/app/_models/ApplicationForm3Model';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { ApplicationUCForm3PrivilegeModel } from 'src/app/_models/schemeModel';
import { SchemeService } from 'src/app/services/scheme.Service';

@Component({
  selector: 'app-form-three',
  templateUrl: './form-three.component.html',
  styleUrls: ['./form-three.component.scss'],
})
export class FormThreeComponent {
  @Input() form3s!: ApplicationForm3Model[];
  @Input() privilegemodel: ApplicationUCForm3PrivilegeModel | null = null;
  @Input() applicationId!: string;
  @Input() canshowform3: boolean = false;

  @Input() name: string = '';
  @Input() trade: string = '';
  @Input() subsidy: number = 0;

  @Output() save = new EventEmitter<ApplicationForm3SaveModel>();

  cols!: Column[];
  searchableColumns!: string[];
  actions: Actions[] = [];
  isDependent: boolean = false;
  title: string = 'Form |||';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  hasCode: boolean = false;
  defaultSortField: string = 'value';
  defaultSortOrder: number = 1;
  fornm3Form!: FormGroup;

  constructor(
    private schemeService: SchemeService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.fornm3Form = new FormGroup({
      id: new FormControl(),
      applicationId: new FormControl(this.applicationId),
      nameAndAddress: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(250),
      ]),
      nameOfTrade: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150),
      ]),
      refNumber: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      subsidy: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      promotorContribution: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      bankLoan: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      totalUtilCost: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
    });
    this.fornm3Form.get('applicationId')?.patchValue(this.applicationId);
    this.fornm3Form.get('nameAndAddress')?.patchValue(this.name);
    this.fornm3Form.get('nameOfTrade')?.patchValue(this.trade);
    this.fornm3Form.get('subsidy')?.patchValue(this.subsidy);
    this.cols = [
      {
        field: 'nameAndAddress',
        header: 'Name',
        sortablefield: 'nameAndAddress',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'nameOfTrade',
        header: 'Name Of Trade',
        sortablefield: 'nameOfTrade',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'refNumber',
        header: 'Ref Number',
        sortablefield: 'refNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'subsidy',
        header: 'Subsidy',
        sortablefield: 'subsidy',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'promotorContribution',
        header: 'Promotor Contribution',
        sortablefield: 'promotorContribution',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'bankLoan',
        header: 'Bank Loan',
        sortablefield: 'bankLoan',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'totalUtilCost',
        header: 'Total Util Cost',
        sortablefield: 'totalUtilCost',
        isSortable: true,
        isSearchable: true,
      },
    ];
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
    this.searchableColumns = this.cols
      .filter((x) => x.isSearchable == true)
      .flatMap((x) => x.field);
  }
  ngOnChanges() {
    if (this.applicationId && this.fornm3Form) {
      this.fornm3Form.reset();
      this.fornm3Form.get('applicationId')?.patchValue(this.applicationId);
      this.fornm3Form.get('nameAndAddress')?.patchValue(this.name);
      this.fornm3Form.get('nameOfTrade')?.patchValue(this.trade);
      this.fornm3Form.get('subsidy')?.patchValue(this.subsidy);
      this.fornm3Form.get('id')?.patchValue(Guid.raw());
    }
  }

  resetform3() {
    this.fornm3Form.reset();
    this.fornm3Form.get('applicationId')?.patchValue(this.applicationId);
    this.fornm3Form.get('id')?.patchValue(Guid.raw());
  }
  submit() {
    this.save.emit({
      id: this.fornm3Form.get('id')?.value,
      applicationId: this.fornm3Form.get('applicationId')?.value,
      nameAndAddress: this.fornm3Form.get('nameAndAddress')?.value,
      nameOfTrade: this.fornm3Form.get('nameOfTrade')?.value,
      refNumber: this.fornm3Form.get('refNumber')?.value,
      subsidy: this.fornm3Form.get('subsidy')?.value,
      promotorContribution: this.fornm3Form.get('promotorContribution')?.value,
      bankLoan: this.fornm3Form.get('bankLoan')?.value,
      totalUtilCost: this.fornm3Form.get('totalUtilCost')?.value,
      isActive: true,
    });
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.save.emit({ ...val.record, isActive: false });
    } else if (val && val.type == 'EDIT') {
      this.fornm3Form.get('id')?.patchValue(val.record.id);
      this.fornm3Form
        .get('applicationId')
        ?.patchValue(val.record.applicationId);
      this.fornm3Form
        .get('nameAndAddress')
        ?.patchValue(val.record.nameAndAddress);
      this.fornm3Form.get('nameOfTrade')?.patchValue(val.record.nameOfTrade);
      this.fornm3Form.get('refNumber')?.patchValue(val.record.refNumber);
      this.fornm3Form.get('subsidy')?.patchValue(val.record.subsidy);
      this.fornm3Form
        .get('promotorContribution')
        ?.patchValue(val.record.promotorContribution);
      this.fornm3Form.get('bankLoan')?.patchValue(val.record.bankLoan);
      this.fornm3Form
        .get('totalUtilCost')
        ?.patchValue(val.record.totalUtilCost);
    }
  }
}
