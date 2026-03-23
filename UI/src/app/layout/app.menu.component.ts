import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { privileges } from '../shared/commonFunctions';
import { query } from '@angular/animations';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];
  permissions: any[] = [];

  permissionsObject: any = '';
  constructor(
    public layoutService: LayoutService,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    this.permissionsService.permissions$.subscribe(
      (x) => (this.permissionsObject = x)
    );
    this.model = [
      {
        label: 'Home',
        ngxPermissionsOnly: [privileges.DASHBOARD_VIEW],
        items: [
          {
            label: 'Dashboard',
            ngxPermissionsOnly: [privileges.DASHBOARD_VIEW],
            icon: 'pi pi-fw pi-home',
            routerLink: ['/officers'],
          },
          {
            label: 'Card Dashboard',
            ngxPermissionsOnly: [privileges.CARD_DASHBOARD_VIEW],
            icon: 'pi pi-id-card',
            routerLink: ['/officers/id-card-status'],
          },
        ],
      },
      {
        label: 'Operations',
        ngxPermissionsOnly: [
          privileges.APPLICATION_VIEW,
          privileges.APPLICATION_MEMBER_VIEW,
          privileges.CALLLETTER_VIEW,
          privileges.REPORT_VIEW,
        ],
        items: [
          // {
          //   label: 'Applications',
          //   icon: 'pi pi-book',
          //   routerLink: ['/officers/applications/applications'],
          //   routerLinkActiveOptions: '{exact:true}',
          //   ngxPermissionsOnly: [
          //     privileges.APPLICATION_VIEW,
          //     privileges.APPLICATION_MEMBER_VIEW,
          //   ],
          // },
          {
  label: 'Application',
  icon: 'pi pi-book',

  ngxPermissionsOnly: [
    privileges.APPLICATION_VIEW,
    privileges.APPLICATION_MEMBER_VIEW
  ],
  items: [
     {
      label: 'Applications',
      icon: 'pi pi-angle-right',
      routerLink: ['/officers/applications'],
      routerLinkActiveOptions: '{exact:true}',
      ngxPermissionsOnly: [privileges.APPLICATION_VIEW]
    },
    {
      label: 'Approvals',
      icon: 'pi pi-angle-right',
      routerLink: ['/officers/applications'],
      queryParams: { Approvalstatus: 'Approvals' },
      routerLinkActiveOptions: '{exact:true}',
       ngxPermissionsOnly: [privileges.MEMBER_APPROVE],
    },
    {
      label: 'Approved',
      icon: 'pi pi-check',
      routerLink: ['/officers/applications'],
      queryParams: { status: 'COMPLETED' },
      routerLinkActiveOptions: '{exact:true}',
       ngxPermissionsOnly: [privileges.MEMBER_APPROVE],
    },
    {
      label: 'Returned',
      icon: 'pi pi-replay',
      routerLink: ['/officers/applications'],
      queryParams: { status: 'RETURNED' },
     routerLinkActiveOptions: '{exact:true}',
       ngxPermissionsOnly: [privileges.MEMBER_APPROVE],
    }
  ]
},
          // {
          //   label: 'Member Approvals',
          //   icon: 'pi pi-angle-double-right',
          //   routerLink: ['/officers/applications/approval'],
          //   routerLinkActiveOptions: '{exact:true}',
          //   ngxPermissionsOnly: [privileges.MEMBER_APPROVE],
          // },
          {
            label: 'Member Approval History',
            icon: 'pi pi-history',
            routerLink: ['/officers/applications/approval-history'],
            routerLinkActiveOptions: '{exact:true}',
            ngxPermissionsOnly: [privileges.MEMBER_APPROVAL_HISTORY],
          },
          // {
          //   label: 'Requested for Print',
          //   icon: 'pi pi-id-card',
          //   routerLink: ['/officers/applications/card-approval'],
          //   routerLinkActiveOptions: '{exact:true}',
          //   ngxPermissionsOnly: [privileges.CARD_APPROVAL_VIEW],
          // },
          {
            label: 'Daily Application Report',
            icon: 'pi pi-fw pi-chart-bar',
            routerLink: ['/officers/applications/daily-report'],
            routerLinkActiveOptions: '{exact:true}',
            ngxPermissionsOnly: [privileges.MEMBER_DAILY_ENTRY],
          },
          {
            label: 'Call Letter',
            icon: 'pi pi-fw pi-calendar',
            routerLink: ['/officers/call-letter'],
            routerLinkActiveOptions: '{exact:true}',
            ngxPermissionsOnly: [privileges.CALLLETTER_VIEW],
          },
          {
            label: 'Bulk Approvals',
            icon: 'pi pi-fw pi-arrow-right',
            routerLink: ['/officers/bulk-approvals'],
            routerLinkActiveOptions: '{exact:true}',
            ngxPermissionsOnly: [privileges.CALLLETTER_VIEW],
          },
          {
            label: 'Key Contacts',
            icon: 'pi pi-fw pi-phone',
            routerLink: ['/officers/key-contacts'],
          },
          {
            label: 'Find Duplicates',
            icon: 'pi pi-fw pi-search',
            routerLink: ['/officers/duplicates'],
            routerLinkActiveOptions: '{exact:true}',
            ngxPermissionsOnly: [privileges.Remove_Duplicates],
          },
          {
  label: 'Saved Deletion',
  icon: 'pi pi-fw pi-trash',
  routerLink: ['/officers/saved-deletion'],
  // routerLinkActiveOptions: '{exact:true}',
  // ngxPermissionsOnly: [privileges.REPORT_VIEW],
},

          // {
          //   label: 'Report',
          //   icon: 'pi pi-fw pi-chart-bar',
          //   routerLink: ['/officers/report'],
          //   ngxPermissionsOnly: [privileges.REPORT_VIEW],
          // },
          // {
          //   label: 'Summary',
          //   icon: 'pi pi-fw pi-chart-line',
          //   routerLink: ['/officers/report/summary'],
          //   ngxPermissionsOnly: [privileges.REPORT_VIEW],
          // },

          {
            label: 'Reports',
            ngxPermissionsOnly: [
              // privileges.CONFIG_VIEW,
              // privileges.ROLE_VIEW,
              // privileges.APPLICATION_PRIVILEGE_VIEW,
              // privileges.USER_VIEW,
              // privileges.APPROVALFLOW_VIEW,
              privileges.MEMBER_REPORT_VIEW,
              privileges.SCHEME_REPORT_VIEW,
              privileges.REPORT_VIEW,
              privileges.MEMBER_REPORT_VIEW,
              privileges.ANIMATOR_REPORT_VIEW,
            ],
            icon: 'pi pi-fw pi-chart-bar',
            items: [
              {
                label: 'Member Report',
                icon: 'pi pi-fw pi-users',
                ngxPermissionsOnly: [privileges.MEMBER_REPORT_VIEW],
                routerLink: ['/officers/applications-reports/applications'],
                queryParams: { mainvalue: 'MEMBER' },
                routerLinkActiveOptions: { exact: true },
              },
              {
                label: 'Scheme Report',
                icon: 'pi pi-fw pi-th-large',
                ngxPermissionsOnly: [privileges.SCHEME_REPORT_VIEW],
                routerLink: ['/officers/applications-reports/applications'],
                queryParams: { mainvalue: 'SCHEME' },
                routerLinkActiveOptions: '{exact:true}',
              },

              {
                label: 'GCC Report',
                icon: 'pi pi-fw pi-file',
                routerLink: ['/officers/report/gccreport'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'District Wise Report',
                icon: 'pi pi-fw pi-file-pdf',
                routerLink: ['/officers/report/districtwisecount'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'CoreSanitary Workers Report',
                icon: 'pi pi-fw pi-book',
                routerLink: ['/officers/report/coresanitaryworkers'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'Consolidated Reports',
                icon: 'pi pi-fw pi-table',
                routerLink: ['/officers/report/reports'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'Card Collection Report',
                icon: 'pi pi-id-card',
                routerLink: ['/officers/report/card-collection'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'Print Report',
                icon: 'pi pi-print',
                routerLink: ['/officers/report/printcard'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'Member Scheme Report',
                icon: 'pi pi-users',
                routerLink: ['/officers/report/memberapplyscheme'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'Scheme GCC Report',
                icon: 'pi pi-building',
                routerLink: ['/officers/report/gccscheme'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'Scheme Cost Report',
                icon: 'pi pi-dollar',
                routerLink: ['/officers/report/gcccost'],
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
              {
                label: 'Datewise Appoval Report',
                icon: 'pi pi-calendar-minus',
                routerLink: ['/officers/report/Date-wise-approval-history'],
                ngxPermissionsOnly: [privileges.ANIMATOR_REPORT_VIEW],
              },
              // [29-Oct-2025] Updated by Sivasankar K: Modified to fetch Animator entries
              {
                label: 'Animator Entries Report',
                icon: 'pi pi-fw pi-list',
                routerLink: ['/officers/Animator-Entries'],
                routerLinkActiveOptions: '{exact:true}',
                ngxPermissionsOnly: [privileges.ANIMATOR_REPORT_VIEW],
              },
              // Updated by sivasankar On 11/12/2025 for user log report
                   {
                label: 'Full Log History',
                icon: 'pi pi-users',
                routerLink: ['/officers/User-log-report'],
                routerLinkActiveOptions: '{exact:true}',
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },
                {
                label: 'User Last Activity Report',
                icon: 'pi pi-users',
                routerLink: ['/officers/Log-report'],
                routerLinkActiveOptions: '{exact:true}',
                ngxPermissionsOnly: [privileges.REPORT_VIEW],
              },

              // {
              //   label: 'Report',
              //   icon: 'pi pi-fw pi-chart-bar',
              //   routerLink: ['/officers/report'],
              //   ngxPermissionsOnly: [privileges.REPORT_VIEW],
              // },
            ],
          },

          {
            label: 'Card Status',
            icon: 'pi pi-fw pi-credit-card',
            ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
            items: [
              {
                label: 'Requested for Print',
                icon: 'pi pi-id-card',
                routerLink: ['/officers/applications/card-approval'],
                routerLinkActiveOptions: '{exact:true}',
                ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
              },
              {
                label: 'Print InProgress',
                icon: 'pi pi-fw pi-table',
                routerLink: ['/officers/report/report-inprogress'],
                ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
              },
              {
                label: 'Print Completed',
                icon: 'pi pi-fw pi-check-circle',
                routerLink: ['/officers/report/PrintCompleted'],
                ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
              },
              {
                label: 'Card Disbursed',
                icon: 'pi pi-fw pi-send',
                routerLink: ['/officers/report/Cardssent'],
                ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
              },
              {
                label: 'Card Approval History',
                icon: 'pi pi-fw pi-history',
                routerLink: ['/officers/report/card-approval-history'],
                ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
              },
            ],
          },

          {
            label: 'Feedback',
            ngxPermissionsOnly: [privileges.USER_VIEW],
            icon: 'pi pi-fw pi-users',
            routerLink: ['/officers/feedback'],
          },
          {
            label: 'Help',
            icon: 'pi pi-fw pi-question-circle',
            routerLink: ['/help/role'],
          },
        ],
      },
      //       {
      //   label: 'Reports',
      //   icon: 'pi pi-fw pi-chart-bar',
      //   ngxPermissionsOnly: [privileges.REPORT_VIEW], // Ensure only those with report privilege see it
      //   items: [
      //     {
      //       label: 'GCC Report',
      //       icon: 'pi pi-fw pi-file',
      //       routerLink: ['/officers/report/gccreport'],
      //       ngxPermissionsOnly: [privileges.REPORT_VIEW],
      //     },
      //         {
      //       label: 'District Wise Report',
      //       icon: 'pi pi-fw pi-file-pdf',
      //       routerLink: ['/officers/report/districtwisecount'],
      //       ngxPermissionsOnly: [privileges.REPORT_VIEW],
      //     },
      //             {
      //       label: 'CoreSanitary Workers Report',
      //       icon: 'pi pi-fw pi-book',
      //       routerLink: ['/officers/report/coresanitaryworkers'],
      //       ngxPermissionsOnly: [privileges.REPORT_VIEW],
      //     },
      //     {
      //       label: 'Consolidated Reports',
      //       icon: 'pi pi-fw pi-table',
      //       routerLink: ['/officers/report/reports'],
      //       ngxPermissionsOnly: [privileges.REPORT_VIEW],
      //     },

      // {
      //       label: 'Member Scheme Report',
      //       icon: 'pi pi-users',
      //       routerLink: ['/officers/report/memberapplyscheme'],
      //       ngxPermissionsOnly: [privileges.REPORT_VIEW],
      //     },
      //     {
      //       label: 'Scheme GCC Report',
      //       icon: 'pi pi-building',
      //       routerLink: ['/officers/report/gccscheme'],
      //       ngxPermissionsOnly: [privileges.REPORT_VIEW],
      //     },
      //     {
      //       label: 'Scheme Cost Report',
      //       icon: 'pi pi-dollar',
      //       routerLink: ['/officers/report/gcccost'],
      //       ngxPermissionsOnly: [privileges.REPORT_VIEW],
      //     }

      //   ],
      // },
      // {
      //   label: 'Card Status',
      //   icon: 'pi pi-fw pi-credit-card',
      //   ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
      //   items: [
      //     {
      //       label: 'Print InProgress',
      //       icon: 'pi pi-fw pi-table',
      //       routerLink: ['/officers/report/report-inprogress'],
      //       ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
      //     },
      //     {
      //       label: 'Print Completed',
      //       icon: 'pi pi-fw pi-check-circle',
      //       routerLink: ['/officers/report/PrintCompleted'],
      //       ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
      //     },
      //     {
      //       label: 'Card Disbursed',
      //       icon: 'pi pi-fw pi-send',
      //       routerLink: ['/officers/report/Cardssent'],
      //       ngxPermissionsOnly: [privileges.CARD_STATUS_REPORT],
      //     }
      //   ],
      // },
      {
        label: 'Settings',
        ngxPermissionsOnly: [
          privileges.CONFIG_VIEW,
          privileges.ROLE_VIEW,
          privileges.APPLICATION_PRIVILEGE_VIEW,
          privileges.USER_VIEW,
          privileges.APPROVALFLOW_VIEW,
        ],
        icon: 'pi pi-fw pi-globe',
        items: [
          {
            label: 'Configurations',
            icon: 'pi pi-fw pi-globe',
            ngxPermissionsOnly: [privileges.CONFIG_VIEW],
            items: [
              {
                label: 'Configuration',
                icon: 'pi pi-fw pi-globe',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration'],
              },
              {
                label: 'General Configuration',
                icon: 'pi pi-fw pi-verified',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/general'],
              },
              // {
              //   label: 'Scheme Configuration',
              //   icon: 'pi pi-fw pi-file-o',
              //   ngxPermissionsOnly: [privileges.CONFIG_VIEW],
              //   routerLink: ['/officers/configuration/scheme-configuration'],
              // },
              {
                label: 'Scheme Detail',
                icon: 'pi pi-fw pi-file-o',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/scheme-detail-config'],
              },
              {
                label: 'Scheme Group',
                icon: 'pi pi-fw pi-file-o',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/scheme-group'],
              },
              {
                label: 'Document Configuration',
                icon: 'pi pi-fw pi-file-edit',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/document'],
              },
              {
                label: 'Status Document Configuration',
                icon: 'pi pi-fw pi-verified',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/status-doc'],
              },
              // {
              //   label: 'Subsidy Configuration',
              //   icon: 'pi pi-fw pi-money-bill',
              //   ngxPermissionsOnly: [privileges.CONFIG_VIEW],
              //   routerLink: ['/officers/configuration/subsidy'],
              // },
              {
                label: 'Branch Configuration',
                icon: 'pi pi-fw pi-building',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/bank-branch'],
              },
              {
                label: 'District Configuration',
                icon: 'pi pi-fw pi-ticket',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/district'],
              },
              {
                label: 'Help Documents Configuration',
                icon: 'pi pi-fw pi-comments',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                routerLink: ['/officers/configuration/help-doc-config'],
              },
            ],
          },
          {
            label: 'Roles',
            icon: 'pi pi-fw pi-th-large',
            ngxPermissionsOnly: [privileges.ROLE_VIEW],
            routerLink: ['/officers/configuration/role'],
            routerLinkActiveOptions: '{exact:true}',
          },
          {
            label: 'Application Privilege',
            icon: 'pi pi-fw pi-hashtag',
            ngxPermissionsOnly: [privileges.APPLICATION_PRIVILEGE_VIEW],
            routerLink: ['/officers/configuration/app-privilege'],
            routerLinkActiveOptions: '{exact:true}',
          },
          {
            label: 'Users',
            icon: 'pi pi-fw pi-users',
            ngxPermissionsOnly: [privileges.USER_VIEW],
            items: [
              {
                label: 'Manage',
                ngxPermissionsOnly: [privileges.USER_VIEW],
                icon: 'pi pi-fw pi-users',
                routerLink: ['/officers/user'],
              },
              {
                label: 'Create',
                ngxPermissionsOnly: [
                  privileges.USER_CREATE,
                  privileges.USER_UPDATE,
                ],
                icon: 'pi pi-fw pi-user',
                routerLink: ['/officers/user-create/0/EDIT'],
              },
              {
                label: 'User Upload',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                icon: 'pi pi-fw pi-users',
                routerLink: ['/officers/user-upload'],
              },
              {
                label: 'Member Upload',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                icon: 'pi pi-fw pi-users',
                routerLink: ['/officers/member-upload'],
              },
              {
                label: 'Family Member Upload',
                ngxPermissionsOnly: [privileges.CONFIG_VIEW],
                icon: 'pi pi-fw pi-users',
                routerLink: ['/officers/familymember-upload'],
              },
            ],
          },
          {
            label: 'Flows',
            ngxPermissionsOnly: [privileges.APPROVALFLOW_VIEW],
            icon: 'pi pi-fw pi-arrow-right-arrow-left',
            routerLink: ['/officers/configuration/approval-flow'],
            routerLinkActiveOptions: '{exact:true}',
          },
        ],
      },
    ];
  }
}
