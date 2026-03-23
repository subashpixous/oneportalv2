// // import { Component } from '@angular/core';
// // import { Router, ActivatedRoute } from '@angular/router';
// // import { MessageService } from 'primeng/api';
// // import {
// //   ConfigSchemeGroupModel,
// //   ConfigurationSchemeSaveModel,
// //   SchemRequiredCategoryDocuments,
// // } from 'src/app/_models/schemeConfigModel';
// // import { Location } from '@angular/common';
// // import { Subscription } from 'rxjs';
// // import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
// // import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// // import { MemberService } from 'src/app/services/member.sevice';
// // import { AccountService } from 'src/app/services/account.service';
// // import { CookieService } from 'ngx-cookie-service';
// // import {
// //   AccountApplicantLoginResponseModel,
// //   UserModel,
// // } from 'src/app/_models/user';
// // import { BreadcrumbModel } from 'src/app/_models/CommonModel';
// // import {
// //   ExistApplicationIdModel,
// //   MemberEligibilityModel,
// // } from 'src/app/_models/MemberDetailsModel';

// // @UntilDestroy()
// // @Component({
// //   selector: 'app-eligibility',
// //   templateUrl: './eligibility.component.html',
// //   styleUrls: ['./eligibility.component.scss'],
// // })
// // export class EligibilityComponent {
// //   configurationList!: ConfigurationSchemeSaveModel;
// //   routeSub!: Subscription;
// //   schemeId!: string;
// //   isLoggedin: boolean = false;
// //   memberEligibilitydetail!: MemberEligibilityModel[];
// //   breadcrumbs!: BreadcrumbModel[];
// //   memberDetails!: AccountApplicantLoginResponseModel;
// //   constructor(
// //     private memberService: MemberService,
// //     private schemeConfigService: SchemeConfigService,
// //     private location: Location,
// //     private accountService: AccountService,
// //     private cookieService: CookieService,
// //     private router: Router,
// //     private route: ActivatedRoute
// //   ) {}
// //   ngOnInit() {
// //     if (this.cookieService.get('accesstype') == 'APPLICANT') {
// //       this.isLoggedin = true;
// //     }
// //     window.scroll({
// //       top: 0,
// //       left: 0,
// //       behavior: 'smooth',
// //     });

// //     this.routeSub = this.route.params
// //       .pipe(untilDestroyed(this))
// //       .subscribe((params) => {
// //         this.schemeId = params['id']; //log the value of id
// //         if (this.schemeId !== '0') {
// //           this.schemeConfigService
// //             .Config_Scheme_Get(this.schemeId)
// //             .subscribe((x) => {
// //               if (x) {
// //                 this.configurationList = x.data[0];
// //               }
// //             });
// //           if (this.isLoggedin) {
// //             this.memberDetails = this.accountService.userValue;
// //             this.memberService
// //               .Member_Eligibilty_Get(this.memberDetails.id, this.schemeId)
// //               .subscribe((x) => {
// //                 if (x) {
// //                   this.memberEligibilitydetail = x.data;
// //                 }
// //               });
// //           }
// //         }
// //       });

// //     this.breadcrumbs = [
// //       {
// //         pathName: 'Homepage ',
// //         routing: 'applicant',
// //         isActionable: true,
// //       },
// //       {
// //         pathName: 'Member Services',
// //         routing: 'applicant/mem-dashboard',
// //         isActionable: true,
// //       },
// //       {
// //         pathName: 'All Schemes',
// //         routing: '',
// //         isActionable: false,
// //       },
// //     ];
// //   }
// //   movetoSchemeList(id: string) {
// //     this.router.navigate(['applicant', 'eligibility', id]);
// //   }
// //   back() {
// //     this.location.back();
// //   }
// //   applyClick(mem: MemberEligibilityModel) {
// //     if (mem.existApplication) {
// //       var d: ExistApplicationIdModel = mem.existApplication;
// //       this.schemeConfigService
// //         .Application_Get(d.applicationId)
// //         .subscribe((x) => {
// //           if (x) {
// //             if (
// //               mem.existApplication.submittedDate &&
// //               mem.existApplication.submittedDate != ''
// //             ) {
// //               this.router.navigate([
// //                 'applicant',
// //                 'view',
// //                 x.data[0].applicationId,
// //               ]);
// //             } else {
// //               this.router.navigate([
// //                 'applicant',
// //                 'd-scheme',
// //                 x.data[0].applicationId,
// //               ]);
// //             }
// //           }
// //         });
// //     } else {
// //       this.schemeConfigService
// //         .Application_Init({
// //           id: '',
// //           schemeId: this.schemeId,
// //           memberId: this.memberDetails.id,
// //           fromStatusId: '',
// //           toStatusId: '',
// //           selectedMember: mem,
// //           isSubmit: false,
// //           memberName: this.memberDetails.name,
// //           applicantName: mem.name,
// //           mobile: this.memberDetails.mobile,
// //           district: '',
// //         })
// //         .subscribe((x) => {
// //           if (x) {
// //             this.router.navigate(['applicant', 'd-scheme', x.data]);
// //           }
// //         });
// //     }
// //   }
// //   getNonEmptyDocs(doscs: string[]) {
// //     return doscs.filter((x) => x != '');
// //   }
// //   getLabel(isAlreadyAvailed?: ExistApplicationIdModel) {
// //     if (isAlreadyAvailed) {
// //       return 'Click to Continue';
// //     }
// //     return 'Apply';
// //   }
// //   isToDisable(item: any) {
// //     return !item.showApplyOption;
// //   }
// //   Logout() {
// //     this.accountService.logout();
// //     this.router.navigate(['/'], {
// //       //queryParams: { returnUrl: returnUrl },
// //     });
// //   }
// // }
// import { Component, OnInit } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { Location } from '@angular/common';
// import { Subscription } from 'rxjs';
// import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

// import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
// import { MemberService } from 'src/app/services/member.sevice';
// import { AccountService } from 'src/app/services/account.service';
// import { CookieService } from 'ngx-cookie-service';

// import { ConfigurationSchemeSaveModel } from 'src/app/_models/schemeConfigModel';
// import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
// import { BreadcrumbModel } from 'src/app/_models/CommonModel';
// import { ExistApplicationIdModel, MemberEligibilityModel } from 'src/app/_models/MemberDetailsModel';

// @UntilDestroy()
// @Component({
//   selector: 'app-eligibility',
//   templateUrl: './eligibility.component.html',
//   styleUrls: ['./eligibility.component.scss'],
// })
// export class EligibilityComponent implements OnInit {
//   configurationList!: ConfigurationSchemeSaveModel;
//   routeSub!: Subscription;
//   schemeId!: string;
//   isLoggedin: boolean = false;
//   memberEligibilitydetail: MemberEligibilityModel[] = [];
//   breadcrumbs!: BreadcrumbModel[];
//   memberDetails!: AccountApplicantLoginResponseModel;

//   // Selected Member Tracker
//   selectedMember: MemberEligibilityModel | null = null;

//   // Static Sub-Schemes to display on the right side when selected
//   dummySubSchemes = [
//     'முறையான பட்ட மேற்படிப்பு மற்றும் விடுதியில் தங்கி படித்தால் / Arts and Science PG Degree Hosteller',
//     'ஐடிஐ அல்லது பாலிடெக்னிக் விடுதியில் தங்கி படித்தால் / ITI or Polytechnic Hosteller',
//     '10-ஆம் வகுப்பு படித்து வரும் (பெண்கள் மட்டும்) - 1000/- / Pursuing 10th Std (Only Girls)',
//     'முறையான பட்டப்படிப்பு மற்றும் விடுதியில் தங்கி படித்தால் / Arts and Science UG Degree Hosteller',
//     'தொழில்நுட்பப் பட்டமேற்படிப்பு மற்றும் விடுதியில் தங்கி படித்தால் / Professional PG degree Hosteller'
//   ];

//   constructor(
//     private memberService: MemberService,
//     private schemeConfigService: SchemeConfigService,
//     private location: Location,
//     private accountService: AccountService,
//     private cookieService: CookieService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit() {
//     if (this.cookieService.get('accesstype') == 'APPLICANT') {
//       this.isLoggedin = true;
//     }
//     window.scroll({ top: 0, left: 0, behavior: 'smooth' });

//     this.routeSub = this.route.params
//       .pipe(untilDestroyed(this))
//       .subscribe((params) => {
//         this.schemeId = params['id'];
//         if (this.schemeId !== '0') {
//           this.schemeConfigService.Config_Scheme_Get(this.schemeId).subscribe((x) => {
//             if (x) {
//               this.configurationList = x.data[0];
//             }
//           });
//           if (this.isLoggedin) {
//             this.memberDetails = this.accountService.userValue;
//             this.memberService.Member_Eligibilty_Get(this.memberDetails.id, this.schemeId).subscribe((x) => {
//               if (x) {
//                 this.memberEligibilitydetail = x.data;
//               }
//             });
//           }
//         }
//       });

//     this.breadcrumbs = [
//       { pathName: 'Homepage ', routing: 'applicant', isActionable: true },
//       { pathName: 'Member Services', routing: 'applicant/mem-dashboard', isActionable: true },
//       { pathName: 'All Schemes', routing: '', isActionable: false },
//     ];
//   }

//   // --- New Getters for UI Layout ---
//   get selfMembers() {
//     return this.memberEligibilitydetail?.filter(m => !m.isFamilyMember) || [];
//   }

//   get familyMembers() {
//     return this.memberEligibilitydetail?.filter(m => m.isFamilyMember) || [];
//   }

//   // Handle row click
//   selectMember(mem: MemberEligibilityModel) {
//     this.selectedMember = mem;
//   }
//   // ----------------------------------

//   back() {
//     this.location.back();
//   }

//   applyClick(mem: MemberEligibilityModel) {
//     if (mem.existApplication) {
//       var d: ExistApplicationIdModel = mem.existApplication;
//       this.schemeConfigService.Application_Get(d.applicationId).subscribe((x) => {
//         if (x) {
//           if (mem.existApplication.submittedDate && mem.existApplication.submittedDate != '') {
//             this.router.navigate(['applicant', 'view', x.data[0].applicationId]);
//           } else {
//             this.router.navigate(['applicant', 'd-scheme', x.data[0].applicationId]);
//           }
//         }
//       });
//     } else {
//       this.schemeConfigService.Application_Init({
//           id: '',
//           schemeId: this.schemeId,
//           memberId: this.memberDetails.id,
//           fromStatusId: '',
//           toStatusId: '',
//           selectedMember: mem,
//           isSubmit: false,
//           memberName: this.memberDetails.name,
//           applicantName: mem.name,
//           mobile: this.memberDetails.mobile,
//           district: '',
//         }).subscribe((x) => {
//           if (x) {
//             this.router.navigate(['applicant', 'd-scheme', x.data]);
//           }
//         });
//     }
//   }

//   getNonEmptyDocs(doscs: string[]) {
//     return doscs.filter((x) => x != '');
//   }

//   getLabel(isAlreadyAvailed?: ExistApplicationIdModel) {
//     if (isAlreadyAvailed) {
//       return 'Click to Continue';
//     }
//     return 'Apply Now';
//   }

//   isToDisable(item: any) {
//     return !item.showApplyOption;
//   }

//   Logout() {
//     this.accountService.logout();
//     this.router.navigate(['/']);
//   }
// }
// import { Component, OnInit } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { Location } from '@angular/common';
// import { Subscription } from 'rxjs';
// import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

// import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
// import { MemberService } from 'src/app/services/member.sevice';
// import { AccountService } from 'src/app/services/account.service';
// import { CookieService } from 'ngx-cookie-service';

// import { ConfigurationSchemeSaveModel, ConfigurationSchemeViewModel } from 'src/app/_models/schemeConfigModel';
// import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
// import { BreadcrumbModel } from 'src/app/_models/CommonModel';
// import { ExistApplicationIdModel, MemberEligibilityModel } from 'src/app/_models/MemberDetailsModel';

// @UntilDestroy()
// @Component({
//   selector: 'app-eligibility',
//   templateUrl: './eligibility.component.html',
//   styleUrls: ['./eligibility.component.scss'],
// })
// export class EligibilityComponent implements OnInit {
//   configurationList!: ConfigurationSchemeSaveModel;
//   routeSub!: Subscription;
//   schemeGroupId!: string;
//   isLoggedin: boolean = false;
//   memberEligibilitydetail: MemberEligibilityModel[] = [];
//   breadcrumbs!: BreadcrumbModel[];
//   memberDetails!: AccountApplicantLoginResponseModel;

//   selectedMember: MemberEligibilityModel | null = null;
//   schemeList: ConfigurationSchemeViewModel[] = [];

//   constructor(
//     private memberService: MemberService,
//     private schemeConfigService: SchemeConfigService,
//     private location: Location,
//     private accountService: AccountService,
//     private cookieService: CookieService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit() {
//     if (this.cookieService.get('accesstype') == 'APPLICANT') {
//       this.isLoggedin = true;
//     }
//     window.scroll({ top: 0, left: 0, behavior: 'smooth' });

//     this.routeSub = this.route.params
//       .pipe(untilDestroyed(this))
//       .subscribe((params) => {
//         this.schemeGroupId = params['id'];
        
//         if (this.schemeGroupId && this.schemeGroupId !== '0') {
          
//           if (this.isLoggedin) {
//             this.memberDetails = this.accountService.userValue;
            
//             // Fetch Scheme Config Info (Documents, Title, etc.)
//             this.schemeConfigService.Config_Scheme_Get(this.schemeGroupId).subscribe((x) => {
//               if (x && x.data && x.data.length > 0) {
//                 this.configurationList = x.data[0];
//               }
//             });

//             // Fetch Member Eligibility
//             this.memberService.Member_Eligible_FamilyMembers_Get_By_SchemeGroup(this.memberDetails.id, this.schemeGroupId).subscribe((x) => {
//               if (x && x.data) {
//                 this.memberEligibilitydetail = x.data;
//               }
//             });

//             // Automatically load sub-schemes for the main user
//             this.fetchSubSchemes(this.memberDetails.id);
//           }
//         }
//       });

//     this.breadcrumbs = [
//       { pathName: 'Homepage ', routing: 'applicant', isActionable: true },
//       { pathName: 'Member Services', routing: 'applicant/mem-dashboard', isActionable: true },
//       { pathName: 'All Schemes', routing: '', isActionable: false },
//     ];
//   }

//   fetchSubSchemes(memberId: string) {
//     this.schemeConfigService
//       .Member_Eligibilty_Get_By_Scheme(this.schemeGroupId, memberId)
//       .subscribe((x) => {
//         if (x && x.data) {
//           this.schemeList = x.data;
//         }
//       });
//   }

//   get selfMembers() {
//     return this.memberEligibilitydetail?.filter(m => !m.isFamilyMember) || [];
//   }

//   get familyMembers() {
//     return this.memberEligibilitydetail?.filter(m => m.isFamilyMember) || [];
//   }

//   selectMember(mem: MemberEligibilityModel) {
//     this.selectedMember = mem;
//     this.fetchSubSchemes(mem.id); 
//   }

//   // Fallback if API returns empty array but dummy UI is clicked
//   selectDummyMember() {
//     this.selectedMember = { id: this.memberDetails.id, name: this.memberDetails.name || 'Applicant' } as any;
//     this.fetchSubSchemes(this.memberDetails.id);
//   }

//   back() {
//     this.location.back();
//   }

//   applySubSchemeClick(subScheme: ConfigurationSchemeViewModel) {
//     if (!this.selectedMember) return;

//     if (this.selectedMember.existApplication && this.selectedMember.existApplication.applicationId) {
//       var d: ExistApplicationIdModel = this.selectedMember.existApplication;
//       this.schemeConfigService.Application_Get(d.applicationId).subscribe((x) => {
//         if (x && x.data && x.data.length > 0) {
//           if (d.submittedDate && d.submittedDate != '') {
//             this.router.navigate(['applicant', 'view', x.data[0].applicationId]);
//           } else {
//             this.router.navigate(['applicant', 'd-scheme', x.data[0].applicationId]);
//           }
//         }
//       });
//     } else {
//       this.schemeConfigService.Application_Init({
//           id: '',
//           schemeId: subScheme.schemeId, 
//           memberId: this.memberDetails.id,
//           fromStatusId: '',
//           toStatusId: '',
//           selectedMember: this.selectedMember,
//           isSubmit: false,
//           memberName: this.memberDetails.name,
//           applicantName: this.selectedMember.name,
//           mobile: this.memberDetails.mobile,
//           district: '',
//         }).subscribe((x) => {
//           if (x) {
//             this.router.navigate(['applicant', 'd-scheme', x.data]);
//           }
//         });
//     }
//   }

//   getNonEmptyDocs(doscs: string[]) {
//     return doscs.filter((x) => x && x !== '');
//   }
//   // Add this function below selectMember()
//   selectFirstMember() {
//     if (this.selfMembers && this.selfMembers.length > 0) {
//       this.selectMember(this.selfMembers[0]); // First self member-ah select pannum
//     } else if (this.familyMembers && this.familyMembers.length > 0) {
//       this.selectMember(this.familyMembers[0]); // Illana first family member-ah select pannum
//     } else {
//       this.selectDummyMember(); // Fallback
//     }
//   }

//   Logout() {
//     this.accountService.logout();
//     this.router.navigate(['/']);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { MemberService } from 'src/app/services/member.sevice';
import { AccountService } from 'src/app/services/account.service';
import { CookieService } from 'ngx-cookie-service';

import { ConfigurationSchemeSaveModel } from 'src/app/_models/schemeConfigModel';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';

@UntilDestroy()
@Component({
  selector: 'app-eligibility',
  templateUrl: './eligibility.component.html',
  styleUrls: ['./eligibility.component.scss'],
})
export class EligibilityComponent implements OnInit {
  configurationList!: ConfigurationSchemeSaveModel;
  routeSub!: Subscription;
  schemeGroupId!: string;
  isLoggedin: boolean = false;
  breadcrumbs!: BreadcrumbModel[];
  memberDetails!: AccountApplicantLoginResponseModel;

  groupedMembers: any[] = [];
  selectedMember: any = null;
  schemeList: any[] = [];
schemeGroupNameDisplay: string = '';
displayImages: string[] = [];
showImageModal: boolean = false;

showFamilyModal: boolean = false;
  selectedEditMember: any = null;

  //  NEW FIGMA MODAL STATE VARIABLES
  showSuccessModal: boolean = false;
  successMessage: string = '';
  
  showDeleteConfirmModal: boolean = false;
  memberToDelete: any = null;
  isDeleting: boolean = false;
  isApplicant: boolean = false;
  constructor(
    private memberService: MemberService,
    private schemeConfigService: SchemeConfigService,
    private location: Location,
    private accountService: AccountService,
    private cookieService: CookieService,
    private router: Router,
    private route: ActivatedRoute,
    
  ) {}

  ngOnInit() {
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
    this.isApplicant = true;  // Applicant வழியே வந்தால் True
    } else {
      this.isApplicant = false; // வேறு வழியே வந்தால் False (Logout காட்டும்)
    }
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });

    this.routeSub = this.route.params
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        this.schemeGroupId = params['id'];
        
        if (this.schemeGroupId && this.schemeGroupId !== '0') {
          if (this.isLoggedin) {
            this.memberDetails = this.accountService.userValue;
            
// உள்ளே true என்று parameter பாஸ் பண்ணனும் ப்ரோ
this.schemeConfigService.Config_Scheme_Group_Get(true).subscribe((res: any) => {
              if (res && res.data) {
                const group = res.data.find((g: any) => g.id === this.schemeGroupId);
                if (group) {
                  this.schemeGroupNameDisplay = `${group.groupNameTamil} / ${group.groupName}`;
                }
              }
            });

            // 2. Fetch Eligibility Data & Process it based on new JSON
            this.schemeConfigService.Member_Eligibilty_Get_By_Scheme(this.schemeGroupId, this.memberDetails.id).subscribe((x: any) => {
              if (x && x.data) {
                this.processEligibilityData(x.data);
              }
            });
          }
        }
      });

    this.breadcrumbs = [
      { pathName: 'Homepage ', routing: 'applicant', isActionable: true },
      { pathName: 'Member Services', routing: 'applicant/mem-dashboard', isActionable: true },
      { pathName: 'All Schemes', routing: '', isActionable: false },
    ];
  }

processEligibilityData(rawData: any[]) {

  const memberMap = new Map<string, any>();

  rawData.forEach((subScheme: any) => {
    if (subScheme.eligibleMembers && subScheme.eligibleMembers.length > 0) {
      subScheme.eligibleMembers.forEach((member: any) => {

        if (!memberMap.has(member.id)) {

          const isFamily = member.relationString && member.relationString.toLowerCase() !== 'self';

          memberMap.set(member.id, {
            ...member,
            id: member.id,
            name: member.name,
            relationString: member.relationString,
            isFamilyMember: isFamily,
            subSchemes: []
          });

        }

      });
    }
  });

  memberMap.forEach((memberObj, memberId) => {

    rawData.forEach((subScheme: any) => {

      const eligibleMemberData =
        (subScheme.eligibleMembers || []).find((m: any) => m.id === memberId);

      memberObj.subSchemes.push({
        schemeId: subScheme.schemeId,
        schemeName: subScheme.schemeName,
        schemeNameEnglish: subScheme.schemeNameEnglish,
        schemeNameTamil: subScheme.schemeNameTamil,
        isApplicable: !!eligibleMemberData,
        existApplication: eligibleMemberData
          ? eligibleMemberData.existApplication
          : null
      });

    });

  });

  this.groupedMembers = Array.from(memberMap.values());

  // ✅ Page load → empty state show ஆகணும்
  this.selectedMember = null;
  this.schemeList = [];
  if (rawData && rawData.length > 0) {
  this.fetchSubSchemeDocuments(rawData[0].schemeId);
}
}
  
  // Filter for Main Member (relationString is empty or 'Self')
  get selfMembers() {
    return this.groupedMembers.filter(m => !m.isFamilyMember);
  }

  // Filter for Family Members (relationString has value like 'Daughter', 'Son')
  get familyMembers() {
    return this.groupedMembers.filter(m => m.isFamilyMember);
  }
fetchSubSchemeDocuments(subSchemeId: string) {
  this.schemeConfigService.Config_Scheme_Get(subSchemeId).subscribe((x: any) => {
    if (x && x.data && x.data.length > 0) {
      this.configurationList = x.data[0]; // Sub-Scheme ku yetha documents set aagidum
      this.mapReferenceImages();
    }
  });
}
mapReferenceImages() {
  const imageMap: { [key: string]: string[] } = {
    'Student ID': ['assets/Document images/School-ID-Card-Vertical_Design-2_a.jpg'],
    'Hostel Certificate': ['assets/Document images/Hostel Certificate.png'],
    'Birth Certificate': ['assets/Document images/Birth Certificate.png'],
    'Death Certificate': ['assets/Document images/Death Certificate.png'],
    'Birth & Death Certificate': [
      'assets/Document images/Birth Certificate.png',
      'assets/Document images/Death Certificate.png'
    ],
    'Marriage Registration': ['assets/Document images/Marriage Registration Certificate.png'],
    'Marriage Invitation': [
      'assets/Document images/Marriage Invitation.png',
      'assets/Document images/Marriage Invitation back.png'
    ],
    'Legal Heir': ['assets/Document images/Legal Heir Certificate.png'],
    'FIR': ['assets/Document images/FIR Copy.png'],
    'Eye Specialist': ['assets/Document images/Eye Test Report.png'],
    'Medical Certificate': ['assets/Document images/Doctor certificate, in case of abortion claim.png'],
    'Ration Card': ['assets/Document images/Family Ration card.jpg']
  };

  this.displayImages = []; // Reset images

  // Safety check to ensure documents exist before mapping
  if (!this.configurationList || !this.configurationList.documents) return;

  // 1. Check if we are in the Maternity Scheme
  let isMaternityScheme = false;
  this.configurationList.documents.forEach((group: any) => {
    group.requiredDocumentCategory?.forEach((doc: any) => {
      if (doc.categoryName && doc.categoryName.includes('Newborn')) {
        isMaternityScheme = true;
      }
    });
  });

  // 2. Map the images
  this.configurationList.documents.forEach((group: any) => {
    group.requiredDocumentCategory?.forEach((doc: any) => {
      const name = doc.categoryName || '';
      
      Object.keys(imageMap).forEach(key => {
        if (name.includes(key)) {
          
          if (key === 'Medical Certificate' && !isMaternityScheme) {
            return; // Skip adding the miscarriage image for Natural Death
          }

          imageMap[key].forEach(imgPath => {
            if (!this.displayImages.includes(imgPath)) {
              this.displayImages.push(imgPath);
            }
          });
        }
      });
    });
  });
}
selectMember(mem: any) {
  this.selectedMember = mem;
  this.schemeList = mem.subSchemes || [];
  

}
getButtonLabel(sub: any): string {
    // 1. தகுதி இல்லை என்றால்
    if (sub.isApplicable === false) {
      return 'Not Applicable';
    }
    
    // 2. ஏற்கனவே Application இருந்தால்
    if (sub.existApplication && sub.existApplication.applicationId) {
      if (sub.existApplication.submittedDate && sub.existApplication.submittedDate !== '') {
        return 'View Application';
      }
      return 'Click to Continue';
    }
    
    // 3. புதுசு என்றால்
    return 'Apply Now';
  }
  selectDummyMember() {
    this.selectedMember = { id: this.memberDetails.id, name: this.memberDetails.name || 'Applicant' } as any;
    this.schemeList = [];
  }

  selectFirstMember() {
    if (this.selfMembers && this.selfMembers.length > 0) {
      this.selectMember(this.selfMembers[0]);
    } else if (this.familyMembers && this.familyMembers.length > 0) {
      this.selectMember(this.familyMembers[0]);
    } else {
      this.selectDummyMember();
    }
  }

  back() {
    this.location.back();
  }

applySubSchemeClick(subScheme: any) {
    if (!this.selectedMember) return;

    // IMPORTANT FIX: We check subScheme.existApplication instead of selectedMember.existApplication
    if (subScheme.existApplication && subScheme.existApplication.applicationId) {
      
      var d = subScheme.existApplication;
      
      this.schemeConfigService.Application_Get(d.applicationId).subscribe((x: any) => {
        if (x && x.data && x.data.length > 0) {
          
          if (d.submittedDate && d.submittedDate != '') {
            // If already submitted, view it
            this.router.navigate(['applicant', 'view', x.data[0].applicationId]);
          } else {
            // If half-filled ("Click to Continue"), open the form to edit
            this.router.navigate(['applicant', 'd-scheme', x.data[0].applicationId]);
          }
          
        }
      });
      
    } else {
      // First time "Apply Now" logic (Remains exactly the same)
      this.schemeConfigService.Application_Init({
          id: '',
          schemeId: subScheme.schemeId,  // Extracted from the grouped map
          memberId: this.memberDetails.id,
          fromStatusId: '',
          toStatusId: '',
          selectedMember: this.selectedMember,
          isSubmit: false,
          memberName: this.memberDetails.name,
          applicantName: this.selectedMember.name,
          mobile: this.memberDetails.mobile,
          district: '',
        }).subscribe((x: any) => {
          if (x) {
            this.router.navigate(['applicant', 'd-scheme', x.data]);
          }
        });
    }
  }
  getNonEmptyDocs(doscs: string[]) {
    return doscs.filter((x) => x && x !== '');
  }
  openImageModal() {
  if (this.displayImages.length > 0) {
    this.showImageModal = true;
  }
}
openFamilyModal() {
this.selectedEditMember = null;
  this.showFamilyModal = true;
}
// 3. Logic to handle Edit Click
editFamilyMember(mem: any, event: Event) {
  event.stopPropagation(); // Prevents the row click (selectMember) from firing
  this.selectedEditMember = mem;
  this.showFamilyModal = true;
}


// Add this helper function inside EligibilityComponent
canEditOrDelete(mem: any): boolean {
  // Check if this member has ANY sub-scheme with an existing application
  const hasExistingApplication = mem.subSchemes?.some((sub: any) => 
    sub.existApplication && sub.existApplication.applicationId
  );
  
  // If they have an application, return false (hide buttons). Otherwise, true (show buttons).
  return !hasExistingApplication;
}
// Receive the fresh data from the popup
handleFamilySuccess(freshEligibilityData: any) {
    this.showFamilyModal = false;
    
    // Set dynamic message based on if we were editing or adding
    if (this.selectedEditMember) {
      this.successMessage = "Family Member Updated<br>Succesfully";
    } else {
      this.successMessage = "Family Member added<br>Succesfully";
    }
    
    this.showSuccessModal = true; 

    if (freshEligibilityData && freshEligibilityData.length > 0) {
        this.processEligibilityData(freshEligibilityData);
    }
  }

continueAfterSuccess() {
    this.showSuccessModal = false;
    this.selectedEditMember = null;
  }

  // ⭐ DELETE CONFIRMATION LOGIC
  deleteFamilyMember(mem: any, event: Event) {
    event.stopPropagation();
    this.memberToDelete = mem;
    this.showDeleteConfirmModal = true; // Opens Confirmation Modal
  }

  cancelDelete() {
    this.showDeleteConfirmModal = false;
    this.memberToDelete = null;
  }

  confirmDelete() {
    if (!this.memberToDelete) return;
    
    this.isDeleting = true;

    const payload = {
      id: this.memberToDelete.id,
      member_Id: this.memberDetails.id,
      isActive: false,
      isSaved: true
    } as any;

    this.memberService.Family_SaveUpdate(payload).subscribe({
      next: (res: any) => {
        this.isDeleting = false;
        if (res && res.status === 'SUCCESS') {
          
          // Show the exact Delete Success Popup
          this.showDeleteConfirmModal = false;
          this.successMessage = "Family Member Deleted<br>Succesfully";
          this.showSuccessModal = true;
          
          this.schemeConfigService
            .Member_Eligibilty_Get_By_Scheme(this.schemeGroupId, this.memberDetails.id)
            .subscribe((x: any) => {
              if (x && x.data) {
                this.processEligibilityData(x.data);
              }
            });
        }
      },
      error: (err: any) => {
        this.isDeleting = false;
        console.error("Delete failed", err);
      }
    });
  }
  Logout() {
    this.accountService.logout();
    this.isLoggedin = false;
    this.router.navigate(['/']);
  }
}