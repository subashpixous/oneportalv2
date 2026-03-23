import { Component, Input, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  convertoWords,
  dateconvertion,
  dateconvertionwithOnlyDate,
  monthDiff,
} from '../../commonFunctions';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ApplicationApprovalFileModel } from 'src/app/_models/ConfigurationModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { ConfigurationSchemeCostFieldModel } from 'src/app/_models/schemeConfigModel';
import {
  ApplicationDetailViewModel,
  StatusFlowModel,
  ApplicationDropdownModel,
  ApplicationDetailViewModel1,
} from 'src/app/_models/schemeModel';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { ApplicationSchemeCostDetails } from 'src/app/_models/MemberDetailsModel';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MemDocumentDetailComponent } from '../mem-document-detail/mem-document-detail.component';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
@UntilDestroy()
@Component({
  selector: 'app-mem-scheme-view',
  templateUrl: './mem-scheme-view.component.html',
  styleUrls: ['./mem-scheme-view.component.scss'],
})
export class MemSchemeViewComponent {
  @Input() schemeDetails!: ApplicationDetailViewModel1;
  @Input() memberDetails!: MemberViewModelExisting;
  @Input() canshowform3: boolean = false;
    @ViewChild(MemDocumentDetailComponent)
    MemDocumentDetailComponent!: MemDocumentDetailComponent;
  visible: boolean = false;
  documents: ApplicationApprovalFileModel[] = [];
  schemeCateDetail!: ApplicationSchemeCostDetails;

  costFieldModels: ConfigurationSchemeCostFieldModel[] = [];
  isSchemeDetailsOpen: boolean = true;
  isSubSchemesOpen: boolean = false; // Default ah close la irukanum na false
  isDocumentsOpen: boolean = true;
  url: any = '';

  displayDocPopup: boolean = false;
selectedDocUrl: SafeResourceUrl | null = null;
isPdf: boolean = false;

  isSchemeDocumentsOpen: boolean = true;   // Closed (+)

  isYourDetailsOpen: boolean = false;       // Closed (+)
  isFamilyDetailsOpen: boolean = false;     // Closed (+)
  isOrgDetailsOpen: boolean = true;         // Open (-)

  constructor(
    private messageService: MessageService,
    private schemeService: SchemeService,
    private router: Router,
    private schemeConfigService: SchemeConfigService,
    private generalService: GeneralService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}
  getclass(item: StatusFlowModel) {
    var isPassed = item.isPassed;
    var isPreviousPassed = this.schemeDetails.statusFlow?.find(
      (x) => x.number == item.number - 1
    )?.isPassed;
    if (isPassed) {
      return 'ChevronDiv ChevronDiv_completed';
    } else if (isPreviousPassed && !isPassed) {
      return 'ChevronDiv ChevronDiv_Active';
    }
    return 'ChevronDiv';
  }
  getStyle(item: StatusFlowModel) {
    var isPassed = item.isPassed;
    var isPreviousPassed = this.schemeDetails.statusFlow?.find(
      (x) => x.number == item.number - 1
    )?.isPassed;
    if (isPassed) {
      return (
        'background-color:#28a745;' + 'z-index:' + (50 - item.number) + ';'
      );
    } else if (
      (isPreviousPassed != undefined && isPreviousPassed) ||
      isPreviousPassed == undefined
    ) {
      return (
        'background-color:#06568e;' + 'z-index:' + (50 - item.number) + ';'
      );
    }
    return 'z-index:' + (50 - item.number) + ';';
  }
  ngOnChanges() {
    this.schemeConfigService
      .Application_Scheme_Form({
        applicationId: this.schemeDetails.applicationId,
        schemeId: this.schemeDetails.schemeId,
      })
      .subscribe((x) => {
        if (x) {
          this.schemeCateDetail = x.data;
        }
      });
   if (this.schemeDetails?.thumbnailSavedFileName &&
    this.schemeDetails.thumbnailSavedFileName.trim() !== '') {
  this.url = `${environment.apiUrl.replace('/api/', '')}/images/${this.schemeDetails.thumbnailSavedFileName}`;
} else {
  this.url = 'https://www.w3schools.com/howto/img_avatar.png';
}
  }

  canShowthisProjectField(fieldName: string) {
    var filed = this.costFieldModels.filter((x) => x.fieldId == fieldName);
    if (filed && filed.length > 0) {
      return filed[0].isVisible;
    }
    return false;
  }
  bacdk() {
    this.router.navigate(['tender']);
  }
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  calculateAge(x: any) {
    let crrdate = new Date();
    var years = (monthDiff(moment(x).toDate(), crrdate) / 12).toFixed(0);
    return years;
  }
  getDocuments(selectedstsId: string) {
    this.schemeService
      .Application_Approval_Document_Get(selectedstsId)
      .subscribe((c) => {
        if (c.data) {
          var d: ApplicationApprovalFileModel[] = c.data;
          if (d) {
            this.visible = true;
            this.documents = d;
            // this.documentsFormArray.clear();
            // this.generateDefaultRows(d);
          }
        }
      });
  }
  back() {
    const printContents = document.getElementById('demo')?.innerHTML;
    const popupWin = window.open(
      '',
      '_blank',
      'top=0,left=0,height=100%,width=auto'
    );

    popupWin?.document.open();
    popupWin?.document.write(`
      <html>
        <head>
          <title>Print</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/5.3.0/css/bootstrap.min.css">
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${printContents}
        </body>
      </html>
    `);
    popupWin?.document.close();
  }
  convertoWordsd(cost: any) {
    return convertoWords(cost ?? 0);
  }
  downloadFile(original: string, saved: string) {
    this.generalService.approvalFiledownloads(saved, original ?? 'File.png');
  }
  approvalFiledownloads(original: string, saved: string) {
    this.generalService.approvalFiledownloads(saved, original ?? 'File.png');
  }
  approvalStatusFiledownloads(original: string, id: string) {
    this.generalService.approvalStatusFiledownloads(original ?? 'File.png', id);
  }
  openDocumentInPopup(savedFileName: string) {
    const fullUrl = `${environment.apiUrl.replace('/api/', '')}/images/${savedFileName}`;
    
    // Check if it's a PDF to decide between <iframe> and <img>
    this.isPdf = savedFileName.toLowerCase().endsWith('.pdf');
    
    // Sanitize the URL for the iframe/object
    this.selectedDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    this.displayDocPopup = true;
}
  // openimg(id: string, originalFileNAme: string) {
  //   return `${environment.apiUrl.replace(
  //     '/api/',
  //     ''
  //   )}/images/${originalFileNAme}`;
  // }
  openimg(id: string, originalFileNAme: string): SafeUrl {
  const fullUrl = `${environment.apiUrl.replace('/api/', '')}/images/${originalFileNAme}`;
  return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
}
  save(event: any) {
    this.schemeService.Application_Form_3_SaveUpdate(event).subscribe((x) => {
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
        this.schemeService
          .Application_Form_3_Get('', this.schemeDetails.applicationId)
          .subscribe((x) => {
            if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
            } else if (x) {
              this.schemeDetails = { ...this.schemeDetails, form3: x.data };
            }
          });
      }
    });
  }
  saveUc(event: any) {
    this.schemeService
      .Application_Utilisation_Certificate_SaveUpdate(event)
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
          this.schemeService
            .Application_Utilisation_Certificate_Get(
              '',
              this.schemeDetails.applicationId
            )
            .subscribe((x) => {
              if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
              } else if (x) {
                this.schemeDetails = {
                  ...this.schemeDetails,
                  ucDocument: x.data,
                };
              }
            });
        }
      });
  }
  resetForm() {}
  CheckNullorEmpty(value?: string | undefined | null) {
    return value != null && value != undefined && value != '';
  }
  CheckZero(value?: number) {
    return value != null && value != undefined && value != 0;
  }
  getAmount() {
    var totl = 0;
    this.schemeCateDetail?.schemeSubCategory?.forEach((x) => {
      if (x.isSelected) {
        totl += Number(x.amount);
      }
    });
    return totl;
  }
  CtoWords(amt: any) {
    return convertoWords(amt);
  }
}
