import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import {} from 'src/app/_models/ApplicationForm3Model';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { ApplicationUCForm3PrivilegeModel } from 'src/app/_models/schemeModel';
import {
  ApplicationUtilizationCirtificateModel,
  ApplicationUtilizationCirtificateSaveModel,
} from 'src/app/_models/UCModel';
import { SchemeService } from 'src/app/services/scheme.Service';

@Component({
  selector: 'app-uc-upload',
  templateUrl: './uc-upload.component.html',
  styleUrls: ['./uc-upload.component.scss'],
})
export class UcUploadComponent {
  @Input() ucs!: ApplicationUtilizationCirtificateModel[];
  @Input() applicationId!: string;
  @Input() privilegemodel: ApplicationUCForm3PrivilegeModel | null = null;
  @Input() canshowform3: boolean = false;

  @Input() name: string = '';
  @Input() trade: string = '';
  @Input() subsidy: number = 0;

  @Output() save =
    new EventEmitter<ApplicationUtilizationCirtificateSaveModel>();
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
  ucForm!: FormGroup;
  defaultDate = moment(new Date()).toDate();

  constructor(
    private schemeService: SchemeService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.ucForm = new FormGroup({
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
      nodalNumber: new FormControl('', [
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
      loanAccountNumber: new FormControl('', [Validators.required]),
      totalAmountReleased: new FormControl('', [
        Validators.required,
        Validators.pattern(new RegExp('^[0-9]+$')),
      ]),
      dateOfLoanSanction: new FormControl('', [Validators.required]),
      dateOfDisbursement: new FormControl('', [Validators.required]),
      dateOfAssetCreated: new FormControl('', [Validators.required]),
      dateOfAssetVerified: new FormControl('', [Validators.required]),
    });
    this.ucForm.get('applicationId')?.patchValue(this.applicationId);
    this.ucForm.get('nameAndAddress')?.patchValue(this.name);
    this.ucForm.get('nameOfTrade')?.patchValue(this.trade);
    this.ucForm.get('subsidy')?.patchValue(this.subsidy);
    this.cols = [
      {
        field: 'nameAndAddress',
        header: 'Name',
        sortablefield: 'nameAndAddress',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'nodalNumber',
        header: 'Nodal Number',
        sortablefield: 'nodalNumber',
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
        field: 'loanAccountNumber',
        header: 'Account Number',
        sortablefield: 'loanAccountNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'dateOfAssetVerified',
        header: 'Asset Verified On',
        sortablefield: 'dateOfAssetVerified',
        isSortable: true,
      },
      {
        field: 'dateOfLoanSanction',
        header: 'Loan Sanctioned On',
        sortablefield: 'dateOfLoanSanction',
        isSortable: true,
      },
      {
        field: 'dateOfDisbursement',
        header: 'Disbursed On',
        sortablefield: 'dateOfDisbursement',
        isSortable: true,
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
    if (this.applicationId && this.ucForm) {
      if (this.ucForm) {
        this.ucForm.reset();
        this.ucForm.get('applicationId')?.patchValue(this.applicationId);
        this.ucForm.get('nameAndAddress')?.patchValue(this.name);
        this.ucForm.get('nameOfTrade')?.patchValue(this.trade);
        this.ucForm.get('subsidy')?.patchValue(this.subsidy);
        this.ucForm.get('id')?.patchValue(Guid.raw());
      }
    }
  }
  resetUc() {
    this.ucForm.reset();
    this.ucForm.get('applicationId')?.patchValue(this.applicationId);
    this.ucForm.get('id')?.patchValue(Guid.raw());
  }
  submit() {
    this.save.emit({
      id: this.ucForm.get('id')?.value,
      applicationId: this.ucForm.get('applicationId')?.value,
      nameAndAddress: this.ucForm.get('nameAndAddress')?.value,
      nameOfTrade: this.ucForm.get('nameOfTrade')?.value,
      subsidy: this.ucForm.get('subsidy')?.value,
      promotorContribution: this.ucForm.get('promotorContribution')?.value,
      bankLoan: this.ucForm.get('bankLoan')?.value,
      isActive: true,
      nodalNumber: this.ucForm.get('nodalNumber')?.value,
      loanAccountNumber: this.ucForm.get('loanAccountNumber')?.value,
      totalAmountReleased: this.ucForm.get('totalAmountReleased')?.value,
      dateOfLoanSanction: this.ucForm.get('dateOfLoanSanction')?.value,
      dateOfDisbursement: this.ucForm.get('dateOfDisbursement')?.value,
      dateOfAssetCreated: this.ucForm.get('dateOfAssetCreated')?.value,
      dateOfAssetVerified: this.ucForm.get('dateOfAssetVerified')?.value,
    });
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.save.emit({ ...val.record, isActive: false });
    } else if (val && val.type == 'EDIT') {
      this.ucForm.get('id')?.patchValue(val.record.id);
      this.ucForm.get('applicationId')?.patchValue(val.record.applicationId);
      this.ucForm.get('nameAndAddress')?.patchValue(val.record.nameAndAddress);
      this.ucForm.get('nameOfTrade')?.patchValue(val.record.nameOfTrade);
      this.ucForm.get('nodalNumber')?.patchValue(val.record.nodalNumber);
      this.ucForm.get('subsidy')?.patchValue(val.record.subsidy);
      this.ucForm
        .get('promotorContribution')
        ?.patchValue(val.record.promotorContribution);
      this.ucForm.get('bankLoan')?.patchValue(val.record.bankLoan);
      this.ucForm
        .get('loanAccountNumber')
        ?.patchValue(val.record.loanAccountNumber); //moment(this.userDetails?.dOB).toDate()

      this.ucForm.get('totalAmountReleased')?.patchValue(val.record.subsidy);
      this.ucForm
        .get('dateOfLoanSanction')
        ?.patchValue(moment(val.record.dateOfLoanSanction).toDate());
      this.ucForm
        .get('dateOfDisbursement')
        ?.patchValue(moment(val.record.dateOfDisbursement).toDate());
      this.ucForm
        .get('dateOfAssetCreated')
        ?.patchValue(moment(val.record.dateOfAssetCreated).toDate());
      this.ucForm
        .get('dateOfAssetVerified')
        ?.patchValue(moment(val.record.dateOfAssetVerified).toDate());
    }
  }
}
