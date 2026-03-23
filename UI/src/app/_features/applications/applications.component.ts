import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationFilterModel,
  MemberFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { ResponseModel } from 'src/app/_models/ResponseStatus';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { UserModel } from 'src/app/_models/user';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent {
  configurationList!: ApplicationMainGridModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;
  privleges = privileges;

  activeStatuses: TCModel[] = [
    { text: 'Active', value: '1' },
    { text: 'Expired', value: '0' },
  ];
  selectedMainOption!: string;
  // mainOptions: any[] = [
  //   {
  //     name: 'Scheme',
  //     value: 'SCHEME',
  //   },
  //   {
  //     name: 'Member',
  //     value: 'MEMBER',
  //   },
  // ];
  // mainValue: string = 'MEMBER';
  mainOptions: any[] = [];
  mainValue: string = '';
  UserDropDownValues!: ResponseModel;
  districtIdsValue: any;
  localBodyIdsValue: string[] | [] = [];
  nameOfLocalBodyIdsValue: any;
  blockIdsValue: any;
  corporationIdsValue: any;
  municipalityIdsValue: any;
  townPanchayatIdsValue: any;
  villagePanchayatIdsValue: any;
  zoneIdsValue: any;
  localbody: any;
  nameoflocalbody: any;
  nameoflocalbodytrue!: boolean;
  member_Id: string | undefined;
  selected_localBody: any;
  selected_localBodyIdsValue: any;
  selected_Block_Value: any;
  selected_VillagePanchayat_Value: any;
  selected_Corporation_Value: any;
  selected_Municipality_Value: any;
  selected_TownPanchayat_Value: any;
  selected_zone_Value: any;
  selectedLocalBody: any;
  selectedNameOfLocalBody: any;
  selectedBlock: any;
  selectedTownPanchayat: any;
  selectedMunicipality: any;
  selectedCorporation: any;
  selectedZone: any;
  selectedVillagePanchayat: any;
  CollectedByPhoneNo: any;
  selectedCollectedByPhone!: any[];
  RoleNameValue: any;
  isUrban: boolean = false;
  isUrbanRural!: boolean;
  generateMainFilter() {}
  schemes: TCModel[] = [];
  districts: TCModel[] = [];
  cardStatus: TCModel[] = [];
  statuses: TCModel[] = [];
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  selectedActiveStatuses: string = '1';
  selectedSchemes: string[] | [] = [];
  selectedDistricts: string[] | [] = [];
  selectedCardStatus: string[] | [] = [];
  selectedStatuses: string[] | [] = [];

  organizationType: TCModel[] = [];
  typeOfWork: TCModel[] = [];
  localBody: TCModel[] = [];
  nameOfLocalBody: TCModel[] = [];
  Application_Status: TCModel[] = [];
  Approval_application_Status: TCModel[] = [];

  Collected_ToDate: Date | null = null;
  Collected_FromDate: Date | null = null;
  Changed_Detail_Records: string[] = [];

  selectedChanged_Detail_Records: string[] = [];

  selected_Block: string[] = [];
  selected_Corporation: string[] = [];
  selected_Municipality: string[] = [];
  selected_TownPanchayat: string[] = [];
  selected_VillagePanchayat: string[] = [];
  selected_zone: string[] = [];

  selectedorganizationType: string[] | [] = [];
  selectedtypeOfWork: string[] | [] = [];
  selectedlocalBody: string[] | [] = [];
  selectednameOfLocalBody: string[] | [] = [];
  selectedApplication_Status: string[] | [] = [];

  actions: Actions[] = [];
  title: string = 'Applications';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;
  queryStatus: string | null = null;
  approvalQuaryParams: string | null = null;
  filtermodel!: ApplicationFilterModel;
  memberfilter!: MemberFilterModel;
  value: string[] = [];
  navigationModel: NavigationModel | undefined;
  nameoflocalbodyValue: string = '';
  localbodyValue: string = '';
  showdata: boolean = false;
  isStatusFromQuery: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private accountService: AccountService,
    private generalService: GeneralService,
    private userService: UserService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef,
  ) {
    var obj = this.router.getCurrentNavigation()?.extras?.state;
    this.navigationModel = obj ? obj['data'] : undefined;

    this.selectedDistricts = this.navigationModel?.districtId
      ? [this.navigationModel?.districtId]
      : [];
    this.selectedCardStatus = this.navigationModel?.cardstatusId
      ? [this.navigationModel?.cardstatusId]
      : [];
    this.selectedSchemes = this.navigationModel?.schemeId
      ? [this.navigationModel?.schemeId]
      : [];
    this.selectedStatuses = this.navigationModel?.statusId
      ? [this.navigationModel?.statusId]
      : [];

    this.route.queryParams.subscribe((params) => {
      this.queryStatus = params['status'] || null;
      this.approvalQuaryParams = params['Approvalstatus'] || null;

      this.isStatusFromQuery = !!(this.queryStatus || this.approvalQuaryParams);

      if (this.queryStatus) {
        this.selectedApplication_Status = [this.queryStatus];
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.approvalQuaryParams = params['Approvalstatus'] || null;
      console.log('Approval Query Param:', this.approvalQuaryParams);
    });

    //  Force Scheme tab if coming with scheme/status from Dashboard
    if (this.selectedSchemes.length > 0 || this.selectedStatuses.length > 0) {
      this.mainValue = 'SCHEME';
    } else {
      this.mainValue = 'MEMBER';
    }

    this.cdr.markForCheck();
  }
  dd: UserModel = this.accountService.userValue;

  local = this.dd.userDetails;
  showAllFilters: boolean = false;

  ngOnInit() {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('privillage='));

    let userPrivileges: string[] = [];

    if (cookie) {
      try {
        userPrivileges = decodeURIComponent(cookie.split('=')[1]).split(',');
      } catch (err) {
        console.error('Error parsing privileges from cookie', err);
      }
    }
    //  Check privileges
    if (userPrivileges.includes('APPLICATION_VIEW')) {
      this.mainOptions.push({ name: 'Scheme', value: 'SCHEME' });
    }

    if (userPrivileges.includes('APPLICATION_MEMBER_VIEW')) {
      this.mainOptions.push({ name: 'Member', value: 'MEMBER' });
    }

    //  Default value
    if (this.mainOptions.length > 0) {
      this.mainValue = this.mainOptions[0].value;
      this.generateMainFilter();
    }

    this.cdr.markForCheck();

    // Updated code to restore filter state - Elanjsuriyan S
    const saved = localStorage.getItem('APPLICATION_FILTER_STATE');

    if (saved) {
      const state = JSON.parse(saved);

      this.mainValue = state.mainValue ?? this.mainOptions[0]?.value;

      if (state?.schemeFilter?.take) {
        this.rows = state.schemeFilter.take;
      }

      if (state?.schemeFilter?.skip) {
        this.first = state.schemeFilter.skip;
      }

      if (state?.schemeFilter?.sorting) {
        this.defaultSortField = state.schemeFilter.sorting.fieldName;
        this.defaultSortOrder = state.schemeFilter.sorting.sort;
      }

      if (state?.schemeFilter?.searchString) {
        this.value = state.schemeFilter.searchString;
      }

      if (state?.schemeFilter?.columnSearch) {
        this.value = [...state.schemeFilter.columnSearch];
      }

      if (this.mainValue === 'MEMBER' && state.memberFilter) {
        this.memberfilter = state.memberFilter;
        const w = this.memberfilter.where;

        this.selectedDistricts = w?.districtIds || [];
        this.selectedCardStatus = w?.cardstatusId || [];
        this.selecteddatefilter = w?.year || this.selecteddatefilter;

        this.selectedApplication_Status = w?.Application_Status || [];
        this.selectedChanged_Detail_Records = w?.Changed_Detail_Records || [];

        this.selectedtypeOfWork = w?.type_of_Works || [];
        this.selectedorganizationType = w?.organization_Types || [];

        this.selectedLocalBody = w?.local_Bodys || [];
        this.selectedNameOfLocalBody = w?.name_of_Local_Bodys || [];

        this.selectedZone = w?.zone || [];
        this.selectedBlock = w?.block || [];
        this.selectedVillagePanchayat = w?.village_Panchayat || [];
        this.selectedCorporation = w?.corporation || [];
        this.selectedMunicipality = w?.municipality || [];
        this.selectedTownPanchayat = w?.town_Panchayat || [];

        this.selectedCollectedByPhone = w?.collectedByPhoneNumber
          ? w.collectedByPhoneNumber.split(',')
          : [];

        this.Collected_FromDate = w?.fromDate ? new Date(w.fromDate) : null;

        this.Collected_ToDate = w?.toDate ? new Date(w.toDate) : null;

        this.showdata = true;
      }

      if (this.mainValue === 'SCHEME' && state.schemeFilter) {
        this.filtermodel = state.schemeFilter;

        const w = this.filtermodel.where;

        this.selectedSchemes = w?.schemeIds || [];
        // this.selectedStatuses = w?.statusIds || [];
        this.selectedStatuses = this.mapReturnedToStatusIds(w?.statusIds || []);
        this.selectedDistricts = w?.districtIds || [];
        this.selecteddatefilter = w?.year || this.selecteddatefilter;
        this.selectedActiveStatuses = w?.isExpired ? '0' : '1';

        console.log(
          'Restored schme filter from localStorage:',
          this.filtermodel,
        );

        this.getApplications();
      }
    }
    console.log('MainValue:', this.mainValue);

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

    this.userService.User_Filter_Dropdowns().subscribe((x) => {
      if (x) {
        this.schemes = x.data.schemeSelectList;
        this.districts = x.data.districtSelectList;
        this.cardStatus = x.data.cardStatusSelectList;
        this.localbody = x.data.localBodyIds;
        this.nameoflocalbody = x.data.nameOfLocalBodyIds;
        this.selected_Block = x.data.blockIds;
        this.selected_Corporation = x.data.corporationIds;
        this.selected_Municipality = x.data.municipalityIds;
        this.selected_TownPanchayat = x.data.townPanchayatIds;
        this.selected_VillagePanchayat = x.data.villagePanchayatIds;
        this.selected_zone = x.data.zoneIds;
        this.CollectedByPhoneNo = x.data.collectedByPhoneNo;
        this.isUrbanRural = x.data.isUrbanRural;
        // Set selected values from items where selected=true
        // this.selectedCollectedByPhone = this.CollectedByPhoneNo.filter(
        //   (x: { selected: any }) => x.selected,

        this.selectedCollectedByPhone = this.CollectedByPhoneNo.filter(
          (x: { selected: any }) => x.selected,
        ).map((x: { value: any }) => x.value);

        const hasUrban = this.localbody?.some((x: any) => x.value === 'URBAN');
        const onlyOneValue = this.localbody?.length === 1;

        this.isUrban = hasUrban && onlyOneValue;
        //  const savedFilters = localStorage.getItem('memberFilter');
        this.cdr.detectChanges();
      }
    });

    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
      .subscribe((x) => {
        this.statuses = x.data;
        if (
          this.mainValue === 'SCHEME' &&
          Array.isArray(this.selectedStatuses) &&
          (this.selectedStatuses as string[]).includes('RETURNED')
        ) {
          this.selectedStatuses = this.mapReturnedToStatusIds(
            this.selectedStatuses as string[],
          );
        }
      });

    this.generalService
      .getConfigurationDetailsInSelectListbyId({
        CategoryCode: 'ORGANIZATION_TYPE',
      })
      .subscribe((x) => {
        this.organizationType = x.data;
      });

    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'TYPE_OF_WORK' })
      .subscribe((x) => {
        this.typeOfWork = x.data;
      });

    this.userService.MemberDataApprovalGridFilter().subscribe((x) => {
      this.Application_Status = x.data.statusList;
      this.Changed_Detail_Records = x.data.changed_Detail_Record_Types;
    });

    if (
      (this.selectedSchemes?.length ?? 0) > 0 ||
      (this.selectedStatuses?.length ?? 0) > 0
    ) {
      this.mainValue = 'SCHEME';
      this.generate();
    } else {
      this.mainValue = 'MEMBER';
    }

    this.cols = [
      {
        field: 'applicationNumber',
        header: 'Id',
        customExportHeader: 'Id',
        sortablefield: 'applicationNumber',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },
      {
        field: 'scheme',
        header: 'Scheme',
        customExportHeader: 'Scheme',
        sortablefield: 'scheme',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
        // isBadge: true,
        badgeCheckfield: 'lastAction',
      },
      // {
      //   field: 'observation',
      //   header: 'Observation',
      //   sortablefield: 'observation',
      //   isSortable: true,
      //   isSearchable: true,
      // },
      {
        field: 'districtName',
        header: 'District',
        sortablefield: 'districtName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'date',
        header: 'Date',
        sortablefield: 'date',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'firstName',
        header: 'Name',
        sortablefield: 'firstName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'beneficiaryName',
        header: 'BeneficiaryName',
        sortablefield: 'beneficiaryName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'submittedDate',
        header: 'Submitted Date',
        sortablefield: 'submittedDate',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'collectedByName',
        header: 'Collected By Name',
        sortablefield: 'collectedByName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedByPhoneNumber',
        header: 'Collected By Phone Number',
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
      {
        field: 'bulkApprovedDate',
        header: 'Approved Date',
        sortablefield: 'bulkApprovedDate',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'bulkApprovedByUserName',
        header: 'Approved By',
        sortablefield: 'bulkApprovedByUserName',
        isSortable: true,
        isSearchable: true,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Update',
        type: 'EDIT',
        isIcon: false,
        visibilityCheckFeild: 'canUpdate',
      },
      {
        icon: 'pi pi-arrow-right',
        title: 'Review',
        type: 'APPROVE',
        isIcon: false,
        visibilityCheckFeild: 'canApprove',
      },
    ];

    //   this.route.queryParams.subscribe(params => {

    //   const status = params['status'];

    //   if (!status)
    //     { this.reset();
    //       return;
    //     }

    //   console.log('Query status:', status);

    //   this.mainValue = 'MEMBER';

    //   // this.reset();

    //   this.selectedApplication_Status = [status];

    //   this.generate();

    // });

    this.route.queryParams.subscribe((params) => {
      const status = params['status'];
      const approval = params['Approvalstatus'];

      this.approvalQuaryParams = approval || null;

      console.log('Status:', status);
      console.log('Approvalstatus:', approval);

      if (approval) {
        this.mainValue = 'MEMBER';
        this.selectedApplication_Status = [];
        this.generate();
        return;
      }

      if (!status) {
        this.reset();
        return;
      }

      this.mainValue = 'MEMBER';
      this.selectedApplication_Status = [status];
      this.generate();
    });

    this.route.queryParams.subscribe((params) => {
      const status = params['status'];
      const approval = params['Approvalstatus'];

      // Set title based on params
      if (approval === 'Approvals') {
        this.title = 'Approvals';
      } else if (status === 'COMPLETED') {
        this.title = 'Approved';
      } else if (status === 'RETURNED') {
        this.title = 'Returned';
      } else {
        this.title = 'Applications';
      }
    });
  }

  mapReturnedToStatusIds(statusIds: string[] = []): string[] {
    if (!statusIds.length || !this.statuses?.length) {
      return statusIds;
    }

    if (statusIds.includes('RETURNED')) {
      const returnedIds = this.statuses
        .filter((s) => s.text?.toUpperCase().startsWith('RETURNED'))
        .map((s) => s.value);

      return [...statusIds.filter((x) => x !== 'RETURNED'), ...returnedIds];
    }

    return statusIds;
  }

  // Updated code to save filter state - Elanjsuriyan S
  saveApplicationFilterState() {
    const payload = {
      mainValue: this.mainValue,

      memberFilter:
        this.mainValue === 'MEMBER'
          ? {
              ...this.memberfilter,
              where: {
                ...this.memberfilter.where,

                districtIds: this.selectedDistricts || [],
                cardstatusId: this.selectedCardStatus || [],
                year: this.selecteddatefilter || null,

                Application_Status: this.selectedApplication_Status || [],
                Changed_Detail_Records:
                  this.selectedChanged_Detail_Records || [],

                type_of_Works: this.selectedtypeOfWork || [],
                organization_Types: this.selectedorganizationType || [],

                local_Body: this.selectedLocalBody?.[0] ?? null,
                local_Bodys: this.selectedLocalBody || [],

                name_of_Local_Body: this.selectedNameOfLocalBody?.[0] ?? null,
                name_of_Local_Bodys: this.selectedNameOfLocalBody || [],

                zone: this.selectedZone || [],
                block: this.selectedBlock || [],
                village_Panchayat: this.selectedVillagePanchayat || [],
                corporation: this.selectedCorporation || [],
                municipality: this.selectedMunicipality || [],
                town_Panchayat: this.selectedTownPanchayat || [],

                collectedByPhoneNumber: this.selectedCollectedByPhone?.length
                  ? this.selectedCollectedByPhone.join(',')
                  : '',

                fromDate: this.Collected_FromDate
                  ? this.Collected_FromDate.toISOString().split('T')[0]
                  : null,

                toDate: this.Collected_ToDate
                  ? this.Collected_ToDate.toISOString().split('T')[0]
                  : null,
              },
            }
          : null,

      schemeFilter: this.mainValue === 'SCHEME' ? this.filtermodel : null,
    };

    localStorage.setItem('APPLICATION_FILTER_STATE', JSON.stringify(payload));
  }
  // Updated code to save filter state - Elanjsuriyan S
  saveMemberFilters() {
    if (!this.memberfilter) return;

    const payload = {
      skip: this.memberfilter.skip,
      take: this.memberfilter.take,
      sorting: this.memberfilter.sorting,
      where: {
        districtIds: this.memberfilter.where?.districtIds || [],
        cardstatusId: this.memberfilter.where?.cardstatusId || [],
        year: this.memberfilter.where?.year || null,
        isActive: this.memberfilter.where?.isActive ?? true,

        type_of_Work: this.memberfilter.where?.type_of_Work,
        type_of_Works: this.memberfilter.where?.type_of_Works || [],

        organization_Type: this.memberfilter.where?.organization_Type,
        organization_Types: this.memberfilter.where?.organization_Types || [],

        local_Body: this.memberfilter.where?.local_Body,
        local_Bodys: this.memberfilter.where?.local_Bodys || [],

        name_of_Local_Body: this.memberfilter.where?.name_of_Local_Body,
        name_of_Local_Bodys: this.memberfilter.where?.name_of_Local_Bodys || [],

        zone: this.memberfilter.where?.zone,
        block: this.memberfilter.where?.block,
        village_Panchayat: this.memberfilter.where?.village_Panchayat,
        corporation: this.memberfilter.where?.corporation,
        municipality: this.memberfilter.where?.municipality,
        town_Panchayat: this.memberfilter.where?.town_Panchayat,

        collectedByPhoneNumber:
          this.memberfilter.where?.collectedByPhoneNumber || '',
        fromDate: this.memberfilter.where?.fromDate || null,
        toDate: this.memberfilter.where?.toDate || null,

        Changed_Detail_Records:
          this.memberfilter.where?.Changed_Detail_Records || [],
        isApprovalPending: false,
      },
    };

    localStorage.setItem('SelectedMemberFilters', JSON.stringify(payload));
  }

  createform() {
    this.router.navigate(['applicant', 'workerlogin']);
  }
  schemeApply() {
    this.router.navigate(['auth', 'login', 'applicant']);
  }

  toggleFilters() {
    this.showAllFilters = !this.showAllFilters;
  }

  loadDropdownsForEdit() {
    const district =
      this.selectedDistricts?.length > 0
        ? this.selectedDistricts[0]
        : undefined;

    if (!district) return;

    /* =============  LOCALBODY ============= */
    this.generalService
      .General_Configuration_GetAreaList_ByDistrict(district)
      .subscribe((res) => {
        this.localbody = Array.isArray(res.data) ? res.data : [];
        // MultiSelect: ngModel must be an array of values
        this.selectedLocalBody = [...(this.localBodyIdsValue ?? [])];
      });

    /* =============  NAME OF LOCAL BODY ============= */
    this.generalService
      .Application_NameOfTheLocalBody_Select_Get(this.member_Id, district)
      .subscribe((res) => {
        this.nameoflocalbody = Array.isArray(res.data) ? res.data : [];
        this.selectedNameOfLocalBody = [
          ...(this.nameOfLocalBodyIdsValue ?? []),
        ];
      });

    /* =============  BLOCK ============= */
    if (this.blockIdsValue?.length > 0) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: district,
          CategoryCode: 'BLOCK',
        })
        .subscribe((res) => {
          this.selected_Block = Array.isArray(res.data) ? res.data : [];
          this.selectedBlock = [...this.blockIdsValue]; // multi-select
        });
      this.localbodyValue = 'RURAL';
      this.nameoflocalbodyValue = '';
    }

    if (this.villagePanchayatIdsValue?.length > 0) {
      const blockIds = this.blockIdsValue[0] ?? '';
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: blockIds,
          CategoryCode: 'VILLAGEPANCHAYAT',
        })
        .subscribe((res: any) => {
          this.selected_VillagePanchayat = Array.isArray(res.data)
            ? res.data
            : [];
          this.selectedVillagePanchayat = [...this.villagePanchayatIdsValue]; // multi-select
        });
    }

    /* =============  TOWN PANCHAYAT ============= */
    if (this.townPanchayatIdsValue?.length > 0) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: district,
          CategoryCode: 'TOWNPANCHAYAT',
        })
        .subscribe((res) => {
          this.selected_TownPanchayat = Array.isArray(res.data) ? res.data : [];
          this.selectedTownPanchayat = [...this.townPanchayatIdsValue];
        });
      this.nameoflocalbodyValue = 'TOWNPANCHAYAT';
    }

    /* =============  MUNICIPALITY ============= */
    if (this.municipalityIdsValue?.length > 0) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: district,
          CategoryCode: 'MUNICIPALITY',
        })
        .subscribe((res) => {
          this.selected_Municipality = Array.isArray(res.data) ? res.data : [];
          this.selectedMunicipality = [...this.municipalityIdsValue];
        });
      this.nameoflocalbodyValue = 'MUNICIPALITY';
    }

    /* ============= CORPORATION ============= */
    if (this.corporationIdsValue?.length > 0) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: district,
          CategoryCode: 'CORPORATION',
        })
        .subscribe((res) => {
          this.selected_Corporation = Array.isArray(res.data) ? res.data : [];
          this.selectedCorporation = [...this.corporationIdsValue];
        });
      this.nameoflocalbodyValue = 'CORPORATION';
    }

    /* =============  ZONE / GCC ============= */
    if (this.zoneIdsValue?.length > 0) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          CategoryCode: 'ZONE',
        })
        .subscribe((res) => {
          this.selected_zone = Array.isArray(res.data) ? res.data : [];
          this.selectedZone = [...this.zoneIdsValue];
        });

      this.nameoflocalbodyValue = 'GCC/CMWS';
    }
  }

  onDistrictChange(selectedDistrict: any): void {
    // 1. Clear arrays and values
    this.localBody = []; // <-- changed here
    this.nameoflocalbody = [];
    this.nameoflocalbodytrue = false;
    this.localbodyValue = '';
    this.nameoflocalbodyValue = '';

    this.clearDependentDropdowns();
    var isUrbalRural = this.isUrbanRural;
    console.log(this.isUrbanRural);
    if (isUrbalRural === false) {
      if (selectedDistrict) {
        this.generalService
          .General_Configuration_GetAreaList_ByDistrict(selectedDistrict)
          .subscribe((res: any) => {
            this.localbody = res?.data || [];
            this.selectedLocalBody = null; // reset selection
            const hasUrban = this.localbody?.some(
              (x: any) => x.value === 'URBAN',
            );
            const onlyOneValue = this.localbody?.length === 1;

            this.isUrban = hasUrban && onlyOneValue;
          });

        // Name of localbody list
        this.generalService
          .Application_NameOfTheLocalBody_Select_Get(
            this.member_Id,
            selectedDistrict,
          )
          .subscribe((res: any) => {
            const raw = res?.data || [];
            this.nameoflocalbody = raw.map((x: any) => ({
              text: x.name ?? x.text ?? x.NameOfLocalBody,
              value: x.id ?? x.value ?? x.LocalBodyId,
            }));
          });

        this.nameoflocalbodytrue = true;
      } else {
        this.localBody = []; // <-- changed here
        this.nameoflocalbody = [];
        this.nameoflocalbodytrue = false;
      }
    }
  }

  clearDependentDropdowns() {
    this.selected_Block = [];
    this.selected_TownPanchayat = [];
    this.selected_Municipality = [];
    this.selected_Corporation = [];
    this.selected_VillagePanchayat = [];
    this.selected_zone = [];
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

  changefilter(val: TableFilterModel) {
    this.memberfilter = {
      ...this.memberfilter,
      skip: val.skip ?? 0,
      take: val.take ?? this.rows,
      searchString: val.searchString,
      columnSearch: val.columnSearch,
      sorting: val.sorting,
      where: {
        ...this.memberfilter.where,
      },
    };
    // this.filtermodel = {
    //   ...this.filtermodel,
    //   ...val,
    //   where: {
    //     isExpired: this.selectedActiveStatuses == '1' ? false : true,
    //     userId: '',
    //     schemeIds: this.selectedSchemes,
    //     districtIds: this.selectedDistricts,
    //     cardstatusId: this.selectedCardStatus,
    //     statusIds: this.selectedStatuses,
    //     year: this.selecteddatefilter,
    //     isBulkApprovalGet: false,
    //   },
    // };

    this.filtermodel = {
      skip: this.memberfilter.skip,
      take: this.memberfilter.take,
      searchString: val.searchString ?? null,
      columnSearch: val.columnSearch ?? null,
      sorting: val.sorting ?? {
        fieldName: 'applicationNumber',
        sort: 'DESC',
      },
      where: {
        isExpired: this.selectedActiveStatuses === '1' ? false : true,
        userId: '',
        schemeIds: this.selectedSchemes,
        districtIds: this.selectedDistricts,
        cardstatusId: this.selectedCardStatus,
        statusIds: this.selectedStatuses,
        year: this.selecteddatefilter,
        isBulkApprovalGet: false,
      },
    };

    this.getApplications();
    this.saveApplicationFilterState();
  }

  onLocalBodyChange(selectedLocalBody: any) {
    // Set the localbody value
    var districtIds =
      this.selectedDistricts.length > 0 ? this.selectedDistricts[0] : undefined;

    this.localbodyValue = selectedLocalBody;

    // Clear all dependent dropdowns
    this.selected_Block = [];
    this.selected_VillagePanchayat = [];
    this.selected_Corporation = [];
    this.selected_Municipality = [];
    this.selected_TownPanchayat = [];
    this.selected_zone = [];

    if (this.localbodyValue && this.localbodyValue == 'URBAN') {
      this.selected_Block = [];
      this.selected_VillagePanchayat = [];
      this.isUrban = true;
    } else if (
      this.localbodyValue &&
      this.localbodyValue == 'RURAL' &&
      districtIds &&
      districtIds != ''
    ) {
      this.selected_Corporation = [];
      this.selected_TownPanchayat = [];
      this.selected_Municipality = [];
      this.selected_zone = [];
      this.localBody = [];

      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: districtIds,
          CategoryCode: 'BLOCK',
        })
        .subscribe((x) => {
          this.selected_Block = x.data;
        });
      this.isUrban = false;
    }
  }

  onBlockChange(selectedBlock: any) {
    if (selectedBlock && selectedBlock.length > 0) {
      // If value exists, call API
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: selectedBlock,
          CategoryCode: 'VILLAGEPANCHAYAT',
        })
        .subscribe((res: any) => {
          this.selected_VillagePanchayat = res?.data || [];
        });
    } else {
      // If no value, clear it
      this.selected_VillagePanchayat = [];
    }
  }

  onNameOfLocalBodyChange(selectedName: string) {
    var districtIds =
      this.selectedDistricts.length > 0 ? this.selectedDistricts[0] : undefined;

    this.nameoflocalbodyValue = selectedName;

    // Clear all dependent dropdowns first
    this.selected_Corporation = [];
    this.selected_Municipality = [];
    this.selected_TownPanchayat = [];
    this.selected_zone = [];
    const nameList = Array.isArray(selectedName)
      ? selectedName
      : [selectedName];
    if (
      nameList.includes('MUNICIPALITY') &&
      this.selectedDistricts?.length > 0
    ) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: districtIds,
          CategoryCode: 'MUNICIPALITY',
        })
        .subscribe((res: any) => {
          this.selected_Municipality = res?.data || [];
        });
    } else if (
      nameList.includes('CORPORATION') &&
      this.selectedDistricts?.length > 0
    ) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: districtIds,
          CategoryCode: 'CORPORATION',
        })
        .subscribe((res: any) => {
          this.selected_Corporation = res?.data || [];
        });
    } else if (
      nameList.includes('TOWNPANCHAYAT') &&
      this.selectedDistricts?.length > 0
    ) {
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          parentConfigId: districtIds,
          CategoryCode: 'TOWNPANCHAYAT',
        })
        .subscribe((res: any) => {
          this.selected_TownPanchayat = res?.data || [];
        });
    } else if (
      nameList.includes('GCC') ||
      (nameList.includes('CMWS') && this.selectedDistricts?.length > 0)
    ) {
      // GCC/CMWS
      this.generalService
        .getConfigurationDetailsInSelectListbyId({
          CategoryCode: 'ZONE',
        })
        .subscribe((res: any) => {
          this.selected_zone = res?.data || [];
        });
      this.nameoflocalbodyValue = 'GCC/CMWS';
    } else {
    }
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

  getApplications() {
    if (!this.memberfilter || !this.memberfilter.where) {
      console.warn('memberfilter not ready, skipping API');
      return;
    }

    localStorage.setItem(
      'memberSelectedFilters',
      JSON.stringify(this.memberfilter),
    );

    const w = this.memberfilter.where;

    this.filtermodel = {
      skip: this.memberfilter.skip ?? 0,
      take: this.memberfilter.take ?? 10,
      searchString: this.memberfilter.searchString ?? null,
      columnSearch: this.memberfilter.columnSearch ?? null,
      sorting: this.memberfilter.sorting ?? {
        fieldName: 'applicationNumber',
        sort: 'DESC',
      },
      where: {
        userId: '',
        schemeIds: this.selectedSchemes ?? [],
        districtIds: w.districtIds ?? [],
        cardstatusId: w.cardstatusId ?? [],
        statusIds: this.selectedStatuses ?? [],
        isExpired: this.selectedActiveStatuses === '1' ? false : true,
        year: w.year || this.selecteddatefilter,
        isBulkApprovalGet: false,
      },
    };

    // Function for processing returned status - Elanjsuriyan S
    if (
      this.mainValue === 'SCHEME' &&
      this.filtermodel?.where?.statusIds?.length
    ) {
      this.filtermodel.where.statusIds = this.normalizeSchemeStatusIds(
        this.filtermodel.where.statusIds,
      );
    }
    // updated code to save filter state - Elanjsuriyan S
    this.saveMemberFilters();
    this.saveApplicationFilterState();

    localStorage.setItem('memberFilter', JSON.stringify(this.filtermodel));
    this.schemeService
      .User_Application_GetList(this.filtermodel)
      .subscribe((c) => {
        this.configurationList = c.data;
        this.total = c.totalRecordCount;
      });
  }

  // Function for identifying Returned status - Elanjsuriyan S
  normalizeSchemeStatusIds(statusIds: string[] = []): string[] {
    if (!statusIds.length || !this.statuses?.length) {
      return statusIds;
    }

    return statusIds.map((id) => {
      const statusObj = this.statuses.find((s) => s.value === id);

      if (!statusObj?.text) return id;

      // If status text starts with "Returned"
      if (statusObj.text.trim().toUpperCase().startsWith('RETURNED')) {
        return 'RETURNED';
      }

      // Otherwise pass original id
      return id;
    });
  }

  // reset() {
  //   this.generalService
  //     .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
  //     .subscribe((x) => {
  //       this.statuses = x.data;
  //     });
  //   this.selectedSchemes = [];
  //   this.selectedCardStatus = [];
  //   this.selectedDistricts = [];
  //   this.selectedStatuses = [];
  //   this.selectedActiveStatuses = '1';
  //   this.generate();
  //   localStorage.removeItem('memberFilter');
  // }

  reset() {
    /*  CLEAR FILTER VARIABLES */

    this.selecteddatefilter = this.datefilter[this.datefilter.length - 1].value;
    this.selectedActiveStatuses = '1';

    this.selectedSchemes = [];
    this.selectedCardStatus = [];
    this.selectedDistricts = [];
    this.selectedStatuses = [];
    this.selectedApplication_Status = []; // <-- REQUIRED
    this.selectedApplication_Status = [...this.selectedApplication_Status]; // <-- forces UI refresh

    this.selectedtypeOfWork = [];
    this.selectedorganizationType = [];
    this.selectedChanged_Detail_Records = [];

    this.selectedLocalBody = [];
    this.selectedNameOfLocalBody = [];
    this.selectedZone = [];
    this.selectedBlock = [];
    this.selectedVillagePanchayat = [];
    this.selectedMunicipality = [];
    this.selectedCorporation = [];
    this.selectedTownPanchayat = [];

    this.selectedCollectedByPhone = [];
    this.Collected_FromDate = null;
    this.Collected_ToDate = null;

    /* RESET filtermodel */
    this.filtermodel = {
      skip: 0,
      take: 10,
      searchString: null,
      columnSearch: null,
      sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
      where: {
        districtIds: [],
        cardstatusId: [],
        schemeIds: [],
        statusIds: [],
        isExpired: false,
        year: this.selecteddatefilter,
        userId: '',
        isBulkApprovalGet: false,
      },
    };

    /* RESET memberfilter */
    this.memberfilter = {
      skip: 0,
      take: 10,
      searchString: null,
      columnSearch: null,
      sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
      where: {
        districtIds: [],
        cardstatusId: [],
        year: this.selecteddatefilter,
        isActive: true,
        type_of_Work: null,
        type_of_Works: [],
        core_Sanitary_Worker_Type: null,
        organization_Type: null,
        organization_Types: [],
        nature_of_Job: null,
        local_Body: null,
        local_Bodys: [],
        name_of_Local_Body: null,
        name_of_Local_Bodys: [],
        zone: null,
        block: null,
        village_Panchayat: null,
        corporation: null,
        municipality: null,
        town_Panchayat: null,
        district_Id: null,
        isApprovalPending: false,
        collectedByPhoneNumber: '',
        collectedByName: '',
        fromDate: null,
        toDate: null,
      },
    };

    /* CLEAR SAVED STATE */
    localStorage.removeItem('memberFilter');

    localStorage.removeItem('SelectedMemberFilters');
    localStorage.removeItem('APPLICATION_FILTER_STATE');
    /*  UPDATE UI */
    this.cdr.detectChanges();

    /*  RELOAD TABLE */
    this.getApplications();
  }

  generate() {
    this.showdata = true;
    this.filtermodel = {
      ...this.filtermodel,
      where: {
        districtIds: this.selectedDistricts,
        // cardstatusId:this.selectedCardStatus,
        schemeIds: this.selectedSchemes,
        statusIds: this.selectedStatuses,
        isExpired: this.selectedActiveStatuses == '1' ? false : true,
        year: this.selecteddatefilter,
        userId: '',
        isBulkApprovalGet: false,
      },
    };

    this.memberfilter = {
      ...this.filtermodel,
      skip: 0,
      take: 10,
      searchString: null,
      columnSearch: null,
      sorting: { fieldName: 'applicationNumber', sort: 'DESC' },
      where: {
        districtIds: this.selectedDistricts,
        cardstatusId: this.selectedCardStatus,
        year: this.selecteddatefilter,
        isActive: true,
        type_of_Work: null,
        type_of_Works: this.selectedtypeOfWork,
        core_Sanitary_Worker_Type: null,
        organization_Type: null,
        organization_Types: this.selectedorganizationType,
        nature_of_Job: null,
        local_Body: null,
        local_Bodys: this.selectedlocalBody,
        Changed_Detail_Records: this.selectedChanged_Detail_Records,
        name_of_Local_Body: null,
        name_of_Local_Bodys: this.selectedlocalBody,
        zone: null,
        block: null,
        village_Panchayat: null,
        corporation: null,
        municipality: null,
        town_Panchayat: null,
        district_Id: null,
        isApprovalPending: false,
        collectedByPhoneNumber: '',
        collectedByName: '',
        fromDate: null,
        toDate: null,
        Collected_FromDate: this.Collected_FromDate,
        Collected_ToDate: this.Collected_ToDate,
        Application_Status: this.selectedApplication_Status,
        Approval_application_Status: this.approvalQuaryParams,
      },
    };

    // Save current filters to localStorage
    localStorage.setItem(
      'memberFilter',
      JSON.stringify({
        selectedDistricts: this.selectedDistricts,
        selectedCardStatus: this.selectedCardStatus,
        selectedSchemes: this.selectedSchemes,
        selectedStatuses: this.selectedStatuses,
        selectedActiveStatuses: this.selectedActiveStatuses,
        selecteddatefilter: this.selecteddatefilter,
        selectedtypeOfWork: this.selectedtypeOfWork,
        selectedChanged_Detail_Records: this.selectedChanged_Detail_Records,
        selectedorganizationType: this.selectedorganizationType,
        selectedLocalBody: this.selectedLocalBody,
        selectedNameOfLocalBody: this.selectedNameOfLocalBody,
        selectedZone: this.selectedZone,
        selectedBlock: this.selectedBlock,
        selectedVillagePanchayat: this.selectedVillagePanchayat,
        selectedCorporation: this.selectedCorporation,
        selectedMunicipality: this.selectedMunicipality,
        selectedTownPanchayat: this.selectedTownPanchayat,
        selectedCollectedByPhone: this.selectedCollectedByPhone,
        Collected_FromDate: this.Collected_FromDate,
        Collected_ToDate: this.Collected_ToDate,
      }),
    );

    // updated code to save filter state - Elanjsuriyan S
    this.saveMemberFilters();
    this.saveApplicationFilterState();

    console.log();
    this.showdata = true;
    this.getApplications();
  }

  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'view',
      val.record.applicationId,
    ]);
  }

  toSingleValue(val: any): any {
    if (Array.isArray(val)) {
      if (val.length === 0) return null;
      if (val.length === 1) return val[0];
      return val.join(','); // combine if multiple selected
    }
    return val ?? null;
  }

  actioInvoked(val: ActionModel) {
    if (val && val.type == 'VIEW') {
      this.router.navigate([
        'officers',
        'applications',
        'view',
        val.record.applicationId,
      ]);
    } else if (val && val.type == 'EDIT') {
      this.router.navigate([
        'officers',
        'applications',
        'edit',
        val.record.applicationId,
        '0',
      ]);
    } else if (val && val.type == 'APPROVE') {
      this.router.navigate([
        'officers',
        'applications',
        'approve',
        val.record.applicationId,
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
}
