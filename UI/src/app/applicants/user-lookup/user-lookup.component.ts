import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { MessageService } from 'primeng/api';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { MemberService } from 'src/app/services/member.sevice';

@Component({
  selector: 'app-user-lookup',
  templateUrl: './user-lookup.component.html',
  styleUrls: ['./user-lookup.component.scss'],
})
export class UserLookupComponent {
  searchText!: string;
  isFound: string = '';
  isSearchClicked: boolean = false;
  loginvisible: boolean = false;
  navigationpage: string = '';
  constructor(
    private router: Router,
    private memberService: MemberService,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {}
  navigatetoRegister() {
    this.router.navigate(['applicant', 'mem-detail', '0', '0']);
  }
  navigateToAuth() {
    this.router.navigate(['auth', 'login', 'applicant']);
  }
  navigateToSearch() {
    this.memberService.Search_Member(this.searchText).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
      } else if (x) {
        this.isSearchClicked = true;
        this.isFound = x.data;
        if (this.isFound && this.isFound != '') {
          this.loginvisible = true;
          this.navigationpage = 'applicant/mem-dashboard';
        }
      }
    });
  }
  bckClick() {
    this.router.navigate(['applicant']);
  }
  loginClick() {
    this.router.navigate(['auth', 'login', 'applicant']);
    //this.router.navigate(['applicant', 'otp-login']);
  }
}
