import { Component } from '@angular/core';
import { Actions, Column } from 'src/app/_models/datatableModel';
import { SuccessStatus } from 'src/app/_models/ResponseStatus';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-key-contacts',
  templateUrl: './key-contacts.component.html',
  styleUrls: ['./key-contacts.component.scss'],
})
export class KeyContactsComponent {
  contacts!: any[];
  roles!: any[];
  districts!: any[];
  selectdistricts!: any[];
  selectRoles: any[] = [];
  cols!: Column[];
  searchableColumns!: string[];
  actions: Actions[] = [];
  isDependent: boolean = false;
  title: string = 'Key Contacts';
  first: number = 0;
  rows: number = 10;
  total: number = 0;
  hasCode: boolean = false;
  defaultSortField: string = 'firstName';
  defaultSortOrder: number = 1;

  constructor(private userService: UserService) {}
  ngOnInit() {
    var appfilter = localStorage.getItem('KeyConatctsFilter');
    if (appfilter) {
      var filter = JSON.parse(appfilter);
      this.selectRoles = filter.roleIds;
      this.selectdistricts = filter.districtIds;
    }
    this.userService.Role_Get_Select_List().subscribe((x) => {
      this.roles = x.data;
    });

    this.userService.User_Filter_Dropdowns().subscribe((x) => {
      if (x) {
        this.districts = x.data.districtSelectList;
        // this.statuses = x.data.statusSelectList;
      }
    });
    this.getKeyContacts();

    this.cols = [
      {
        field: 'firstName',
        header: 'Name',
        sortablefield: 'firstName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'roleName',
        header: 'Role',
        sortablefield: 'roleName',
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
        field: 'mobile',
        header: 'Mobile',
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
        field: 'address',
        header: 'Address',
        sortablefield: 'address',
        isSortable: true,
        isSearchable: true,
      },
    ];
    this.searchableColumns = this.cols
      .filter((x) => x.isSearchable == true)
      .flatMap((x) => x.field);
  }
  change(event: any) {
    this.selectRoles = event;
    this.getKeyContacts();
  }
  changeDistricts(event: any) {
    this.selectdistricts = event;
    this.getKeyContacts();
  }
  getKeyContacts() {
    localStorage.setItem(
      'KeyConatctsFilter',
      JSON.stringify({
        roleIds: this.selectRoles,
        districtIds: this.selectdistricts,
      })
    );
    this.userService
      .Key_Contacts({
        roleIds: this.selectRoles,
        districtIds: this.selectdistricts,
      })
      .subscribe((c) => {
        this.contacts = c.data;
        this.total = c.totalRecordCount;
      });
  }
}
