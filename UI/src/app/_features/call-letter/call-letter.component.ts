import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { CallletterGridModel } from 'src/app/_models/CallletterApplicationModel';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import {
  CallletterWhereClauseProperties,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { CallLetterService } from 'src/app/services/call-letter.Service';
import { GeneralService } from 'src/app/services/general.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@Component({
  selector: 'app-call-letter',
  templateUrl: './call-letter.component.html',
  styleUrls: ['./call-letter.component.scss'],
})
export class CallLetterComponent {
   exportedData: any[] = []; //modified by Sivasankar on 31-10-2025 for export functionality
  configurationList!: CallletterGridModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  activeStatuses: TCModel[] = [
    { text: 'Active', value: '1' },
    { text: 'Expired', value: '0' },
  ];
  schemes: TCModel[] = [];
  districts: TCModel[] = [];
  statuses: TCModel[] = [];
  datefilter: TCModel[] = [];

  selecteddatefilter: string = '';
  selectedActiveStatuses: string = '';
  selectedSchemes: string[] = [];
  selectedDistricts: string[] = [];
  selectedStatuses: string[] = [];

  actions: Actions[] = [];
  title: string = 'Call Letter';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'meetingDate';
  defaultSortOrder: number = 0;

  endDate = moment(new Date()).toDate();
  filtermodel!: any;
  privleges = privileges;
  value: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private callLetterService: CallLetterService,
    private userService: UserService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    var curentyr = new Date().getFullYear();
    var curentmnt = new Date().getMonth();
    var startyr = 2023;
    do {
      this.datefilter = [
        ...this.datefilter,
        {
          text: `Apr ${startyr} - March ${startyr + 1}`,
          value: `${startyr}-${startyr + 1}`,
        },
      ];
      startyr = startyr + 1;
    } while (
      curentyr >= startyr &&
      ((curentyr == startyr && curentmnt > 2) || curentyr != startyr)
    );

    this.userService.User_Filter_Dropdowns().subscribe((x) => {
      if (x) {
        this.schemes = x.data.schemeSelectList;
        this.districts = x.data.districtSelectList;
        // this.statuses = x.data.statusSelectList;
      }
    });

    this.cols = [
      // {
      //   field: 'isExpired',
      //   header: 'Status',
      //   customExportHeader: 'Call Letter Status',
      //   sortablefield: 'isExpired',
      //   isSortable: true,
      //   isSearchable: true,
      //   isBadge: true,
      // },
      {
        field: 'callletterName',
        header: 'Call Letter Name',
        customExportHeader: 'Call Letter Name',
        sortablefield: 'callletterName',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },
      {
        field: 'callLetterStatus',
        header: 'Status',
        customExportHeader: 'Status',
        sortablefield: 'callLetterStatus',
        isSortable: true,
        isSearchable: true,
        isColorText: true,
      },
      {
        field: 'scheme',
        header: 'Scheme',
        sortablefield: 'scheme',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'district',
        header: 'District',
        sortablefield: 'district',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'venue',
        header: 'Venue',
        sortablefield: 'venue',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'meetingDate',
        header: 'Date',
        sortablefield: 'meetingDate',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'meetingTimeFrom',
        header: 'Time From',
        sortablefield: 'meetingTimeFrom',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'meetingTimeTo',
        header: 'Time To',
        sortablefield: 'meetingTimeTo',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'modifiedByUserName',
        header: 'Updated By',
        sortablefield: 'modifiedByUserName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'modifiedDate',
        header: 'Updated Date',
        sortablefield: 'modifiedDate',
        isSortable: true,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-trash',
        title: 'In-Activate',
        type: 'INACTIVATE',
        visibilityCheckFeild: 'canDelete',
        isIcon: true,
        privilege: [privileges.CALLLETTER_DELETE],
      },
      {
        icon: 'pi pi-send',
        title: 'Send',
        type: 'SEND',
        visibilityCheckFeild: 'canSent',
        isIcon: true,
        privilege: [privileges.CALLLETTER_SEND_INVITE],
      },
      {
        icon: 'pi pi-times',
        title: 'Cancel',
        type: 'CANCEL',
        visibilityCheckFeild: 'canCancel',
        isIcon: true,
        privilege: [privileges.CALLLETTER_EDIT],
      },
    ];

    var appfilter = localStorage.getItem('CallletterFilter');
    if (appfilter) {
      this.filtermodel = JSON.parse(appfilter);
      this.filtermodel = {
        ...this.filtermodel,
        searchString: null,
        columnSearch: null,
        skip: 0,
        take: 10,
        sorting: { fieldName: 'meetingDate', sort: 'DESC' },
      };
      this.selectedStatuses = this.filtermodel.where?.statusIds;
      this.selectedDistricts = this.filtermodel.where?.districtIds;
      this.selectedSchemes = this.filtermodel.where?.schemeIds;
      this.selectedActiveStatuses = this.filtermodel.where?.isExpired
        ? '0'
        : '1';
      this.selecteddatefilter = this.filtermodel.where?.year;
    } else {
      this.filtermodel = {
        searchString: null,
        skip: 0,
        where: {
          userId: '',
          schemeIds: [],
          districtIds: [],
          statusIds: [],
          isExpired: false,
          isBulkApprovalGet: false,
          year: '',
        },
        sorting: { fieldName: 'meetingDate', sort: 'DESC' },
        take: 10,
        columnSearch: null,
      };
    }
  }
  reset() {
    this.selectedSchemes = [];
    this.selectedDistricts = [];
    this.selectedStatuses = [];
    this.selectedActiveStatuses = '1';
    this.generate();
  }
  createmeeting(val: string) {
    this.router.navigate(['officers', 'call-letter', 'create', val, 'EDIT']);
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = {
      ...this.filtermodel,
      ...val,
      where: { isActive: this.currentStatus, ...this.filtermodel.where },
    };
    this.getcallLetters();
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
    this.getcallLetters();
  }
  generate() {
    this.filtermodel = {
      ...this.filtermodel,
      where: <CallletterWhereClauseProperties>{
        isActive: this.selectedActiveStatuses == '0' ? false : true,
        schemeIds: this.selectedSchemes,
        districtIds: this.selectedDistricts,
      },
    };
    this.getcallLetters();
  }
  getcallLetters() {
    localStorage.setItem('CallletterFilter', JSON.stringify(this.filtermodel));
    this.callLetterService.Callletter_Get(this.filtermodel).subscribe((x) => {
      this.configurationList = x.data;
      this.total = x.totalRecordCount;
      this.configurationList.map((x) => {
        var t = this.isATimeGreater(
          moment(x.meetingTimeTo).toDate(),
          moment(x.meetingDate).toDate()
        );

        if (
          t &&
          (x.callLetterStatus.toLocaleLowerCase() == 'scheduled' ||
            x.callLetterStatus.toLocaleLowerCase() ==
              'message not sent for all')
        ) {
          x.canSent = true;
        } else {
          x.canSent = false;
        }
        if (x.isMessageSentToAll.toString() == 'true') {
          x.isMessageSentToAll = 'Message Sent For All';
        } else {
          x.isMessageSentToAll = 'Message Not Sent For All';
        }
        if (x.isExpired.toString() == 'true') {
          x.isExpired = 'Expired';
        } else {
          x.isExpired = 'Active';
        }
      });
    });
  }
//modified by Sivasankar on 31-10-2025 for export functionality
      onExportRequest(type: string) {
  

  const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };
  this.callLetterService.Callletter_Get(this.filtermodel)
      .subscribe((c) => {
        this.exportedData = c.data;
        
       
      });
        

}
  isATimeGreater(meeeingTime: Date, meeeingDate: Date) {
    // You can now compare this time with another time
    const anotherTime = meeeingTime;
    const anotherHours = anotherTime.getHours();
    const anotherMinutes = anotherTime.getMinutes();
    const anotherSeconds = anotherTime.getSeconds();

    var mDateyer = moment(meeeingDate).toDate().getFullYear();
    var mDateymt = moment(meeeingDate).toDate().getMonth();
    var mDateydt = moment(meeeingDate).toDate().getDate();

    var meetingdatetime = moment()
      .year(mDateyer)
      .month(mDateymt)
      .date(mDateydt)
      .hour(anotherHours)
      .minute(anotherMinutes)
      .second(anotherSeconds);
    var currentTime = moment();

    if (meetingdatetime > currentTime) {
      return true;
    }
    return false;
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.callLetterService.Callletter_Delete(val.record.id).subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Deleted Successfully',
          });
          this.getcallLetters();
        }
      });
    } else if (val && val.type == 'EDIT') {
      this.createmeeting(val.record.id);
    } else if (val && val.type == 'CANCEL') {
      this.callLetterService
        .Callletter_Cancel_Meeting(val.record.id)
        .subscribe((x) => {
          if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              life: 2000,
              detail: x.message,
            });
          } else if (x) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Send Successfully',
            });
            this.getcallLetters();
          }
        });
    } else if (val && val.type == 'SEND') {
      this.callLetterService
        .Callletter_Send_Meeting_Invite(val.record.id)
        .subscribe((x) => {
          if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              life: 2000,
              detail: x.message,
            });
          } else if (x) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Send Successfully',
            });
            this.getcallLetters();
          }
        });
    }
  }
  actionalAction(val: ActionModel) {
    this.createmeeting(val.record.id);
  }
}
