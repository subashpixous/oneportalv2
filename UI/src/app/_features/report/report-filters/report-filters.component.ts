import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MenuItem } from 'primeng/api';
import { Actions, Column } from 'src/app/_models/datatableModel';
import {
  TableFilterModel,
  ReportBreadcrumbModel,
  NavigationModel,
} from 'src/app/_models/filterRequest';
import { ReportTopFilterModel } from 'src/app/_models/ReportMode';
import { TCModel } from 'src/app/_models/user/usermodel';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ReportService } from 'src/app/services/reportsService';
import {
  getYearList,
  dateconvertionwithOnlyDate,
  dateconvertion,
} from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-report-filters',
  templateUrl: './report-filters.component.html',
  styleUrls: ['./report-filters.component.scss'],
})
export class ReportFiltersComponent {
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

  title: string = 'Reports';

  changes!: selectedProps;

  navigationModel: NavigationModel | undefined;
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
    this.reportsService.Report_Filter_Dropdowns().subscribe((x) => {
      var det = x.data as ReportTopFilterModel;
      this.schemes = det.schemeSelectList ?? [];
      this.districts = det.districtSelectList ?? [];
      this.reportOutput = det.reportTypeSelectList ?? [];
      this.tablereportList = det.tableReportSelectList ?? [];
      this.chartreportList = det.chartReportSelectList ?? [];
      this.statuses = det.statusSelectList ?? [];

      var appfilter = localStorage.getItem('ReportFilter');
      if (appfilter) {
        var filtermodel = JSON.parse(appfilter);
        var df = this.props.selectedStatuses;
        this.props = filtermodel;
        this.props.selectedStatuses =
          df && df.length > 0 ? df : this.props.selectedStatuses;
      }
      this.reportsService.setProps(this.props);
    });
  }
  changescheme(event: any) {
    this.props = { ...this.props, selectedSchemes: event, needsChange: true };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
    this.reportsService.GetStatusListByScheme(event).subscribe((c) => {
      this.statuses = c.data;
    });
  }
  generatetablereportList(event: any) {
    this.props = {
      ...this.props,
      selectedtablereport: event,
      needsChange: true,
    };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
  generatechartreportList(event: any) {
    this.props = {
      ...this.props,
      selectedchartreport: event,
      needsChange: true,
    };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
  generatereportOutput(event: any) {
    this.props = {
      ...this.props,
      selectedreportOutput: event,
      needsChange: true,
    };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
  generatestatuses(event: any) {
    this.props = { ...this.props, selectedStatuses: event, needsChange: true };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
  generatefinancialYearsfromfilter(event: any) {
    this.props = {
      ...this.props,
      selectedfinancialYearfromfilter: event,
      needsChange: true,
    };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
  generatefinancialYearstofilter(event: any) {
    this.props = {
      ...this.props,
      selectedfinancialYeartofilter: event,
      needsChange: true,
    };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
  generatedistricts(event: any) {
    this.props = { ...this.props, selectedDistricts: event, needsChange: true };
    localStorage.setItem('ReportFilter', JSON.stringify(this.props));
    this.reportsService.setProps(this.props);
  }
}

export interface selectedProps {
  selectedSchemes: string[];
  selectedDistricts: string[];
  selectedStatuses: string[];
  selectedfinancialYearfromfilter: string;
  selectedfinancialYeartofilter: string;
  selectedreportOutput: string;
  selectedtablereport: string[];
  selectedchartreport: string[];
  needsChange: boolean;
}
