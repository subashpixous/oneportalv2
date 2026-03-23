import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { TableFilterModel } from 'src/app/_models/filterRequest';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent {
   exportedData: any[] = [];
  configurationList!: any[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Feedback';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'lastUpdatedDate';
  defaultSortOrder: number = 1;

  filtermodel!: any;
  privleges = privileges;
  value: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.cols = [
      {
        field: 'name',
        header: 'Name',
        sortablefield: 'name',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'mobileNumber',
        customExportHeader: 'Mobile Number',
        sortablefield: 'mobileNumber',
        isSortable: true,
        isSearchable: true,
        header: 'Mobile Number',
      },
      {
        field: 'feedback',
        header: 'Feedback',
        sortablefield: 'feedback',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'lastUpdatedDate',
        header: 'Updated Date',
        sortablefield: 'lastUpdatedDate',
        isSortable: true,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        isIcon: true,
        // TODO privilege: [privileges.USER_UPDATE],
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        isIcon: true,
        // TODO privilege: [privileges.USER_Delete],
      },
    ];
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = {
      ...this.filtermodel,
      ...val,
      where: { isActive: this.currentStatus },
    };
    this.getUsers();
  }
  changeStatus(val: boolean) {
    this.filtermodel = { ...this.filtermodel, where: { isActive: !val } };
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
    this.getUsers();
  }
  getUsers() {
    this.generalService
      .Feedback_Get(this.filtermodel)
      .pipe(untilDestroyed(this))
      .subscribe((x) => {
        this.configurationList = x.data;
        this.total = x.totalRecordCount;
      });
  }
//modified by Sivasankar on 31-10-2025 for export functionality
       onExportRequest(type: string) {
  

  const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };
    this.generalService
      .Feedback_Get(exportFilter)
      .subscribe((c) => {
        this.exportedData = c.data;
        
       
      });
    }
  actioInvoked(val: ActionModel) {}
}
