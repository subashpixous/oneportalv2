import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import {
  ConfigSchemeGroupModel,
  ConfigurationSchemeSaveModel,
  ConfigurationSchemeViewModel,
} from 'src/app/_models/schemeConfigModel';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { IconButtonModel } from 'src/app/shared/common/icon-button/icon-button.component';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';

@Component({
  selector: 'app-scheme-groups',
  templateUrl: './scheme-groups.component.html',
  styleUrls: ['./scheme-groups.component.scss'],
})
export class SchemeGroupsComponent {
  model: IconButtonModel[] = [];
  configurationList!: ConfigSchemeGroupModel[];
  schemeList!: ConfigurationSchemeViewModel[];
  breadcrumbs!: BreadcrumbModel[];
  isLoggedin: boolean = false;
  visible: boolean = false;
  loginvisible: boolean = false;
  navigationpage: string = '';
  memberInformation!: AccountApplicantLoginResponseModel;
  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private schemeConfigService: SchemeConfigService,
    private location: Location,
    private cookieService: CookieService,
    private accountService: AccountService,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
    }
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'Member Services',
        routing: 'applicant/mem-dashboard',
        isActionable: true,
      },
      {
        pathName: 'Scheme Group',
        routing: '',
        isActionable: false,
      },
    ];
    this.schemeConfigService.Config_Scheme_Group_Get(true).subscribe((x) => {
      if (x) {
        this.configurationList = x.data;
      }
    });
  }

  geturl(name: string) {
    return '../../../assets/group-images/' + name;
  }
  movetoSchemeList(id: string) {
    this.memberInformation = this.accountService.userValue;
    this.schemeConfigService
      .Member_Eligibilty_Get_By_Scheme(id, this.memberInformation?.id ?? '')
      .subscribe((x) => {
        if (x) {
          this.visible = true;
          this.schemeList = x.data;
        }
      });
  }
  bckClick() {
    this.location.back();
  }
  movetosc(id: any) {
    if (!this.isLoggedin) {
      this.loginvisible = true;
      this.navigationpage = 'applicant/eligibility/' + id;
      // this.confirmationService.confirm({
      //   message: `உள்நுழைவதன் மூலம் உங்கள் தனிப்பயனாக்கப்பட்ட தகுதி முடிவுகளை அணுகவும்.
      //   / Access your personalized eligibility results by logging in.`,
      //   header: 'Login Required',
      //   icon: 'pi pi-exclamation-triangle',
      //   accept: () => {},
      //   reject: (type: ConfirmEventType) => {},
      // });
    } else {
      this.router.navigate(['applicant', 'eligibility', id]);
    }
  }
  Logout() {
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }
}
