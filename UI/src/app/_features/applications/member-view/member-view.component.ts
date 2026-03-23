import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Column } from 'src/app/_models/datatableModel';
import { MemberDataApprovalGridFilterModel } from 'src/app/_models/filterRequest';
import {
  MemberDataApprovalGridModel,
  MemberDocumentMaster,
  MemberGetModels,
} from 'src/app/_models/MemberDetailsModel';
import { MemberDetailsViewModelExisting, MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@UntilDestroy()
@Component({
  selector: 'app-member-view',
  templateUrl: './member-view.component.html',
  styleUrls: ['./member-view.component.scss'],
})
export class MemberViewComponent implements OnInit {
  memberDetails!: MemberViewModelExisting;
  memPersonalInfo!: MemberDocumentMaster[];
  title: string = 'Member Information';
  memberId: string = '';
  routeSub!: Subscription;
  allDet!: MemberGetModels;
  filtermodel!: MemberDataApprovalGridFilterModel;
  configurationList!: MemberDataApprovalGridModel[];
showProfilePopup = false;
showVerificationPopup = false;
  defaultSortField: string = 'temporaryNumber';
  defaultSortOrder: number = 1;
  cols!: Column[];
  searchableColumns!: string[];
   cols1!: Column[];
    memberDetail!:MemberDetailsViewModelExisting;
    popupPosition = {
  top: 0,
  left: 0
};
showMorePopup = false;
selectedMember: any = null;

configurationList1!:any[];
  Id:string=''
    status: string = '';
  memberCardData: any;
   apiUrl = environment.apiUrl;
  isOrgHide: boolean = false;
  isPersonalHide: boolean = false;
  isMemberAddressHide: boolean = false;
  isFamilyHide: boolean = false;
  isMemberBankHide: boolean = false;
  isDocumentHide: boolean = false;
  isAdditionalDocumentHide: boolean = false;
  roleName: string = '';
  url: string = environment.apiUrl.replace('/api/', '') + '/images/';
selectedDoc: any = null;
pdfBlobUrl: SafeResourceUrl | null = null;
  showPreview: boolean = false;
  get trimmedApiUrl(): string {
     return environment.apiUrl.replace(/\/api\/?$/, '').trim();
   }


  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private cdr: ChangeDetectorRef,
      private elementRef: ElementRef,
    private permissionsService: NgxPermissionsService,
    private location: Location,
      private sanitizer: DomSanitizer,

             private userService: UserService,

  ) {}
      encodeURIComponent = encodeURIComponent;


      @HostListener('document:click', ['$event'])
      onDocumentClick(event: MouseEvent) {
      
        const target = event.target as HTMLElement;
      
        const clickedInsidePopover = this.elementRef.nativeElement
          .querySelector('.education-popover')
          ?.contains(target);
      
        const clickedInsideProfile = this.elementRef.nativeElement
          .querySelector('.profile-popup')
          ?.contains(target);
      
        const clickedMoreButton = target.closest('.more-btn');
        const clickedViewButton = target.closest('.view-details-btn');
        const clickedVerificationButton = target.closest('.verification-btn');
      
        if (
          !clickedInsidePopover &&
          !clickedInsideProfile &&
          !clickedMoreButton &&
          !clickedViewButton &&
          !clickedVerificationButton
        ) {
          this.showMorePopup = false;
          this.showProfilePopup = false;
          this.showVerificationPopup = false;
        }
      }
  // ngOnInit() {
  //   this.routeSub = this.route.params
  //     .pipe(untilDestroyed(this))
  //     .subscribe((params) => {
  //       this.memberId = params['id']; //log the value of id
  //       if (this.memberId !== '0') {
  //         this.memberService
  //           .Get_Member_All_Details_By_MemberId(this.memberId)
  //           .subscribe((x) => {
  //             if (x) {
  //               this.memberDetails = x.data;
  //             }
  //           });
  //       }
  //     });

  //   this.cols = [
  //     {
  //       field: 'member_Id_Text',
  //       header: 'Member Id',
  //       customExportHeader: 'Member Id',
  //       sortablefield: 'member_Id_Text',
  //       isSortable: true,
  //       isSearchable: true,
  //     },
  //     {
  //       field: 'changed_Detail_Record',
  //       header: 'Changed Detail ',
  //       sortablefield: 'changed_Detail_Record',
  //       isSortable: true,
  //       isSearchable: true,
  //       isBadge: true,
  //     },
  //     {
  //       field: 'nextApprovalRole',
  //       header: 'Next Approval Role',
  //       sortablefield: 'nextApprovalRole',
  //       isSortable: true,
  //       isSearchable: true,
  //       isBadge: true,
  //     },
  //     {
  //       field: 'status',
  //       header: 'Status',
  //       sortablefield: 'status',
  //       isSortable: true,
  //       isSearchable: true,
  //       isBadge: true,
  //     },
  //     {
  //       field: 'approvedByRole',
  //       header: 'Last Approved Role',
  //       sortablefield: 'approvedByRole',
  //       isSortable: true,
  //       isSearchable: true,
  //       isBadge: true,
  //     },
  //     {
  //       field: 'lastApprovalReason',
  //       header: 'Last Approved Reason',
  //       sortablefield: 'lastApprovalReason',
  //       isSortable: true,
  //       isSearchable: true,
  //       isBadge: true,
  //     },
  //     {
  //       field: 'phone',
  //       header: 'Phone',
  //       sortablefield: 'phone',
  //       isSortable: true,
  //       isSearchable: true,
  //     },
  //     {
  //       field: 'district',
  //       header: 'District',
  //       sortablefield: 'district',
  //       isSortable: true,
  //       isSearchable: true,
  //     },
  //     {
  //       field: 'changed_Date',
  //       header: 'Changed Date',
  //       sortablefield: 'changed_Date',
  //       isSortable: true,
  //       isSearchable: false,
  //     },
  //     {
  //       field: 'changed_Time',
  //       header: 'Changed Time',
  //       sortablefield: 'changed_Time',
  //       isSortable: true,
  //       isSearchable: false,
  //     },
  //     {
  //       field: 'updatedByUserName',
  //       header: 'Updated By',
  //       sortablefield: 'updatedByUserName',
  //       isSortable: true,
  //       isSearchable: true,
  //     },
  //     {
  //       field: 'updatedDate',
  //       header: 'Updated Date',
  //       sortablefield: 'updatedDate',
  //       isSortable: true,
  //       isSearchable: false,
  //     },
  //   ];
  //   this.filtermodel = {
  //     searchString: null,
  //     skip: 0,
  //     where: {
  //       memberDataChangeRequestTypes: [],
  //       districtIds: [],
  //       statusIds: [],
  //       roleId: '',
  //       memberId: this.memberId,
  //       isActive: true,
  //       year: '',
  //       getAll: false,
  //     },
  //     sorting: { fieldName: 'changed_Date', sort: 'DESC' },
  //     take: 100,
  //     columnSearch: null,
  //   };
  //   this.memberService
  //     .MemberDataApprovalGridGet(this.filtermodel)
  //     .subscribe((x) => {
  //       if (x) {
  //         this.configurationList = x.data;
  //       }
  //     });
  // }
   ngOnInit() {

    const privileges = this.cookieService.get('privillage');
    const privilegeList = privileges ? privileges.split(',') : [];
    const userPrivilege = this.cookieService.get('user');
    if (userPrivilege) {
      const userObj = JSON.parse(userPrivilege);
      this.roleName = userObj?.userDetails?.roleName;
    }
    if(this.roleName !='Super Admin') {

    if(privilegeList.includes('ORGANIZATION_INFO_HIDE')){
      this.isOrgHide = true;
    }

    if(privilegeList.includes('MEMBER_PERSONAL_DETAILS_HIDE')){
      this.isPersonalHide = true;
    }

    if(privilegeList.includes('MEMBER_ADDRESS_HIDE')){
      this.isMemberAddressHide = true;
    }

    if(privilegeList.includes('FAMILY_MEMBER_DETAILS_HIDE')){
      this.isFamilyHide = true;
    }

    if(privilegeList.includes('MEMBER_BANK_DETAILS_HIDE')){
      this.isMemberBankHide = true;
    }

    if(privilegeList.includes('DOCUMENT_DETAILS_HIDE')){
      this.isDocumentHide = true;
    }

    if(privilegeList.includes('ADDITIONAL_DOCUMENT_DETAILS_HIDE')){
      this.isAdditionalDocumentHide = true;
    }
  }else {
    this.isOrgHide = false;
    this.isPersonalHide = false;
    this.isMemberAddressHide = false;
    this.isFamilyHide = false;
    this.isMemberBankHide = false;
    this.isDocumentHide = false;
    this.isAdditionalDocumentHide = false;
  }

      this.route.queryParams.subscribe(params => {
      if (params['goTo'] === 'history') {
        this.scrollToHistorySection();
      }
    });
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
                   this.memberService
                        .Get_Member_Id_Card(this.memberId)
                        .subscribe((x) => {
                          if (x) {
                            this.memberCardData = x.data;
                            this.url =
                              this.memberCardData.profile_Picture &&
                              this.memberCardData.profile_Picture != ''
                                ? `${environment.apiUrl.replace('/api/', '')}/images/${
                                    this.memberCardData.profile_Picture
                                  }`
                                : '';
                          }
                        });
                            this.memberService
            .Get_Member_Detail_View(this.memberId)
            .subscribe((x) => {
              if (x) {
                this.memberDetail = x.data;

              }
            });
        }
      });

    this.cols = [
      {
        field: 'member_Id_Text',
        header: 'Member Id',
        customExportHeader: 'Member Id',
        sortablefield: 'member_Id_Text',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'changed_Detail_Record',
        header: 'Changed Detail ',
        sortablefield: 'changed_Detail_Record',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'nextApprovalRole',
        header: 'Next Approval Role',
        sortablefield: 'nextApprovalRole',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'approvedByRole',
        header: 'Last Approved Role',
        sortablefield: 'approvedByRole',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'lastApprovalReason',
        header: 'Last Approved Reason',
        sortablefield: 'lastApprovalReason',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'phone',
        header: 'Phone',
        sortablefield: 'phone',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'district',
        header: 'District',
        sortablefield: 'district',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'changed_Date',
        header: 'Changed Date',
        sortablefield: 'changed_Date',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'changed_Time',
        header: 'Changed Time',
        sortablefield: 'changed_Time',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'updatedByUserName',
        header: 'Updated By',
        sortablefield: 'updatedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'updatedDate',
        header: 'Updated Date',
        sortablefield: 'updatedDate',
        isSortable: true,
        isSearchable: false,
      },
    ];
      this.cols1 = [
      {
        field: 'memberCode',
        header: 'Member Id',
        customExportHeader: 'Member Id',
        sortablefield: 'memberCode',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },

      {
        field: 'district',
        header: 'District',
        sortablefield: 'district',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'approvalComment',
        header: 'Approval Comment',
        sortablefield: 'approvalComment',
        isSortable: true,
        isSearchable: false,
      },

      {
        field: 'modifiedByUserName',
        header: 'Updated By',
        sortablefield: 'modifiedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'modifiedDate',
        header: 'Updated Date',
        sortablefield: 'modifiedDate',
        isSortable: true,
        isSearchable: false,
      },

    ];
    this.filtermodel = {
      searchString: null,
      skip: 0,
      where: {
        memberDataChangeRequestTypes: [],
        districtIds: [],
        statusIds: [],
        roleId: '',
        memberId: this.memberId,
        isActive: true,
        year: '',
        getAll: false,
      },
      sorting: { fieldName: 'changed_Date', sort: 'DESC' },
      take: 100,
      columnSearch: null,
    };
    this.memberService
      .MemberDataApprovalGridGet(this.filtermodel)
      .subscribe((x) => {
        if (x) {
          this.configurationList = x.data;


        }
      });
//       this.userService
//       .MemberCardApprovalGridGet(this.filtermodel)
//       .subscribe((c) => {
//         this.configurationList1 = c.data;

//       const matchedConfig = this.configurationList1.find((x: any) => x.member_Id === this.memberId);
// this.status = matchedConfig ? matchedConfig.status : '';


//       });
  }
getCommaSeparatedNamesFromFamily(
    members: { nameEnglish?: string; nameTamil?: string }[],
    language: 'English' | 'Tamil'
  ): string {
    const key = language === 'English' ? 'nameEnglish' : 'nameTamil';

    return members
      .map((member) => member[key]?.trim())
      .filter((name) => !!name)
      .join(', ');
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

    if (data.pincode) {
      parts.push(data.pincode);
    }

    return parts.join(', ');
  }

  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  back() {
      if (window.history.length > 1) {
    this.location.back();
  } else {

    this.router.navigate(['officers', 'applications']);
  }
}
scrollToHistorySection() {


  const tryScroll = () => {
    const element = document.getElementById('historySection');
    if (element) {
      // Get scrollable container
      const container = document.querySelector<HTMLElement>('.main-content');

      if (container) {
        // Scroll the container
        container.scrollTop = element.offsetTop;
      } else {
        // Scroll window as fallback
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Retry on next frame if element not yet in DOM
      requestAnimationFrame(tryScroll);
    }
  };
  tryScroll();
}


openMore(member: any, event: MouseEvent) {

  const rect = (event.target as HTMLElement).getBoundingClientRect();

  this.popupPosition = {
    top: rect.top + window.scrollY - 40,
    left: rect.right + window.scrollX + 10
  };

  this.selectedMember = member;
  this.showMorePopup = true;
}
closeMore() {
  this.showMorePopup = false;
}

getDocumentImageUrl(doc: any): SafeResourceUrl | string {

  if (!doc) return '';

   const fileUrl =
    `${environment.apiUrl}/Member/Member_Document_Download_for_qr?fileId=${doc.id}`;

  if (this.isImage(doc.savedFileName)) {
    return fileUrl;
  }

  return this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
}

isImage(fileName: string): boolean {

  if (!fileName) return false;

  const ext = fileName.split('.').pop()?.toLowerCase();

  return ['jpg','jpeg','png','gif','webp'].includes(ext ?? '');

}


// openPreview(doc: any) {

//   this.selectedDoc = doc;

//   if (this.isImage(doc.savedFileName)) {
//     this.showPreview = true;
//     return;
//   }

//    const fileUrl =
//     `${environment.apiUrl}/Member/Member_Document_Download_for_qr?fileId=${doc.id}`;


//   fetch(fileUrl)
//     .then(res => res.blob())
//     .then(blob => {

//       const blobUrl = URL.createObjectURL(blob);

//       this.pdfBlobUrl =
//         this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

//       this.showPreview = true;

//     });
// }


openPreview(doc: any) {

  this.selectedDoc = doc;

  const fileUrl =
    `${environment.apiUrl}/Member/Member_Document_Download_for_qr?fileId=${doc.id}`;

  // If image
  if (this.isImage(doc.savedFileName)) {

    // ✅ JUST ADD THIS LINE (sanitize URL)
    this.pdfBlobUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);

    this.showPreview = true;
    return;
  }

  // Existing PDF logic (unchanged)
  fetch(fileUrl)
    .then(res => res.blob())
    .then(blob => {

      const blobUrl = URL.createObjectURL(blob);

      this.pdfBlobUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

      this.showPreview = true;

    });
}
closePreview() {
  this.showPreview = false;
}

}
