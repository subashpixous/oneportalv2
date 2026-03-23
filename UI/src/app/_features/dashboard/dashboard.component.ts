import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ApplicationCountCard,
  ApplicationCountMap,
  ApplicationCountModel,
  DashboardApplicationCountModel,
} from 'src/app/_models/DashboardModel';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { NavigationModel } from 'src/app/_models/filterRequest';
import { ApplicationMainGridModel } from 'src/app/_models/schemeModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { MapMarkerModel } from 'src/app/_models/utils';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { UserService } from 'src/app/services/user.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ConfigSchemeGroupModel } from 'src/app/_models/schemeConfigModel';
import { DASHBOARD_DUMMY } from './dashboard.dummy';
import { AccountService } from 'src/app/services/account.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  schemes: TCModel[] = [];
  selectedSchemes: string = '';
  selectedbtn: string = 'DISTRICT';

  dashboardApplicationCountModel!: DashboardApplicationCountModel;
  countcards!: ApplicationCountCard[];
  countmaps!: ApplicationCountMap[];
  configurationList!: ConfigSchemeGroupModel[];
  applicationCountModel!: ApplicationCountModel[];
  markerPositions!: MapMarkerModel[];
  counts: DashboardApplicationCountModel[] = [];
  title: string = 'Dashboard';
  curentyr = new Date().getFullYear();
  curentmn = new Date().getMonth();
  options: any[] = [
    {
      name: 'Current year',
      value: `${this.curentmn < 3 ? this.curentyr - 1 : this.curentyr}-${
        this.curentmn < 3 ? this.curentyr : this.curentyr + 1
      }`,
    },
    {
      name: 'Last year',
      value: `${this.curentmn < 3 ? this.curentyr - 2 : this.curentyr - 1}-${
        this.curentmn < 3 ? this.curentyr - 1 : this.curentyr
      }`,
    },
    {
      name: 'Last 5 year',
      value: `${this.curentmn < 3 ? this.curentyr - 5 : this.curentyr - 4}-${
        this.curentmn < 3 ? this.curentyr : this.curentyr + 1
      }`,
    },
  ];
  mainOptions: any[] = [
    {
      name: 'Scheme',
      value: 'SCHEME',
    },
    {
      name: 'Member',
      value: 'MEMBER',
    },
  ];
  value: string = `${this.curentmn < 3 ? this.curentyr - 1 : this.curentyr}-${
    this.curentmn < 3 ? this.curentyr : this.curentyr + 1
  }`;
  mainValue: string = 'MEMBER';
  isMimimized: boolean = true;
  navigationModel!: NavigationModel;

  items: memberDetailCount[] = [];
  selectedSchemeGroup: string = '';
  showWorkCategoryMenu: boolean = false;
  showDaysMenu: boolean = false;
  selectedWorkCategory: string = 'Work category';
  selectedDays: string = '7 Days';
  selectedStatusTab: string = 'Pending Approval';
  userRole: string = '';
currentBarData: any[] = [ ];

currentDonutData: any = { total: 0, male: 0, female: 0, malePercent: 0, genders: [] };
  // Data from your Figma screenshot
  workCategories: string[] = [
    'Core sanitary worker',
    'Cleanliness workers',
    'Health workers',
    'Mayanam workers',
    'Rag pickers'
  ];

  delayDays: string[] = [
    'Last 15 Days',
    'Last 30 Days',
    'Last 7 Days'
  ];
chartDataMap: any = {
    'Pending Approval': {
      bars: [
        { district: 'Chennai', count: 150, width: '100%', financeValue: '1,00,000' },
        { district: 'Madurai', count: 120, width: '80%', financeValue: '90,000' },
        { district: 'Sivagangai', count: 100, width: '60%', financeValue: '85,000' },
        { district: 'Viruthunagar', count: 90, width: '50%', financeValue: '55,000' },
        { district: 'Coimbatore', count: 85, width: '40%', financeValue: '45,000' }
      ],
      donut: { total: 3000, male: 2500, female: 500, malePercent: 83 }
    },
    'Approved By HQ': {
      bars: [
        { district: 'Chennai', count: 1601, width: '80%', financeValue: '3,50,000' },
        { district: 'Madurai', count: 2095, width: '100%', financeValue: '4,20,000' },
        { district: 'Sivagangai', count: 1555, width: '75%', financeValue: '2,90,000' },
        { district: 'Viruthunagar', count: 475, width: '25%', financeValue: '1,10,000' },
        { district: 'Coimbatore', count: 613, width: '30%', financeValue: '1,45,000' }
      ],
      donut: { total: 2500, male: 1745, female: 1324, malePercent: 60 }
    }
  };
  isFinanceData: boolean = false;
  memberApplicationCount:number = 0;
schemeApplicationCount:number = 0;

pendingApproval:number = 0;
approvedByHQ:number = 0;
cardPrinted:number = 0;

pendingApprovalData: any;
approvedData: any;
pendingApprovalTotal: number = 0;
approvedTotal: number = 0;

approvalDelay:number = 0;
cardDelay:number = 0;
/* SCHEME COUNTS */

eligibleApplicantCount:number = 0;
appliedApplicantCount:number = 0;
pendingApprovalCount:number = 0;
memberAppliedCount:number = 0;
beneficiaryAppliedCount:number = 0;
approvedApplicantsCount:number = 0;
districtsList: string[] = ['All'];
  selectedDistrict: string = 'All';
  showDistrictMenu: boolean = false;

/* SCHEME AMOUNTS */

eligibleApplicantAmount:number = 0;
appliedApplicantAmount:number = 0;
pendingApprovalAmount:number = 0;
memberAppliedAmount:number = 0;
beneficiaryAppliedAmount:number = 0;
approvedApplicantsAmount:number = 0;

amountDisbursed:number = 0;
amountSanctioned:number = 0;

selectedSort: string = 'Most';
/* CHART DATA */

schemeDistrictChart:any[] = [];
schemeTypeChart:any[] = [];

amountDistrictChart:any[] = [];
amountSchemeChart:any[] = [];
fullDashboardData: any = null;
currentSchemeTotal: number = 0;
  // items: memberDetailCount[] = [
  //   {
  //     count: 10,
  //     value: 'Approved for Print',
  //     key: 'Print',
  //     forwardIcon: 'pi pi-print',
  //     backwardIcon: 'pi pi-chevron-down',
  //     items: [
  //       {
  //         count: 10,
  //         value: 'Approved for Print',
  //         key: 'Print',
  //         forwardIcon: 'pi pi-print',
  //         backwardIcon: 'pi pi-chevron-down',
  //       },
  //       {
  //         count: 10,
  //         value: 'Approved for Print',
  //         key: 'Print',
  //         forwardIcon: 'pi pi-print',
  //         backwardIcon: 'pi pi-chevron-down',
  //       },
  //       {
  //         count: 10,
  //         value: 'Approved for Print',
  //         key: 'Print',
  //         forwardIcon: 'pi pi-print',
  //         backwardIcon: 'pi pi-chevron-down',
  //       },
  //       {
  //         count: 10,
  //         value: 'Approved for Print',
  //         key: 'Print',
  //         forwardIcon: 'pi pi-print',
  //         backwardIcon: 'pi pi-chevron-down',
  //       },
  //     ],
  //   },
  // ];
  applicationSubmittedCount: number = 0;
  approvedCardColors: string[] = [
  'linear-gradient(135deg, #2ecc71, #27ae60)', // Green
  'linear-gradient(135deg, #e67e22, #d35400)', // Orange
  'linear-gradient(135deg, #9b59b6, #8e44ad)', // Purple
  'linear-gradient(135deg, #e74c3c, #c0392b)', // Red
  'linear-gradient(135deg, #1abc9c, #16a085)'  // Teal
];
  constructor(
    private router: Router,
    private userService: UserService,
    private generalService: GeneralService,
    private schemeConfigService: SchemeConfigService,
    private accountService: AccountService
  ) {}
  ngOnInit() {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'SCHEME' })
      .subscribe((x) => {
        this.schemes = x.data;
        this.selectedSchemes = x.data[0].value;
              this.getDashboardData();

        // this.getDashboard(this.selectedSchemes);
      });
      const currentUser = this.accountService.userValue;
    if (currentUser && currentUser.userDetails) {
      this.userRole = currentUser.userDetails.roleName;
    }
    //       this.schemeConfigService.Config_Scheme_Group_Get(true).subscribe((x) => {
    //   if (x) {
    //     this.configurationList = x.data;
    //   }
    // });
  }

  getDashboardData() {
  const filter = {
    year: this.value,
    isDistrictWise: this.selectedbtn === 'DISTRICT',
    isSchemeWise: this.selectedbtn === 'SCHEME',
    isDueDateWise: this.selectedbtn === 'DUEDATE',
    schemeId: this.selectedSchemes
  };

  this.userService.Dashboard_GetCount(filter).subscribe({
    next: (res: any) => {
      if (res && res.data) {
        const data = res.data;

        this.mapDashboardData(data);
        this.mapSchemeDashboardData(data);
        this.mapSchemeAmountDashboard(data);
      }
    },
    error: (err) => {
      console.error('Dashboard API Error:', err);
    }
  });
}

mapDashboardData(res: any) {

    /* MEMBER APPLICATION COUNT */
    // Ensure you use lowercase 'status' and 'count' to match the API response
/* 1. APPLICATION SUBMITTED COUNT FIX */
    if (res && res.member_application_count) {
        const waitingItem = res.member_application_count.find((x: any) => x.status === 'WAITING_FOR_APPROVAL');
        this.applicationSubmittedCount = waitingItem ? waitingItem.count : 0;
        
        // Debugging: Browser console-la 11281 varudha nu check panna
        console.log("Actual Waiting Count from API:", this.applicationSubmittedCount);
    } else {
        this.applicationSubmittedCount = 0;
    }

    /* 2. MEMBER APPLICATION COUNT */
    const saved = res.member_application_count?.find((x: any) => x.status === 'SAVED')?.count || 0;
    this.memberApplicationCount = saved + this.applicationSubmittedCount;


    /* SCHEME APPLICATION COUNT */
    // Double-check your scheme counts to ensure they match the API keys exactly too
    const schemeSaved =
      res.scheme_application_count.find((x: any) => x.statusCode === 'SAVED')?.count || 0;

    const schemeSubmitted =
      res.scheme_application_count.find((x: any) => x.statusCode === 'SUBMITTED')?.count || 0;

    this.schemeApplicationCount = schemeSaved + schemeSubmitted;


/* MEMBER DASHBOARD */
const memberData = res.member_dashboard_data;

// API-la irundhu vara object-a (labels & values) store pandrom
this.pendingApprovalData = memberData.pending_approval;
this.approvedData = memberData.approved;

// Multiple labels irundha total calculate panna:
this.pendingApprovalTotal = this.pendingApprovalData?.values?.reduce((a: number, b: number) => a + b, 0) || memberData.pending_approval_count || 0;
this.approvedTotal = this.approvedData?.values?.reduce((a: number, b: number) => a + b, 0) || memberData.approved_by_hq_count || 0;

// Unga pazhaya variables-kum indha total-a assign panniduvom (so that nothing breaks)
this.pendingApproval = this.pendingApprovalTotal;
this.approvedByHQ = this.approvedTotal;
this.cardPrinted = memberData.card_printed;

this.approvalDelay = memberData.approval_delay;
this.cardDelay = memberData.card_delay;


// Get the arrays from the API response
    const districtData = res.member_dashboard_data.charts.districtwise_count; 
    const genderData = res.member_dashboard_data.charts.member_by_gender;

    // Populate the dropdown list (skip the "TOTAL" row)
    if (districtData && districtData.pending_approval_count) {
      this.districtsList = ['All', ...districtData.pending_approval_count
        .filter((d: any) => d.district !== 'TOTAL')
        .map((d: any) => d.district)];
    }

    // Build the data map for all tabs
    this.chartDataMap = {
      'Pending Approval': this.extractChartData(districtData?.pending_approval_count, genderData?.pending_approval_count, 'pending_approval_count'),
      'Approved By HQ': this.extractChartData(districtData?.approved_by_hq_count, genderData?.approved_by_hq_count, 'approved_by_hq_count'),
      'Card printed': this.extractChartData(districtData?.card_printed, genderData?.card_printed, 'card_printed'),
      'Approval delay': this.extractChartData(districtData?.approval_delay, genderData?.approval_delay, 'approval_delay'),
      'Card delay': this.extractChartData(districtData?.card_delay, genderData?.card_delay, 'card_delay')
    };

    // Trigger the initial chart load
    this.selectStatusTab(this.selectedStatusTab);
  }
// 1. Formats the JSON arrays into chart data
extractChartData(distArray: any[], genderArray: any[], countKey: string) {
  if (!distArray || !genderArray) return { allBars: [], donut: { total: 0, male: 0, female: 0, malePercent: 0, genders: [] } };

  // Parse District Bars
  const allBars = distArray
    .filter((d: any) => d.district !== 'TOTAL')
    .map((d: any) => ({
      district: d.district,
      count: d[countKey] || 0,
      width: '0%' 
    }));

  const max = Math.max(...allBars.map(b => b.count), 1);
  allBars.forEach(b => {
    b.width = ((b.count / max) * 100) + '%'; 
  });

  // Parse Gender Data
  const totalObj = genderArray.find((g: any) => g.gender === 'TOTAL');
  const maleObj = genderArray.find((g: any) => g.gender === 'Male');
  const femaleObj = genderArray.find((g: any) => g.gender === 'Female');

  const total = totalObj ? totalObj[countKey] : 0;
  const male = maleObj ? maleObj[countKey] : 0;
  const female = femaleObj ? femaleObj[countKey] : 0;

  // Create an array for the genders so we can sort them in the UI
  const genderList = genderArray
    .filter((g: any) => g.gender !== 'TOTAL')
    .map((g: any) => ({
      label: g.gender,
      count: g[countKey] || 0,
      colorClass: g.gender === 'Male' ? 'light-blue-bg' : 
                  g.gender === 'Female' ? 'dark-purple-bg' : 'fallback' // Gray color for Others/Transgender
    }));

  return {
    allBars: allBars,
    donut: {
      total: total,
      male: male, // Kept for the CSS getDonutGradient() calculation
      female: female,
      malePercent: total > 0 ? Math.round((male / total) * 100) : 0,
      genders: genderList // <-- Our new array for the HTML
    }
  };
}

  // 2. Triggered when dropdown is clicked
  onDistrictChange(district: string) {
    this.selectedDistrict = district;
    this.showDistrictMenu = false;
    this.applyDistrictFilter(); // Update the chart
  }

  // 3. Filters the data based on selection
applyDistrictFilter() {
  const currentData = this.chartDataMap[this.selectedStatusTab];
  if (!currentData || !currentData.allBars) return;

  // --- 1. SORT DISTRICTS ---
  let processedBars = [...currentData.allBars];

  if (this.selectedSort === 'Most') {
    processedBars.sort((a, b) => b.count - a.count); // Highest to Lowest
  } else if (this.selectedSort === 'Least') {
    processedBars.sort((a, b) => a.count - b.count); // Lowest to Highest
  }

if (this.selectedDistrict === 'All') {
    this.currentBarData = processedBars; // <-- Now it passes ALL items
  } else {
    this.currentBarData = processedBars.filter((b: any) => b.district === this.selectedDistrict);
  }

  // --- 2. SORT GENDERS ---
  if (currentData.donut && currentData.donut.genders) {
    let processedGenders = [...currentData.donut.genders];
    
    if (this.selectedSort === 'Most') {
      processedGenders.sort((a, b) => b.count - a.count); // Highest to Lowest
    } else if (this.selectedSort === 'Least') {
      processedGenders.sort((a, b) => a.count - b.count); // Lowest to Highest
    }
    
    // Merge the sorted genders back into currentDonutData so the UI updates
    this.currentDonutData = {
      ...this.currentDonutData,
      genders: processedGenders
    };
  }
}

mapSchemeDashboardData(res: any) {
  // Use res directly if it's the root, or map from scheme_dashboard_data if nested
  const scheme = res.scheme_dashboard_data || res;
  if (!scheme) return;

  // 1. Store the full raw data so we can reuse it when clicking cards
  this.fullDashboardData = scheme;

  /* 2. SCHEME DASHBOARD COUNTS (Card Values) */
  this.eligibleApplicantCount = scheme.eligible_applicant_count || 0;

  const appCounts = scheme.scheme_application_count || {};
  this.appliedApplicantCount = 
    (appCounts['SUBMITTED'] || 0) + 
    (appCounts['DM-REVD'] || 0) + 
    (appCounts['DC-REVD'] || 0) + 
    (appCounts['HQ-APPRD'] || 0) + 
    (appCounts['COMPLETED'] || 0);

  this.pendingApprovalCount = 
    (appCounts['SUBMITTED'] || 0) + 
    (appCounts['DM-REVD'] || 0) + 
    (appCounts['DC-REVD'] || 0) + 
    (appCounts['HQ-APPRD'] || 0);

  this.approvedApplicantsCount = appCounts['COMPLETED'] || 0;

  if (scheme.member_applied_count && scheme.member_applied_count.values) {
    this.memberAppliedCount = scheme.member_applied_count.values.reduce((a: number, b: number) => a + b, 0);
  } else {
    this.memberAppliedCount = 0;
  }

  if (scheme.benificary_applied_count && scheme.benificary_applied_count.values) {
    this.beneficiaryAppliedCount = scheme.benificary_applied_count.values.reduce((a: number, b: number) => a + b, 0);
  } else {
    this.beneficiaryAppliedCount = 0;
  }

  // 3. Trigger initial chart render based on the default selected tab
  this.updateCharts(this.selectedStatusTab);
}


mapSchemeAmountDashboard(res:any){

const amount = res.scheme_dashboard_amount_data;


/* AMOUNT COUNTS */

this.eligibleApplicantAmount = amount.eligible_applicant_amount;
this.appliedApplicantAmount = amount.applied_applicant_amount;
this.pendingApprovalAmount = amount.pending_approval_amount;
this.memberAppliedAmount = amount.member_applied_amount;
this.beneficiaryAppliedAmount = amount.benificary_applied_amount;
this.approvedApplicantsAmount = amount.approved_applicants_amount;

this.amountDisbursed = amount.amount_disbursed;
this.amountSanctioned = amount.amount_sanctioned;


/* AMOUNT DISTRICT CHART */

const districtAmountChart =
amount.charts.districtwise_count.eligible_applicant_amount;

const districts = districtAmountChart[0];
const values = districtAmountChart[1];

this.amountDistrictChart = districts.map((d:any,i:number)=>{

return{
label:d,
value:values[i]
}

});


/* AMOUNT BY SCHEME */

const schemeAmountChart =
amount.charts.amount_by_schemes.eligible_applicant_amount;

const schemes = schemeAmountChart[0];
const schemeValues = schemeAmountChart[1];

this.amountSchemeChart = schemes.map((s:any,i:number)=>{

return{
label:s,
value:schemeValues[i]
}

});

}

  onSchemeGroupChange(groupId: string) {
  this.selectedSchemeGroup = groupId;
  console.log("Selected Group ID:", groupId);
}
  expand(statusId: string) {
  this.navigationModel = {
    ...this.navigationModel,
    statusId: statusId,
    schemeId: this.selectedSchemes,   // already selected
  };

  this.router.navigate(['officers', 'applications'], {
    state: { data: this.navigationModel },
  });
  this.selectStatusTab('Pending Approval');
}

  createmeeting(val: string) {
    this.router.navigate(['officers', 'user-create', val, 'EDIT']);
  }
  // getDashboard(selectedSchemes: any) {
  //   this.userService
  //     .Application_GetCount({
  //       year: this.value,
  //       isDistrictWise: this.selectedbtn == 'DISTRICT',
  //       isSchemeWise: this.selectedbtn == 'SCHEME',
  //       isDueDateWise: this.selectedbtn == 'DUEDATE',
  //       schemeId: selectedSchemes,
  //     })
  //     .subscribe((x) => {
  //       this.dashboardApplicationCountModel = x.data;
  //       this.countcards = this.dashboardApplicationCountModel.cardCount;
  //       this.countmaps = this.dashboardApplicationCountModel.mapCount;
  //       this.applicationCountModel =
  //         this.dashboardApplicationCountModel.statusCount;
  //       this.markerPositions = this.countmaps.map(
  //         (x) =>
  //           <MapMarkerModel>{
  //             lat: x.latitude,
  //             lng: x.longitude,
  //             label: x.count.toString(),
  //             content: `${x.districtName.toString()} - ${x.count.toString()}`,
  //           }
  //       );
  //     });
  //   this.userService
  //     .Member_GetCount({
  //       year: this.value,
  //       isDistrictWise: this.selectedbtn == 'DISTRICT',
  //       isSchemeWise: this.selectedbtn == 'SCHEME',
  //       isDueDateWise: this.selectedbtn == 'DUEDATE',
  //       schemeId: selectedSchemes,
  //     })
  //     .subscribe((x) => {
  //       this.items = [x.data];
  //     });
  // }
  generate() {
  // this.getDashboardData();
  }
generatePDF() {
  const dashboardElement = document.getElementById('print-section');
  if (!dashboardElement) {
    return;
  }

  // Wait for UI to settle (avoid blank captures)
  setTimeout(() => {
    html2canvas(dashboardElement, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const title = 'Tamil Nadu Cleanliness Workers Welfare Board - Member Dashboard';
      const textWidth = pdf.getTextWidth(title);
      const centerX = (pageWidth - textWidth) / 2;
      pdf.text(title, centerX, 15);

      // Calculate image size
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const topMargin = 20;

      // Add image
      pdf.addImage(imgData, 'PNG', 0, topMargin, pdfWidth, imgHeight);

      // Save or print
      const blobUrl = URL.createObjectURL(pdf.output('blob'));
window.open(blobUrl, '_blank');

      // Or open in new tab:
      // window.open(URL.createObjectURL(pdf.output('blob')));
    }).catch(err => console.error('PDF generation error:', err));
  }, 500);
}

  generateMainFilter() {}
schemeChanged(event: any) {
  this.selectedSchemes = event;
  this.getDashboardData();
}
  getclassbasedonIndex(i: number) {
    var res = i % 4;
    return res == 0
      ? 'count1s'
      : res == 1
      ? 'count2s'
      : res == 2
      ? 'count3s'
      : res == 3
      ? 'count4s'
      : 'count1s';
  }
  print() {}

  getmbookStyleClass() {
    if (this.isMimimized) {
      return 'lg:col-7 md:col-7';
    } else {
      return 'lg:col-12 md:col-12';
    }
  }
  togglembookStable() {
    if (this.isMimimized) {
      this.isMimimized = false;
    } else {
      this.isMimimized = true;
    }
  }
  getStyleClass() {
    if (this.isMimimized) {
      return 'lg:col-5 md:col-5';
    } else {
      return 'lg:col-5 md:col-5 d-none';
    }
  }
  getbtnclass(type: string) {
    if (this.selectedbtn == 'DISTRICT' && this.selectedbtn == type) {
      return 'p-button-secondary p-highlight smallpaddforbtn';
    } else if (this.selectedbtn == 'SCHEME' && this.selectedbtn == type) {
      return 'p-button-secondary p-highlight smallpaddforbtn';
    } else if (this.selectedbtn == 'DUEDATE' && this.selectedbtn == type) {
      return 'p-button-secondary p-highlight smallpaddforbtn';
    } else {
      return 'p-button-secondary smallpaddforbtn';
    }
  }
  setSelected(type: string) {
    this.selectedbtn = type;
    this.generate();
  }
  navigate() {
    this.navigationModel = {
      ...this.navigationModel,
      districtId: null,
      schemeId: this.selectedSchemes,
    };
    this.router.navigate(['officers', 'applications'], {
      state: { data: this.navigationModel },
    });
  }
  prependZero(number: number) {
    // if (number < 9) return '0' + number;
    // else return number;

    return number;
  }
  navigateToApplications(obj: ApplicationCountCard) {
    if ((obj.type == 'DISTRICT' || obj.type == 'SCHEME') && obj.count > 0) {
      this.navigationModel = {
        ...this.navigationModel,
        districtId: obj.type == 'DISTRICT' ? obj.typeId : null,
        schemeId: obj.type == 'SCHEME' ? obj.typeId : null,
      };
      this.router.navigate(['officers', 'applications'], {
        state: { data: this.navigationModel },
      });
    }
  }
export() {
  const dashboardElement = document.getElementById('print-section');
  if (!dashboardElement) {
    return;
  }

  setTimeout(() => {
    html2canvas(dashboardElement, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Optional title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const title = 'Member Dashboard - Tamil Nadu Cleanliness Workers Welfare Board';
      const textWidth = pdf.getTextWidth(title);
      const centerX = (pageWidth - textWidth) / 2;
      pdf.text(title, centerX, 15);

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const topMargin = 20;

      pdf.addImage(imgData, 'PNG', 0, topMargin, pdfWidth, imgHeight);

      // ✅ Download PDF
      pdf.save('MemberDashboard.pdf');
    }).catch(err => console.error('PDF generation error:', err));
  }, 300);
}

toggleWorkCategory() {
    this.showWorkCategoryMenu = !this.showWorkCategoryMenu;
    this.showDaysMenu = false; // Close the other menu if open
  }

  selectWorkCategory(cat: string) {
    this.selectedWorkCategory = cat;
    this.showWorkCategoryMenu = false;
    // You can call your API/filter function here later
  }

  toggleDaysMenu() {
    this.showDaysMenu = !this.showDaysMenu;
    this.showWorkCategoryMenu = false; 
  }

  selectDays(day: string) {
    this.selectedDays = day;
    this.showDaysMenu = false;

  }
toggleFinanceData() {
    this.isFinanceData = !this.isFinanceData;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.showWorkCategoryMenu = false;
    this.showDaysMenu = false;
    this.showDistrictMenu = false; // Added this line
  }
selectStatusTab(tabName: string) {
    this.selectedStatusTab = tabName;
    
    if (this.mainValue === 'SCHEME') {
        // Update Scheme Charts using the new dynamic functions
        this.updateCharts(tabName);
    } else {
        // Update Member Charts (Your existing logic)
        this.applyDistrictFilter(); 
        const data = this.chartDataMap[tabName];
        if (data && data.donut) {
            this.currentDonutData = data.donut; 
        }
    }
}

// Dynamically maps the selected tab to the correct API keys and updates the charts
updateCharts(tab: string) {
    if (!this.fullDashboardData || !this.fullDashboardData.charts) return;

    let keysToSum: string[] = [];

    // Map the selected tab to the exact keys in the JSON response
    switch(tab) {
        case 'Eligible applications':
            keysToSum = ['eligible_applicant_count'];
            break;
        case 'Applied applications':
            // Sums all applied states
            keysToSum = ['SAVED', 'SUBMITTED', 'DM-REVD', 'DC-REVD', 'HQ-APPRD', 'COMPLETED'];
            break;
        case 'Pending Approval':
            keysToSum = ['SUBMITTED', 'DM-REVD', 'DC-REVD', 'HQ-APPRD'];
            break;
        case 'Member Applied':
            keysToSum = ['member_applied_count'];
            break;
        case 'Beneficiary Applied':
            keysToSum = ['benificary_applied_count'];
            break;
        case 'Approved Applications':
            keysToSum = ['COMPLETED'];
            break;
        default:
            keysToSum = ['SUBMITTED'];
    }

    this.updateDistrictChart(keysToSum);
    this.updateSchemeTypeChart(keysToSum);
}

updateDistrictChart(keys: string[]) {
    const districtData = this.fullDashboardData.charts.districtwise_count;
    if (!districtData) return;

    let aggregatedData: { [key: string]: number } = {};
    
    // Sum up values for all required keys
    keys.forEach(key => {
        if (districtData[key] && districtData[key].labels) {
            districtData[key].labels.forEach((label: string, index: number) => {
                if (!aggregatedData[label]) aggregatedData[label] = 0;
                aggregatedData[label] += districtData[key].values[index];
            });
        }
    });

    const districts = Object.keys(aggregatedData);
    const values = Object.values(aggregatedData);

    this.districtsList = ['All', ...districts];

    // Map and Sort Data
    let mappedBars = districts.map((d: string, i: number) => ({
        district: d,
        count: values[i],
        width: '0%'
    }));

    mappedBars.sort((a: any, b: any) => b.count - a.count);

    // Calculate bar width percentage
    const maxCount = Math.max(...mappedBars.map((b: any) => b.count), 1);
    mappedBars.forEach((b: any) => {
        b.width = ((b.count / maxCount) * 100) + '%';
    });

    // Assign back to UI
    this.schemeDistrictChart = mappedBars;
    this.currentBarData = mappedBars; 
}

updateSchemeTypeChart(keys: string[]) {
    const typeData = this.fullDashboardData.charts.schemes_by_types;
    if (!typeData) return;

    let aggregatedData: { [key: string]: number } = {};
    let totalCount = 0; // Create a total counter
    
    // Sum up values for all required keys
    keys.forEach(key => {
        if (typeData[key] && typeData[key].labels) {
            typeData[key].labels.forEach((label: string, index: number) => {
                if (!aggregatedData[label]) aggregatedData[label] = 0;
                aggregatedData[label] += typeData[key].values[index];
                totalCount += typeData[key].values[index]; // Add to total
            });
        }
    });

    this.currentSchemeTotal = totalCount; // Update UI Total

    const schemes = Object.keys(aggregatedData);
    const schemeValues = Object.values(aggregatedData);

    // Assign back to UI Donut Chart
    this.schemeTypeChart = schemes.map((s: string, i: number) => ({
        label: s,
        value: schemeValues[i]
    }));

    // Optional: Sort highest to lowest so the biggest schemes show first
    this.schemeTypeChart.sort((a, b) => b.value - a.value);
}
  // Calculates the donut chart colors dynamically based on the male/female ratio
  getDonutGradient() {
    const p = this.currentDonutData.malePercent;
    return `conic-gradient(#5A99EB 0% ${p}%, transparent ${p}% ${p+2}%, #53527D ${p+2}% 98%, transparent 98% 100%)`;
  }
  // Maps API Scheme Labels to the Exact Figma Colors
getSchemeColor(label: string): string {
    const normalizedLabel = label.trim(); // Remove trailing spaces
    const colors: any = {
        'Education Assistance': '#9D65E0',
        'Marriage Assistance': '#E95959',
        'Maternity': '#F1C40F',
        'Purchase of spectacles': '#2ECC71',
        'Natural Death & Funeral Assistance': '#3498DB',
        'Accident Death & Funeral Assistance': '#D35400',
        'Old Age Pension (Over 60 years old)': '#95A5A6',
        'Livelihood Scheme(CM Arise)': '#1ABC9C', // Added fallback color
        'Ungaludan Stalin': '#E67E22'           // Added fallback color
    };
    return colors[normalizedLabel] || '#3B82F6'; // Default to blue if missing
}

// Maps API Scheme Labels to the Figma Text formatting (with <br>)
formatSchemeLabel(label: string): string {
    if(label.includes('Natural Death')) return 'Natural Death &<br>Funeral Assistance';
    if(label.includes('Accident Death')) return 'Accident Death &<br>Funeral Assistance';
    if(label.includes('Old Age Pension')) return 'Old Age Pension<br>(Over 60 years old)';
    if(label.includes('Education')) return 'Education<br>Assistance';
    if(label.includes('Marriage')) return 'Marriage<br>Assistance';
    if(label.includes('spectacles')) return 'Spectacles<br>Assistance';
    if(label.includes('Maternity')) return 'Maternity<br>Assistance';
    return label; 
}
}


export interface memberDetailCount {
  forwardIcon?: string;
  backwardIcon?: string;
  count: Number;
  key: string;
  value: string;
  items?: memberDetailCount[];
  expanded?: boolean;
}
