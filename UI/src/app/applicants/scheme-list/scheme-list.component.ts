import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subscription } from 'rxjs';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import {
  ConfigSchemeGroupModel,
  ConfigurationSchemeSaveModel,
} from 'src/app/_models/schemeConfigModel';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { IconButtonModel } from 'src/app/shared/common/icon-button/icon-button.component';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';
import { CookieService } from 'ngx-cookie-service';

@UntilDestroy()
@Component({
  selector: 'app-scheme-list',
  templateUrl: './scheme-list.component.html',
  styleUrls: ['./scheme-list.component.scss'],
})
export class SchemeListComponent {
  model: IconButtonModel[] = [];
  groupId!: string;
  configurationList!: ConfigurationSchemeSaveModel[];
  breadcrumbs!: BreadcrumbModel[];
  routeSub!: Subscription;
  isLoggedin: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeConfigService: SchemeConfigService,
    private accountService: AccountService,
    private cookieService: CookieService,
    private location: Location,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
    }
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.groupId = params['id']; //log the value of id
        if (this.groupId !== '0') {
          this.schemeConfigService
            .Config_Scheme_View_Get(this.groupId)
            .subscribe((x) => {
              if (x) {
                this.configurationList = x.data;
              }
            });
        }
      });
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
        pathName: 'All Schemes',
        routing: '',
        isActionable: false,
      },
    ];
  }
  geturl(name: string) {
    return '../../../assets/bannerImages/' + name;
  }
  movetoSchemeList(id: string) {
    this.router.navigate(['applicant', 'eligibility', id]);
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
