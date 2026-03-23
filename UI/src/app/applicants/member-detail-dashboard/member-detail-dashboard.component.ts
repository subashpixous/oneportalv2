import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { IconButtonModel } from 'src/app/shared/common/icon-button/icon-button.component';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-member-detail-dashboard',
  templateUrl: './member-detail-dashboard.component.html',
  styleUrls: ['./member-detail-dashboard.component.scss'],
})
export class MemberDetailDashboardComponent {
  model: IconButtonModel[] = [];
  breadcrumbs!: BreadcrumbModel[];
  isLoggedin: boolean = false;
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private location: Location,
    private accountService: AccountService,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    this.router.navigate(['applicant', 'mem-dashboard']);
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
        routing: '',
        isActionable: false,
      },
    ];
    this.model = [
      {
        buttonName: 'Member Data',
        iconImageName: '../../../assets/bannerImages/member-details.png',
        id: 'Member Data',
      },
      {
        buttonName: 'Member Data Update',
        iconImageName: '../../../assets/bannerImages/member-data-update.png',
        id: 'Member Data',
      },
      {
        buttonName: 'Member ID Card',
        iconImageName: '../../../assets/bannerImages/member-id-card.png',
        id: 'Member Data',
      },
      {
        buttonName: 'உறுப்பினர் வரலாறு / Member History',
        iconImageName: '../../../assets/bannerImages/member-history.png',
        id: 'Member Data',
      },
    ];
  }
  iconbtnClicked(event: any) {
    if (event.buttonName == 'Member Data') {
      this.router.navigate(['applicant', 'mem-detail', '0', '0']);
    } else if (event.buttonName == 'Member Data Update') {
      this.router.navigate(['applicant', 'member-data-update', 'AVAILED']);
    } else if (event.buttonName == 'Member ID Card') {
      this.router.navigate(['applicant', 'member-id-card', 'ALL']);
    } else if (event.buttonName == 'Member History') {
      this.router.navigate(['applicant', 'member-id-card', 'ALL']);
    }
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
