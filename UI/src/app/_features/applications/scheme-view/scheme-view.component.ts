import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import {
  ApplicationDetailViewModel,
  ApplicationDetailViewModel1,
} from 'src/app/_models/schemeModel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';

@UntilDestroy()
@Component({
  selector: 'app-scheme-view',
  templateUrl: './scheme-view.component.html',
  styleUrls: ['./scheme-view.component.scss'],
})
export class SchemeViewComponent {
  title: string = 'Application View';
  schemeDetails!: ApplicationDetailViewModel1;
  memberDetails!: MemberViewModelExisting;
  routeSub!: Subscription;
  applicationId!: string;
  cashow: boolean = true;
  MemberId : string = '';
  constructor(
    private cookieService: CookieService,
    private schemeService: SchemeService,
    private router: Router,
    private route: ActivatedRoute,
    private memberService: MemberService,
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
          this.schemeService
            .Application_Get(this.applicationId)
            .subscribe((c) => {
              this.schemeDetails = c.data[0];
              this.memberService
                .Get_Member_All_Details_By_MemberId(c.data[0].memberId)
                .subscribe((x) => {
                  if (x) {
                    this.memberDetails = x.data;
                    this.MemberId = this.memberDetails?.memberDetail?.memberId;

                    console.log(this.memberDetails);
                  }
                });
            });
        }
      });
  }
  back() {
    if (this.cashow) {
      this.router.navigate(['applicant', 'dashboard']);
    } else {
      this.router.navigate(['officers', 'applications']);
    }
  }
  print() {
    // this.router.navigate([
    //   'officers',
    //   'applications',
    //   'view-print',
    //   this.applicationId,
    // ]);
  }
}
