import { Component, OnInit, OnDestroy } from '@angular/core';
import { SchemeService } from 'src/app/services/scheme.Service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApplicationFilterModel } from 'src/app/_models/filterRequest';
import { GeneralService } from 'src/app/services/general.service';
import { Router } from '@angular/router';
import { ActionModel, Actions, Column } from 'src/app/_models/datatableModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-saved-deletion',
  templateUrl: './saved-deletion.component.html',
  styleUrls: ['./saved-deletion.component.scss']
})
export class SavedDeletionComponent implements OnInit, OnDestroy {
  // Data
  Math = Math;
  applications: any[] = [];
  selectedApplications: any[] = [];

  // Filters
  searchText: string = '';

  // UI State
  loading: boolean = false;
  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;
  currentPage: number = 1;

  // Search
  private searchSubject = new Subject<string>();

  // Destroy subject
  private destroy$ = new Subject<void>();

  // SAVED status ID and CODE
  private savedStatusId: string = '43ea8ff6-043a-eccd-d9a0-95841bcb48e1';
  private savedStatusCode: string = 'SAVED';

  // Tabs
  mainOptions: any[] = [
    { name: 'Active Saved Application', value: 'ACTIVE' },
    { name: 'Trashed Application', value: 'TRASH' }
  ];
  mainValue: string = 'ACTIVE';

  // Datatable
  cols!: Column[];
  actions: Actions[] = [];
  searchableColumns!: string[];
  defaultSortField: string = 'ModifiedDate';
  defaultSortOrder: number = 0;

  // User info
  dd: any;
  local: any;

  constructor(
    private schemeService: SchemeService,
    private generalService: GeneralService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.dd = this.accountService.userValue;
    this.local = this.dd?.userDetails || {};

    this.setupSearch();
    this.loadSavedStatusId();
    this.initializeDatatable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize datatable columns and actions
   */
  private initializeDatatable(): void {
    this.cols = [
      {
        field: 'applicationNumber',
        header: 'Application No.',
        customExportHeader: 'Application No.',
        sortablefield: 'applicationNumber',
        isSortable: true,
        isSearchable: true,
        isActionable: true,
      },
      {
        field: 'firstName',
        header: 'Applicant Name',
        sortablefield: 'firstName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'scheme',
        header: 'Scheme',
        sortablefield: 'scheme',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'districtName',
        header: 'District',
        sortablefield: 'districtName',
        isSortable: true,
        isSearchable: true,
      },
      {
        field: 'status',
        header: 'Status',
        sortablefield: 'status',
        isSortable: true,
        isSearchable: true,
        isBadge: true,
      },
      {
        field: 'date',
        header: 'Saved Date',
        sortablefield: 'date',
        isSortable: true,
        isSearchable: false,
      }
    ];

    // Actions for active tab
    this.actions = [
      {
        icon: 'pi pi-eye',
        title: 'View',
        type: 'VIEW',
        isIcon: true,
        visibilityCheckFeild: 'canView',
      },
      {
        icon: 'pi pi-pencil',
        title: 'Edit',
        type: 'EDIT',
        isIcon: true,
        visibilityCheckFeild: 'canUpdate',
      },
      {
        icon: 'pi pi-trash',
        title: 'Move to Trash',
        type: 'DELETE',
        isIcon: true,

      }
    ];

    this.searchableColumns = ['applicationNumber', 'firstName', 'scheme', 'districtName', 'status'];
  }

  /**
   * Load the SAVED status ID from configuration
   */
  private loadSavedStatusId(): void {
    this.generalService
      .getConfigurationDetailsInSelectListbyId({ CategoryCode: 'STATUS' })
      .subscribe({
        next: (x) => {
          const savedStatus = x.data?.find((s: any) =>
            s.text?.includes('Saved') ||
            s.code === 'SAVED' ||
            s.value?.toLowerCase()?.includes('saved') ||
            s.text?.toLowerCase()?.includes('saved')
          );

          if (savedStatus) {
            this.savedStatusId = savedStatus.value;
            this.loadApplications();
          } else {
            console.error('SAVED status not found in configuration');
            this.showMessage('error', 'Error', 'SAVED status not found in system configuration');
          }
        },
        error: (err) => {
          console.error('Error loading status configuration:', err);
          this.showMessage('error', 'Error', 'Failed to load status configuration');
        }
      });
  }

  /**
   * Setup debounced search
   */
  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.first = 0;
        this.currentPage = 1;
        this.loadApplications();
      });
  }

  /**
   * Load saved applications based on active tab
   */
  loadApplications(): void {
    if (!this.savedStatusId) {
      return;
    }

    this.loading = true;
    this.selectedApplications = [];

    // Get current financial year
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const financialYear = month >= 4
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;

    // Determine if we're showing active or trashed apps
    const showInactiveOnly = this.mainValue === 'TRASH';

    // Create the filter
    const filter: ApplicationFilterModel = {
      searchString: this.searchText || null,
      skip: (this.currentPage - 1) * this.rows,
      take: this.rows,
      sorting: {
        fieldName: this.defaultSortField,
        sort: 'DESC'
      },
      columnSearch: [],
      where: {
        userId: '',
        schemeIds: [],
        districtIds: [],
        statusIds: [this.savedStatusId],
        isExpired: false,
        year: financialYear,
        isBulkApprovalGet: false,
        showInactiveOnly: showInactiveOnly
      }
    };

    this.schemeService.User_Application_GetList(filter)
      .subscribe({
        next: (response) => {
          if (response.status?.toUpperCase() === 'SUCCESS') {
            this.applications = response.data || [];
            this.totalRecords = response.totalRecordCount || 0;

            // Update actions based on tab
            this.updateActions();
          } else {
            this.showMessage('error', 'Error', response.message || 'Failed to load applications');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.showMessage('error', 'Error', 'Failed to load applications. Please try again.');
          this.loading = false;
        }
      });
  }

  /**
   * Update actions based on active tab
   */
  private updateActions(): void {
    if (this.mainValue === 'ACTIVE') {
      this.actions = [
        // {
        //   icon: 'pi pi-eye',
        //   title: 'View',
        //   type: 'VIEW',
        //   isIcon: true,
        //   visibilityCheckFeild: 'canView',
        // },
        // {
        //   icon: 'pi pi-pencil',
        //   title: 'Edit',
        //   type: 'EDIT',
        //   isIcon: true,
        //   visibilityCheckFeild: 'canUpdate',
        // },
        {
          icon: 'pi pi-trash',
          title: 'Move to Trash',
          type: 'DELETE',
          isIcon: true,

        }
      ];
    } else {
      this.actions = [
        {
          icon: 'pi pi-refresh',
          title: 'Restore',
          type: 'RESTORE',
          isIcon: true,
        }
      ];
    }
  }

  /**
   * Handle tab change
   */
  generateMainFilter(): void {
    this.first = 0;
    this.currentPage = 1;
    this.selectedApplications = [];
    this.loadApplications();
  }

  /**
   * Handle datatable actions
   */
  actioInvoked(val: ActionModel): void {
    if (val && val.type === 'VIEW') {
      this.viewApplication(val.record);
    } else if (val && val.type === 'EDIT') {
      this.editApplication(val.record);
    } else if (val && val.type === 'DELETE') {
      this.selectedApplications = [val.record];
      this.moveToTrash();
    } else if (val && val.type === 'RESTORE') {
      this.selectedApplications = [val.record];
      this.restoreApplications();
    }
  }

  /**
   * Handle filter changes from datatable
   */
  changefilter(val: any): void {
    this.searchText = val.searchString || '';
    this.first = val.skip || 0;
    this.rows = val.take || 10;
    this.loadApplications();
  }

  /**
   * Handle action buttons from datatable header
   */
actionalAction(val: ActionModel) {
    this.router.navigate([
      'officers',
      'applications',
      'view',
      val.record.applicationId,
    ]);
  }

  /**
   * Page change handler
   */
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.currentPage = Math.floor(this.first / this.rows) + 1;
    this.loadApplications();
  }

  /**
   * Search handler
   */
  onSearch(): void {
    this.searchSubject.next(this.searchText);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchText = '';
    this.onSearch();
  }

  /**
   * View application details
   */
  viewApplication(application: any): void {
    if (application?.applicationId) {
      this.router.navigate(['/applicant/mem-detail', application.applicationId, 'VIEW']);
    }
  }

  /**
   * Edit application
   */
  editApplication(application: any): void {
    if (application?.applicationId) {
      this.router.navigate(['/applicant/mem-detail', application.applicationId, 'EDIT']);
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(application: any): string {
    if (this.isExpired(application)) {
      return 'danger';
    }
    return this.mainValue === 'TRASH' ? 'warning' : 'info';
  }

  /**
   * Move selected applications to trash
   */
// Update the moveToTrash() method (around line 280-320):
moveToTrash(): void {
  if (!this.selectedApplications || this.selectedApplications.length === 0) {
    this.showMessage('warn', 'No Selection', 'Please select applications to move to trash.');
    return;
  }

  const selectedCount = this.selectedApplications.length;
  const request = {
    applicationIds: this.selectedApplications.map(app => app.applicationId)
  };

  this.confirmationService.confirm({
    message: `Are you sure you want to move ${selectedCount} selected application(s) to trash?`,
    header: 'Confirm Move to Trash',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.loading = true;

      this.schemeService.moveToTrash(request).subscribe({
        next: (response) => {
          this.loading = false;

          // ✅ FIX: Check response status properly
         if (response?.status?.toString().toUpperCase() === 'SUCCESS')
 {
            this.showMessage('success', 'Success',
              `${selectedCount} application(s) moved to trash successfully.`);

                     this.selectedApplications = [];
            this.first = 0;
            this.currentPage = 1;

            // Small delay to force UI refresh
            setTimeout(() => this.loadApplications(), 150);
          } else {
            // Show error message from response or default
            const errorMsg = response?.message || 'Failed to move applications to trash.';
            this.showMessage('error', 'Error', errorMsg);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error moving to trash:', error);
          this.showMessage('error', 'Error', 'Failed to move applications to trash. Please try again.');
        }
      });
    }
  });
}

// Update the restoreApplications() method (around line 330-370):
restoreApplications(): void {
  if (!this.selectedApplications || this.selectedApplications.length === 0) {
    this.showMessage('warn', 'No Selection', 'Please select applications to restore.');
    return;
  }

  const selectedCount = this.selectedApplications.length;
  const request = {
    applicationIds: this.selectedApplications.map(app => app.applicationId)
  };

  this.confirmationService.confirm({
    message: `Are you sure you want to restore ${selectedCount} selected application(s) from trash?`,
    header: 'Confirm Restoration',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.loading = true;

      this.schemeService.restoreFromTrash(request).subscribe({
        next: (response) => {
          this.loading = false;

          // ✅ FIX: Check response status properly
        if (response?.status?.toString().toUpperCase() === 'SUCCESS')
 {
            this.showMessage('success', 'Success',
              `${selectedCount} application(s) restored successfully.`);

          this.selectedApplications = [];
            this.first = 0;
            this.currentPage = 1;

            // Delay to allow UI to refresh
            setTimeout(() => this.loadApplications(), 150);
          } else {
            // Show error message from response or default
            const errorMsg = response?.message || 'Failed to restore applications.';
            this.showMessage('error', 'Error', errorMsg);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error restoring applications:', error);
          this.showMessage('error', 'Error', 'Failed to restore applications. Please try again.');
        }
      });
    }
  });
}

  /**
   * Check if any applications are selected
   */
  hasSelected(): boolean {
    return this.selectedApplications.length > 0;
  }

  onSelectedApplications(selectedApps: any[]): void {
  this.selectedApplications = selectedApps;
  console.log('Selected applications:', this.selectedApplications.length);
}
// Add this method to clear selected applications:
clearSelection(): void {
  this.selectedApplications = [];
  // You might need to trigger an event to clear checkboxes in datatable
}
  /**
   * Get count of selected applications
   */
  getSelectedCount(): number {
    return this.selectedApplications.length;
  }

  /**
   * Show message
   */
// Change this method from private to public:
showMessage(severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string): void {
  this.messageService.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: 5000
  });
}

  /**
   * Get full name
   */
  getFullName(application: any): string {
    if (application.firstName && application.lastName) {
      return `${application.firstName} ${application.lastName}`;
    } else if (application.firstName) {
      return application.firstName;
    } else if (application.lastName) {
      return application.lastName;
    } else if (application.name) {
      return application.name;
    }
    return 'N/A';
  }

  /**
   * Format date
   */
  formatDate(date: any): string {
    if (!date) return 'N/A';

    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';

      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }

  /**
   * Check if SAVED application is expired
   */
  isExpired(application: any): boolean {
    if (application.isExpired === true) {
      return true;
    }

    if (application.date) {
      try {
        const savedDate = new Date(application.date);
        const today = new Date();

        if (isNaN(savedDate.getTime())) {
          return false;
        }

        const diffTime = today.getTime() - savedDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
      } catch (e) {
        return false;
      }
    }

    return false;
  }
}
