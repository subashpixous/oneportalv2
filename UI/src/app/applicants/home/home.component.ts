import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { AccountService } from 'src/app/services/account.service';
import { Location } from '@angular/common';
import { IconButtonModel } from 'src/app/shared/common/icon-button/icon-button.component';
import { LanguageService } from 'src/app/services/LanguageService';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @Input() language: string = 'en';
images: string[] = [
  'assets/landing-2.jpg',
  'assets/landing3.jpeg',
  'assets/landing5.jpeg',
  'assets/landing6.jpeg',
  'assets/landing7.jpeg',
  'assets/landingimage7.jpeg',
];

// currentIndex = 0;
intervalId: any;
  slideInterval = 2500; 
  infoContent: any;
  isLoggedin: boolean = false;
currentIndex = 1; 
isTransitioning = true;
 totalImages: string[] = [];
  showUserTypeDialog: boolean = false;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private accountService: AccountService,
    private location: Location,
    private permissionsService: NgxPermissionsService,
    private languageService: LanguageService
  ) {}


  ngOnInit(): void {
    this.languageService.language$.subscribe(lang => {

    this.language = lang;

    this.setLanguageContent();

    this.totalImages = [
    this.images[this.images.length - 1],
    ...this.images,
    this.images[0]
  ];
  this.startAutoSlide();

  });
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
      this.router.navigateByUrl('/applicant/mem-dashboard');

    } else if (this.cookieService.get('privillage')) {
      const privillage: any = this.cookieService.get('privillage');

      if (privillage) {
        this.permissionsService.loadPermissions(privillage.split(','));
      }
      this.router.navigateByUrl('/officers');
    }
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
      ngOnChanges(changes: SimpleChanges): void {
      this.setLanguageContent();
    }

setLanguageContent() {

  if (this.language === 'ta') {

    this.infoContent = {

      leftTitle: 'தொழிலாளர் பதிவு செய்யும் முறை',

      leftList: [

        `நீங்கள் ஒரு <span class="highlight">சுகாதார பணியாளர் (Sanitary Worker)</span> அல்லது உங்களிடம் ஆதார் எண் இருந்தால், பதிவு செய்ய உங்களுக்கு ஆதார் எண்ணை வழங்க வேண்டும்.`,

        `நீங்கள் ஒரு <span class="highlight">குப்பை சேகரிப்பவர் (Rag Picker)</span> அல்லது உங்களிடம் ஆதார் இல்லையெனில், பதிவு செய்ய உங்களுக்கு கைபேசி எண்ணை வழங்க வேண்டும்.`,

        `<span class="info-subtitle">விண்ணப்பிக்கும் முன் இந்த ஆவணங்களை தயாராக வைத்துக் கொள்ளுங்கள்:</span>`,

        `<span class="highlight">ஆதார் அட்டை</span> – உறுப்பினர்களுக்காக`,

        `<span class="highlight">கைபேசி எண்</span> – குப்பை சேகரிப்பவர்களுக்காக`

      ],

      rightTitle: 'திட்டங்களுக்கு விண்ணப்பிக்க',

      rightDesc:
        'நீங்கள் பதிவு செய்யப்பட்ட உறுப்பினராக இருந்தால், கீழ்க்கண்டவர்களுக்கான பல திட்டங்களுக்கு விண்ணப்பிக்கலாம்:',

      rightPoints: [

        `<span class="highlight">நீங்கள்</span>`,

        `<span class="highlight">உங்கள் குடும்ப உறுப்பினர்கள்</span>`

      ],

      docTitle:
        'விண்ணப்பிக்கும் முன் இந்த ஆவணங்களை தயாராக வைத்துக் கொள்ளுங்கள்:',

      docs: [

        `<span class="highlight">ஆதார் அட்டை</span> – உறுப்பினர்களுக்காக`,

        `<span class="highlight">கைபேசி எண்</span> – குப்பை சேகரிப்பவர்களுக்காக`

      ],

      viewMore: 'View More'

    };

  }

  else {

    this.infoContent = {

      leftTitle: 'HOW TO REGISTER IN TNCWWB PORTAL?',

      leftList: [

        `Go to the TNCWWB Home Page and click <span class="highlight">Member Register</span>.`,

        `Select your Worker Category and enter your <span class="highlight">Aadhaar number</span>.`,

        `Verify your mobile number using the OTP received.`,

        `Fill in your personal, address, and bank details.`,

        `Submit the application to complete your registration.`

      ],

      rightTitle: 'APPLY FOR SCHEMES',

      rightDesc:
        'If you are a registered member, you can apply for many schemes for:',

      rightPoints: [

        `<span class="highlight">Yourself</span>`,

        `<span class="highlight">Your family members</span>`

      ],

      docTitle:
        'Keep These Documents Ready Before Applying:',

      docs: [

        `<span class="highlight">Aadhaar Card</span> – for members`,

        `<span class="highlight">Mobile Number</span> – for rag pickers`

      ],

      viewMore: 'View More'

    };

  }

}

  // Start Auto Slide
  startAutoSlide() {
    this.clearTimer();
    this.intervalId = setInterval(() => {
      this.next();
    }, this.slideInterval);
  }

  // Stop Auto Slide
  pauseAutoSlide() {
    this.clearTimer();
  }


  clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

next() {
  this.isTransitioning = true;
  this.currentIndex++;

  if (this.currentIndex === this.totalImages.length - 1) {
    setTimeout(() => {
      this.isTransitioning = false; // Disable animation for the jump
      this.currentIndex = 1;        // Snap back to the real first image
    }, 800); // Match this to your CSS transition time
  }
}

prev() {
  this.isTransitioning = true;
  this.currentIndex--;

  if (this.currentIndex === 0) {
    setTimeout(() => {
      this.isTransitioning = false;
      this.currentIndex = this.totalImages.length - 2; // Snap to real last image
    }, 800);
  }
}

  openUserTypeDialog() {
    this.showUserTypeDialog = true;
  }
  
 goToMember() {
    this.showUserTypeDialog = false;
    this.router.navigate(['applicant', 'workerlogin']);
  }

  goToDataCollector() {
    this.showUserTypeDialog = false;
    this.router.navigate(['applicant', 'data-checker-login']);
  }

  
  // Next Slide
  // next() {
  //   this.currentIndex =
  //     (this.currentIndex + 1) % this.images.length;
  // }

  // // Previous Slide
  // prev() {
  //   this.currentIndex =
  //     (this.currentIndex - 1 + this.images.length) % this.images.length;
  // }
}
