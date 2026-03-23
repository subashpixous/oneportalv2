import { ChangeDetectorRef, Component } from '@angular/core';
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

@UntilDestroy()
@Component({
  selector: 'app-member-view',
  templateUrl: './member-view.component.html',
  styleUrls: ['./member-view.component.scss'],
})
export class MemberViewComponent {
  memberDetails!: MemberViewModelExisting;
  memberDetail!:MemberDetailsViewModelExisting;
  memPersonalInfo!: MemberDocumentMaster[];
  title: string = 'Member Information';
  memberId: string = '';
configurationList1!:any[];
  Id:string=''
  
  routeSub!: Subscription;
  allDet!: MemberGetModels;
  filtermodel!: MemberDataApprovalGridFilterModel;
  configurationList!: MemberDataApprovalGridModel[];
  status: string = '';
  memberCardData: any; 
   url: any = '';
    apiUrl = environment.apiUrl;
  get trimmedApiUrl(): string {
     return environment.apiUrl.replace(/\/api\/?$/, '').trim();}

  defaultSortField: string = 'temporaryNumber';
  defaultSortOrder: number = 1;
  cols!: Column[];
  searchableColumns!: string[];
  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private memberService: MemberService,
    private router: Router,
      private userService: UserService,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private cdr: ChangeDetectorRef,
    private permissionsService: NgxPermissionsService
  ) {}
    encodeURIComponent = encodeURIComponent;
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
      this.userService
      .MemberCardApprovalGridGet(this.filtermodel)
      .subscribe((c) => {
        this.configurationList1 = c.data;
     
      const matchedConfig = this.configurationList1.find((x: any) => x.member_Id === this.memberId);
this.status = matchedConfig ? matchedConfig.status : '';


        
      });
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  back() {
    this.router.navigate(['officers', 'applications']);
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
}
