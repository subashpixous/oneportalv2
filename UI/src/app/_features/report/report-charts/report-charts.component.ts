import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ReportService } from 'src/app/services/reportsService';
import { selectedProps } from '../report-filters/report-filters.component';
import {
  CountModel,
  DemographicAndBenificiaryInsightsModel,
  DistrictWiseCountCost,
  FinancialYearAnalysisModel,
  ProjectSubsidyCostModel,
  SchemeCountModel,
} from 'src/app/_models/ReportMode';
import {
  ApplicationCountbySchemeandFinancialYear,
  Dependent,
  LocalChartOptins,
  schemeAchievementsCount,
  schemeCountbyDistrict,
  schemeCountPlannedvsActuals,
  schemeSubsidyVsProjectAmount,
  Self,
} from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-report-charts',
  templateUrl: './report-charts.component.html',
  styleUrls: ['./report-charts.component.scss'],
})
export class ReportChartsComponent {
  changes!: selectedProps;

  countModel!: CountModel;
  chartoption!: LocalChartOptins;
  chartoptionswitch!: boolean;
  achievementschartoption!: LocalChartOptins;
  achievementschartoptionswitch!: boolean;

  districtWiseCountCost!: DistrictWiseCountCost;
  districtWiseCountCostchartoption!: LocalChartOptins;
  districtWiseCountCostchartoptionswitch!: boolean;

  ProjectSubsidyModel!: ProjectSubsidyCostModel[];
  ProjectSubsidychartoption!: LocalChartOptins;
  ProjectSubsidychartoptionswitch!: boolean;

  FinancialYearModel!: FinancialYearAnalysisModel[];
  FinancialYearchartoption!: LocalChartOptins;
  FinancialYearchartoptionswitch!: boolean;

  DemographicModel!: DemographicAndBenificiaryInsightsModel;
  slefChartOption!: LocalChartOptins;
  dependentChartOption!: LocalChartOptins;
  servedChartOption!: LocalChartOptins;
  maritalStatusChartOption!: LocalChartOptins;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private reportsService: ReportService,
    public layoutService: LayoutService
  ) {}

  ngOnInit() {
    this.reportsService.propSubscription.subscribe((x) => {
      if (x) {
        this.changes = x;
        this.changes.selectedchartreport.map((x) => {
          if (x == 'scheme_performance') {
            this.reportsService
              .SchemePerformance({
                fromYear: Number(this.changes.selectedfinancialYearfromfilter),
                toYear: Number(this.changes.selectedfinancialYeartofilter),
                schemeIds: this.changes.selectedSchemes,
                districtIds: this.changes.selectedDistricts,
                statusIds: this.changes.selectedStatuses,
              })
              .subscribe((x) => {
                this.countModel = x.data as CountModel;
                var d = schemeCountPlannedvsActuals;
                var ac = schemeAchievementsCount;
                this.chartoption = {
                  ...d,
                  series: this.getSchemePerformance(this.countModel, 'count'),
                  xaxis: {
                    ...d.xaxis,
                    title: {
                      text: 'Years',
                    },
                    categories: this.getSchemePerformanceCategories(
                      this.countModel
                    ),
                  },
                  yaxis: {
                    title: {
                      text: 'No of Application',
                    },
                  },
                };
                this.achievementschartoption = {
                  ...ac,
                  series: this.getSchemePerformance(this.countModel, 'count'),
                  xaxis: {
                    ...ac.xaxis,
                    categories: this.getSchemePerformanceCategories(
                      this.countModel
                    ),
                  },
                  yaxis: {
                    title: {
                      text: 'No of Application',
                    },
                  },
                };
              });
          } else if (x == 'district_distribution') {
            this.reportsService
              .DistrictDistribution({
                fromYear: Number(this.changes.selectedfinancialYearfromfilter),
                toYear: Number(this.changes.selectedfinancialYeartofilter),
                schemeIds: this.changes.selectedSchemes,
                districtIds: this.changes.selectedDistricts,
                statusIds: this.changes.selectedStatuses,
              })
              .subscribe((x) => {
                this.districtWiseCountCost = x.data as DistrictWiseCountCost;
                var d = schemeCountbyDistrict;
                this.districtWiseCountCostchartoption = {
                  ...d,
                  series: this.getDistrictDistribution(
                    this.districtWiseCountCost,
                    'count'
                  ),
                  xaxis: {
                    ...d.xaxis,
                    title: {
                      text: 'No of Application',
                    },
                    categories: this.getDistrictDistributionCategories(
                      this.districtWiseCountCost
                    ),
                  },
                  yaxis: {
                    title: {
                      text: 'Districts',
                    },
                  },
                };
              });
          } else if (x == 'comparision_of_scheme') {
            this.reportsService
              .ComparisionSchemeSubsidyAmount({
                fromYear: Number(this.changes.selectedfinancialYearfromfilter),
                toYear: Number(this.changes.selectedfinancialYeartofilter),
                schemeIds: this.changes.selectedSchemes,
                districtIds: this.changes.selectedDistricts,
                statusIds: this.changes.selectedStatuses,
              })
              .subscribe((x) => {
                this.ProjectSubsidyModel = x.data as ProjectSubsidyCostModel[];
                var d = schemeSubsidyVsProjectAmount;
                this.ProjectSubsidychartoption = {
                  ...d,
                  series: this.getProjectSubsidyCostModel(
                    this.ProjectSubsidyModel
                  ),
                  xaxis: {
                    ...d.xaxis,
                    categories: this.getProjectSubsidyCostCategories(
                      this.ProjectSubsidyModel
                    ),
                  },
                  yaxis: {
                    title: {
                      text: 'Amount',
                    },
                  },
                };
              });
          } else if (x == 'financial_year_analysis') {
            this.reportsService
              .FinancialYearAnalysis({
                fromYear: Number(this.changes.selectedfinancialYearfromfilter),
                toYear: Number(this.changes.selectedfinancialYeartofilter),
                schemeIds: this.changes.selectedSchemes,
                districtIds: this.changes.selectedDistricts,
                statusIds: this.changes.selectedStatuses,
              })
              .subscribe((x) => {
                this.FinancialYearModel =
                  x.data as FinancialYearAnalysisModel[];
                var d = ApplicationCountbySchemeandFinancialYear;
                this.FinancialYearchartoption = {
                  ...d,
                  series: this.getFinancialYear(
                    this.FinancialYearModel,
                    'count'
                  ),
                  xaxis: {
                    ...d.xaxis,
                    title: {
                      text: 'No of Application',
                    },
                    categories: this.getFinancialYearCategories(
                      this.FinancialYearModel
                    ),
                  },
                  yaxis: {
                    title: {
                      text: 'Schemes',
                    },
                  },
                };
              });
          } else if (x == 'avg_days_by_applications') {
          } else if (x == 'demographic_and_beneficiary_insights') {
            this.reportsService
              .DemographicAndBenificiaryInsights({
                fromYear: Number(this.changes.selectedfinancialYearfromfilter),
                toYear: Number(this.changes.selectedfinancialYeartofilter),
                schemeIds: this.changes.selectedSchemes,
                districtIds: this.changes.selectedDistricts,
                statusIds: this.changes.selectedStatuses,
              })
              .subscribe((x) => {
                this.DemographicModel =
                  x.data as DemographicAndBenificiaryInsightsModel;
                var d = Self;
                this.slefChartOption = {
                  ...d,
                  labels: ['Self'],
                  series: [this.DemographicModel.self as any],
                };

                var dep = Dependent;
                this.dependentChartOption = {
                  ...dep,
                  labels:
                    (this.DemographicModel.dependent?.map(
                      (x) => x.name
                    ) as any) ?? [],
                  series:
                    (this.DemographicModel.dependent?.map(
                      (x) => x.count
                    ) as any) ?? [],
                };
              });
          }
        });
      }
    });
  }
  getSchemePerformance(list: CountModel, type: string) {
    var planned: number[] = [];
    var actual: number[] = [];
    if (type == 'count') {
      planned = list.count.map((x) => {
        return x.count;
      });
      actual = list.count.map((x) => {
        return x.actual;
      });
    } else {
      planned = list.cost.map((x) => {
        return x.cost;
      });
      actual = list.cost.map((x) => {
        return x.actual;
      });
    }
    return [
      {
        name: 'Planned',
        data: planned,
      },
      {
        name: 'Actual',
        data: actual,
      },
    ];
  }
  getSchemePerformanceCategories(list: CountModel) {
    return list.count.map((x) => {
      return `${x.fromYear} - ${x.toYear}`;
    });
  }
  chartoptionswitchchange(evrnt: any) {
    this.chartoption = {
      ...this.chartoption,

      series: this.getSchemePerformance(
        this.countModel,
        evrnt ? 'cost' : 'count'
      ),
      xaxis: {
        ...this.chartoption.xaxis,
        title: {
          text: 'Years',
        },
        categories: this.getSchemePerformanceCategories(this.countModel),
      },
      yaxis: {
        title: {
          text: evrnt ? 'Cost' : 'No of Application',
        },
      },
    };
    return this.chartoption;
  }
  achievementschartoptionswitchChange(evrnt: any) {
    this.achievementschartoption = {
      ...this.achievementschartoption,

      series: this.getSchemePerformance(
        this.countModel,
        evrnt ? 'cost' : 'count'
      ),
      xaxis: {
        ...this.achievementschartoption.xaxis,
        categories: this.getSchemePerformanceCategories(this.countModel),
      },
      yaxis: {
        title: {
          text: evrnt ? 'Cost' : 'No of Application',
        },
      },
    };
    return this.chartoption;
  }

  getDistrictDistribution(list: DistrictWiseCountCost, type: string) {
    var planned: number[] = [];
    if (type == 'count' && list.count != null) {
      planned = list.count.map((x) => {
        return x.count;
      });
    } else if (type == 'cost' && list.cost != null) {
      planned = list.cost.map((x) => {
        return x.cost;
      });
    }
    return [
      {
        name: 'Districts',
        data: planned,
      },
    ];
  }
  getDistrictDistributionCategories(list: DistrictWiseCountCost) {
    return list.count.map((x) => {
      return `${x.districtName}`;
    });
  }
  DistrictDistributionchartoptionswitchchange(evrnt: any) {
    this.districtWiseCountCostchartoption = {
      ...this.districtWiseCountCostchartoption,

      series: this.getDistrictDistribution(
        this.districtWiseCountCost,
        evrnt ? 'cost' : 'count'
      ),
      xaxis: {
        ...this.districtWiseCountCostchartoption.xaxis,
        title: {
          text: 'Years',
        },
        categories: this.getDistrictDistributionCategories(
          this.districtWiseCountCost
        ),
      },
      yaxis: {
        title: {
          text: evrnt ? 'Cost' : 'No of Application',
        },
      },
    };
    return this.districtWiseCountCostchartoption;
  }

  getProjectSubsidyCostModel(list: ProjectSubsidyCostModel[]) {
    var projectcost: number[] = [];
    var subsidyCost: number[] = [];
    projectcost = list.map((x) => {
      return x.projectCost;
    });
    subsidyCost = list.map((x) => {
      return x.subsidyCost;
    });
    return [
      {
        name: 'Project Cost',
        data: projectcost,
      },
      {
        name: 'Subsidy Cost',
        data: subsidyCost,
      },
    ];
  }
  getProjectSubsidyCostCategories(list: ProjectSubsidyCostModel[]) {
    return list.map((x) => {
      return `${x.fromYear} - ${x.toYear}`;
    });
  }

  getFinancialYear(list: FinancialYearAnalysisModel[], type: string) {
    var years: any[] = list.flatMap((x) =>
      x.data?.map((c) => `${c.fromYear}-${c.toYear}`)
    );
    if (years && years.length > 0) {
      return years.map((c) => {
        return {
          name: c,
          data: this.getYeardata(list, c, type) ?? [],
        };
      });
    }
    return [];
  }
  getYeardata(list: FinancialYearAnalysisModel[], year: string, type: string) {
    var d = list.flatMap((x) =>
      x.data?.filter((v) => v.fromYear.toString() == year.split('-')[0])
    );
    return d.map((x) =>
      type == 'count' ? x?.recordCount ?? 0 : x?.totalCost ?? 0
    );
  }
  getFinancialYearCategories(list: FinancialYearAnalysisModel[]) {
    return list.map((x) => {
      return `${x.schemeName}`;
    });
  }
  FinancialYearchartoptionswitchchange(evrnt: any) {
    this.FinancialYearchartoption = {
      ...this.FinancialYearchartoption,

      series: this.getFinancialYear(
        this.FinancialYearModel,
        evrnt ? 'cost' : 'count'
      ),
      xaxis: {
        ...this.FinancialYearchartoption.xaxis,
        title: {
          text: evrnt ? 'Cost' : 'No of Application',
        },
        categories: this.getFinancialYearCategories(this.FinancialYearModel),
      },
      yaxis: {
        title: {
          text: 'Schemes',
        },
      },
    };
    return this.FinancialYearchartoption;
  }
}
