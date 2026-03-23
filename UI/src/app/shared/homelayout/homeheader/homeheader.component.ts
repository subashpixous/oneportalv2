import { Component, EventEmitter, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ConfigSchemeGroupModel } from 'src/app/_models/schemeConfigModel';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LanguageService } from 'src/app/services/LanguageService';
import { CookieService } from 'ngx-cookie-service';
import { AccountService } from 'src/app/services/account.service';
import { Menu } from 'primeng/menu';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-homeheader',
  templateUrl: './homeheader.component.html',
  styleUrls: ['./homeheader.component.scss'],
})
export class HomeheaderComponent {
  @Output() languageChange = new EventEmitter<string>();
  configurationList!: ConfigSchemeGroupModel[];
  currentStatus: boolean = true;
  schemeMenuItems: MenuItem[] = [];
  showUserTypeDialog: boolean = false;
  loginMenuItems: MenuItem[] = [];
  breadcrumb: string = '';
  texts: any = {};
  currentFontSize: number = 16;
  maxFontSize: number = 20;
  minFontSize: number = 14;
@ViewChild('schemeMenu') schemeMenu!: Menu;
  @ViewChild('loginMenu') loginMenu!: Menu;
  isLoggedin: boolean = false;
  userData: any;
profilePictureUrl: string | SafeUrl = 'assets/worker-png.png';
isMemberDashboardRoute: boolean = false; // Add this flag
searchText: string = '';
showSearch: boolean = false;
  constructor(
    private router: Router,
    private schemeConfigService: SchemeConfigService,
    private route: ActivatedRoute,
    private languageService: LanguageService,
    private cookieService: CookieService,
    private accountService: AccountService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.setLanguageTexts();
    this.getgroups(true);
    this.initializeLoginMenu();
        this.checkLoginStatus();
    this.setBreadcrumb();


this.accountService.currentProfileImage.subscribe(url => {
      if (url) {
        // Sanitize the URL before binding it to the HTML <img src="...">
        this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      } else {
        this.profilePictureUrl = 'assets/worker-png.png';
      }
    });
    
this.checkCurrentRoute(this.router.url);
    this.setBreadcrumb();

    // --- Listen for future route changes ---
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;

        let currentRoute = this.route.root;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }
        this.breadcrumb = currentRoute.snapshot.data['breadcrumb'] || '';

        if (navEvent && navEvent.urlAfterRedirects) {
          this.checkCurrentRoute(navEvent.urlAfterRedirects);
        }
      });
  }

  checkCurrentRoute(url: string) {
    if (!url) return;
    const baseUrl = url.split('?')[0];
    // This will match '/applicant/mem-dashboard' or just '/mem-dashboard'
    this.isMemberDashboardRoute = baseUrl.endsWith('/mem-dashboard');
  }

  setBreadcrumb() {
    let currentRoute = this.route.root;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    this.breadcrumb = currentRoute.snapshot.data['breadcrumb'] || '';
  }


  toggleSearch() {
  this.showSearch = !this.showSearch;
}


onSearch() {
  const value = this.searchText.trim().toLowerCase();

  if (!value) return;

  // 🔹 1. STATIC ROUTES
  if (value.includes('register') || value.includes('member')) {
    this.openUserTypeDialog();
    this.resetSearch();
    return;
  }

  if (value.includes('worker')) {
    this.router.navigate(['applicant', 'workerlogin']);
    this.resetSearch();
    return;
  }

if (value.includes('data-checker')) {
   this.router.navigate(['applicant', 'data-checker-login']);
  this.resetSearch();
  return;
}
if (value.includes('member')) {
 this.router.navigate(['auth', 'login', 'applicant']),
  this.resetSearch();
  return;
}

  // 🔹 2. DYNAMIC SCHEME SEARCH (IMPORTANT)
  const matchedScheme = this.configurationList?.find(group =>
    group.groupName.toLowerCase().includes(value)
  );

  if (matchedScheme) {
    this.onSchemeSelect(matchedScheme); 
    this.resetSearch();
    return;
  }

  // NOT FOUND
  // alert('No matching result found');
  this.resetSearch();
}

resetSearch() {
  this.showSearch = false;
  this.searchText = '';
}

  initializeLoginMenu() {
    this.loginMenuItems = [
      {
        label: 'Worker',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['auth', 'login', 'applicant']),
        data: {
          subtitle: 'Already a registered Worker',
          avatar: 'assets/worker-png.png',
        },
      },
      {
        label: 'Tncwwb',
        icon: 'pi pi-users',
        // command: () => this.router.navigate(['auth', 'login'])
        command: () =>
          this.router.navigate(['applicant', 'data-checker-login']),
        data: {
          subtitle: 'Registered Tncwwb member',
          avatar: 'assets/tncwwb-png.png',
        },
      },
    ];
  }

  setLanguageTexts() {
    if (this.selectedLanguage === 'ta') {
      this.texts = {
        memberregister: 'உறுப்பினர் பதிவு',
        schemes: 'நலத்திட்டம்',
        login: 'உள்நுழைவு',
      };
    } else {
      this.texts = {
        memberregister: 'Member register',
        schemes: 'Schemes',
        login: ' Login',
      };
    }
  }

  openUserTypeDialog() {
    this.showUserTypeDialog = true;
  }

  navigatetoMembeRegistration() {
    this.router.navigate(['applicant', 'mem-detail', '0', '0']);
  }

  languages = [
    { label: 'Eng', value: 'en' },
    { label: 'Tamil', value: 'ta' },
  ];

  selectedLanguage = 'en';

  toggleLanguage() {
    this.selectedLanguage = this.selectedLanguage === 'en' ? 'ta' : 'en';

    this.setLanguageTexts(); // Update header text
    this.languageChange.emit(this.selectedLanguage); // Send to parent
    this.languageService.setLanguage(this.selectedLanguage);
  }

  // increaseFont() {
  //   document.body.style.fontSize = '18px';
  // }

  // decreaseFont() {
  //   document.body.style.fontSize = '14px';
  // }

  increaseFont() {
    if (this.currentFontSize < this.maxFontSize) {
      this.currentFontSize += 2;
      document.body.style.fontSize = this.currentFontSize + 'px';
    }
  }

  decreaseFont() {
    if (this.currentFontSize > this.minFontSize) {
      this.currentFontSize -= 2;
      document.body.style.fontSize = this.currentFontSize + 'px';
    }
  }

  getgroups(status: boolean) {
    this.schemeConfigService.Config_Scheme_Group_Get(status).subscribe((x) => {
      if (x) {
        this.configurationList = x.data;

        this.schemeMenuItems = this.configurationList.map((group) => ({
          label: group.groupName,
          command: () => this.onSchemeSelect(group),
        }));
      }
    });
  }
  // Find this method and update it to pass the queryParams
  // onSchemeSelect(group: ConfigSchemeGroupModel) {
  //   console.log(group);
  //   this.router.navigate(['applicant', 'scheme-login'], { queryParams: { id: group.id } });
  // }
  onSchemeSelect(group: ConfigSchemeGroupModel) {
    if (group.description && group.description.startsWith('http')) {
      // External link open
      window.open(group.description, '_blank');
    } else {
      // Normal navigation
      this.router.navigate(['applicant', 'scheme-login'], {
        queryParams: { id: group.id },
      });
    }
  }

  goToMember() {
    this.showUserTypeDialog = false;
    sessionStorage.setItem('Applicanttype', 'Member');
    this.router.navigate(['applicant', 'workerlogin']);
  }

  goToDataCollector() {
    this.showUserTypeDialog = false;
    sessionStorage.setItem('Applicanttype', 'DataOperator/LocalBody');
    this.router.navigate(['applicant', 'data-checker-login']);
  }

  // goToMember() {
  //   this.showUserTypeDialog = false;
  //   this.router.navigate(['applicant', 'mem-detail', '0', '0']);
  // }

  // goToDataCollector() {
  //   this.showUserTypeDialog = false;
  //   this.router.navigate(['applicant', 'collector']);
  // }
checkLoginStatus() {
    // 1. Check the cookie as the primary source of truth for login state
    const accessType = this.cookieService.get('accesstype');
    this.isLoggedin = accessType === 'APPLICANT';

    // 2. Try to get user data from the AccountService
    this.userData = this.accountService.userValue;

    // 3. FIX 2: If service doesn't have it yet (page refresh), parse it from the cookie
    if (!this.userData && this.isLoggedin) {
      const userCookie = this.cookieService.get('user');
      if (userCookie) {
        try {
          // Decode and parse the URI component since it looks like %7B%22... in your screenshot
          this.userData = JSON.parse(decodeURIComponent(userCookie));
        } catch (error) {
          console.error("Could not parse user cookie on refresh", error);
        }
      }
    }
    
    console.log("Header User Data on Load:", this.userData);
    console.log("Is Logged In:", this.isLoggedin);
    console.log("Is Dashboard Route:", this.isMemberDashboardRoute);
  }

// Add the Logout function if not already there
Logout() {
    this.accountService.logout();
    this.isLoggedin = false;
    this.router.navigate(['/']);
}
}
