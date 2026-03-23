import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationInfoFilterModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import { ReportService } from 'src/app/services/reportsService';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-report-tables',
  templateUrl: './report-tables.component.html',
  styleUrls: ['./report-tables.component.scss'],
})
export class ReportTablesComponent {
  configurationList!: any[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Application Info';
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
        if (x && x.selectedtablereport.includes('application_info')) {
          this.filtermodel = {
            ...this.filtermodel,
            districtIds: x.selectedDistricts,
            schemeIds: x.selectedSchemes,
            statusIds: x.selectedStatuses,
            fromYear: Number(x.selectedfinancialYearfromfilter),
            toYear: Number(x.selectedfinancialYeartofilter),
          };
          this.reportService
            .ApplicationInfo(this.filtermodel)
            .pipe(untilDestroyed(this))
            .subscribe((x) => {
              this.configurationList = x.data;
              if (this.configurationList && this.configurationList.length > 0) {
                this.configurationList.forEach((r) => {
                  r.declarationAcceptedstring =
                    r.declarationAccepted ?? false ? 'YES' : 'NO';
                  r.typeOfTraining = (r.typeOfTraining as string).replaceAll(
                    '|',
                    ', '
                  );
                });
              }
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
        isActionable: true,
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
        field: 'projectDistrict',
        header: 'District',
        //sortablefield: 'projectDistrict',
      },
      {
        field: 'firstName',
        header: 'First Name',
        //sortablefield: 'firstName',
      },
      {
        field: 'lastName',
        header: 'Last Name',
        //sortablefield: 'lastName',
      },
      {
        field: 'servedInString',
        header: 'Served In',
        //sortablefield: 'servedInString',
      },
      {
        field: 'serviceNumber',
        header: 'Service Number',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'rank_String',
        header: 'Rank',
        //sortablefield: 'rank',
      },
      {
        field: 'dobb',
        header: 'DOB',
        //sortablefield: 'dobb',
      },
      {
        field: 'isSelfstring',
        header: 'Is Self',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'dependentName',
        header: 'Dependent Name',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'dependentDob',
        header: 'Dependent Dob',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'isNativeTamilNadustring',
        header: 'Is Nativity TamilNadu',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'serviceNumber',
        header: 'Service Number',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'age',
        header: 'Age',
        //sortablefield: 'age',
      },
      {
        field: 'gender',
        header: 'Gender',
        //sortablefield: 'gender',
      },
      {
        field: 'religion',
        header: 'Religion',
        //sortablefield: 'religion',
      },
      {
        field: 'community',
        header: 'Community',
        //sortablefield: 'community',
      },
      {
        field: 'maritalStatus',
        header: 'Marital Status',
        //sortablefield: 'maritalStatus',
      },
      {
        field: 'fathersName',
        header: 'Fathers Name',
        //sortablefield: 'fathersName',
      },
      {
        field: 'mobile',
        header: 'Mobile',
        //sortablefield: 'mobile',
      },
      {
        field: 'doorNo',
        header: 'Address',
        //sortablefield: 'doorNo',
      },
      {
        field: 'streetName',
        header: 'Street Name',
        //sortablefield: 'doorNo',
      },
      {
        field: 'district',
        header: 'District',
        //sortablefield: 'district',
      },
      {
        field: 'taluk',
        header: 'Taluk',
        //sortablefield: 'taluk',
      },
      {
        field: 'village',
        header: 'Village',
        //sortablefield: 'village',
      },
      {
        field: 'pincode',
        header: 'Pincode',
        //sortablefield: 'pincode',
      },
      {
        field: 'aadharNo',
        header: 'Aadhar No',
        //sortablefield: 'aadharNo',
      },
      {
        field: 'email',
        header: 'Email',
        //sortablefield: 'email',
      },
      {
        field: 'ventureCategory',
        header: 'Venture Category',
        //sortablefield: 'ventureCategory',
      },
      {
        field: 'activityLane',
        header: 'Activity Lane',
        //sortablefield: 'activityLane',
      },
      {
        field: 'activityLaneOther',
        header: 'Activity Lane Other',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'isReEmployedstring',
        header: 'Is Re-Employed',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'employeementType',
        header: 'Employement Type',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'employementOthers',
        header: 'Employement Others',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'landCost',
        header: 'Land Cost',
        //sortablefield: 'landCost',
      },
      {
        field: 'buildingCost',
        header: 'Building Cost',
        //sortablefield: 'buildingCost',
      },
      {
        field: 'equipmentCost',
        header: 'Equipment Cost',
        //sortablefield: 'equipmentCost',
      },
      {
        field: 'workingCost',
        header: 'Working Cost',
        //sortablefield: 'workingCost',
      },
      {
        field: 'preopertaiveExpense',
        header: 'Pre-Opertaive Expense',
        //sortablefield: 'preopertaiveExpense',
      },
      {
        field: 'otherExpense',
        header: 'Other Expense',
        //sortablefield: 'otherExpense',
      },
      {
        field: 'totalCost',
        header: 'Total Project Cost',
        //sortablefield: 'totalCost',
      },
      {
        field: 'subsidyCost',
        header: 'Subsidy Cost',
        //sortablefield: 'subsidyCost',
      },
      {
        field: 'beneficiaryCost',
        header: 'Beneficiary Cost',
        //sortablefield: 'beneficiaryCost',
      },
      {
        field: 'ifsc',
        header: 'IFSC',
        //sortablefield: 'iFSC',
      },
      {
        field: 'bank',
        header: 'Bank',
        //sortablefield: 'bank',
      },
      {
        field: 'branch',
        header: 'Branch',
        //sortablefield: 'branch',
      },
      {
        field: 'address',
        header: 'Address',
        //sortablefield: 'address',
      },
      {
        field: 'accountNumber',
        header: 'Account Number',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'declarationAcceptedstring',
        header: 'Declaration Accepted',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'isSubmittedstring',
        header: 'Is Submitted',
        //sortablefield: 'accountNumber',
      },
      {
        field: 'modifiedByUserName',
        header: 'Updated by',
        //sortablefield: 'modifiedByUserName',
      },
      {
        field: 'modifiedDate',
        header: 'Updated Date',
        //sortablefield: 'modifiedDate',
      },
    ];
    this.actions = [];
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = { ...this.filtermodel, ...val };
    this.getUsers();
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
    this.getUsers();
  }
  getUsers() {
    this.reportService.ApplicationInfo(this.filtermodel).subscribe((x) => {
      this.configurationList = x.data;
      if (this.configurationList && this.configurationList.length > 0) {
        this.configurationList.forEach((r) => {
          r.declarationAcceptedstring =
            r.declarationAccepted ?? false ? 'YES' : 'NO';
          r.isNativeTamilNadustring =
            r.isNativeTamilNadu ?? false ? 'YES' : 'NO';
          r.isSelfstring = r.isSelf ?? false ? 'YES' : 'NO';
          r.isReEmployedstring = r.isReEmployed ?? false ? 'YES' : 'NO';
          r.isSubmittedstring = r.isSubmitted ?? false ? 'YES' : 'NO';
          r.typeOfTraining = (r.typeOfTraining as string).replaceAll('|', ', ');
        });
      }
      this.total = x.totalRecordCount;
    });
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
    } else if (val && val.type == 'EDIT') {
    } else if (val && val.type == 'ACTIVATE') {
    }
  }
  openView(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'view',
      val.record.applicationId,
    ]);
  }
}
