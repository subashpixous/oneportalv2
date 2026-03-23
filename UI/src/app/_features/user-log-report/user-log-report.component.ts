// Updated by sivasankar On 11/12/2025 for user log report

import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountUserFormDetailModel } from 'src/app/_models/AccountUserViewModel';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-log-report',
  templateUrl: './user-log-report.component.html',
  styleUrls: ['./user-log-report.component.scss']
})
export class UserLogReportComponent implements OnInit {

  logs: any[] = [];
  total = 0;
  rows = 10;
title="Full Log History";
  districts: any[] = [];
  roles: any[] = [];
 eventTypes: any[] = [];

  eventStatuses = [
    { label: 'Failed', value: 0 },
    { label: 'Partial Success', value: 1 },
    { label: 'Success', value: 2 }
  ];

  selectedDistricts = '';
  selectedRole = '';
  selectedEventType = '';
  selectedEventStatus: number | null = null;

  cols = [
    { field: 'userName', header: 'User', sortablefield: 'userName', isSortable: true },
    { field: 'roleName', header: 'Role', sortablefield: 'roleName', isSortable: true },
    { field: 'eventType', header: 'Event', sortablefield: 'eventType', isSortable: true },
    { field: 'eventStatusText', header: 'Status', sortablefield: 'eventStatusText', isSortable: true,isBadge:true },
    { field: 'districtName', header: 'District', sortablefield: 'districtName', isSortable: true },
    { field: 'createdAt', header: 'Last Action', sortablefield: 'createdAt', isSortable: true,isBadge:true, }
  ];

  filtermodel: any;

  constructor(
    private generalService:GeneralService,
    private userService: UserService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.initializeFilter();
    this.loadDropdowns();
    this.loadData();
  }

  initializeFilter() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filtermodel = {
      searchString: '',
      where: {
        userName: '',
        roleName: '',
        moduleName: '',
        eventType: '',
        districtName: '',
        eventStatus: null
      },
      roleId: '',
      districtIds: '',
      fromDate: monthStart,
      toDate: today,
      skip: 0,
      take: this.rows,

     
      getLastLogPerUser: false
    };
  }

  onDistrictChange() {
    this.filtermodel.districtIds = this.selectedDistricts || '';
  }

  onRoleChange() {
    this.filtermodel.roleId = this.selectedRole || '';
  }

  onEventTypeChange() {
    this.filtermodel.where.eventType = this.selectedEventType || '';
  }

  onEventStatusChange() {
    this.filtermodel.where.eventStatus =
      this.selectedEventStatus !== null ? this.selectedEventStatus : '';
  }

  loadDropdowns() {
    this.userService.User_Filter_Dropdowns().subscribe(x => {
      this.districts = x?.data?.districtSelectList || [];
    });

    this.userService.Roleget().subscribe((x: any) => {
      const dds: AccountUserFormDetailModel = x.data;
      this.roles = dds.roleList || [];
    });
     this.generalService.getConfigurationDetailsbyId({
    configId: '',
    categoryId: '7b313ec8-d67d-11f0-9212-06040707f3b5',  
    ShowParent: false,
    parentConfigId: '',
    CategoryCode: '',
    SchemeId: 'GENERAL'
  })
  .subscribe({
    next: (res: any) => {
      if (res?.data && Array.isArray(res.data)) {
        this.eventTypes = res.data.map((x: any) => ({
          label: x.code,
          value: x.value
        }));
      }
    },
    error: (err:any) => {
      console.error("Error loading Event Types:", err);
    }
  });
  }

  changefilter(e: any) {
    this.filtermodel.skip = e.skip;
    this.filtermodel.take = e.take;
    this.filtermodel.searchString = e.searchString || '';
    this.loadData();
  }

  loadData() {
    this.userService.getUserActivityLogs(this.filtermodel)
      .subscribe((res: any) => {
        const rawLogs = res.data || [];

       

        this.logs = rawLogs.map((x: any) => ({
          ...x,
          createdAt: x.createdAt
            ? this.datePipe.transform(x.createdAt, 'dd-MMM-yyyy, hh:mm a')
            : null
        }));

        this.total = res.totalCount || 0;
      });
  }



  reset() {
    this.selectedDistricts = '';
    this.selectedRole = '';
    this.selectedEventType = '';
    this.selectedEventStatus = null;
    this.initializeFilter();
    this.loadData();
  }

  onExportRequest(type: string) {
    const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };
  }
}
