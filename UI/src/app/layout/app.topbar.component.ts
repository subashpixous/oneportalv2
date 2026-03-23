import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { UserModel } from '../_models/user';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent implements OnInit {
  items!: MenuItem[];
  user!: UserModel;

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private messageService: MessageService,
    private router: Router,
    private accountService: AccountService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.user = this.accountService.userValue;
    this.items = [
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user-edit',
        routerLink: ['/configuration'],
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-sign-out',
        command: (e) => this.log(e),
      },
    ];
  }
  log(e: any) {
    const returnUrl = this.router.url;
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }
}
