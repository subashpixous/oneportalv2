import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Guid } from 'guid-typescript';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { MemberDetailsViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';

import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import {
  triggerValueChangesForAll,
  dateconvertionwithOnlyDate,
  dateconvertion,
} from 'src/app/shared/commonFunctions';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@UntilDestroy()
@Component({
  selector: 'app-mem-card-approve-view',
  templateUrl: './mem-card-approve-view.component.html',
  styleUrls: ['./mem-card-approve-view.component.scss']
})
export class MemCardApproveViewComponent {


   memberDetail!: MemberDetailsViewModelExisting;
  title: string = 'Member Card Approval';
  routeSub!: Subscription;
  memberId!: string;
  requestId!: string;
  memberCardData: any;
  reasons: TCModel[] = [];
  url: SafeUrl | string = '';
  apiUrl = environment.apiUrl;
  get trimmedApiUrl(): string {
     return environment.apiUrl.replace(/\/api\/?$/, '').trim();
   }

  constructor(
    private memberService: MemberService,
    private userService: UserService,
    private accountService: AccountService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
    private generalService: GeneralService,
    private sanitizer: DomSanitizer
  ) {}
  encodeURIComponent = encodeURIComponent;
  ngOnInit() {

    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.memberId = params['id']; 
          this.memberService
            .Get_Member_Detail_View(this.memberId)
            .subscribe((x) => {
              if (x) {
                this.memberDetail = x.data;
              }
            });
        if (this.memberId !== '0') {
          this.memberService
  .Get_Member_Id_Card(this.memberId)
  .subscribe((x) => {
    if (x) {
      this.memberCardData = x.data;

      const pic = this.memberCardData?.profile_Picture;
      let finalUrl = '';

      if (pic && pic.trim() !== '') {
        if (pic.startsWith('http') || pic.includes('application.tncwwb.com')) {
          finalUrl = pic;
        } else {
          finalUrl = `${environment.apiUrl.replace('/api/', '')}/images/${pic}`;
        }
      } else {
        finalUrl = 'https://www.w3schools.com/howto/img_avatar.png';
      }

      // ✅ SANITIZE HERE
      this.url = this.sanitizer.bypassSecurityTrustUrl(finalUrl);
    }
  });
            // .Get_Member_Id_Card(this.memberId)
            // .subscribe((x) => {
            //    if (x) {
            //     this.memberCardData = x.data;
            //       const pic = this.memberCardData?.profile_Picture;
                 
            //       if (pic && pic.trim() !== '') {
            //         if (pic.startsWith('http') || pic.includes('application.tncwwb.com')) {
            //           // Already a full URL (either absolute or hosted on application.tncwwb.com)
            //           this.url = pic;
            //         } else {
            //           // Build from environment
            //           this.url = `${environment.apiUrl.replace('/api/', '')}/images/${pic}`;
            //         }
            //       } else {
            //         // Fallback default image
            //         this.url = 'https://www.w3schools.com/howto/img_avatar.png';
            //       }
            //   }
 
            // });
        }
      });
  }
back() {
 
  if (this.router.navigated) {
    this.location.back();
  } else {
    this.router.navigate(['officers', 'applications', 'card-approval']);
  }
}
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  getCommaSeparatedNamesFromFamily(
    members: { nameEnglish?: string; nameTamil?: string }[],
    language: 'English' | 'Tamil'
  ): string {
    const key = language === 'English' ? 'nameEnglish' : 'nameTamil';

    return members
      .map((member) => member[key]?.trim())
      .filter((name) => !!name)
      .join(', ');
  }

  getFormattedAddress(data: any): string {
    const parts: string[] = [];
 
    if (data.doorNo) {
      parts.push(`D.No ${data.doorNo}`);
    }
    if (data.streetName) {
      parts.push(data.streetName);
    }
    if (data.villlageTownCity) {
      parts.push(data.villlageTownCity);
    }
 
    if (data.districtEnglish) {
      parts.push(data.districtEnglish);
    }
    if(data.talukEnglish){
      parts.push(data.talukEnglish);
    }
    if (data.pincode) {
      parts.push(data.pincode);
    }
 
    return parts.join(', ');
  }

  getFormattedAddressTamil(data: any): string {
  const parts: string[] = [];

  if (data.doorNo) {
    parts.push(`க.எண் ${data.doorNo}`); // keep number in English
  }
  if (data.streetNameTamil) {
    parts.push(data.streetNameTamil);
  }
  if (data.villlageTownCityTamil) {
    parts.push(data.villlageTownCityTamil);
  }
  if (data.districtTamil) {
    parts.push(data.districtTamil);
  }
  if (data.talukTamil) {
    parts.push(data.talukTamil);
  }
  if (data.pincode) {
    parts.push(data.pincode);
  }

  return parts.join(', ');
}

}
