import moment from 'moment';
import { ToWords } from 'to-words';
import {
  ApexAxisChartSeries,
  ApexStroke,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexMarkers,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexResponsive,
} from 'ng-apexcharts';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';

export function dateconvertion(date: any) {
  if (date) return moment(date).format('DD-MM-YYYY hh:mm a');
  return '';
}
export function dateconvertionwithOnlyDate(date: any) {
  if (date) return moment(date).format('DD-MM-YYYY');
  return '';
}
export function dateconvertionwithOnlyTime(date: any) {
  if (date) return moment(date).format('hh:mm a');
  return '';
}

export function getYearList() {
  var startyear = 2022;
  var yearlist = [(2022).toString()];
  var currentyear = new Date().getFullYear();
  for (var i = startyear + 1; i <= currentyear; i++) {
    yearlist = [...yearlist, i.toString()];
  }
  return yearlist;
}
export function monthDiff(d1: Date, d2: Date) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}
export function calculateCompletedAge(birthDate: Date, currentDate: Date) {
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  let hasHadBirthdayThisYear =
    currentDate.getMonth() > birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }
  return age;
}
export const successStatusList = [
  'published',
  'approved',
  'saved',
  'submitted',
  'completed',
  'payment done',
  'active',
  'message sent for all',
];
export const warningStatusList = [
  'in-progress',
  'returned',
  'new',
  'payment pending',
  'payment in progress',
  'in_progress',
];
export const dangerStatusList = [
  'rejected',
  'expired',
  'message not sent for all',
  'cancelled',
  'rejected',
];

export const wordFileTypes = ['docx', 'doc'];
export const xlFileTypes = ['xlsx', 'xls'];
export const pdfFileTypes = ['pdf'];
export const imgFileTypes = ['jpeg', 'png'];

export function getBtnSeverity(statusName: string) {
  if (!statusName) {
    return 'grey';
  }
  if (successStatusList.includes(statusName.toLowerCase())) {
    return 'success';
  } else if (warningStatusList.includes(statusName.toLowerCase())) {
    return 'warning';
  } else if (dangerStatusList.includes(statusName.toLowerCase())) {
    return 'danger';
  }
  return 'grey';
}
export function datecolumns() {
  return [
    'lastUpdatedDate',
    'bulkApprovedDate',
    'submittedDate',
    'date',
    'meetingDate',
    'meetingTimeTo',
    'meetingTimeFrom',
    'modifiedDate',
    'dob',
    'fromDate',
    'toDate',
    'dateOfDisbursement',
    'dateOfAssetVerified',
    'dateOfAssetCreated',
    'dateOfLoanSanction',
    'dependentDob',
    'updatedDate',
  ];
}
export function dateonlycolumns() {
  return [
    'date',
    'meetingDate',
    'dob',
    'fromDate',
    'toDate',
    'dateOfDisbursement',
    'dateOfAssetVerified',
    'dateOfLoanSanction',
    'dateOfAssetCreated',
    'dependentDob',
  ];
}
export function timeonlycolumns() {
  return ['meetingTimeTo', 'meetingTimeFrom'];
}
export function getCommentType() {
  return [
    { value: 'MBOOK', text: 'M-Book' },
    { value: 'MILESTONE', text: 'Milestone' },
    { value: 'TENDER', text: 'Tender' },
  ];
}

export function getcolorforProgress(val: number, type: string) {
  if (type == 'paymentPercentage') {
    return '#8888ea';
  }
  if (val > 0 && val <= 30) {
    return '#8888ea';
  } else if (val > 30 && val <= 70) {
    return '#caca29';
  } else if (val > 70) {
    return '#4dbc4d';
  }
  return '#b2b2b2';
}
export const privileges = {
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_VIEW: 'ROLE_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_VIEW: 'USER_VIEW',
  RECORD_LOG_VIEW: 'RECORD_LOG_VIEW',
  EMAIL_SMS_LOG_VIEW: 'EMAIL_SMS_LOG_VIEW',
  CALLLETTER_VIEW: 'CALLLETTER_VIEW',
  CALLLETTER_CREATE: 'CALLLETTER_CREATE',
  CALLLETTER_EDIT: 'CALLLETTER_EDIT',
  CALLLETTER_DELETE: 'CALLLETTER_DELETE',
  CALLLETTER_SEND_INVITE: 'CALLLETTER_SEND_INVITE',
  REPORT_VIEW: 'REPORT_VIEW',
  GO_VIEW: 'GO_VIEW',
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  APPLICATION_VIEW: 'APPLICATION_VIEW',
  APPLICATION_PRIVILEGE_VIEW: 'APPLICATION_PRIVILEGE_VIEW',
  APPLICATION_PRIVILEGE_EDIT: 'APPLICATION_PRIVILEGE_EDIT',
  CONFIG_CREATE: 'CONFIG_CREATE',
  CONFIG_VIEW: 'CONFIG_VIEW',
  CONFIG_UPDATE: 'CONFIG_UPDATE',
  CONFIG_DELETE: 'CONFIG_DELETE',
  ROLE_SET_PRIVILEGE: 'ROLE_SET_PRIVILEGE',
  APPROVALFLOW_CREATE: 'APPROVALFLOW_CREATE',
  APPROVALFLOW_VIEW: 'APPROVALFLOW_VIEW',
  APPROVALFLOW_UPDATE: 'APPROVALFLOW_UPDATE',
  USER_Delete: 'USER_Delete',
  ROLE_Delete: 'ROLE_Delete',

  CARD_APPROVAL_VIEW: 'CARD_APPROVAL_VIEW',
  CARD_APPROVAL_APPROVE: 'CARD_APPROVAL_APPROVE',
  MEMBER_VIEW: 'MEMBER_VIEW',
  MEMBER_UPDATE: 'MEMBER_UPDATE',
  MEMBER_APPROVE: 'MEMBER_APPROVE',
  MEMBER_APPROVAL_HISTORY: 'MEMBER_APPROVAL_HISTORY',
  MEMBER_DAILY_ENTRY: 'MEMBER_DAILY_ENTRY',
  MEMBER_REPORT_VIEW: 'MEMBER_REPORT_VIEW',
  SCHEME_REPORT_VIEW: 'SCHEME_REPORT_VIEW',
  CARD_STATUS_REPORT: 'CARD_STATUS_REPORT',
  CARD_DASHBOARD_VIEW: 'CARD_DASHBOARD_VIEW',
  APPLICATION_MEMBER_VIEW: 'APPLICATION_MEMBER_VIEW',
  MEMBER_BULK_APPROVE: 'MEMBER_BULK_APPROVE',
  APPLICATION_LOCALBODY_VIEW: 'APPLICATION_LOCALBODY_VIEW',
  FORM_CREATE: 'FORM_CREATE',
  APPLY_SCHEME: 'APPLY_SCHEME',
  Remove_Duplicates: 'Remove_Duplicates',

  FORM_SECTION: 'FORM_SECTION',
  ORGANIZATION_INFO: 'ORGANIZATION_INFO',
  ORGANIZATION_INFO_HIDE: 'ORGANIZATION_INFO_HIDE',
  ORGANIZATION_INFO_EDIT: 'ORGANIZATION_INFO_EDIT',
  MEMBER_PERSONAL_DETAILS: 'MEMBER_PERSONAL_DETAILS',
  MEMBER_PERSONAL_DETAILS_HIDE: 'MEMBER_PERSONAL_DETAILS_HIDE',
  MEMBER_PERSONAL_DETAILS_EDIT: 'MEMBER_PERSONAL_DETAILS_EDIT',
  MEMBER_ADDRESS: 'MEMBER_ADDRESS',
  MEMBER_ADDRESS_HIDE: 'MEMBER_ADDRESS_HIDE',
  MEMBER_ADDRESS_EDIT: 'MEMBER_ADDRESS_EDIT',
  FAMILY_MEMBER_DETAILS: 'FAMILY_MEMBER_DETAILS',
  FAMILY_MEMBER_DETAILS_HIDE: 'FAMILY_MEMBER_DETAILS_HIDE',
  FAMILY_MEMBER_DETAILS_EDIT: 'FAMILY_MEMBER_DETAILS_EDIT',
  MEMBER_BANK_DETAILS: 'MEMBER_BANK_DETAILS',
  MEMBER_BANK_DETAILS_HIDE: 'MEMBER_BANK_DETAILS_HIDE',
  MEMBER_BANK_DETAILS_EDIT: 'MEMBER_BANK_DETAILS_EDIT',
  DOCUMENT_DETAILS: 'DOCUMENT_DETAILS',
  DOCUMENT_DETAILS_HIDE: 'DOCUMENT_DETAILS_HIDE',
  DOCUMENT_DETAILS_EDIT: 'DOCUMENT_DETAILS_EDIT',
  ADDITIONAL_DOCUMENT_DETAILS: 'ADDITIONAL_DOCUMENT_DETAILS',
  ADDITIONAL_DOCUMENT_DETAILS_HIDE: 'ADDITIONAL_DOCUMENT_DETAILS_HIDE',
  ADDITIONAL_DOCUMENT_DETAILS_EDIT: 'ADDITIONAL_DOCUMENT_DETAILS_EDIT',
ANIMATOR_REPORT_VIEW: 'ANIMATOR_REPORT_VIEW', // [29/10/2025}] Updated by Sivasankar K: Added privilege for Animator entries
  // group
  SCHEME_VERIFY:'SCHEME_VERIFY' 
};

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: 'Rupee',
      plural: 'Rupees',
      symbol: '₹',
      fractionalUnit: {
        name: 'Paisa',
        plural: 'Paise',
        symbol: '',
      },
    },
  },
});

export function convertoWords(amount: number) {
  return toWords.convert(amount);
}

export const colors = ['#0A417C', '#34689E', '#3D8ADA', '#5AAAFF', '#9FCDFF'];

export const maledependents = ['son below 25 years'];
export const femaledependents = ['daughter', 'widow', 'wife'];
export const fatherandHubdependents = ['widow', 'wife'];

export const straightStroke: ApexStroke = {
  curve: 'straight',
};

export interface LocalChartOptins {
  chart: ApexChart;
  series: ApexAxisChartSeries;

  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis;
  xaxis?: ApexXAxis;
  stroke?: ApexStroke;
  fill?: ApexFill;
  markers?: ApexMarkers;
  title?: ApexTitleSubtitle;
  tooltip?: ApexTooltip;
  legend?: ApexLegend;
  theme?: ApexTheme;
  colors?: string[];
  labels?: string[];
  responsive?: ApexResponsive[];
}

export const schemeCountPlannedvsActuals: LocalChartOptins = {
  dataLabels: {
    enabled: true,
  },
  colors: colors,
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
    },
  },
  chart: {
    type: 'bar',
    height: 350,
  },
  series: [],
  markers: undefined,
  title: undefined,
  fill: {
    opacity: 1,
    colors: colors,
  },
  yaxis: {
    title: {
      text: '',
    },
  },
  xaxis: {
    title: {
      text: '',
    },
    categories: [],
  },
  tooltip: undefined,
  legend: undefined,
};
export const schemeAchievementsCount: LocalChartOptins = {
  dataLabels: {
    enabled: true,
  },
  stroke: {
    curve: 'straight',
  },
  plotOptions: undefined,
  chart: {
    height: 350,
    type: 'line',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  colors: colors,
  series: [],
  markers: {
    size: 1,
  },
  title: {
    text: 'Scheme Achievements Count',
    align: 'left',
  },
  fill: undefined,
  yaxis: {
    title: {
      text: '',
    },
  },
  xaxis: {
    title: {
      text: '',
    },
    categories: [],
  },
  tooltip: undefined,
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    floating: true,
  },
};

export const schemeCountbyDistrict: LocalChartOptins = {
  dataLabels: {
    enabled: true,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '55%',
    },
  },
  chart: {
    type: 'bar',
    height: 350,
  },
  series: [],
  markers: undefined,
  title: undefined,
  fill: {
    opacity: 1,
    colors: colors,
  },
  yaxis: {
    title: {
      text: '',
    },
  },
  xaxis: {
    categories: [],
  },
  tooltip: undefined,
  legend: undefined,
};
export const schemeSubsidyVsProjectAmount: LocalChartOptins = {
  dataLabels: {
    enabled: true,
  },
  stroke: {
    curve: 'straight',
  },
  plotOptions: undefined,
  chart: {
    height: 350,
    type: 'line',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  colors: colors,
  series: [],
  markers: {
    size: 1,
  },
  title: {
    text: 'Scheme Subsidy vs Project Amount',
    align: 'left',
  },
  fill: undefined,
  yaxis: {
    title: {
      text: '',
    },
  },
  xaxis: {
    title: {
      text: '',
    },
    categories: [],
  },
  tooltip: undefined,
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    floating: true,
  },
};

export const ApplicationCountbySchemeandFinancialYear: LocalChartOptins = {
  dataLabels: {
    enabled: true,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '55%',
    },
  },
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
  },
  series: [],
  markers: undefined,
  title: undefined,
  fill: {
    opacity: 1,
    colors: colors,
  },
  yaxis: {
    title: {
      text: '',
    },
  },
  xaxis: {
    categories: [],
  },
  tooltip: undefined,
  legend: undefined,
};

export const SchemeamountbyDistrict: LocalChartOptins = {
  dataLabels: {
    enabled: true,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '55%',
    },
  },
  chart: {
    type: 'bar',
    height: 350,
  },
  series: [],
  markers: undefined,
  title: undefined,
  fill: {
    opacity: 1,
    colors: colors,
  },
  yaxis: {
    title: {
      text: '',
    },
  },
  xaxis: {
    categories: [],
  },
  tooltip: undefined,
  legend: undefined,
};

export const Self: LocalChartOptins = {
  stroke: {
    lineCap: 'round',
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 225,
      hollow: {
        margin: 0,
        size: '70%',
        background: '#fff',
        image: undefined,
        position: 'front',
        dropShadow: {
          enabled: true,
          top: 3,
          left: 0,
          blur: 4,
          opacity: 0.24,
        },
      },
      track: {
        background: '#fff',
        strokeWidth: '67%',
        margin: 0, // margin is in pixels
        dropShadow: {
          enabled: true,
          top: -3,
          left: 0,
          blur: 4,
          opacity: 0.35,
        },
      },

      dataLabels: {
        show: true,
        name: {
          offsetY: -10,
          show: true,
          color: '#888',
          fontSize: '17px',
        },
        value: {
          formatter: function (val) {
            return parseInt(val.toString(), 10).toString();
          },
          color: '#111',
          fontSize: '36px',
          show: true,
        },
      },
    },
  },
  chart: {
    height: 350,
    type: 'radialBar',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  series: [],
  markers: undefined,
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      shadeIntensity: 0.5,
      gradientToColors: ['#0A417C'],
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100],
    },
  },
  yaxis: undefined,
  xaxis: undefined,
  tooltip: undefined,
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    floating: true,
  },
  labels: ['Count'],
};

export const Dependent: LocalChartOptins = {
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: {
          fontSize: '22px',
        },
        value: {
          fontSize: '16px',
        },
        total: {
          show: true,
          label: 'Total',
          formatter: function (w) {
            const sum = w.globals.seriesTotals.reduce(
              (a: any, b: any) => a + b,
              0
            );
            return sum;
          },
        },
      },
    },
  },
  chart: {
    height: 350,
    type: 'radialBar',
  },
  series: [],
  title: undefined,
  fill: undefined,
  yaxis: undefined,
  xaxis: undefined,
  tooltip: undefined,
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    floating: true,
  },
  labels: [],
};
export const SchemesServedin: LocalChartOptins = {
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: {
          fontSize: '22px',
        },
        value: {
          fontSize: '16px',
        },
        total: {
          show: true,
          label: 'Total',
          formatter: function (w) {
            return '249';
          },
        },
      },
    },
  },
  chart: {
    height: 350,
    type: 'radialBar',
  },
  series: [],
  title: undefined,
  fill: undefined,
  yaxis: undefined,
  xaxis: undefined,
  tooltip: undefined,
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    floating: true,
  },
  labels: [],
};
export const MaritalStatus: LocalChartOptins = {
  dataLabels: undefined,
  stroke: undefined,
  plotOptions: undefined,
  chart: {
    width: '100%',
    type: 'pie',
  },
  series: [],
  markers: undefined,
  title: undefined,
  fill: undefined,
  yaxis: undefined,
  xaxis: undefined,
  tooltip: undefined,
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    floating: true,
  },
  labels: [],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
};

// export function triggerValueChangesForAll(formGroup: FormGroup): void {
//   formGroup.markAllAsTouched();
//   formGroup.updateValueAndValidity({
//     onlySelf: false,
//     emitEvent: false,
//   });
//   Object.keys(formGroup.controls).forEach((key) => {
//     const control = formGroup.get(key);
//     if (control) {
//       const value = control.value; // Get current value
//       control.setValue(value); // Re-set the same value to trigger valueChanges
//     }
//   });
// }

export function triggerValueChangesForAll(formGroup: FormGroup): void {
  formGroup.markAllAsTouched();
  Object.keys(formGroup.controls).forEach((key) => {
    const control = formGroup.get(key);

    if (control) {
      // Refresh validation
      control.updateValueAndValidity({ emitEvent: true });

      // Only re-set value for primitive types (avoid dropdown/multiselect)
      const value = control.value;
      const isPrimitive = value === null || ['string', 'number', 'boolean'].includes(typeof value);

      if (isPrimitive) {
        control.setValue(value); // safe to reassign
      }
    }
  });
}


export function triggerValueChangesForAlwl(control: AbstractControl): void {
  control.markAllAsTouched();
  control.updateValueAndValidity({ onlySelf: false, emitEvent: true });

  // if (control instanceof FormGroup || control instanceof FormArray) {
  //   Object.values(control.controls).forEach((childControl) => {
  //     return triggerValueChangesForAll(childControl); // recursion for nested
  //   });
  // } else {
  //   // For FormControl, re-set the same value to trigger valueChanges
  //   const value = control.value;
  //   control.setValue(value, { emitEvent: true });
  // }
}
export const VariableConst = {};
function sanitizeForm(form: any): any {
  if (typeof form === 'string') {
    return form.replace(/<[^>]+>/g, '');
  } else if (Array.isArray(form)) {
    return form.map((item) => sanitizeForm(item));
  } else if (typeof form === 'object') {
    Object.keys(form).forEach((key) => {
      form[key] = sanitizeForm(form[key]);
    });
  }
  return form;
  
}
