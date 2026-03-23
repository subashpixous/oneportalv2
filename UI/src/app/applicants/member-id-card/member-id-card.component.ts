import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment, { Moment } from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { interval } from 'rxjs';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { Location } from '@angular/common';
import { AccountService } from 'src/app/services/account.service';
import { AccountApplicantLoginResponseModel } from 'src/app/_models/user';
import html2canvas from 'html2canvas';
import { MemberService } from 'src/app/services/member.sevice';
import { environment } from 'src/environments/environment';
import { Input } from '@angular/core';

@Component({
  selector: 'app-member-id-card',
  templateUrl: './member-id-card.component.html',
  styleUrls: ['./member-id-card.component.scss'],
})
export class MemberIdCardComponent {
  breadcrumbs!: BreadcrumbModel[];
  currentTime: string = moment(new Date()).format('DD-MM-yyyy, h:mm:ss A');
  isLoggedin: boolean = false;
  memberDetails!: AccountApplicantLoginResponseModel;
  memberId!: string;
  url: any = '';
  apiUrl = environment.apiUrl;
   @Input() memberCardData: any;   // ✅ NEW
  @Input() isFromOutside: boolean = false; // ✅ flag
  
  get trimmedApiUrl(): string {
     return environment.apiUrl.replace(/\/api\/?$/, '').trim();
   }

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private location: Location,
    private accountService: AccountService,
    private permissionsService: NgxPermissionsService,
    private memberService: MemberService,
     private route: ActivatedRoute,

  ) {}

  encodeURIComponent = encodeURIComponent;

  ngOnInit() {

      if (this.isFromOutside && this.memberCardData) {
      this.setProfileUrl();
      return;
    }
    this.memberDetails = this.accountService.userValue;
    
    if (this.memberDetails.id) {

      this.getMemberIdData(this.memberDetails.id);
    }
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.isLoggedin = true;
    }
    interval(1000).subscribe(() => {
      this.currentTime = moment(new Date()).format('DD-MM-yyyy, h:mm:ss A');
    });
    this.breadcrumbs = [
      {
        pathName: 'Homepage ',
        routing: 'applicant',
        isActionable: true,
      },
      {
        pathName: 'Member Services',
        routing: '',
        isActionable: false,
      },
    ];
  
  }
  setProfileUrl() {
    if (this.memberCardData?.profile_Picture?.startsWith('https')) {
      this.url = this.memberCardData.profile_Picture;
    } else {
      this.url = this.memberCardData?.profile_Picture
        ? `${environment.apiUrl.replace('/api/', '')}/images/${this.memberCardData.profile_Picture}`
        : '';
    }
  }
  getMemberIdData(memberId: string) {
    
    
    this.memberService.Get_Member_Id_Card(memberId).subscribe({
      
      next: (response) => {
        
        if (response.status === 'SUCCESS') {
          this.memberCardData = response.data;
         
          if(this.memberCardData.profile_Picture != ''&& this.memberCardData.profile_Picture.startsWith('https'))
          { this.url =this.memberCardData.profile_Picture
          }
          else{
            this.url = this.memberCardData.profile_Picture &&
            this.memberCardData.profile_Picture != ''
              ? `${environment.apiUrl.replace('/api/', '')}/images/${
                  this.memberCardData.profile_Picture
                }`
              : '';
          }
        }
      },
      error: (error) => {
        console.error('Error fetching member ID card data:', error);
      },
    });
  }

  getCommaSeparatedNamesFromFamily(
    members: { nameEnglish?: string; nameTamil?: string }[],
    language: 'English' | 'Tamil'
  ): string {
    const key = language === 'English' ? 'nameEnglish' : 'nameTamil';

    return members
      .map((member) => member[key]?.trim())
      .filter((name) => !!name)
      .join(', ');
  }

  getFormattedAddress(data: any): string {
    const parts: string[] = [];

    if (data.doorNo) {
      parts.push(`D.No ${data.doorNo}`);
    }

    if (data.streetName) {
      parts.push(data.streetName);
    }

    if (data.villlageTownCity) {
      parts.push(data.villlageTownCity);
    }
        if (data.talukEnglish) {
      parts.push(data.talukEnglish);
    }

    if (data.districtEnglish) {
      parts.push(data.districtEnglish);
    }
    
    

    if (data.pincode) {
      parts.push(data.pincode);
    }

    return parts.join(', ');
  }

  bckClick() {
    this.location.back();
  }

  printClick() {
    this.printWithHtml2Canvas();
  }

downloadClick() {
  const button = document.getElementById('convertButton');
  const element = document.getElementById('id-card-container');
  if (!element) return;

  this.prepareElementForCapture(element, button);

  // Construct profile image URL
  const profileUrl = this.memberCardData?.profile_Picture
    ? `${this.trimmedApiUrl}/images/${this.memberCardData.profile_Picture}`
    : '';

  // Helper function to load an image and return a promise
  const loadImage = (url: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS for html2canvas
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // Skip broken images
    });

  // Wait for profile image and all other images inside the container
  const otherImages = Array.from(element.querySelectorAll('img'));
  const imagePromises = otherImages.map(
    (img: HTMLImageElement) =>
      new Promise<void>((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      })
  );

  // Wait for profile image + other images
  Promise.all([loadImage(profileUrl), ...imagePromises]).then(() => {
    // Capture the element after all images are loaded
    html2canvas(element, {
      useCORS: true,
      logging: false,
      scale: 3,
      scrollY: 0,
      backgroundColor: '#ffffff',
    })
      .then((canvas) => {
        const imageData = canvas.toDataURL('image/jpeg', 0.95);

        // Trigger download
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `${this.memberDetails?.name || 'Member'}_${this.memberDetails?.memberId}.jpg`;
        link.click();

        this.resetElementAfterCapture(element, button);
      })
      .catch((error) => {
        console.error('Error capturing element for download:', error);
        this.resetElementAfterCapture(element, button);
      });
  });
}


  printWithHtml2Canvas() {
    const button = document.getElementById('convertButton');
    const element = document.getElementById('id-card-container');
    if (!element) return;

    this.prepareElementForCapture(element, button);

    // Use html2canvas to capture the element
    html2canvas(element
      , {
      useCORS: true,
      logging: false,
      scale: 2,
      scrollY: 0,
      backgroundColor: '#ffffff',
    }
  )
      .then((canvas) => {
        // Convert to image format
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        const currentDate = moment().format('DD-MM-YYYY');
        const memberName = this.memberDetails?.name || 'Member';
        const memberId = this.memberDetails?.memberId || 'N/A';
      
        // Create a new window for printing with header
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
          <html>
            <head>
              <title>Member ID Card - Print</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 0; 
                  background: white;
                  font-family: Arial, sans-serif;
                }
                .print-header {
                  background: #ffffff;
                  padding: 20px 30px;
                  border-bottom: 3px solid #1e3c72;
                  margin-bottom: 30px;
                  page-break-after: avoid;
                }
                .header-content {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  max-width: 1000px;
                  margin: 0 auto;
                }
                .header-logo {
                  width: 70px;
                  height: 70px;
                  object-fit: contain;
                }
                .header-text-center {
                  flex: 1;
                  text-align: center;
                  padding: 0 20px;
                  color: #333;
                }
                .header-title-tamil {
                  font-size: 24px;
                  font-weight: bold;
                  margin: 0 0 5px 0;
                  color: #1e3c72;
                  letter-spacing: 0.5px;
                }
                .header-title-english {
                  font-size: 18px;
                  font-weight: bold;
                  margin: 0 0 8px 0;
                  color: #2a5298;
                  letter-spacing: 1px;
                }
                .header-subtitle {
                  font-size: 14px;
                  margin: 0 0 5px 0;
                  color: #666;
                  font-style: italic;
                }
                .header-member-info {
                  font-size: 12px;
                  margin: 0;
                  color: #888;
                  font-weight: 500;
                }
                .card-container {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 20px;
                  min-height: 50vh;
                }
                .card-image {
                  max-width: 100%;
                  height: auto;
                  border: 2px solid #333;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-radius: 8px;
                }
                @media print {
                  body { 
                    padding: 0; 
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
                  .print-header { 
                    margin-bottom: 15px; 
                    border-bottom: 2px solid #1e3c72;
                  }
                  .card-image { 
                    border: 1px solid #000; 
                    box-shadow: none; 
                  }
                }
              </style>
            </head>
            <body>
              <!-- Header Section -->
              <div class="print-header">
                <div class="header-content">
                  <div class="header-logos">
                    <img src="assets/LogoImages/logo_tn_govt.png" alt="TN Government Logo" class="header-logo">
                  </div>
                  <div class="header-text-center">
                    <h2 class="header-title-tamil">தமிழ்நாடு கட்டுமான தொழிலாளர் நலவாரியம்</h2>
                    <h3 class="header-title-english">TAMIL NADU CONSTRUCTION WORKERS WELFARE BOARD</h3>
                    <p class="header-subtitle">Member Identity Card / உறுப்பினர் அடையாள அட்டை</p>
                    <p class="header-member-info">Member: ${memberName} | ID: ${memberId} | Print Date: ${currentDate}</p>
                  </div>
                  <div class="header-logos">
                    <img src="assets/LogoImages/tncwwblogo.png" alt="TNCWWB Logo" class="header-logo">
                  </div>
                </div>
              </div>
              
              <!-- ID Card Image -->
              <div class="card-container">
                <img src="${imageData}" alt="Member ID Card" class="card-image" />
              </div>
              
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  }, 1500);
                };
              </script>
            </body>
          </html>
        `);
          printWindow.document.close();
        }

        this.resetElementAfterCapture(element, button);
      })
      .catch((error) => {
        console.error('Error capturing element for print:', error);
        this.resetElementAfterCapture(element, button);
      });
  }

  private prepareElementForCapture(
    element: HTMLElement,
    button: HTMLElement | null
  ): void {
    if (button) {
      button.style.display = 'none';
    }
    element.style.filter = 'brightness(1.2)';
    element.style.fontFamily = 'Arial, Helvetica, sans-serif';
    element.style.fontWeight = 'bold';
  }

  // Helper method to reset styles and show buttons
  private resetElementAfterCapture(
    element: HTMLElement,
    button: HTMLElement | null
  ): void {
    element.style.filter = '';
    element.style.fontFamily = '';
    element.style.fontWeight = '';
    if (button) {
      button.style.display = 'block';
    }
  }
  getFormattedAddressTamil(data: any): string {
  const parts: string[] = [];

  if (data.doorNo) {
    parts.push(`க.எண் ${data.doorNo}`); // keep number in English
  }
  if (data.streetNameTamil) {
    parts.push(data.streetNameTamil);
  }
  if (data.villlageTownCityTamil) {
    parts.push(data.villlageTownCityTamil);
  }
   if (data.talukTamil) {
    parts.push(data.talukTamil);
  }
  if (data.districtTamil) {
    parts.push(data.districtTamil);
  }
 if (data.pincode) {
    parts.push(data.pincode);
  }

  return parts.join(', ');
}
  Logout() {
    this.accountService.logout();
    this.router.navigate(['/'], {
      //queryParams: { returnUrl: returnUrl },
    });
  }
}
