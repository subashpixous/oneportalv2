import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Actions, ActionModel, Column } from 'src/app/_models/datatableModel';
import { TableFilterModel } from 'src/app/_models/filterRequest';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { UserService } from 'src/app/services/user.service';
import { privileges } from 'src/app/shared/commonFunctions';

@UntilDestroy()
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  configurationList!: any[];
  cols!: Column[];
  catgories!: any[];
  searchableColumns!: string[];
  currentStatus: boolean = true;

  actions: Actions[] = [];
  title: string = 'User';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  defaultSortField: string = 'userNumber';
  defaultSortOrder: number = 1;

  filtermodel!: any;
  privleges = privileges;
  value: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.cols = [
      // {
      //   field: 'userNumber',
      //   header: 'User Number',
      //   customExportHeader: 'User Number',
      //   sortablefield: 'userNumber',
      //   isSortable: true,
      //   isSearchable: true,
      // },
      {
        field: 'firstName',
        header: 'Name',
        customExportHeader: 'Name',
        sortablefield: 'firstName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'email',
        header: 'Email',
        sortablefield: 'email',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'dob',
        header: 'Date of Birth',
        sortablefield: 'dob',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'roleName',
        header: 'Role Name',
        sortablefield: 'roleName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'mobile',
        header: 'Phone',
        sortablefield: 'mobile',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'telephone',
        header: 'Telephone',
        sortablefield: 'telephone',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'lastUpdatedUserName',
        header: 'Updated By',
        sortablefield: 'lastUpdatedUserName',
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
        privilege: [privileges.USER_UPDATE],
      },
      {
        icon: 'pi pi-times',
        title: 'In-Activate',
        type: 'INACTIVATE',
        isIcon: true,
        privilege: [privileges.USER_Delete],
      },
    ];
  }

  createmeeting(val: string) {
    this.router.navigate(['officers', 'user-create', val, 'EDIT']);
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
    this.userService
      .GetUserList(this.filtermodel)
      .pipe(untilDestroyed(this))
      .subscribe((x) => {
        this.configurationList = x.data;
        this.total = x.totalRecordCount;
      });
  }
  actioInvoked(val: ActionModel) {
    if (val && val.type == 'INACTIVATE') {
      this.userService
        .SaveUser({ ...val.record, isActive: false })
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
              detail: 'In-Activated Successfully',
            });
            this.getUsers();
          }
        });
    } else if (val && val.type == 'EDIT') {
      this.createmeeting(val.record.userId);
    } else if (val && val.type == 'ACTIVATE') {
      this.userService.User_Activate(val.record.userId).subscribe((x) => {
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
            detail: 'In-Activated Successfully',
          });
          this.getUsers();
        }
      });
    }
  }
}
