import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';

@Component({
  selector: 'app-otp-login',
  templateUrl: './otp-login.component.html',
  styleUrls: ['./otp-login.component.scss'],
})
export class OtpLoginComponent {
  value!: number;
  breadcrumbs!: BreadcrumbModel[];
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private permissionsService: NgxPermissionsService
  ) {}
  ngOnInit() {
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'Member Login',
        routing: '',
        isActionable: false,
      },
    ];
  }
  bckClick() {
    this.router.navigate(['applicant']);
  }
  loginClick() {
    this.router.navigate(['applicant', 'mem-dashboard']);
  }
}
