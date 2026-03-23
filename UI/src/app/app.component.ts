import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ui';

  constructor(
    private primengConfig: PrimeNGConfig,
    private permissionsService: NgxPermissionsService,
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    if (this.cookieService.get('privillage')) {
      const privillage: any = this.cookieService.get('privillage');
      if (privillage && privillage) {
        this.permissionsService.loadPermissions(privillage.split(','));
      }
    }

    //  this.http.get('url').subscribe((permissions) => {
    //    //const perm = ["ADMIN", "EDITOR"]; example of permissions
    //    this.permissionsService.loadPermissions(permissions);
    // })
  }
}
