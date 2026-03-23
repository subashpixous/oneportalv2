import { Component, Input } from '@angular/core';
import {
  ApexDataLabels,
  ApexStroke,
  ApexPlotOptions,
  ApexChart,
  ApexAxisChartSeries,
  ApexMarkers,
  ApexTitleSubtitle,
  ApexFill,
  ApexYAxis,
  ApexXAxis,
  ApexTooltip,
  ApexLegend,
  ApexTheme,
} from 'ng-apexcharts';
import { LocalChartOptins } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  @Input() chartopt!: LocalChartOptins;
  dataLabels!: ApexDataLabels;
  stroke!: ApexStroke;
  plotOptions!: ApexPlotOptions;
  chart!: ApexChart;
  series!: ApexAxisChartSeries;
  markers!: ApexMarkers;
  title!: ApexTitleSubtitle;
  fill!: ApexFill;
  yaxis!: ApexYAxis;
  xaxis!: ApexXAxis;
  tooltip!: ApexTooltip;
  legend!: ApexLegend;
  theme!: ApexTheme;
  labels!: string[];

  constructor() {}
  ngOnInit() {
    this.initChartData();
  }
  public initChartData(): void {
    this.theme = {
      palette: 'palette10',
      monochrome: {
        enabled: true,
        color: '#255aee',
        shadeTo: 'light',
        shadeIntensity: 0.65,
      },
    };
  }
  ngOnChanges() {
    this.stroke = this.chartopt.stroke as any;
    this.plotOptions = this.chartopt.plotOptions as any;
    this.chart = this.chartopt.chart as any;
    this.series = this.chartopt.series as any;
    this.markers = this.chartopt.markers as any;
    this.title = this.chartopt.title as any;
    this.fill = this.chartopt.fill as any;
    this.yaxis = this.chartopt.yaxis as any;
    this.xaxis = this.chartopt.xaxis as any;
    this.tooltip = this.chartopt.tooltip as any;
    this.legend = this.chartopt.legend as any;
    this.theme = this.chartopt.theme as any;
    this.labels = this.chartopt.labels as any;
  }
}
