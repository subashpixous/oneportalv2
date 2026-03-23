import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { IconButtonModel } from 'src/app/shared/common/icon-button/icon-button.component';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
import { MemberService } from 'src/app/services/member.sevice';
import { MemberFormGeneralInfo } from 'src/app/_models/MemberDetailsModel';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { MenuItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss'],
})
export class MemberDashboardComponent {
  model: IconButtonModel[] = [];
  modelforMemDetails: IconButtonModel[] = [];
  breadcrumbs!: BreadcrumbModel[];
  isLoggedin: boolean = false;
  visible: boolean = false;
  isSubmitted: boolean = false;
  isNewMember: boolean = false;
  isRejected: boolean = false;
  memberDetails!: AccountApplicantLoginResponseModel;
  memberFormGeneralInfo!: MemberFormGeneralInfo;
  memberInfoItems: MenuItem[] = [];
  eligibilitySchemeItems: MenuItem[] = [];
  profilePictureUrl: string = 'assets/images/default-user.png';
  constructor(
    public router: Router,
    private location: Location,
    private cookieService: CookieService,
    private memberService: MemberService,
    private accountService: AccountService,
    private schemeConfigService: SchemeConfigService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.memberDetails = this.accountService.userValue;
    this.isLoggedin = this.cookieService.get('accesstype') == 'APPLICANT';
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
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
      this.memberService
        .MemberFormGeneralInfo_Get(this.memberDetails.id)
        .subscribe((x) => {
          this.memberFormGeneralInfo = x.data;
let rawUrl = '';

        if (this.memberFormGeneralInfo.profile_Picture && this.memberFormGeneralInfo.profile_Picture !== '') {
          if (this.memberFormGeneralInfo.profile_Picture.startsWith('http') || 
              this.memberFormGeneralInfo.profile_Picture.startsWith('data:')) {
            rawUrl = this.memberFormGeneralInfo.profile_Picture;
          } else {
            rawUrl = `${environment.apiUrl.replace('/api/', '')}/images/${this.memberFormGeneralInfo.profile_Picture}`;
          }
        } else {
          rawUrl = 'https://www.w3schools.com/howto/img_avatar.png';
        }

        // 1. Send the raw string to the Header component BEFORE sanitizing it here
        this.accountService.changeProfileImage(rawUrl);

        // 2. Sanitize it for the Dashboard component (using 'any' to avoid TypeScript string errors)
        this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(rawUrl) as any;
          this.isSubmitted = this.memberFormGeneralInfo.isSubmitted;
          this.isNewMember = this.memberFormGeneralInfo.isNewMember;
          this.isRejected = this.memberFormGeneralInfo.isRejected;
          this.setmemDEt();
          // this.initializeMenus();
        this.loadEligibilitySchemes();
        });
    } else {
      this.setmemDEt();
    }
    if (!this.isLoggedin) {
      this.model = [
        {
          buttonName: 'அனைத்து திட்டம் / All Schemes',
          iconImageName: '../../../assets/bannerImages/all-schemes.png',
          id: 'All Schemes',
        },
      ];
    } else {
      this.model = [
        {
          buttonName: 'உறுப்பினர் விவரங்கள் / Member Details',
          id: 'Member Details',
          canClick: true,
          buttonTextName: 'Proceed',
          iconImageName: '../../../assets/bannerImages/member-details.png',
        },
        {
          buttonName: 'கிடைக்கும் திட்டம் / Availed Schemes',
          iconImageName: '../../../assets/bannerImages/availed-scheme.png',
          id: 'Availed Schemes',
        },
        {
          buttonName: 'அனைத்து திட்டம் / All Schemes',
          iconImageName: '../../../assets/bannerImages/all-schemes.png',
          id: 'All Schemes',
        },
      ];
    }
  }
  // setmemDEt() {
  //   this.modelforMemDetails = [
  //     {
  //       buttonName: 'உறுப்பினர் விவரங்கள் / Member Data',
  //       tooltip:
  //         'உங்கள் உறுப்பினர் விவரங்களைப் பார்க்கவும் / View Your Member Details',
  //       iconImageName: '../../../assets/bannerImages/member-details.png',
  //       id: 'Member Data',
  //       canClick: true,
  //       buttonTextName: this.isSubmitted ? 'View' : 'Edit',
  //     },
  //     {
  //       buttonName: 'உறுப்பினர் தரவு புதுப்பிப்பு / Member Data Update',
  //       tooltip:
  //         'உங்கள் குறிப்பிட்ட தகவலைப் புதுப்பிக்கவும் / Update Your Particular Information',
  //       iconImageName: '../../../assets/bannerImages/member-data-update.png',
  //       id: 'Member Data Update',
  //       canClick: this.isSubmitted && !this.isRejected,
  //       buttonTextName:
  //         this.isSubmitted && !this.isRejected
  //           ? 'Proceed'
  //           : 'Details Unavailable',
  //     },
  //     {
  //       buttonName: 'உறுப்பினர் அடையாள அட்டை / Member ID Card',
  //       tooltip:
  //         'உங்கள் உறுப்பினர் அடையாள அட்டையைப் பார்க்கவும் / View Your Member ID Card',
  //       iconImageName: '../../../assets/bannerImages/member-id-card.png',
  //       id: 'Member ID Card',
  //       canClick: this.isSubmitted && !this.isRejected,
  //       buttonTextName:
  //         this.isSubmitted && !this.isRejected
  //           ? 'Proceed'
  //           : 'Details Unavailable',
  //     },
  //     {
  //       buttonName: 'உறுப்பினர் வரலாறு / Member History',
  //       tooltip:
  //         'உங்கள் உறுப்பினர் வரலாற்றைப் பார்க்கவும் / View Your Member History',
  //       iconImageName: '../../../assets/bannerImages/member-history.png',
  //       id: 'Member History',
  //       canClick: this.isSubmitted || !this.isSubmitted,
  //       buttonTextName: this.isSubmitted ? 'Proceed' : 'Proceed',
  //     },
  //   ];
  // }
  setmemDEt() {
  this.modelforMemDetails = [
    {
      buttonName: 'உறுப்பினர் விவரங்கள் / Member Details',
      tooltip: 'உங்கள் உறுப்பினர் விவரங்களைப் பார்க்கவும் / View Your Member Details',
      iconImageName: '../../../assets/bannerImages/member-details.png',
      id: 'Member Data',
      canClick: true,
      buttonTextName: this.isSubmitted ? 'View' : 'Edit',
    },
    {
      buttonName: 'உறுப்பினர் தரவு புதுப்பிப்பு / Member Update',
      tooltip: 'உங்கள் குறிப்பிட்ட தகவலைப் புதுப்பிக்கவும் / Update Your Particular Information',
      iconImageName: '../../../assets/bannerImages/member-data-update.png',
      id: 'Member Data Update',
      canClick: this.isSubmitted && !this.isRejected,
      buttonTextName: this.isSubmitted && !this.isRejected ? 'Proceed' : 'Details Unavailable',
    },
    {
      buttonName: 'உறுப்பினர் அடையாள அட்டை / Member ID Card',
      tooltip: 'உங்கள் உறுப்பினர் அடையாள அட்டையைப் பார்க்கவும் / View Your Member ID Card',
      iconImageName: '../../../assets/bannerImages/member-id-card.png',
      id: 'Member ID Card',
      canClick: this.isSubmitted && !this.isRejected,
      buttonTextName: this.isSubmitted && !this.isRejected ? 'Proceed' : 'Details Unavailable',
    },
    {
      buttonName: 'உறுப்பினர் வரலாறு / Member History',
      tooltip: 'உங்கள் உறுப்பினர் வரலாற்றைப் பார்க்கவும் / View Your Member History',
      iconImageName: '../../../assets/bannerImages/member-history.png',
      id: 'Member History',
      canClick: true,
      buttonTextName: 'Proceed',
    },
  ];

  // 2. Immediately sync the Menu items whenever logic updates
  this.syncMemberMenu();
}
syncMemberMenu() {
  this.memberInfoItems = this.modelforMemDetails.map((item) => {
    return {
      // label: extracts only the English part (e.g., "Member Data")
      label: item.buttonName.split('/')[1]?.trim() || item.buttonName, 
      // Removed the icon property entirely
      disabled: !item.canClick,
      command: () => this.movetosc(item.id),
      title: item.tooltip 
    };
  });
}

// Ensure this returns the full PrimeIcon class string
getMenuIcon(id: string): string {
  const icons: { [key: string]: string } = {
    'Member Data': 'pi pi-user',
    'Member Data Update': 'pi pi-user-edit',
    'Member ID Card': 'pi pi-id-card',
    'Member History': 'pi pi-history'
  };
  return icons[id] || 'pi pi-info-circle';
}
  initializeMenus() {
    // Member Info Menu
    this.memberInfoItems = [
      { label: 'Member Data', icon: 'pi pi-user', command: () => this.movetosc('Member Data') },
      { label: 'Update Info', icon: 'pi pi-pencil', disabled: !this.isSubmitted, command: () => this.movetosc('Member Data Update') },
      { label: 'ID Card', icon: 'pi pi-id-card', disabled: !this.isSubmitted, command: () => this.movetosc('Member ID Card') },
      { label: 'History', icon: 'pi pi-history', command: () => this.movetosc('Member History') }
    ];
  }

  loadEligibilitySchemes() {
    this.schemeConfigService.Config_Scheme_Group_Get(true).subscribe((res: any) => {
      if (res?.data) {
        this.eligibilitySchemeItems = res.data.map((group: any) => ({
          label: `${group.groupName}`,
          command: () => {
            this.router.navigate(['applicant', 'eligibility', group.id]);
          }
        }));
      }
    });
  }
  movetosc(event: any) {
    
    if (event == 'Member Data') {
      if (this.isSubmitted) {
        this.router.navigate([
          'applicant',
          'mem-detail-view',
          this.memberDetails.id,
       ], { queryParams: { from: 'dashboard' } }); // 👈 Add this query param
      }
      else {
        this.router.navigate([
          'applicant',
          'mem-detail',
          this.memberDetails.id,
          '0',
        ]);
      }
      
    }
  if (event == 'Member Data Update') {
      // this.router.navigate([
      //   'applicant',
      //   'member-data-update',
      //   this.memberDetails.id,
      // ]);

            this.router.navigate([
          'applicant',
          'mem-detail',
        this.memberDetails.id,
         '0',
      ],
        { queryParams: { isEdit: true } });
    } else if (event == 'Member ID Card') {
      this.router.navigate([
        'applicant',
        'member-id-card',
        this.memberDetails.id,
      ]);
    } else if (event == 'Member History') {
      this.router.navigate([
        'applicant',
        'member-history',
        this.memberDetails.id,
      ]);
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
  iconbtnClicked(event: IconButtonModel) {
    if (event.id == 'Member Details') {
      this.visible = true;
    }
    if (event.id == 'Availed Schemes') {
      this.router.navigate(['applicant', 'dashboard']);
    }
    if (event.id == 'All Schemes') {
      this.router.navigate(['applicant', 'scheme-group']);
    }
  }
  goToDashboard() {
    this.router.navigate(['applicant', 'dashboard']);
}
}
