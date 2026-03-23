import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationFilterModel,
  MemberDataApprovalFilterModel,
  MemberDataApprovalGridFilterModel,
  MemberFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import {
  MemberDataApprovalGridModel,
  MemberGridViewModel,
  OrganizationDetailFormModel,
} from 'src/app/_models/MemberDetailsModel';
import { ResponseModel } from 'src/app/_models/ResponseStatus';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-datewise-approval-report',
  templateUrl: './datewise-approval-report.component.html',
  styleUrls: ['./datewise-approval-report.component.scss'],
})
export class DatewiseApprovalReportComponent {
  configurationList!: MemberDataApprovalGridModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  activeStatuses: TCModel[] = [
    { text: 'Active', value: '1' },
    { text: 'Expired', value: '0' },
  ];

  mainValue: string = 'MEMBER';
  generateMainFilter() {}
  recordTypes: TCModel[] = [];
  districts: TCModel[] = [];
  divisions: TCModel[] = [];
  statuses: TCModel[] = [];
  roles: TCModel[] = [];
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  maxDate: Date = new Date();
  selectedapprovaldatefilter: Date[] | null = null;

  selectedActiveStatuses: string = '1';
  selectedrecordTypes: string[] | [] = [];
  selectedDistricts: string[] | [] = [];
  selectedDivisions: string[] | [] = [];
  selectedStatuses: string[] | [] = [];
  selectedroles: string = '';
  selectedorganizationType: string[] | [] = [];
  selectedtypeOfWork: string[] | [] = [];
  selectedlocalBody: string[] | [] = [];
  selectednameOfLocalBody: string[] | [] = [];
  selectedapplicationStatus: string[] | [] = [];

  UserDropDownValues!: ResponseModel;
  districtIdsValue: any;
  localBodyIdsValue: string[] | [] = [];
  nameOfLocalBodyIdsValue: any;

  nameoflocalbodytrue!: boolean;

  organizationType: TCModel[] = [];
  typeOfWork: TCModel[] = [];
  localBody: TCModel[] = [];
  nameOfLocalBody: TCModel[] = [];
  applicationStatus: TCModel[] = [];

  actions: Actions[] = [];
  title: string = 'Date wise Approval Report';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;
  showAllFilters: boolean = false;
  filtermodel!: MemberDataApprovalGridFilterModel;
  showdata: boolean = false;
  value: string[] = [];
  navigationModel: NavigationModel | undefined;
  isExporting: boolean = false;

  // New filters
memberAadhaarNumber: string = '';
memberPhoneNumber: string = '';
selectedReportFormat: string = '';

// Report format dropdown


//Updated by Sivasankar K on 20/12/2025 for DateWiseReport 

reportFormats: TCModel[] = [
  { text: 'Enrollment - CMWS', value: 'CMWS' },
  { text: 'Enrollment - GCC', value: 'GCC' },
  { text: 'Enrollment - Corporation', value: 'CORPORATION' },
  { text: 'Enrollment - Town Panchayat', value: 'TOWN PANCHAYAT' },
  { text: 'Enrollment - Municipality', value: 'MUNICIPALITY' },
  { text: 'Enrollment - Rural Developement', value: 'RuralDevelopement' },
  { text: 'Enrollment - Member Details', value: 'MEMBER' },
  { text: 'Enrollment - Department Wise', value: 'DEPARTMENT' },
  {text: 'Famiy Members' , value: 'FamilyMembers'},
  { text: 'Progressive Report', value: 'PROGRESSIVE' },


];
departmentCols: Column[] = [
  { field: 'districtName', header: 'District', sortablefield :'districtName',isSortable: true , isSearchable: true},
  { field: 'csw', header: 'CSW',sortablefield :'csw', isSortable: true , isSearchable: true},
  { field: 'cw', header: 'CW',sortablefield :'cw', isSortable: true , isSearchable: true},
  { field: 'mw', header: 'MW',sortablefield :'mw', isSortable: true , isSearchable: true},
  { field: 'rp', header: 'RP',sortablefield :'rp', isSortable: true , isSearchable: true},
  { field: 'others', header: 'Others', sortablefield :'others',isSortable: true , isSearchable: true},
  { field: 'total_Count', header: 'Total', sortablefield :'total_Count',isSortable: true , isSearchable: true},
];

familyMemberCols: Column[] = [
  { field: 'Member_Id', header: 'Member ID', sortablefield: 'Member_Id', isSortable: true, isSearchable: true },
  { field: 'name', header: 'Member Name', sortablefield: 'name', isSortable: true, isSearchable: true },

  { field: 'organization_Type', header: 'Organization Type', sortablefield: 'organization_Type', isSortable: true, isSearchable: true },
  { field: 'occupation', header: 'Occupation', sortablefield: 'occupation', isSortable: true, isSearchable: true },
  { field: 'districtName', header: 'District', sortablefield: 'districtName', isSortable: true, isSearchable: true },
  { field: 'localBody', header: 'Local Body', sortablefield: 'localBody', isSortable: true, isSearchable: true },
  { field: 'nameOfLocalBody', header: 'Name Of Local Body', sortablefield: 'nameOfLocalBody', isSortable: true, isSearchable: true },

 { field: 'blockName', header: 'Block Name', sortablefield: 'blockName', isSortable: true, isSearchable: true },

  { field: 'village', header: 'Village', sortablefield: 'village', isSortable: true, isSearchable: true },

  { field: 'localBodyDetails', header: 'LocalBodyDetails', sortablefield: 'localBodyDetails', isSortable: true, isSearchable: true },
  
  { field: 'phone', header: 'Member Phone', sortablefield: 'phone', isSortable: true, isSearchable: true },
  { field: 'aadhaar_Number', header: 'Aadhaar Number', sortablefield: 'aadhaar_Number', isSortable: true, isSearchable: true },
  { field: 'rationCardNumber', header: 'Ration Card Number', sortablefield: 'rationCardNumber', isSortable: true, isSearchable: true },

  { field: 'maritalStatus', header: 'Marital Status', sortablefield: 'maritalStatus', isSortable: true, isSearchable: true },
  { field: 'community', header: 'Community', sortablefield: 'community', isSortable: true, isSearchable: true },
{ field: 'date_Of_Birth', header: 'DOB', sortablefield: 'date_Of_Birth', isSortable: true, isSearchable: true },
{ field: 'mem_Education', header: 'Member_Education', sortablefield: 'mem_Education', isSortable: true, isSearchable: true },


  { field: 'homeAddress', header: 'Home Address', sortablefield: 'homeAddress', isSortable: true, isSearchable: true },
  { field: 'workAddress', header: 'Work Address', sortablefield: 'workAddress', isSortable: true, isSearchable: true },
  { field: 'mem_CreatedDate', header: 'Member_CreatedDate', sortablefield: 'mem_CreatedDate', isSortable: true, isSearchable: true },

  { field: 'familyMemberName', header: 'Family Member Name', sortablefield: 'familyMemberName', isSortable: true, isSearchable: true },
  { field: 'relationType', header: 'Relation', sortablefield: 'relationType', isSortable: true, isSearchable: true },
  { field: 'gender', header: 'Gender', sortablefield: 'gender', isSortable: true, isSearchable: true },
  { field: 'age', header: 'Age', sortablefield: 'age', isSortable: true, isSearchable: true },

  { field: 'education', header: 'Education', sortablefield: 'education', isSortable: true, isSearchable: true },
  { field: 'course', header: 'Course', sortablefield: 'course', isSortable: true, isSearchable: true },
   { field: 'standard', header: 'Standard', sortablefield: 'standard', isSortable: true, isSearchable: true },
  { field: 'degree_Name', header: 'Degree', sortablefield: 'degree_Name', isSortable: true, isSearchable: true },
  { field: 'familyMemberOccupation', header: 'Family Member Occupation', sortablefield: 'familyMemberOccupation', isSortable: true, isSearchable: true },
  {field: 'eMIS_No', header: 'EMIS_No', sortablefield: 'eMIS_No', isSortable: true, isSearchable: true},
  { field: 'disability', header: 'Disability', sortablefield: 'disability', isSortable: true, isSearchable: true },
  { field: 'school_Address', header: 'School_Address', sortablefield: 'school_Address', isSortable: true, isSearchable: true },
  { field: 'currentEducationStatus', header: 'CurrentEducationStatus', sortablefield: 'currentEducationStatus', isSortable: true, isSearchable: true },
  { field: 'year_Of_Completion', header: 'Year_Of_Completion', sortablefield: 'year_Of_Completion', isSortable: true, isSearchable: true },


  {
    field: 'familyMemberCreatedDate',
    header: 'Created Date',
    sortablefield: 'familyMemberCreatedDate',
    isSortable: true,
    isSearchable: true
  },
  { field: 'mem_AadharNumber', header: 'Mem_AadharNumber', sortablefield: 'mem_AadharNumber', isSortable: true, isSearchable: true },

  { field: 'cardStatus', header: 'Card Status', sortablefield: 'cardStatus', isSortable: true, isSearchable: true },

  {
    field: 'schemeStatus',
    header: 'Availed Scheme',
    sortablefield: 'schemeStatus',
    isSortable: true,
    isSearchable: true,   
  },

  { field: 'scheme', header: 'Scheme Name', sortablefield: 'scheme', isSortable: true, isSearchable: true },
  // { field: 'schemeCode', header: 'Scheme Code', sortablefield: 'schemeCode', isSortable: true, isSearchable: true },
  // { field: 'statusValue', header: 'Status', sortablefield: 'statusValue', isSortable: true, isSearchable: true },
  { field: 'statusCode', header: 'Scheme Status', sortablefield: 'statusCode', isSortable: true, isSearchable: true }
];


ruralDevelopmentCols: Column[] = [
  {
    field: 'nameOfTheDistrict',
    header: 'District',
    sortablefield: 'nameOfTheDistrict',
    isSortable: true,
    isSearchable: true,
  },
  {
    field: 'noOfBlocks',
    header: 'No. of Blocks',
    sortablefield: 'noOfBlocks',
    isSortable: true,
    isSearchable: false,
  },
  {
    field: 'total',
    header: 'Total Registrations',
    sortablefield: 'total',
    isSortable: true,
    isSearchable: false,
  },
  {
    field: 'approved',
    header: 'Approved',
    sortablefield: 'approved',
    isSortable: true,
    isSearchable: false,
  },
  {
    field: 'cardIssued',
    header: 'Card Issued',
    sortablefield: 'cardIssued',
    isSortable: true,
    isSearchable: false,
  },
  {
    field: 'cardToBeIssued',
    header: 'Card To Be Issued',
    sortablefield: 'cardToBeIssued',
    isSortable: true,
    isSearchable: false,
  },
  {
    field: 'cardRejected',
    header: 'Card Rejected',
    sortablefield: 'cardRejected',
    isSortable: true,
    isSearchable: false,
  },
];
localBodyCols: Column[] = [
  {
    field: 'allLocalBody',
    header: 'Local Body',
    sortablefield: 'allLocalBody',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'localBodyCountDisplay',
    header: 'LOCAL BODY COUNT',
    sortablefield: 'localBodyCountDisplay',
    isSortable: true,
    isSearchable: false
  },

  {
    field: 'total',
    header: 'Registrations',
    sortablefield: 'total',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'approved',
    header: 'Approved',
    sortablefield: 'approved',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'cardIssued',
    header: 'Card Issued',
    sortablefield: 'cardIssued',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'returned',
    header: 'Returned',
    sortablefield: 'returned',
    isSortable: true,
    isSearchable: true
  }
];

private romanOrder: any = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
  XIII: 13,
  XIV: 14,
  XV: 15
};


corporationCols: Column[] = [
  { field: 'districts', header: 'District', sortablefield: 'name_of_district', isSortable: true, isSearchable: true },

  { field: 'nameofLocalbodyitems', header: 'Corporations', sortablefield: 'nameofLocalbodyitems', isSortable: true, isSearchable: true },

  { field: 'total', header: 'Registrations', sortablefield: 'total', isSortable: true, isSearchable: true },

  { field: 'approved', header: 'Accepted', sortablefield: 'approved', isSortable: true, isSearchable: true },

  { field: 'cardIssued', header: 'Card Printed', sortablefield: 'cardIssued', isSortable: true, isSearchable: true },

  { field: 'cardToBeIssued', header: 'Card Under Printed', sortablefield: 'cardToBeIssued', isSortable: true, isSearchable: true },

  { field: 'cardRejected', header: 'Card Returned', sortablefield: 'cardRejected', isSortable: true, isSearchable: true },
];
GCCcols: Column[] = [
  {
    field: 'districtName',
    header: 'District',
    sortablefield: 'districtName',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'zoneName', // GCC: Zone | CMWS: Corporation
    header: 'GCC Name',
    sortablefield: 'zoneName',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'total',
    header: 'GCC Counts',
    sortablefield: 'total',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'approvedCount',
    header: 'Accepted',
    sortablefield: 'approvedCount',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'cardIssued',
    header: 'Card Printed',
    sortablefield: 'cardIssued',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'cardtobeIssued',
    header: 'Card Under Printed',
    sortablefield: 'cardtobeIssued',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'cardRejected',
    header: 'Card Returned',
    sortablefield: 'cardRejected',
    isSortable: true,
    isSearchable: true
  }
];
CMWScols: Column[] = [
  {
    field: 'districtName',
    header: 'District',
    sortablefield: 'districtName',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'zoneName', // GCC: Zone | CMWS: Corporation
    header: 'CMWS Name',
    sortablefield: 'zoneName',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'total',
    header: 'CMWS Counts',
    sortablefield: 'total',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'approvedCount',
    header: 'Accepted',
    sortablefield: 'approvedCount',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'cardIssued',
    header: 'Card Printed',
    sortablefield: 'cardIssued',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'cardtobeIssued',
    header: 'Card Under Printed',
    sortablefield: 'cardtobeIssued',
    isSortable: true,
    isSearchable: true
  },

  {
    field: 'cardRejected',
    header: 'Card Returned',
    sortablefield: 'cardRejected',
    isSortable: true,
    isSearchable: true
  }
];

MunicipalityCols: Column[] = [
  { field: 'districts', header: 'District', sortablefield: 'name_of_district', isSortable: true, isSearchable: true },

  { field: 'nameofLocalbodyitems', header: 'Municipality', sortablefield: 'nameofLocalbodyitems', isSortable: true, isSearchable: true },

  { field: 'total', header: 'Registrations', sortablefield: 'total', isSortable: true, isSearchable: true },

  { field: 'approved', header: 'Accepted', sortablefield: 'approved', isSortable: true, isSearchable: true },

  { field: 'cardIssued', header: 'Card Printed', sortablefield: 'cardIssued', isSortable: true, isSearchable: true },

  { field: 'cardToBeIssued', header: 'Card Under Printed', sortablefield: 'cardToBeIssued', isSortable: true, isSearchable: true },

  { field: 'cardRejected', header: 'Card Returned', sortablefield: 'cardRejected', isSortable: true, isSearchable: true },
];
TownPanchayatCols: Column[] = [
  { field: 'districts', header: 'District', sortablefield: 'name_of_district', isSortable: true, isSearchable: true },

  { field: 'nameofLocalbodyitems', header: 'Town Panchayat', sortablefield: 'nameofLocalbodyitems', isSortable: true, isSearchable: true },

  { field: 'total', header: 'Registrations', sortablefield: 'total', isSortable: true, isSearchable: true },

  { field: 'approved', header: 'Accepted', sortablefield: 'approved', isSortable: true, isSearchable: true },

  { field: 'cardIssued', header: 'Card Printed', sortablefield: 'cardIssued', isSortable: true, isSearchable: true },

  { field: 'cardToBeIssued', header: 'Card Under Printed', sortablefield: 'cardToBeIssued', isSortable: true, isSearchable: true },

  { field: 'cardRejected', header: 'Card Returned', sortablefield: 'cardRejected', isSortable: true, isSearchable: true },
];

ProgressiveWiseCols: Column[] = [
  {
    field: 'districtName',
    header: 'District',
    sortablefield: 'districtname',
    isSortable: true,
    isSearchable: true
  },
  {
    field: 'year_1',
    header: 'Year - 1',
    sortablefield: 'year_1',
    isSortable: true,
    isSearchable: true,
     compareWith: 'year_2'
  },
  {
    field: 'year_2',
    header: 'Year - 2',
    sortablefield: 'year_2',
    isSortable: true,
    isSearchable: true,
    compareWith: 'year_1'
  },
  {
    field: 'year_3',
    header: 'Year - 3',
    sortablefield: 'year_3',
    isSortable: true,
    isSearchable: true,
       compareWith: 'year_2'
  }
];



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private userService: UserService,
    private roleService: RoleService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    var obj = this.router.getCurrentNavigation()?.extras?.state;
    this.navigationModel = obj ? obj['data'] : undefined;
    this.selectedDistricts = this.navigationModel?.districtId
      ? [this.navigationModel?.districtId]
      : [];
    this.selectedrecordTypes = this.navigationModel?.recordType
      ? [this.navigationModel?.recordType]
      : [];
    this.cdr.markForCheck();
  }
  ngOnInit() {
    var appfilter = localStorage.getItem('ApprovalHistoryFilter');
    if (appfilter) {
      this.filtermodel = JSON.parse(appfilter);
      this.filtermodel = {
        ...this.filtermodel,
        searchString: null,
        columnSearch: null,
        skip: 0,
        take: 10,
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
      };
      this.selectedStatuses = this.filtermodel.where?.statusIds;

      this.selectedDistricts =
        this.selectedDistricts && this.selectedDistricts.length > 0
          ? this.selectedDistricts
          : this.filtermodel.where?.districtIds;
      this.selectedrecordTypes =
        this.selectedrecordTypes && this.selectedrecordTypes.length > 0
          ? this.selectedrecordTypes
          : this.filtermodel.where?.memberDataChangeRequestTypes;
      this.selectedActiveStatuses = this.filtermodel.where?.isActive
        ? '0'
        : '1';
      this.selecteddatefilter = this.filtermodel.where?.year;
    } else {
      this.filtermodel = {
        searchString: null,
        skip: 0,
        where: {
          memberDataChangeRequestTypes: [],
          districtIds: [],
          divisionIds:[],
          statusIds: [],
          Local_Bodys: [],
          name_of_Local_Bodys: [],
          organization_Types: [],
          approvaldateRange: null,
          type_of_Works: [],
          roleId: '',
          memberId: '',
          isActive: false,
          year: '',
          getAll: true,
        },
        sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
        take: 10,
        columnSearch: null,
      };
    }
    var curentyr = new Date().getFullYear();
    var curentmnt = new Date().getMonth();
    var startyr = 2023;
    do {
      this.datefilter = [
        ...this.datefilter,
        {
          text: `Apr ${startyr} - March ${startyr + 1}`,
          value: `${startyr}-${startyr + 1}`,
        },
      ];
      startyr = startyr + 1;
    } while (
      curentyr >= startyr &&
      ((curentyr == startyr && curentmnt > 2) || curentyr != startyr)
    );

    this.userService.MemberDataApprovalGridFilter().subscribe((x) => {
      if (x) {
        var d: MemberDataApprovalFilterModel = x.data;
        this.recordTypes = (
          x.data as MemberDataApprovalFilterModel
        ).changed_Detail_Record_Types;
        this.districts = d.districtList;
        this.divisions = d.divisionList;
        this.statuses = d.approvedStatusList;
        this.roles = d.roleList;
        this.applicationStatus = d.approvedStatusList;
        this.nameOfLocalBody = d.nameofLocalBodyList;
        this.localBody = d.locaBodyList;
        this.organizationType = d.organizationTypeList;
        this.typeOfWork = d.typeOfWorkList;
      }
    });

    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;

    this.cols = [
      {
        field: 'member_Id',
        header: 'Member Id',
        customExportHeader: 'Member Id',
        sortablefield: 'member_Id',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },

      {
        field: 'name',
        header: 'Name',
        customExportHeader: 'Name',
        sortablefield: 'name',
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
        field: 'phone',
        header: 'Phone',
        sortablefield: 'phone',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'memberAadhaarNumber',
        header: 'Aadhaar Number',
        sortablefield: 'memberAadhaarNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'type_of_Work',
        header: 'Type of Work',
        sortablefield: 'type_of_Work',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'organizationType',
        header: 'Organization Type',
        sortablefield: 'organizationType',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'localBody',
        header: 'Local Body',
        sortablefield: 'localBody',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'nameOfLocalBody',
        header: 'Name of Local Body',
        sortablefield: 'nameOfLocalBody',
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
        field: 'approvedBy',
        header: 'Approved By',
        sortablefield: 'approvedBy',
        isSortable: true,
        isSearchable: true,
      },

      {
        field: 'approved_For',
        header: 'Approval For',
        sortablefield: 'approved_For',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'approvedDate',
        header: 'Date',
        sortablefield: 'approvedDate',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'collectedByName',
        header: 'Collected By',
        sortablefield: 'collectedByName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedByPhoneNumber',
        header: 'Collected By Phone',
        sortablefield: 'collectedByPhoneNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedOn',
        header: 'Collected On',
        sortablefield: 'collectedOn',
        isSortable: true,
        isSearchable: true,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-arrow-right',
        title: 'Approve',
        type: 'APPROVE',
        isIcon: true,
      },
    ];
  }
  changescheme(event: any) {
    if (event) {
      this.roleService
        .Get_Status_Select_List_By_Scheme(event)
        .subscribe((x) => {
          this.statuses = x.data;
        });
    } else {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
        .subscribe((x) => {
          this.statuses = x.data;
        });
    }
  }
  createmeeting(val: string) {
    this.router.navigate(['officers', 'user-create', val, 'EDIT']);
  }

  toggleFilters() {
    this.showAllFilters = !this.showAllFilters;
  }
  onDateChange() {
    // Ensure both dates are selected
    if (
      !this.selectedapprovaldatefilter ||
      this.selectedapprovaldatefilter.length !== 2
    ) {
      return;
    }

    const [from, to] = this.selectedapprovaldatefilter;

    // If only one date selected, do nothing until second date comes
    if (!to) return;

    // Ensure To Date >= From Date
    if (to < from) {
      this.selectedapprovaldatefilter[1] = from; // auto-adjust
    }

    // Ensure To Date is not future (extra safety even though maxDate is set)
    if (to > this.maxDate) {
      this.selectedapprovaldatefilter[1] = this.maxDate;
    }
  }

  changefilter(val: TableFilterModel) {
    this.filtermodel = {
      ...this.filtermodel,
      ...val,
      where: {
        districtIds: this.selectedDistricts,
        divisionIds: this.selectedDivisions,
        memberDataChangeRequestTypes: this.selectedrecordTypes,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        roleId: this.selectedroles,
        Local_Bodys: this.selectedlocalBody,
        name_of_Local_Bodys: this.selectednameOfLocalBody,
        organization_Types: this.selectedorganizationType,
        type_of_Works: this.selectedtypeOfWork,
        approvaldateRange: this.selectedapprovaldatefilter,

            // ✅ ADD THESE
         Aadhaar_Number: this.memberAadhaarNumber || null,
         Phone_Number: this.memberPhoneNumber || null,
         reportFormat: this.selectedReportFormat || null,

        memberId: '',
        isActive: true,
        getAll: true,
      },
    };
    this.getApplications();
  }
  changeStatus(val: boolean) {
    this.filtermodel = { ...this.filtermodel };
    this.currentStatus = !val;
    if (!val) {
      this.actions = [
        {
          icon: 'pi pi-pencil',
          title: 'Edit',
          type: 'EDIT',
          isIcon: true,
        },
        {
          icon: 'pi pi-times',
          title: 'In-Activate',
          type: 'INACTIVATE',
          isIcon: true,
        },
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-undo',
          title: 'Activate',
          type: 'ACTIVATE',
          isIcon: true,
        },
      ];
    }
    this.getApplications();
  }

  //Updated by Sivasankar K on 20/12/20025 for DateWiseReport 
  getApplications() {
    localStorage.setItem(
      'ApprovalHistoryFilter',
      JSON.stringify(this.filtermodel)
    );
    if (this.showdata) {
      this.userService.DatewiseAprovedList(this.filtermodel).subscribe((c) => {
    const data = [...c.data];
    
      const grandTotal = data.find(x => x.zoneName === 'GRAND TOTAL');
      const filtered = data.filter(x => x.zoneName !== 'GRAND TOTAL');

     
      filtered.sort((a: any, b: any) => {

       
        if (a.zoneName === 'Others') return 1;
        if (b.zoneName === 'Others') return -1;

        const aOrder = this.romanOrder[a.zoneName] ?? 999;
        const bOrder = this.romanOrder[b.zoneName] ?? 999;

        return aOrder - bOrder;
      });

      // Push GRAND TOTAL to the very end
      if (grandTotal) {
        filtered.push(grandTotal);
      }

    this.configurationList = filtered.map((x: any) => {

  if (x.allLocalBody === 'GCC' || x.allLocalBody === 'CMWS') {
    return {
      ...x,
      localBodyCountDisplay: '15 Zones'
    };
  }

  return {
    ...x,
    localBodyCountDisplay: x.localBodyCount
  };
});
      this.total = c.totalRecordCount;
 



//Updated by Sivasankar K on 20/12/2025 for DateWiseReport 


  switch (this.selectedReportFormat) {
  case 'RuralDevelopement':
    this.cols = this.ruralDevelopmentCols;
    this.actions = []; // no row actions
    break;

    case 'DEPARTMENT':
      this.cols = this.departmentCols;
      this.actions = [];
      break;


      case 'FamilyMembers':
  this.cols = this.familyMemberCols;
  this.actions = [];

  this.configurationList = c.data.map((item: any) => {
    const hasScheme =
      !!item.schemeId ||
      !!item.schemeCode ||
      !!item.statusCode;

    return {
      ...item,

      // ✅ Scheme Status YES / NO
      schemeStatus: hasScheme ? 'Yes' : 'No',

      // ✅ Card Status
      cardStatus:
        item.cardStatus === '1'
          ? 'Issued'
          : item.cardStatus === '0'
          ? 'Not Issued'
          : 'No',

      // ✅ Date formatting
      familyMemberCreatedDate: item.familyMemberCreatedDate
        ? moment(item.familyMemberCreatedDate).format('DD-MM-YYYY hh:mm A')
        : '-',

      // ✅ Empty-safe fields
      scheme: item.scheme || '-',
      statusCode: item.statusCode || '-',
      familyMemberOccupation: item.familyMemberOccupation || '-',
    };
  });

  this.total = c.totalRecordCount;
  break;




    // case 'FamilyMembers':
    //   this.cols = this.familyMemberCols;
    //   this.actions = []; // no row actions
    //   break;

    case 'CORPORATION':
      this.cols = this.corporationCols;
      this.actions = []; // no row actions
      break;   

    case 'PROGRESSIVE':
      this.cols = this.ProgressiveWiseCols;
      this.actions = []; // no row actions
      break;   
    case 'GCC':
      this.cols = this.GCCcols;
      this.actions = []; // no row actions
      break; 
      
        case 'CMWS':
      this.cols = this.CMWScols;
      this.actions = []; // no row actions
      break; 
     case 'TOWN PANCHAYAT':
      this.cols = this.TownPanchayatCols;
      this.actions = []; // no row actions
      break; 
           case 'MUNICIPALITY':
      this.cols = this.MunicipalityCols;
      this.actions = []; // no row actions
      break; 
           case 'MEMBER':
      this.cols = this.localBodyCols;
      this.actions = []; // no row actions
      break; 
      
    default:
      this.resetMemberColumns();
      break;
  }

      });
    }
  }
  reset() {
   
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
      .subscribe((x) => {
        this.statuses = x.data;
      });
    this.selectedrecordTypes = [];
    this.selectedDistricts = [];
    this.selectedDivisions = [];
    this.selectedStatuses = [];
    this.selectedroles = '';
    this.selectedActiveStatuses = '1';
    this.selectedorganizationType = [];
    this.selectedtypeOfWork = [];
    this.selectedlocalBody = [];
    this.selectednameOfLocalBody = [];
    this.selectedapprovaldatefilter = null;
    this.selecteddatefilter = '';

    this.memberAadhaarNumber = '';
    this.memberPhoneNumber = '';
    this.selectedReportFormat = '';

    // Reset Filter Model
    this.filtermodel = {
      ...this.filtermodel,
      skip: 0,
      take: 10,
      where: {
        memberDataChangeRequestTypes: [],
        districtIds: [],
        divisionIds: [],
        statusIds: [],
        Local_Bodys: [],
        name_of_Local_Bodys: [],
        organization_Types: [],
        approvaldateRange: null,
        type_of_Works: [],

        Aadhaar_Number: '',
        Phone_Number: '',
        reportFormat: '',

        roleId: '',
        memberId: '',
        isActive: true,
        year: '',
        getAll: true,
      },
      
    };
     this.resetMemberColumns();

    // Remove saved filters
    localStorage.removeItem('ApprovalHistoryFilter');

    // Clear table display
    this.configurationList = [];

    // Force UI refresh
    this.cdr.detectChanges();
    //this.generate();
    //this.getApplications();
  }
  generate() {
    this.showdata = true;

    if (!this.selectedDistricts || this.selectedDistricts.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'District Required',
        detail: 'Please select at least one District.',
      });
      return;
    }

    // ✅ Validate Status is selected
    if (!this.selectedStatuses || this.selectedStatuses.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Status Required',
        detail: 'Please select at least one Status.',
      });
      return;
    }
    if (
      this.selectedapprovaldatefilter &&
      this.selectedapprovaldatefilter.length > 0
    ) {
      if (
        this.selectedapprovaldatefilter.length !== 2 ||
        !this.selectedapprovaldatefilter[0] ||
        !this.selectedapprovaldatefilter[1]
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Date Required',
          detail: 'Please select both From Date and To Date.',
        });
        return;
      }
    }

    this.filtermodel = {
      ...this.filtermodel,
      where: {
        districtIds: this.selectedDistricts,
        divisionIds: this.selectedDivisions,
        memberDataChangeRequestTypes: this.selectedrecordTypes,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        roleId: this.selectedroles,
        Local_Bodys: this.selectedlocalBody,
        name_of_Local_Bodys: this.selectednameOfLocalBody,
        organization_Types: this.selectedorganizationType,
        type_of_Works: this.selectedtypeOfWork,
        approvaldateRange: this.selectedapprovaldatefilter,


         // ✅ ADD THESE
  Aadhaar_Number: this.memberAadhaarNumber?.trim() || null,
Phone_Number: this.memberPhoneNumber?.trim() || null,
    reportFormat: this.selectedReportFormat || null,
        memberId: '',
        getAll: true,
        isActive: true,
      },
    };
    this.getApplications();
  }
  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'member-view',
      val.record.id,
    ]);
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'VIEW') {
      this.router.navigate(['officers', 'applications', 'view', val.record.id]);
    } else if (val && val.type == 'EDIT') {
      this.router.navigate([
        'officers',
        'applications',
        'edit',
        val.record.member_Id,
        '0',
      ]);
    } else if (val && val.type == 'APPROVE') {
      this.router.navigate([
        'officers',
        'applications',
        'update-approval',
        val.record.id,
        val.record.member_Id,
      ]);
    } else if (val && val.type == 'PRINT') {
      this.router.navigate([
        'officers',
        'applications',
        'view-print',
        val.record.applicationId,
      ]);
    }
  }
  cf() {
    this.router.navigate(['officers', 'applications', 'update-approval', 'd']);
  }

  // onExportRequest(type: string) {
  //   if (this.isExporting) return;
  //   this.isExporting = true;

  //   const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };

  //   this.messageService.add({
  //     severity: 'info',
  //     summary: 'Preparing...',
  //     detail: `Your ${type.toUpperCase()} file is being generated.`,
  //     life: 3000,
  //   });

  //   this.schemeService.startDatewiseExport(exportFilter, type).subscribe({
  //     next: (res: any) => {
  //       // ✅ create an invisible iframe to trigger file download
  //       const iframe = document.createElement('iframe');
  //       iframe.style.display = 'none';
  //       iframe.src = res.downloadUrl;
  //       document.body.appendChild(iframe);

  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Started',
  //         detail:
  //           'Your file is being prepared. It will download automatically.',
  //       });

  //       this.isExporting = false;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Export failed to start.',
  //       });
  //       this.isExporting = false;
  //     },
  //   });
  // }

  onExportRequest(type: string) {
    if (this.isExporting) return;

    this.isExporting = true;

    const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };

    this.messageService.add({
      severity: 'info',

      summary: 'Preparing...',

      detail: `Your ${type.toUpperCase()} file is being generated.`,

      life: 3000,
    });

    this.schemeService.startDatewiseExport(exportFilter, type).subscribe({
      next: (res: any) => {
        const downloadUrl = res.downloadUrl;

        // ✅ Trigger file download via <a> tag (no iframe, no popup)

        const link = document.createElement('a');

        link.href = downloadUrl;

        link.setAttribute('download', ''); // Let browser decide file name

        link.style.display = 'none';

        document.body.appendChild(link);

        link.click(); // 👈 triggers download instantly

        document.body.removeChild(link);

        this.messageService.add({
          severity: 'success',

          summary: 'Started',

          detail:
            'Your file is being prepared. It will download automatically.',

          life: 3000,
        });

        this.isExporting = false;
      },

      error: (err) => {
        console.error(err);

        this.messageService.add({
          severity: 'error',

          summary: 'Error',

          detail: 'Export failed to start.',

          life: 3000,
        });

        this.isExporting = false;
      },
    });
  }

  onDivisionChange(event: any) {
  const divisionIds = event.value;

  this.selectedDistricts = []; // reset districts

  if (!divisionIds || divisionIds.length === 0) {
    this.districts = [];
    return;
  }

  // this.generalService
  //   .getDistrictsByDivisionIds(divisionIds)
  //   .subscribe((res) => {
  //     this.districts = res.data;
  //   });
}

resetMemberColumns() {
  this.cols = [
    { field: 'member_Id', header: 'Member Id', isSortable: true },
    { field: 'name', header: 'Name', isSortable: true },
    { field: 'district', header: 'District', isSortable: true },
    { field: 'phone', header: 'Phone', isSortable: true },
    { field: 'memberAadhaarNumber', header: 'Aadhaar Number', isSortable: true },
    { field: 'type_of_Work', header: 'Type of Work', isSortable: true },
    { field: 'organizationType', header: 'Organization Type', isSortable: true },
    { field: 'localBody', header: 'Local Body', isSortable: true },
    { field: 'nameOfLocalBody', header: 'Name of Local Body', isSortable: true },
    { field: 'status', header: 'Status', isSortable: true },
    { field: 'approvedBy', header: 'Approved By', isSortable: true },
    { field: 'approved_For', header: 'Approval For', isSortable: true },
    { field: 'approvedDate', header: 'Date', isSortable: true },
    { field: 'collectedByName', header: 'Collected By', isSortable: true },
    { field: 'collectedByPhoneNumber', header: 'Collected By Phone', isSortable: true },
    { field: 'collectedOn', header: 'Collected On', isSortable: true },
  ];
}


}
