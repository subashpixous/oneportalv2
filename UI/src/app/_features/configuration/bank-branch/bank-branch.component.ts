import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { ConfigurationBranchAddressSaveModel } from 'src/app/_models/ConfigurationModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { DocumentService } from 'src/app/services/document.Service';
import { GeneralService } from 'src/app/services/general.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-bank-branch',
  templateUrl: './bank-branch.component.html',
  styleUrls: ['./bank-branch.component.scss'],
})
export class BankBranchComponent {
  bankdetails!: ConfigurationBranchAddressSaveModel;
  branches!: TCModel[];
  banks!: string[];
  districts!: any[];

  title: string = 'Branch Configuration';

  privleges = privileges;
  bankBranchForm!: FormGroup;
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
        CategoryCode: 'BANK',
      })
      .subscribe((x) => {
        this.banks = x.data;
      });
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'DISTRICT',
      })
      .subscribe((x) => {
        this.districts = x.data;
      });
    this.bankBranchForm = new FormGroup({
      bankId: new FormControl('', [Validators.required]),
      branchId: new FormControl('', [Validators.required]),
      ifscCode: new FormControl('', [Validators.required]),
      branchName: new FormControl('', [Validators.required]),
      districtId: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email]),
    });
    this.bankBranchForm.controls['branchId'].valueChanges.subscribe((x) => {
      if (x) {
        var d = this.branches.find((c) => c.value == x);
        this.bankBranchForm.controls['branchName'].patchValue(d?.text);
        this.bankBranchForm.controls['ifscCode'].patchValue('');
        this.bankBranchForm.controls['districtId'].patchValue('');
        this.bankBranchForm.controls['address'].patchValue('');
        this.bankBranchForm.controls['email'].patchValue('');
        if (this.bankBranchForm.controls['bankId'].value && x) {
          this.generalService
            .Branch_Address_Get(
              this.bankBranchForm.controls['bankId'].value,
              this.bankBranchForm.controls['branchId'].value
            )
            .subscribe((x) => {
              this.bankdetails = x.data[0];
              this.setdetails();
            });
        }
      } else {
        this.resetForm();
      }
    });
    this.bankBranchForm.controls['bankId'].valueChanges.subscribe((x) => {
      this.branches = [];
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            CategoryCode: 'BRANCH',
            parentConfigId: x,
          })
          .subscribe((x) => {
            this.branches = x.data;
          });
      }
    });
  }
  setdetails() {
    this.bankBranchForm.controls['ifscCode'].patchValue(
      this.bankdetails.ifscCode
    );
    this.bankBranchForm.controls['districtId'].patchValue(
      this.bankdetails.districtId
    );
    this.bankBranchForm.controls['address'].patchValue(
      this.bankdetails.address
    );
    this.bankBranchForm.controls['email'].patchValue(this.bankdetails.email);
  }
  resetForm() {
    this.bankBranchForm.reset();
  }
  savebankBranch() {
    this.generalService
      .Branch_Address_SaveUpdate({
        bankId: this.bankBranchForm.controls['bankId'].value,
        branchId: this.bankBranchForm.controls['branchId'].value,
        branchName: this.bankBranchForm.controls['branchName'].value,
        ifscCode: this.bankBranchForm.controls['ifscCode'].value,
        districtId: this.bankBranchForm.controls['districtId'].value,
        address: this.bankBranchForm.controls['address'].value,
        email: this.bankBranchForm.controls['email'].value,
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
            detail: 'Saved Successfully',
          });
          this.resetForm();
        }
      });
  }
  ngOnDestroy() {}
}
