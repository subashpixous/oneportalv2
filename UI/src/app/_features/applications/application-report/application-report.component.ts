import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import moment from 'moment';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import {
  ApplicationFilterModel,
  MemberFilterModel,
  NavigationModel,
  TableFilterModel,
} from 'src/app/_models/filterRequest';
import {
  MemberGridViewModel,
  OrganizationDetailFormModel,
} from 'src/app/_models/MemberDetailsModel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { RoleService } from 'src/app/services/role.service';
import { SchemeService } from 'src/app/services/scheme.Service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-application-report',
  templateUrl: './application-report.component.html',
  styleUrls: ['./application-report.component.scss'],
})
export class ApplicationReportComponent {
  configurationList!: MemberGridViewModel[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'Application Report';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'applicationNumber';
  defaultSortOrder: number = 0;

  filtermodel!: any;
  memberfilter!: MemberFilterModel;
  value: string[] = [];
  navigationModel: NavigationModel | undefined;
  formDetail!: OrganizationDetailFormModel;
  organizationForm!: FormGroup;
  maxDate: Date = moment(new Date()).toDate();
  minDate: Date = moment(new Date(2024, 0, 1)).toDate();
  get localbodyValue() {
    return this.organizationForm.get('local_Body')?.value;
  }
  get nameoflocalbodyValue() {
    return this.organizationForm.get('name_of_Local_Body')?.value;
  }
  get IsCoreSanitoryworkkerOrg() {
    if (
      this.formDetail &&
      this.formDetail.type_of_Work_SelectList &&
      this.organizationForm.get('type_of_Work')?.value
    ) {
      var type = this.formDetail.type_of_Work_SelectList.find(
        (x) => x.value == this.organizationForm.get('type_of_Work')?.value
      );
      return type && type.text.includes('Core Sanitary Workers');
    }
    return false;
  }
  // Updated By Sivasankar K on 14/01/2026 for Health Worker
   get IsHealthWorkerOrg() {
    if (
      this.formDetail &&
      this.formDetail.type_of_Work_SelectList &&
      this.organizationForm.get('type_of_Work')?.value
    ) {
      var type = this.formDetail.type_of_Work_SelectList.find(
        (x) => x.value == this.organizationForm.get('type_of_Work')?.value
      );
      return type && type.text.includes('Health Workers');
    }
    return false;
  }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private schemeService: SchemeService,
    private memberService: MemberService,
    private generalService: GeneralService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.memberService.Organization_Form_Get('').subscribe((x) => {
      if (x) {
        this.formDetail = x.data;
      }
    });
    this.cols = [
      {
        header: 'Member Id',
        field: 'member_Id',
        customExportHeader: 'Member Id',
        sortablefield: 'member_Id',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },
      {
        field: 'name',
        header: 'Name ',
        customExportHeader: 'Name',
        sortablefield: 'name',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'phone',
        header: 'Phone ',
        sortablefield: 'phone',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
        badgeCheckfield: 'lastAction',
      },
      {
        field: 'district',
        header: 'District',
        sortablefield: 'district',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedByName',
        header: 'Collected By Name',
        sortablefield: 'collectedByName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedByPhoneNumber',
        header: 'Collected By Phone Number',
        sortablefield: 'collectedByPhoneNumber',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'collectedOn',
        header: 'Collected On',
        sortablefield: 'collectedOn',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'isApprovalPending',
        header: 'Is Approval Pending',
        sortablefield: 'isApprovalPending',
        isSortable: true,
        isSearchable: false,
      },
      {
        field: 'updatedDate',
        header: 'Date',
        sortablefield: 'updatedDate',
        isSortable: true,
        isSearchable: false,
      },
    ];
    this.actions = [
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        isIcon: true,
        visibilityCheckFeild: 'canUpdate',
      },
      {
        icon: 'pi pi-arrow-right',
        title: 'Approve',
        type: 'APPROVE',
        isIcon: true,
        visibilityCheckFeild: 'canApprove',
      },
    ];

    this.organizationForm = new FormGroup({
      type_of_Work: new FormControl(null),
      core_Sanitary_Worker_Type: new FormControl(null),
      health_Worker_Type: new FormControl(null),
      organization_Type: new FormControl(null),
      district_Id: new FormControl(null),
      nature_of_Job: new FormControl(null),
      local_Body: new FormControl(null),
      name_of_Local_Body: new FormControl(null),
      zone: new FormControl(null),
      block: new FormControl(null),
      corporation: new FormControl(null),
      municipality: new FormControl(null),
      town_Panchayat: new FormControl(null),
      village_Panchayat: new FormControl(null),
      collectedByPhoneNumber: new FormControl(null),
      collectedByName: new FormControl(null),
      fromDate: new FormControl(null),
      toDate: new FormControl(null),
    });

    this.organizationForm.get('district_Id')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .General_Configuration_GetAreaList_ByDistrict(x)
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.local_Body_SelectList = x.data;
            }
          });
        this.generalService
          .Application_NameOfTheLocalBody_Select_Get('', x)
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.name_of_Local_Body_SelectList = x.data;
            }
          });
      } else {
        if (this.formDetail) {
          this.formDetail.local_Body_SelectList = x.data;
        }
      }
    });
    this.organizationForm.get('local_Body')?.valueChanges.subscribe((x) => {
      if (x && x == 'URBAN') {
        this.organizationForm.get('block')?.clearValidators();
        this.organizationForm.get('block')?.patchValue(null);
        this.organizationForm.get('village_Panchayat')?.clearValidators();
        this.organizationForm.get('village_Panchayat')?.patchValue(null);
        if (this.formDetail) {
          this.formDetail.block_SelectList = [];
        }
      } else if (
        x &&
        x == 'RURAL' &&
        this.organizationForm.get('district_Id')?.value &&
        this.organizationForm.get('district_Id')?.value != ''
      ) {
        this.organizationForm.get('corporation')?.clearValidators();
        this.organizationForm.get('corporation')?.patchValue(null);
        this.organizationForm.get('town_Panchayat')?.clearValidators();
        this.organizationForm.get('town_Panchayat')?.patchValue(null);
        this.organizationForm.get('municipality')?.clearValidators();
        this.organizationForm.get('municipality')?.patchValue(null);
        this.organizationForm.get('zone')?.clearValidators();
        this.organizationForm.get('zone')?.patchValue(null);

        this.organizationForm.get('name_of_Local_Body')?.clearValidators();
        this.organizationForm.get('name_of_Local_Body')?.patchValue(null);

        this.organizationForm.get('block')?.addValidators(Validators.required);
        this.organizationForm
          .get('village_Panchayat')
          ?.addValidators(Validators.required);
        this.organizationForm.updateValueAndValidity();
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.organizationForm.get('district_Id')?.value,
            CategoryCode: 'BLOCK',
          })
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.block_SelectList = x.data;
            }
          });
      } else {
        if (this.formDetail) {
          this.formDetail.block_SelectList = [];
        }
      }
    });

    this.organizationForm.get('type_of_Work')?.valueChanges.subscribe((x) => {
      if (x) {
        var type = this.formDetail?.type_of_Work_SelectList?.find(
          (x) => x.value == this.organizationForm.get('type_of_Work')?.value
        );
        if (type && type.text.includes('Core Sanitary Workers')) {
          this.organizationForm
            .get('core_Sanitary_Worker_Type')
            ?.addValidators(Validators.required);
          this.organizationForm.updateValueAndValidity();
        } else {
          this.organizationForm
            .get('core_Sanitary_Worker_Type')
            ?.clearValidators();
          this.organizationForm
            .get('core_Sanitary_Worker_Type')
            ?.patchValue(null);
        }
        // Updated By Sivasankar K on 14/01/2026 for Health Worker Type filter
        if (type && type.text.includes('Health Workers')) {
          this.organizationForm
            .get('health_Worker_Type')
            ?.addValidators(Validators.required);
          this.organizationForm.updateValueAndValidity();
        } else {
          this.organizationForm
            .get('health_Worker_Type')
            ?.clearValidators();
          this.organizationForm
            .get('health_Worker_Type')
            ?.patchValue(null);
        }
      }
    });
    this.organizationForm
      .get('organization_Type')
      ?.valueChanges.subscribe((x) => {
        if (x) {
          var type = this.formDetail?.organization_Type_SelectList?.find(
            (x) =>
              x.value == this.organizationForm.get('organization_Type')?.value
          );
          if (type && type.text == 'Private / தனியார்') {
            this.organizationForm
              .get('organisation_Name')
              ?.addValidators(Validators.required);
            this.organizationForm
              .get('designation')
              ?.addValidators(Validators.required);
            this.organizationForm
              .get('address')
              ?.addValidators(Validators.required);
            this.organizationForm.updateValueAndValidity();
          }
        } else {
          this.organizationForm.get('organisation_Name')?.patchValue(null);
          this.organizationForm.get('designation')?.patchValue(null);
          this.organizationForm.get('address')?.patchValue(null);
          this.organizationForm.get('organisation_Name')?.clearValidators();
          this.organizationForm.get('designation')?.clearValidators();
          this.organizationForm.get('address')?.clearValidators();
        }
      });
    this.organizationForm.get('block')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: this.organizationForm.get('block')?.value,
            CategoryCode: 'VILLAGEPANCHAYAT',
          })
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.village_Panchayat_SelectList = x.data;
            }
          });
      }
    });
    this.organizationForm
      .get('name_of_Local_Body')
      ?.valueChanges.subscribe((x) => {
        if (x && x == 'MUNICIPALITY') {
          this.organizationForm.get('corporation')?.clearValidators();
          this.organizationForm.get('corporation')?.patchValue(null);
          this.organizationForm.get('town_Panchayat')?.clearValidators();
          this.organizationForm.get('town_Panchayat')?.patchValue(null);
          this.organizationForm.get('zone')?.clearValidators();
          this.organizationForm.get('zone')?.patchValue(null);
          this.organizationForm.updateValueAndValidity();
          if (
            this.organizationForm.get('district_Id')?.value &&
            this.organizationForm.get('district_Id')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.organizationForm.get('district_Id')?.value,
                CategoryCode: 'MUNICIPALITY',
              })
              .subscribe((x) => {
                if (this.formDetail) {
                  this.formDetail.municipality_SelectList = x.data;

                  this.organizationForm
                    .get('municipality')
                    ?.addValidators(Validators.required);
                  this.organizationForm.updateValueAndValidity();
                }
              });
          }
        } else if (x && x == 'CORPORATION') {
          this.organizationForm.get('municipality')?.clearValidators();
          this.organizationForm.get('municipality')?.patchValue(null);
          this.organizationForm.get('town_Panchayat')?.clearValidators();
          this.organizationForm.get('town_Panchayat')?.patchValue(null);
          this.organizationForm.get('zone')?.clearValidators();
          this.organizationForm.get('zone')?.patchValue(null);
          this.organizationForm.updateValueAndValidity();
          if (
            this.organizationForm.get('district_Id')?.value &&
            this.organizationForm.get('district_Id')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.organizationForm.get('district_Id')?.value,
                CategoryCode: 'CORPORATION',
              })
              .subscribe((x) => {
                if (this.formDetail) {
                  this.formDetail.corporation_SelectList = x.data;
                  this.organizationForm
                    .get('corporation')
                    ?.addValidators(Validators.required);
                  this.organizationForm.updateValueAndValidity();
                }
                this.cdr.detectChanges();
                this.cdr.markForCheck();
              });
          }
        } else if (x && x == 'TOWNPANCHAYAT') {
          this.organizationForm.get('corporation')?.clearValidators();
          this.organizationForm.get('corporation')?.patchValue(null);
          this.organizationForm.get('municipality')?.clearValidators();
          this.organizationForm.get('municipality')?.patchValue(null);
          this.organizationForm.get('zone')?.clearValidators();
          this.organizationForm.get('zone')?.patchValue(null);
          this.organizationForm.updateValueAndValidity();
          if (
            this.organizationForm.get('district_Id')?.value &&
            this.organizationForm.get('district_Id')?.value != ''
          ) {
            this.generalService
              .getConfigurationDetailsInSelectListbyId({
                parentConfigId: this.organizationForm.get('district_Id')?.value,
                CategoryCode: 'TOWNPANCHAYAT',
              })
              .subscribe((x) => {
                if (this.formDetail) {
                  this.formDetail.town_Panchayat_SelectList = x.data;
                  this.organizationForm
                    .get('town_Panchayat')
                    ?.addValidators(Validators.required);
                  this.organizationForm.updateValueAndValidity();
                }
              });
          }
        } else if (x && x != '') {
          this.organizationForm.get('corporation')?.clearValidators();
          this.organizationForm.get('corporation')?.patchValue(null);
          this.organizationForm.get('municipality')?.clearValidators();
          this.organizationForm.get('municipality')?.patchValue(null);
          this.organizationForm.get('town_Panchayat')?.clearValidators();
          this.organizationForm.get('town_Panchayat')?.patchValue(null);
          this.organizationForm.get('zone')?.addValidators(Validators.required);
          this.organizationForm.updateValueAndValidity();
          this.organizationForm.updateValueAndValidity();
        }
      });
  }
  createmeeting(val: string) {
    this.router.navigate(['officers', 'user-create', val, 'EDIT']);
  }
  changefilter(val: TableFilterModel) {
    this.filtermodel = {
      ...this.filtermodel,
      // ...val,
    skip: val.skip ?? 0,
    take: val.take ?? this.rows,
    searchString: val.searchString ?? null,
    columnSearch: val.columnSearch ?? [],
      where: {
        districtIds: null,
        cardstatusId:null,
        type_of_Work: this.organizationForm.get('type_of_Work')?.value,
        core_Sanitary_Worker_Type: this.organizationForm.get(
          'core_Sanitary_Worker_Type'
        )?.value,
           health_Worker_Type: this.organizationForm.get(
          'health_Worker_Type'
        )?.value,
        organization_Type:
          this.organizationForm.get('organization_Type')?.value,
        nature_of_Job: this.organizationForm.get('nature_of_Job')?.value,
        local_Body: this.organizationForm.get('local_Body')?.value,
        name_of_Local_Body:
          this.organizationForm.get('name_of_Local_Body')?.value,
        zone: this.organizationForm.get('zone')?.value,
        block: this.organizationForm.get('block')?.value,
        village_Panchayat:
          this.organizationForm.get('village_Panchayat')?.value,
        corporation: this.organizationForm.get('corporation')?.value,
        municipality: this.organizationForm.get('municipality')?.value,
        town_Panchayat: this.organizationForm.get('town_Panchayat')?.value,
        district_Id: this.organizationForm.get('district_Id')?.value,
        isApprovalPending: false,
        isActive: true,
        year: '',
        collectedByPhoneNumber: this.organizationForm.get(
          'collectedByPhoneNumber'
        )?.value,
        collectedByName: this.organizationForm.get('collectedByName')?.value,
        fromDate: this.organizationForm.get('fromDate')?.value,
        toDate: this.organizationForm.get('toDate')?.value,
      },
    };
    this.getApplications();
    console.log("filter",this.filtermodel);
    //  this.saveApplicationFilterState();

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
    this.getApplications();
  }
  getApplications() {
    localStorage.setItem(
      'DailyApplicationFilter',
      JSON.stringify(this.memberfilter)
    );
    this.schemeService.Member_GetList(this.memberfilter).subscribe((c) => {
      this.configurationList = c.data;
      this.total = c.totalRecordCount;
      this.configurationList.map((x) => {
        x.isApprovalPending = x.isApprovalPending == '1' ? 'YES' : 'NO';
      });
    });
  }
  reset() {
    this.organizationForm.reset();
    this.generate();
  }
  generate() {
    this.memberfilter = {
      ...this.filtermodel,
      where: {
        cardstatusId:null,
        type_of_Work: this.organizationForm.get('type_of_Work')?.value,
        core_Sanitary_Worker_Type: this.organizationForm.get(
          'core_Sanitary_Worker_Type'
        )?.value,
        health_Worker_Type: this.organizationForm.get(
          'health_Worker_Type'
        )?.value,
        organization_Type:
          this.organizationForm.get('organization_Type')?.value,
        nature_of_Job: this.organizationForm.get('nature_of_Job')?.value,
        local_Body: this.organizationForm.get('local_Body')?.value,
        name_of_Local_Body:
          this.organizationForm.get('name_of_Local_Body')?.value,
        zone: this.organizationForm.get('zone')?.value,
        block: this.organizationForm.get('block')?.value,
        village_Panchayat:
          this.organizationForm.get('village_Panchayat')?.value,
        corporation: this.organizationForm.get('corporation')?.value,
        municipality: this.organizationForm.get('municipality')?.value,
        town_Panchayat: this.organizationForm.get('town_Panchayat')?.value,
        district_Id: this.organizationForm.get('district_Id')?.value,
        isApprovalPending: false,
        isActive: true,
        year: '',
        collectedByPhoneNumber: this.organizationForm.get(
          'collectedByPhoneNumber'
        )?.value,
        collectedByName: this.organizationForm.get('collectedByName')?.value,
        fromDate: this.organizationForm.get('fromDate')?.value,
        toDate: this.organizationForm.get('toDate')?.value,
        districtIds: null,
      },
    };
    this.getApplications();
  }
  actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'view',
      val.record.applicationId,
    ]);
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'VIEW') {
      this.router.navigate([
        'officers',
        'applications',
        'view',
        val.record.applicationId,
      ]);
    } else if (val && val.type == 'EDIT') {
      this.router.navigate([
        'officers',
        'applications',
        'edit',
        val.record.applicationId,
        '0',
      ]);
    } else if (val && val.type == 'APPROVE') {
      this.router.navigate([
        'officers',
        'applications',
        'approve',
        val.record.applicationId,
      ]);
    } else if (val && val.type == 'PRINT') {
      this.router.navigate([
        'officers',
        'applications',
        'view-print',
        val.record.applicationId,
      ]);
    }
  }
  cf() {
    this.router.navigate(['officers', 'applications', 'update-approval', 'd']);
  }
  download() {
    var fileUrl = `${environment.apiUrl}/Report/GetAllMemberAsExcel`;
    this.generalService
      .DocumentsDownloadPost(fileUrl, {
        year: '2023-2027',
        districtIds: [],
      })
      .subscribe(async (event) => {
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], {
          type: data.body?.type,
        });
        if (downloadedFile.type != '') {
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.download = 'MemberReport_' + Guid.raw();
          a.href = URL.createObjectURL(downloadedFile);
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
        }
      });
  }
}
