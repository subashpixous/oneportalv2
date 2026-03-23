import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import {
  ApplicationDetailViewModel,
  ApplicationDropdownModel,
  StatusFlowModel,
} from 'src/app/_models/schemeModel';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { environment } from 'src/environments/environment';
import {
  dateconvertionwithOnlyDate,
  dateconvertion,
  convertoWords,
  monthDiff,
} from '../../commonFunctions';
import { ConfigurationSchemeCostFieldModel } from 'src/app/_models/schemeConfigModel';
import moment from 'moment';

@UntilDestroy()
@Component({
  selector: 'app-mkk-view-print',
  templateUrl: './mkk-view-print.component.html',
  styleUrls: ['./mkk-view-print.component.scss'],
})
export class MkkViewPrintComponent {
  @Input() schemeDetails!: ApplicationDetailViewModel;
  applicationId!: string;
  cashow!: boolean;
  url: any = '';
  routeSub!: Subscription;
  costFieldModels: ConfigurationSchemeCostFieldModel[] = [];
  constructor(
    private messageService: MessageService,
    private schemeService: SchemeService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private http: HttpClient
  ) {}
  ngOnInit() {
    this.cashow = this.cookieService.check('accesstype')
      ? this.cookieService.get('accesstype') != 'OFFICER' &&
        this.cookieService.get('accesstype') != ''
        ? true
        : false
      : true;
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.applicationId = params['id']; //log the value of id
        if (this.applicationId !== '0') {
          // this.schemeService
          //   .Application_Get(this.applicationId)
          //   .subscribe((c) => {
          //     this.schemeDetails = c.data[0];
          //     this.url = `${environment.apiUrl.replace('/api/', '')}/images/${
          //       this.schemeDetails.thumbnailSavedFileName
          //     }`;
          //   });
        }
      });
  }
  ngOnChanges() {
    if (this.schemeDetails) {
      this.schemeService
        .applicationFormGet(this.schemeDetails.applicationId)
        .subscribe((x) => {
          var det: ApplicationDropdownModel = x.data;
          if (det) {
            this.costFieldModels = det.costFieldModels ?? [];
          }
        });
      if (
        this.schemeDetails.thumbnailSavedFileName &&
        this.schemeDetails.thumbnailSavedFileName != ''
      ) {
        this.url = `${environment.apiUrl.replace('/api/', '')}/images/${
          this.schemeDetails.thumbnailSavedFileName
        }`;
      } else {
        this.url = 'https://www.w3schools.com/howto/img_avatar.png';
      }
    }
  }

  convertoWordsd(cost: any) {
    return convertoWords(cost ?? 0);
  }
  canShowthisProjectField(fieldName: string) {
    var filed = this.costFieldModels.filter((x) => x.fieldId == fieldName);
    if (filed && filed.length > 0) {
      return filed[0].isVisible;
    }
    return false;
  }
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
  print() {
    const printContents = document.getElementById('demo')?.innerHTML;
    const popupWin = window.open(
      '',
      '_blank',
      'top=10,left=10,height=100%,width=auto'
    );

    popupWin?.document.open();
    popupWin?.document.write(`
      <html>
        <head>
          <title>Print</title>
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
  calculateAge(x: any) {
    let crrdate = new Date();
    var years = (monthDiff(moment(x).toDate(), crrdate) / 12).toFixed(0);
    return years;
  }
  back() {
    if (this.cashow) {
      this.router.navigateByUrl('/applicant/eligibility');
    } else {
      this.router.navigateByUrl('/officers/applications');
    }
  }
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  CheckNullorEmpty(value?: string | undefined | null) {
    return value != null && value != undefined && value != '';
  }
  CheckZero(value?: number) {
    return value != null && value != undefined && value != 0;
  }
}
