import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { MessageService } from 'primeng/api';
import { ConfigurationModel } from 'src/app/_models/ConfigurationModel';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { privileges } from 'src/app/shared/commonFunctions';
import { MemberService } from 'src/app/services/member.sevice';
import { MemberDataApprovalGridFilterModel } from 'src/app/_models/filterRequest';
import moment from 'moment';
import { MemberDataApprovalGridModel } from 'src/app/_models/MemberDetailsModel';

@Component({
  selector: 'app-member-history',
  templateUrl: './member-history.component.html',
  styleUrls: ['./member-history.component.scss'],
})
export class MemberHistoryComponent {
  configurationList!: MemberDataApprovalGridModel[];
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
  filtermodel!: MemberDataApprovalGridFilterModel;
  currentTime: string = moment(new Date()).format('DD-MM-yyyy, h:mm:ss A');
  isLoggedin: boolean = false;
  constructor(
    private messageService: MessageService,
    private schemeService: SchemeService,
    private memberService: MemberService,
    private cookieService: CookieService,
    private location: Location,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
    }
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
        field: 'member_Id_Text',
        header: 'Member Id',
        customExportHeader: 'Member Id',
        sortablefield: 'member_Id_Text',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'changed_Detail_Record',
        header: 'Changed Detail ',
        sortablefield: 'changed_Detail_Record',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'nextApprovalRole',
        header: 'Next Approval Role',
        sortablefield: 'nextApprovalRole',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'approvedByRole',
        header: 'Last Approved Role',
        sortablefield: 'approvedByRole',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'lastApprovalReason',
        header: 'Last Approved Reason',
        sortablefield: 'lastApprovalReason',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'lastApprovalComment',
        header: 'Last Approved Comment',
        sortablefield: 'lastApprovalComment',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'changed_Date',
        header: 'Changed Date',
        sortablefield: 'changed_Date',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'changed_Time',
        header: 'Changed Time',
        sortablefield: 'changed_Time',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'updatedByUserName',
        header: 'Updated By',
        sortablefield: 'updatedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'updatedDate',
        header: 'Updated Date',
        sortablefield: 'updatedDate',
        isSortable: true,
        isSearchable: false,
      },
    ];
    this.searchableColumns = [
      'member_Id',
      'district',
      'phone',
      'changed_Detail_Record',
      'approvedByRole',
    ];

    this.actions = [
      {
        icon: 'pi pi-eye',
        title: 'View',
        type: 'VIEW',
      },
    ];
    this.filtermodel = {
      searchString: null,
      skip: 0,
      where: {
        memberDataChangeRequestTypes: [],
        districtIds: [],
        statusIds: [],
        roleId: '',
        memberId: '',
        isActive: true,
        year: '',
        getAll: false,
      },
      sorting: { fieldName: 'changed_Date', sort: 'DESC' },
      take: 100,
      columnSearch: null,
    };
    this.memberService
      .MemberDataApprovalGridGet(this.filtermodel)
      .subscribe((x) => {
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
  Logout() {
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }
}
