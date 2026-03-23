import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import {
  MemberDocumentMaster,
  MemberGetModels,
} from 'src/app/_models/MemberDetailsModel';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { ApplicationDetailViewModel1 } from 'src/app/_models/schemeModel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { Location } from '@angular/common';
@UntilDestroy()
@Component({
  selector: 'app-mem-detail-view',
  templateUrl: './mem-detail-view.component.html',
  styleUrls: ['./mem-detail-view.component.scss'],
})
export class MemDetailViewComponent {
  memberDetails!: MemberViewModelExisting;
  memPersonalInfo!: MemberDocumentMaster[];
  title: string = 'Member Information';
  memberId: string = '';
  routeSub!: Subscription;
  allDet!: MemberGetModels;
  applicantType: string | null = null;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private permissionsService: NgxPermissionsService,
    private location: Location
  ) {}
  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.memberId = params['id']; //log the value of id
        if (this.memberId !== '0') {
          this.memberService
            .Get_Member_All_Details_By_MemberId(this.memberId)
            .subscribe((x) => {
              if (x) {
                this.memberDetails = x.data;
              }
            });
        }
      });

    this.applicantType = sessionStorage.getItem('Applicanttype');
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
// back() {
//     // Check if the URL contains '?from=dashboard'
//     const isFromDashboard = this.route.snapshot.queryParams['from'] === 'dashboard';

//     if (isFromDashboard) {
//       // Came from Member Dashboard -> Go back
//       this.location.back(); 
//     } else {
//       // Came directly or from somewhere else -> Logout
//       this.Logout();
//     }
//   }
  


  back() {
  const role = sessionStorage.getItem('accesstype'); 
 if (role === 'OFFICER') {
    this.router.navigate(['/officers/applications']);
  } else {
    this.router.navigate(['/applicant']);
  }
}






Logout() {
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }

    get hasValidDocuments(): boolean {
  return this.memberDetails?.memberDocuments?.some(
    (x: any) => x.originalFileName && x.originalFileName.trim() !== ''
  );
}
}
