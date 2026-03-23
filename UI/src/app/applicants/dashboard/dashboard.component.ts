import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import {
  ConfigurationModel,
  ConfigCategoryModel,
} from 'src/app/_models/ConfigurationModel';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { privileges } from 'src/app/shared/commonFunctions';
import { Location } from '@angular/common';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  configurationList!: ConfigurationModel[];
  breadcrumbs!: BreadcrumbModel[];
  cols!: Column[];
  searchableColumns!: string[];
  memberInformation!: AccountApplicantLoginResponseModel;
  actions: Actions[] = [];
  isDependent: boolean = false;
  title: string = 'Dashboard';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  hasCode: boolean = false;
  defaultSortField: string = 'temporaryNumber';
  defaultSortOrder: number = 1;
  currentStatus: boolean = true;
  canShowAction: boolean = true;
  parentconfigtext!: string;
  mobile: string = '';
  name: string = '';
  privleges = privileges;
  constructor(
    private messageService: MessageService,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private cookieService: CookieService,
    private location: Location,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.memberInformation = this.accountService.userValue;
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'Member Services',
        routing: '',
        isActionable: false,
      },
    ];
    this.mobile = this.cookieService.get('mobile');
    this.name = this.cookieService.get('name');
    this.cols = [
      {
        field: 'temporaryNumber',
        header: 'தற்காலிக எண் / Temporary Number',
        customExportHeader: 'தற்காலிக எண் / Temporary Number',
        sortablefield: 'temporaryNumber',
        isSortable: true,
      },
      {
        field: 'applicationNumber',
        header: 'விண்ணப்ப எண் / Application Number',
        customExportHeader: 'விண்ணப்ப எண் / Application Number',
        sortablefield: 'applicationNumber',
        isSortable: true,
      },
      {
        field: 'scheme',
        header: 'திட்டம் / Scheme',
        sortablefield: 'scheme',
        isSortable: true,
      },
      {
        field: 'firstName',
        header: 'முதல் பெயர் /First Name',
        sortablefield: 'firstName',
        isSortable: true,
      },
      {
        field: 'lastName',
        header: 'கடைசி பெயர் / Initial',
        sortablefield: 'lastName',
        isSortable: true,
      },
      {
        field: 'status',
        header: 'நிலை / Status',
        sortablefield: 'status',
        isSortable: true,
      },
      {
        field: 'modifiedDate',
        header: 'தேதி / Date',
        sortablefield: 'modifiedDate',
        isSortable: true,
      },
    ];
    this.searchableColumns = [
      'applicationNumber',
      'temporaryNumber',
      'lastName',
      'scheme',
      'firstName',
    ];

    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        visibilityCheckFeild: 'canEdit',
      },
      {
        icon: 'pi pi-eye',
        title: 'View',
        type: 'VIEW',
      },
    ];
    this.schemeService.Applicant_Application_Get().subscribe((x) => {
      if (x) {
        this.configurationList = x.data;
      }
    });
  }
  resetForm() {
    this.total = 0;
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'EDIT') {
      this.router.navigate(['applicant', 'd-scheme', val.record.applicationId]);
    } else if (val && val.type == 'VIEW') {
      this.router.navigateByUrl('/applicant/view/' + val.record.applicationId);
    } else if (val && val.type == 'ACTIVATE') {
    }
  }
  changeStatus(event: any) {}
  logout() {
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }
  bckClick() {
    this.location.back();
  }
}
