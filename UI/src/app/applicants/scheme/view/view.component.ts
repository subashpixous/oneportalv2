import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ApplicationSchemeCostDetails } from 'src/app/_models/MemberDetailsModel';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import {
  ApplicationDetailViewModel,
  ApplicationDetailViewModel1,
} from 'src/app/_models/schemeModel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { Location } from '@angular/common';
@UntilDestroy()
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent {
  title: string = 'Application View';
  schemeDetails!: ApplicationDetailViewModel1;
  memberDetail!: MemberViewModelExisting;
  schemeCateDetail!: ApplicationSchemeCostDetails;
  routeSub!: Subscription;
  applicationId!: string;
  constructor(
    private memberService: MemberService,
    private schemeService: SchemeService,
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private http: HttpClient,
    private location: Location
  ) {}
  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.applicationId = params['id']; //log the value of id
        if (this.applicationId !== '0') {
          this.schemeService
            .Application_Get(this.applicationId)
            .subscribe((c) => {
              this.schemeDetails = c.data[0];
this.schemeCateDetail = c.data[0].schemeCateDetail;
              this.memberService
                .Get_Member_All_Details_By_MemberId(c.data[0].memberId)
                .subscribe((x) => {
                  if (x) {
                    this.memberDetail = x.data;
                  }
                });
            });
        }
      });
  }
back() {
  this.location.back();
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
