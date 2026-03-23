import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActionModel } from 'src/app/_models/datatableModel';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-find-duplicates',
  templateUrl: './find-duplicates.component.html',
  styleUrls: ['./find-duplicates.component.scss']
})
export class FindDuplicatesComponent {
 exportedData: any[] = [];  //modified by Sivasankar on 31-10-2025 for export functionality
  filtermodel: any = {};
  configurationList: any[] = [];
  total: number = 0;
  rows: number = 10;
  cols: any[] = [];
  actions: any[] = [];
  selectedRows: any[] = [];

  districts: any[] = [];
  selectedDistricts: any[] = [];

  constructor(
     private router: Router,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'memberCode', header: 'Member Id',sortablefield:'memberCode', isSortable: true,   },
      { field: 'fullName', header: 'Full Name',sortablefield:'fullName', isSortable: true,   isActionable: true  },
      { field: 'modifiedDate', header: 'ModifiedDate',sortablefield:'modifiedDate', isSortable: true,  },
      { field: 'phoneNumber', header: 'Phone Number',sortablefield:'phoneNumber', isSortable: true,   },
      { field: 'aadhaarNumber', header: 'Aadhaar Number',sortablefield:'aadhaarNumber', isSortable: true,   },
      { field: 'district', header: 'District',sortablefield:'district', isSortable: true,   },
      { field: 'organizationType', header: 'Organization Type',sortablefield:'organizationType', isSortable: true,   }
    ];

    this.actions = [
    
      { icon: 'pi pi-times', title: 'Delete', type: 'DELETE', isIcon: true }
    ];

    // Initialize filter model
    this.filtermodel = {
      where: { districtIds: [], memberId: '', phoneNumber: '', memberCode: '', fullName: '', aadhaarNumber: '', district: '', organizationType: '' },
      searchString: null,
      sorting: { fieldName: 'memberCode', sort: 'ASC' },
      take: 10,
      skip: 0
    };
   this.selectedDistricts = this.filtermodel.where?.districtIds || [];
    // Load district list
    this.userService.MemberCardApprovalGridFilter().subscribe((res) => {
      if (res && res.data) this.districts = res.data.districtList || [];
    });

    // Load initial data
    this.getDuplicateMembers();
  }

  changefilter(val: any) {
    this.filtermodel = {
      ...this.filtermodel,
      skip: val.skip ?? 0,
      take: val.take ?? 10,
      searchString: val.searchString?.trim() || null,
      columnSearch: val.columnSearch || null,
      sorting: val.sorting || { fieldName: 'memberCode', sort: 'ASC' },
      where: {
        ...this.filtermodel.where,
        districtIds: this.selectedDistricts ?? [],
      }
    };

    this.getDuplicateMembers();
  }

  onSelectedApplications(selected: any[]) {
    this.selectedRows = selected;
  }

  deleteMembers(Ids: string[]) {
  if (!Ids || !Ids.length) return;

  const payload = { MemberIds: Ids };

    
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete selected member(s)?',
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
  this.userService.RemoveDuplicateMembers(payload).subscribe({
    

        next: () => {
          console.log('Delete successful');
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Member(s) deleted successfully'
          });
          this.getDuplicateMembers(); // reload grid
          this.selectedRows = []; // clear selected rows
        },
        
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete member(s)'
          });
          console.error('Delete error', err);
        }
      });
    },
    reject: () => {
      // optional reject action
    }
  });
}


actioInvoked(event: ActionModel) {
 
  if (event.type === 'DELETE') {
    this.deleteMembers([event.record.id]); 
    // or event.record.Id ?
  }

}
actionalAction(event: ActionModel) {

  if (event.type === 'DELETE') {
    this.deleteMembers([event.record.id]); // or event.record.Id ?
  
  }
  
  else  {
   
          this.router.navigate([
      'officers',
      'applications',
      'member-view',
      event.record.id,
    ]);
  }
}



  

  deleteSelectedRows() {
   
    this.deleteMembers(this.selectedRows.map(r => r.id));
  }

  getDuplicateMembers() {
    this.userService.DuplicateMemberGridGet(this.filtermodel).subscribe({
      next: (res) => {
        this.configurationList = res.data ?? [];
        this.total = res.totalRecordCount ?? this.configurationList.length;
      },
      error: (err) => {
        console.error(err);
        this.configurationList = [];
        this.total = 0;
      }
    });
  }

  //modified by Sivasankar on 31-10-2025 for export functionality
      onExportRequest(type: string) {
  

  const exportFilter = { ...this.filtermodel, skip: 0, take: this.total };
    this.userService.DuplicateMemberGridGet(exportFilter)
      .subscribe((c) => {
        this.exportedData = c.data;
        
       
      });
        

}

onClearDistricts() {
  this.selectedDistricts = [];
  this.filtermodel.where = {
    ...this.filtermodel.where,
    districtIds: []
  };
  this.getDuplicateMembers();
}

onDistrictChange() {
  this.filtermodel.where = {
    ...this.filtermodel.where,
    districtIds: this.selectedDistricts ?? []
  };

  this.getDuplicateMembers();
}
}
