import { ChangeDetectorRef, Component } from '@angular/core';
import {
  ApplicationInfoFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { TCModel } from 'src/app/_models/user/usermodel';
import { selectedProps } from '../report-filters/report-filters.component';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ReportService } from 'src/app/services/reportsService';
import {
  ApplicationStatusCount,
  ApplicationStatusReport,
  DistrictWiseCountCost,
  ReportTopFilterModel,
} from 'src/app/_models/ReportMode';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import {
  LocalChartOptins,
  privileges,
  schemeCountbyDistrict,
} from 'src/app/shared/commonFunctions';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-summary-report',
  templateUrl: './summary-report.component.html',
  styleUrls: ['./summary-report.component.scss'],
})
export class SummaryReportComponent {
  schemes!: TCModel[];
  districts!: TCModel[];
  statuses!: TCModel[];
  financialYearsfilter: TCModel[] = [];
  reportOutput!: TCModel[];
  tablereportList!: TCModel[];
  chartreportList!: TCModel[];

  props: selectedProps = {
    selectedSchemes: [],
    selectedDistricts: [],
    selectedStatuses: [],
    selectedfinancialYearfromfilter: (new Date().getFullYear() - 1).toString(),
    selectedfinancialYeartofilter: new Date().getFullYear().toString(),
    selectedreportOutput: 'table',
    selectedtablereport: ['application_info', 'application_document'],
    selectedchartreport: ['scheme_performance'],
    needsChange: true,
  };

  title: string = 'Summary';

  changes!: selectedProps;

  navigationModel: NavigationModel | undefined;

  configurationList!: any[];
  totalDet!: ApplicationStatusReport;
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  first: number = 0;
  rows: number = 50;
  total: number = 0;
  defaultSortField: string = 'district';
  defaultSortOrder: number = 1;

  filtermodel!: ApplicationInfoFilterModel;

  privleges = privileges;
  value: string[] = [];

  districtWiseCountCost!: DistrictWiseCountCost;
  applicationReceivedchartoption!: LocalChartOptins;
  taskForceCommitteechartoption!: LocalChartOptins;
  forwardedToLendingBankchartoption!: LocalChartOptins;
  approvedByLendingBankchartoption!: LocalChartOptins;
  subsidyReleasedToLendingBankchartoption!: LocalChartOptins;
  subsidyReleasedByHqchartoption!: LocalChartOptins;
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private reportsService: ReportService,
    public layoutService: LayoutService
  ) {
    var obj = this.router.getCurrentNavigation()?.extras?.state;
    this.navigationModel = obj ? obj['data'] : undefined;
    this.props.selectedSchemes = this.navigationModel?.schemeId
      ? [this.navigationModel?.schemeId]
      : [];
    this.reportsService
      .GetStatusListByScheme(this.props.selectedSchemes)
      .subscribe((c) => {
        this.statuses = c.data;
        this.props.selectedStatuses = this.navigationModel?.statusId
          ? [this.navigationModel?.statusId]
          : [];
      });

    var appfilter = localStorage.getItem('SummaryFilter');
    if (appfilter) {
      var filtermodel = JSON.parse(appfilter);
      this.props = filtermodel;
    }
    this.reportsService.setProps(this.props);
    this.cdr.markForCheck();
  }

  ngOnInit() {
    var curentyr = new Date().getFullYear();
    var curentmnt = new Date().getMonth();
    var startyr = 2023;
    do {
      this.financialYearsfilter = [
        ...this.financialYearsfilter,
        {
          text: `${startyr} (Apr ${startyr} to  Mar ${startyr + 1})`,
          value: `${startyr}`,
        },
      ];
      startyr = startyr + 1;
    } while (
      curentyr >= startyr &&
      ((curentyr == startyr && curentmnt > 2) || curentyr != startyr)
    );
    this.cols = [
      {
        field: 'scheme',
        header: 'Scheme',
        customExportHeader: 'scheme',
        //sortablefield: 'scheme',
      },
      {
        field: 'district',
        header: 'District',
        isActionable: true,
        //sortablefield: 'status',
      },
      {
        field: 'totalCount',
        header: 'Total Application',
        //sortablefield: 'projectDistrict',
      },
      {
        field: 'applicationReceived',
        header: 'Application Received',
        //sortablefield: 'firstName',
      },
      {
        field: 'taskForceCommittee',
        header: 'Task Force Committee Approved',
        //sortablefield: 'lastName',
      },
      {
        field: 'forwardedToLendingBank',
        header: 'Forwarded to Lending Bank',
        //sortablefield: 'rank',
      },
      {
        field: 'approvedByLendingBank',
        header: 'Approved by Lending Bank',
        //sortablefield: 'servedInString',
      },
      {
        field: 'subsidyReleasedToLendingBank',
        header: 'Subsidy Released to Bank',
        //sortablefield: 'dob',
      },
      {
        field: 'subsidyReleasedByHq',
        header: 'Subsidy Released by HQ',
        //sortablefield: 'dob',
      },
    ];
    this.actions = [];
    this.reportsService.Report_Filter_Dropdowns().subscribe((x) => {
      var det = x.data as ReportTopFilterModel;
      this.schemes = det.schemeSelectList ?? [];
      this.districts = det.districtSelectList ?? [];
      this.reportOutput = det.reportTypeSelectList ?? [];
      this.tablereportList = det.tableReportSelectList ?? [];
      this.chartreportList = det.chartReportSelectList ?? [];
      this.statuses = det.statusSelectList ?? [];
      this.reportsService.setProps(this.props);
    });
    this.reportsService
      .DistrictDistribution({
        fromYear: Number(this.props.selectedfinancialYearfromfilter),
        toYear: Number(this.props.selectedfinancialYeartofilter),
        schemeIds: this.props.selectedSchemes,
        districtIds: this.props.selectedDistricts,
        statusIds: this.props.selectedStatuses,
      })
      .subscribe((x) => {
        this.districtWiseCountCost = x.data as DistrictWiseCountCost;
      });

    this.getApplicationDocument();
  }
  getDistrictDistribution(list: ApplicationStatusCount[]) {
    var planned: number[] = [];
    if (list != null) {
      planned = list.map((x) => {
        return x.count;
      });
    }
    return [
      {
        name: 'Districts',
        data: planned,
      },
    ];
  }
  getDistrictDistributionCategories(list: ApplicationStatusCount[]) {
    return list.map((x) => {
      return `${x.district}`;
    });
  }
  actionalAction(event: any) {
    this.navigationModel = {
      districtId: event.record.districtId,
      schemeId: null,
    };
    this.router.navigate(['officers', 'applications'], {
      state: { data: this.navigationModel },
    });
  }
  changescheme(event: any) {
    this.props = { ...this.props, selectedSchemes: event, needsChange: true };
    localStorage.setItem('SummaryFilter', JSON.stringify(this.props));

    this.getApplicationDocument();
  }
  generatestatuses(event: any) {
    this.props = { ...this.props, selectedStatuses: event, needsChange: true };
    localStorage.setItem('SummaryFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
  generatefinancialYearsfromfilter(event: any) {
    this.props = {
      ...this.props,
      selectedfinancialYearfromfilter: event,
      needsChange: true,
    };
    localStorage.setItem('SummaryFilter', JSON.stringify(this.props));

    this.getApplicationDocument();
  }
  generatefinancialYearstofilter(event: any) {
    this.props = {
      ...this.props,
      selectedfinancialYeartofilter: event,
      needsChange: true,
    };
    localStorage.setItem('SummaryFilter', JSON.stringify(this.props));

    this.getApplicationDocument();
  }
  generatedistricts(event: any) {
    this.props = { ...this.props, selectedDistricts: event, needsChange: true };
    localStorage.setItem('SummaryFilter', JSON.stringify(this.props));
    this.getApplicationDocument();
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = { ...this.filtermodel, ...val };
    this.getApplicationDocument();
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
    this.getApplicationDocument();
  }
  getApplicationDocument() {
    this.reportsService
      .SummaryReport({
        fromYear: Number(this.props.selectedfinancialYearfromfilter),
        toYear: Number(this.props.selectedfinancialYeartofilter),
        schemeIds: this.props.selectedSchemes,
        districtIds: this.props.selectedDistricts,
        statusIds: this.props.selectedStatuses,
      })
      .pipe(untilDestroyed(this))
      .subscribe((x) => {
        this.totalDet = x.data;
        var ddt = this.totalDet;
        this.configurationList = ddt.applicationAllStatusCount.filter(
          (x) => x.totalCount != 0
        );
        var d = schemeCountbyDistrict;
        this.applicationReceivedchartoption = {
          ...d,
          series: this.getDistrictDistribution(ddt.applicationReceived),
          xaxis: {
            ...d.xaxis,
            title: {
              text: 'No of Application',
            },
            categories: this.getDistrictDistributionCategories(
              ddt.applicationReceived
            ),
          },
          yaxis: {
            title: {
              text: 'Districts',
            },
          },
        };
        this.taskForceCommitteechartoption = {
          ...d,
          series: this.getDistrictDistribution(ddt.taskForceCommittee),
          xaxis: {
            ...d.xaxis,
            title: {
              text: 'No of Application',
            },
            categories: this.getDistrictDistributionCategories(
              ddt.taskForceCommittee
            ),
          },
          yaxis: {
            title: {
              text: 'Districts',
            },
          },
        };
        this.forwardedToLendingBankchartoption = {
          ...d,
          series: this.getDistrictDistribution(ddt.forwardedToLendingBank),
          xaxis: {
            ...d.xaxis,
            title: {
              text: 'No of Application',
            },
            categories: this.getDistrictDistributionCategories(
              ddt.forwardedToLendingBank
            ),
          },
          yaxis: {
            title: {
              text: 'Districts',
            },
          },
        };
        this.approvedByLendingBankchartoption = {
          ...d,
          series: this.getDistrictDistribution(ddt.approvedByLendingBank),
          xaxis: {
            ...d.xaxis,
            title: {
              text: 'No of Application',
            },
            categories: this.getDistrictDistributionCategories(
              ddt.approvedByLendingBank
            ),
          },
          yaxis: {
            title: {
              text: 'Districts',
            },
          },
        };
        this.subsidyReleasedToLendingBankchartoption = {
          ...d,
          series: this.getDistrictDistribution(
            ddt.subsidyReleasedToLendingBank
          ),
          xaxis: {
            ...d.xaxis,
            title: {
              text: 'No of Application',
            },
            categories: this.getDistrictDistributionCategories(
              ddt.subsidyReleasedToLendingBank
            ),
          },
          yaxis: {
            title: {
              text: 'Districts',
            },
          },
        };
        this.subsidyReleasedByHqchartoption = {
          ...d,
          series: this.getDistrictDistribution(ddt.subsidyReleasedByHq),
          xaxis: {
            ...d.xaxis,
            title: {
              text: 'No of Application',
            },
            categories: this.getDistrictDistributionCategories(
              ddt.subsidyReleasedByHq
            ),
          },
          yaxis: {
            title: {
              text: 'Districts',
            },
          },
        };
      });
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
    } else if (val && val.type == 'EDIT') {
    } else if (val && val.type == 'ACTIVATE') {
    }
  }
}
