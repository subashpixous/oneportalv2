import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GeneralConfigurationCommonModel } from 'src/app/_models/ConfigurationModel';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-area-configuration',
  templateUrl: './area-configuration.component.html',
  styleUrls: ['./area-configuration.component.scss'],
})
export class AreaConfigurationComponent {
  title: string = 'General Configuration';
  districts: TCModel[] = [];
  docCategories: TCModel[] = [];

  obj!: GeneralConfigurationCommonModel;

  privleges = privileges;

  cansendCard: boolean = false;

  nonManError: string = '';
  manError: string = '';

  famnonManError: string = '';
  fammanError: string = '';

  constructor(
    private messageService: MessageService,
    private router: Router,
    private generalService: GeneralService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'DISTRICT',
      })
      .subscribe((c) => {
        this.districts = c.data;
      });
    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'DOCUMENTCATEGORY',
      })
      .subscribe((c) => {
        this.docCategories = c.data;
      });
    this.generalService.General_Configuration_Get().subscribe((c) => {
      this.obj = c.data;
      this.cansendCard = this.obj.canSendPhysicalCard == 'true' ? true : false;
    });
  }
  saveRuralDistricts() {
    this.generalService
      .RuralDistricts_SaveUpdate({
        districtIds: this.obj.ruralDistricts,
      })
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  saveUrbanDistricts() {
    this.generalService
      .UrbanDistricts_SaveUpdate({
        districtIds: this.obj.urbanDistricts,
      })
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  saveDays() {
    this.generalService
      .Application_Expiry_SaveUpdate(this.obj.applicationExpiryDays)
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  cler() {
    this.manError = '';
    this.nonManError = '';
    this.fammanError = '';
    this.famnonManError = '';
  }
  savedoc() {
    var sd = this.obj.memberDocumentCategories.filter((x) =>
      this.obj.memberNonMandatoryDocumentCategories.includes(x)
    );
    var cat = this.docCategories
      .filter((x) => sd.includes(x.value))
      .flatMap((c) => c.text);

    if (cat && cat.length > 0) {
      this.manError =
        'Some of the categories are selected in non mandatory document categories such as ' +
        cat.join(', ');
      return;
    }
    this.generalService
      .General_Configuration_Member_Dodument_SaveUpdate({
        documentCategoryIds: this.obj.memberDocumentCategories,
      })
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  saveNMdoc() {
    var sd = this.obj.memberNonMandatoryDocumentCategories.filter((x) =>
      this.obj.memberDocumentCategories.includes(x)
    );
    var cat = this.docCategories
      .filter((x) => sd.includes(x.value))
      .flatMap((c) => c.text);
    if (cat && cat.length > 0) {
      this.nonManError =
        'Some of the categories are selected in mandatory document categories such as ' +
        cat.join(', ');
      return;
    }
    this.generalService
      .General_Configuration_Member_NonMandatory_Dodument_SaveUpdate({
        documentCategoryIds: this.obj.memberNonMandatoryDocumentCategories,
      })
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  saveFamdoc() {
    var sd = this.obj.familyMemberMandatoryDocumentCategories.filter((x) =>
      this.obj.familyMemberNonMandatoryDocumentCategories.includes(x)
    );
    var cat = this.docCategories
      .filter((x) => sd.includes(x.value))
      .flatMap((c) => c.text);

    if (cat && cat.length > 0) {
      this.fammanError =
        'Some of the categories are selected in non mandatory document categories such as ' +
        cat.join(', ');
      return;
    }
    this.generalService
      .General_Configuration_Family_Member_Dodument_SaveUpdate({
        documentCategoryIds: this.obj.familyMemberMandatoryDocumentCategories,
      })
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  saveFamNMdoc() {
    var sd = this.obj.familyMemberNonMandatoryDocumentCategories.filter((x) =>
      this.obj.familyMemberMandatoryDocumentCategories.includes(x)
    );
    var cat = this.docCategories
      .filter((x) => sd.includes(x.value))
      .flatMap((c) => c.text);
    if (cat && cat.length > 0) {
      this.famnonManError =
        'Some of the categories are selected in mandatory document categories such as ' +
        cat.join(', ');
      return;
    }
    this.generalService
      .General_Configuration_Family_Member_NonMandatory_Dodument_SaveUpdate({
        documentCategoryIds:
          this.obj.familyMemberNonMandatoryDocumentCategories,
      })
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  saveReqCard() {
    this.generalService
      .General_Configuration_CanSend_Physical_Card_SaveUpdate(this.cansendCard)
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
  savecontactCard() {
    this.generalService
      .General_Configuration_QuickContact_SaveUpdate({
        quickContactName: this.obj.quickContactName,
        quickContactPhone: this.obj.quickContactPhone,
        quickContactEmail: this.obj.quickContactEmail,
      })
      .subscribe((c) => {
        if (c && (c.status == FailedStatus || c.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: c.message,
          });
        } else if (c) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: c?.message,
          });
        }
      });
  }
}
