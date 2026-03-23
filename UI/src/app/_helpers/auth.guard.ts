import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AccountService } from '../services/account.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountService: AccountService,
    private cookieService: CookieService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    var prmissions: string[] = route.data['privileges'] as string[];
    const user = this.accountService.userValue;
    const privillage: any = this.cookieService.get('privillage');
    if (user) {
      var priviles: string[] = privillage.split(',');
      if (
        priviles &&
        prmissions &&
        prmissions.length > 0 &&
        priviles.length > 0 &&
        !this.checkhasaccessornot(priviles, prmissions)
      ) {
        this.router.navigate(['/notaccess'], {
          //queryParams: { returnUrl: state.url },
        });
      }

      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/applicant'], {
      //queryParams: { returnUrl: state.url },
    });
    return false;
  }
  checkhasaccessornot(allPri: string[], reqPri: string[]) {
    var hascode: boolean = false;
    reqPri.forEach((x) => {
      if (allPri.includes(x)) {
        hascode = true;
      }
    });
    return hascode;
  }
}
