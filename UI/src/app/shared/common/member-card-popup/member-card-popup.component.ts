import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { MemberDetailsViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { dateconvertion, dateconvertionwithOnlyDate } from '../../commonFunctions';

@Component({
  selector: 'app-member-card-popup',
  templateUrl: './member-card-popup.component.html',
  styleUrls: ['./member-card-popup.component.scss']
})
export class MemberCardPopupComponent {
 @Input() memberId!: string;

  memberCardData: any;
  url: any = '';

   memberDetail!: MemberDetailsViewModelExisting;
  title: string = 'Member Card Approval';
  routeSub!: Subscription;

  requestId!: string;

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
    private generalService: GeneralService
  ) {}
  encodeURIComponent = encodeURIComponent;
  ngOnInit() {
    if (this.memberId) {
      this.memberService.Get_Member_Id_Card(this.memberId)
        .subscribe((x) => {
          if (x) {
            this.memberCardData = x.data;

            const pic = this.memberCardData?.profile_Picture;

            if (pic && pic.trim() !== '') {
              this.url = pic.startsWith('http')
                ? pic
                : `${environment.apiUrl.replace('/api/', '')}/images/${pic}`;
            } else {
              this.url = 'https://www.w3schools.com/howto/img_avatar.png';
            }
          }
        });
    }
  }

  back() {
   
    if (this.router.navigated) {
      // this.location.back();
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
