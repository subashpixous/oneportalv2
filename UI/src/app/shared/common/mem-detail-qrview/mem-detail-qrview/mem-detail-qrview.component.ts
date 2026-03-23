import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgxPermissionsService } from 'ngx-permissions';
import { MessageService } from 'primeng/api';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { MemberService } from 'src/app/services/member.sevice';
import { GeneralService } from 'src/app/services/general.service';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-mem-detail-qrview',
  templateUrl: './mem-detail-qrview.component.html',
  styleUrls: ['./mem-detail-qrview.component.scss']
})
export class MemDetailQrviewComponent {
  memberDetails!: MemberViewModelExisting;
  title: string = 'Member Information';
  memberId: string = '';

  constructor(
    private messageService: MessageService,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private cdr: ChangeDetectorRef,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        untilDestroyed(this),
        switchMap((params) => {
          this.memberId = params.get('id') ?? '';
          console.log('Route param ID:', this.memberId); // ✅ Debug

          if (!this.memberId || this.memberId === '0') {
            console.warn('Invalid MemberId, skipping API call');
            return EMPTY;
          }

          return this.memberService.Get_Member_detail_byqr(this.memberId);
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('API Response:', res); // ✅ Debug
          if (res?.data) {
            this.memberDetails = res.data;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('API error:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load member details'
          });
        }
      });
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.qrmemberdownload(id, originalFileNAme ?? 'File.png');
  }

}
