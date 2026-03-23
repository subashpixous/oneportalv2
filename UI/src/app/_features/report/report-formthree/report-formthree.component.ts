import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationInfoFilterModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { ReportService } from 'src/app/services/reportsService';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-report-formthree',
  templateUrl: './report-formthree.component.html',
  styleUrls: ['./report-formthree.component.scss'],
})
export class ReportFormthreeComponent {
  configurationList!: any[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Form |||';
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
        if (x && x.selectedtablereport.includes('form3')) {
          this.filtermodel = {
            ...this.filtermodel,
            districtIds: x.selectedDistricts,
            schemeIds: x.selectedSchemes,
            statusIds: x.selectedStatuses,
            fromYear: Number(x.selectedfinancialYearfromfilter),
            toYear: Number(x.selectedfinancialYeartofilter),
          };
          this.reportService
            .ApplicationForm3(this.filtermodel)
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
        field: 'nameAndAddress',
        header: 'Name and Address',
        //sortablefield: 'projectDistrict',
      },
      {
        field: 'nameOfTrade',
        header: 'Name of Trade',
        //sortablefield: 'firstName',
      },
      {
        field: 'refNumber',
        header: 'Ref Number',
        //sortablefield: 'lastName',
      },
      {
        field: 'subsidy',
        header: 'Subsidy',
        //sortablefield: 'rank',
      },
      {
        field: 'promotorContribution',
        header: 'Promotor Contribution',
        //sortablefield: 'servedInString',
      },
      {
        field: 'bankLoan',
        header: 'Bank Loan',
        //sortablefield: 'dob',
      },
      {
        field: 'totalUtilCost',
        header: 'Total Util Cost',
        //sortablefield: 'dob',
      },
    ];
    this.actions = [];
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
    this.reportService
      .ApplicationForm3(this.filtermodel)
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
