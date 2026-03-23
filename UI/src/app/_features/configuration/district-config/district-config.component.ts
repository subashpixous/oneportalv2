import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import {
  ConfigurationBranchAddressSaveModel,
  ConfigurationDistrictSaveModel,
} from 'src/app/_models/ConfigurationModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { DocumentService } from 'src/app/services/document.Service';
import { GeneralService } from 'src/app/services/general.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-district-config',
  templateUrl: './district-config.component.html',
  styleUrls: ['./district-config.component.scss'],
})
export class DistrictConfigComponent {
  districtdetails!: ConfigurationDistrictSaveModel;
  districts!: any[];
  selectedDistricts: string = '';

  title: string = 'District Configuration';

  privleges = privileges;
  districtForm!: FormGroup;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private documentService: DocumentService,
    private generalService: GeneralService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.districtForm = new FormGroup({
      districtId: new FormControl('', [Validators.required]),
      latitude: new FormControl('', [
        Validators.required,
        Validators.pattern(
          new RegExp('^-?([0-9]{1,2}|1[0-7][0-9]|180)(.[0-9]{1,10})$')
        ),
      ]),
      longitude: new FormControl('', [
        Validators.required,
        Validators.pattern(
          new RegExp('^-?([0-9]{1,2}|1[0-7][0-9]|180)(.[0-9]{1,10})?$')
        ),
      ]),
    });
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'DISTRICT',
      })
      .subscribe((x) => {
        this.districts = x.data;
        if (this.districts && this.districts.length > 0) {
          this.selectedDistricts = this.districts[0].value;

          this.generalService
            .Config_District_Get(this.selectedDistricts)
            .subscribe((x) => {
              this.districtdetails = x.data[0];
              this.setdetails();
            });
        }
      });
  }
  setdetails() {
    this.districtForm.controls['districtId'].patchValue(this.selectedDistricts);
    this.districtForm.controls['latitude'].patchValue(
      this.districtdetails.latitude
    );
    this.districtForm.controls['longitude'].patchValue(
      this.districtdetails.longitude
    );
  }
  resetForm() {
    this.districtForm.reset();
  }
  savedistrict() {
    this.generalService
      .Config_District_SaveUpdate({
        districtId: this.districtForm.controls['districtId'].value,
        latitude: this.districtForm.controls['latitude'].value,
        longitude: this.districtForm.controls['longitude'].value,
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
        }
      });
  }
  changeDistrict(event: any) {
    this.districtForm.reset();
    this.districtForm.controls['districtId'].patchValue(event);
    this.generalService.Config_District_Get(event).subscribe((x) => {
      this.districtdetails = x.data[0];
      this.setdetails();
    });
  }
  ngOnDestroy() {}
}
