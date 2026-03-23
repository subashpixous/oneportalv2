import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationInfoFilterModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { ApplicationStatusReportModel } from 'src/app/_models/ReportMode';
import { ReportService } from 'src/app/services/reportsService';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-report-status',
  templateUrl: './report-status.component.html',
  styleUrls: ['./report-status.component.scss'],
})
export class ReportStatusComponent {
  configurationList!: ApplicationStatusReportModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Application Status';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;

  filtermodel!: ApplicationInfoFilterModel;
  privleges = privileges;
  value: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private reportService: ReportService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.reportService.propSubscription
      .pipe(untilDestroyed(this))
      .subscribe((x) => {
        if (x && x.selectedtablereport.includes('application_status')) {
          this.filtermodel = {
            ...this.filtermodel,
            districtIds: x.selectedDistricts,
            schemeIds: x.selectedSchemes,
            statusIds: x.selectedStatuses,
            fromYear: Number(x.selectedfinancialYearfromfilter),
            toYear: Number(x.selectedfinancialYeartofilter),
          };
          this.reportService
            .ApplicationStatus(this.filtermodel)
            .pipe(untilDestroyed(this))
            .subscribe((x) => {
              this.configurationList = x.data;
              this.total = x.totalRecordCount;
            });
        }
      });
    this.cols = [
      {
        field: 'applicationNumber',
        header: 'Application Number',
        customExportHeader: 'Application Number',
        //sortablefield: 'applicationNumber',
      },
      {
        field: 'scheme',
        header: 'Scheme',
        customExportHeader: 'Name',
        //sortablefield: 'scheme',
      },
      {
        field: 'status',
        header: 'Status',
        //sortablefield: 'status',
      },
      {
        field: 'submittedDate',
        header: 'Submitted Date',
        //sortablefield: 'projectDistrict',
      },
      {
        field: 'projectDistrict',
        header: 'District',
        //sortablefield: 'firstName',
      },
      {
        field: 'actionStatus',
        header: 'Action Status',
        //sortablefield: 'lastName',
      },
      {
        field: 'fromStatus',
        header: 'From Status',
        //sortablefield: 'rank',
      },
      {
        field: 'toStatus',
        header: 'To Status',
        //sortablefield: 'servedInString',
      },
      {
        field: 'reson',
        header: 'Reson',
        //sortablefield: 'dob',
      },
      {
        field: 'comment ',
        header: 'Comment ',
        //sortablefield: 'dob',
      },
    ];
    this.actions = [];
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = { ...this.filtermodel, ...val };
    this.getApplicationStatus();
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
    this.getApplicationStatus();
  }
  getApplicationStatus() {
    this.reportService
      .ApplicationStatus(this.filtermodel)
      .pipe(untilDestroyed(this))
      .subscribe((x) => {
        this.configurationList = x.data;
        this.total = x.totalRecordCount;
      });
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
    } else if (val && val.type == 'EDIT') {
    } else if (val && val.type == 'ACTIVATE') {
    }
  }
}
