import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PrimeNGConfig } from 'primeng/api';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-homelayout',
  templateUrl: './homelayout.component.html',
  styleUrls: ['./homelayout.component.scss'],
})
export class HomelayoutComponent {
  constructor(
    private primengConfig: PrimeNGConfig,
    private permissionsService: NgxPermissionsService,
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
  }


  
  selectedLanguage: string = 'en';

  onLanguageChanged(lang: string) {
    this.selectedLanguage = lang;
  }
}
