import { Component, HostListener, ElementRef, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SuccessStatus } from 'src/app/_models/ResponseStatus'; 
import { OrganizationDetailFormModel } from 'src/app/_models/MemberDetailsModel';
import { BreadcrumbModel } from 'src/app/_models/CommonModel';
import { Subscription } from 'rxjs';
import { Message } from 'primeng/api';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';
import { MemberService } from 'src/app/services/member.sevice';
@Component({
  selector: 'app-scheme-login',
  templateUrl: './scheme-login.component.html',
  styleUrls: ['./scheme-login.component.scss']
})
export class SchemeLoginComponent implements OnInit {
  organizationForm!: FormGroup;
  inputValue: string = '';
  errorMessage: string = '';

  @Input() formDetail?: OrganizationDetailFormModel;
  
  @Input() navigationpage: string = ''; 
schemeId: string | null = null;
schemeGroupNameDisplay: string = '';
  returnUrl: string = '';
  showOtpScreen: boolean = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  maskedValue: string = '';
  otpTimer: number = 60;
  timerInterval: any;
  showSuccessPopup: boolean = false;
  showErrorPopup: boolean = false;
requiredDocuments: any[] = [];
displayImages: string[] = [];
showImageModal: boolean = false;
showFamilyPromptPopup: boolean = false; // For the small info popup
showFamilyTablePopup: boolean = false;  // For the large table popup
familyMembersList: any[] = [];
currentMemberId: string = '';
showMorePopup: boolean = false;
selectedMember: any = null;
popupPosition = { top: 0, left: 0 };
showDeleteConfirmModal: boolean = false;
memberToDelete: any = null;
isDeleting: boolean = false;
// Action Success Popup Variables
showActionSuccessPopup: boolean = false;
actionSuccessMessage: string = '';
isVerifySuccess: boolean = false; // Helps us know what to do when they click "Continue"
  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
    private memberService: MemberService,
    private permissionsService: NgxPermissionsService,
    private schemeConfigService: SchemeConfigService,
    private elementRef: ElementRef
  ) {}

ngOnInit() {
    // 1. URL-ல் இருந்து Scheme ID அல்லது returnUrl எடுக்கிறோம் (ex: /scheme-login/123 or ?id=123)
    this.schemeId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParams['id'];
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
// Fetch documents if an ID is present
  if (this.schemeId) {
        this.loadSchemeName(this.schemeId);

    this.loadDocuments(this.schemeId);
  }
    // 2. User ஏற்கனவே Login ஆகியிருந்தால், OTP கேட்காமல் நேராக eligibility பேஜுக்கு அனுப்பவும்
    if (this.cookieService.get('accesstype') === 'APPLICANT') {
      this.navigateToTarget();
    }
  }
navigateToTarget() {

  const defaultSchemeId = 'c99ef8af-02c3-6ad1-361b-35870bc265fd';

  // 1. @Input navigationpage இருந்தால்
  if (this.navigationpage && this.navigationpage.trim() !== '') {

    this.router.navigateByUrl(`/${this.navigationpage.replace(/^\/+/, '')}`);

  } 
  // 2. URL schemeId இருந்தால்
  else if (this.schemeId) {

    this.router.navigate(['applicant', 'eligibility', this.schemeId]);

  } 
  // 3. returnUrl இருந்தால்
  else if (this.returnUrl) {

    this.router.navigateByUrl(`/${this.returnUrl.replace(/^\/+/, '')}`);

  } 
  // 4. default → your required schemeId
  else {

    this.router.navigate(['applicant', 'eligibility', defaultSchemeId]);

  }

}
  goback() {
    this.router.navigate(['applicant']);
  }

  getOtp() {
    if (!this.inputValue || this.inputValue.trim() === '') {
      this.errorMessage = 'Mobile number is required';
      return;
    }

    if (this.inputValue.length !== 10) {
      this.errorMessage = 'Mobile number must be exactly 10 digits';
      return;
    }

    this.errorMessage = '';
    this.sendMobileOtp();
  }

  sendMobileOtp() {
    // Calling the ApplicantLogin API from AuthService
    this.authService.ApplicantLogin(this.inputValue).subscribe({
      next: (x: any) => {
        console.log("Get OTP Response:", x);
        
        // Check if status is success
        if (x.status === SuccessStatus || x.status === 'SUCCESS' || x.status === 200) {
          this.maskedValue = 'XXXXXX' + this.inputValue.slice(-4);
          this.showOtpScreen = true;
          this.otpDigits = ['', '', '', '', '', ''];
          this.startOtpTimer();
        } else {
          this.errorMessage = x.message || "Failed to send OTP";
        }
      },
      error: (err) => {
        console.error("Send OTP Error:", err);
        this.errorMessage = "Failed to send OTP";
      }
    });
  }

  verifyOtp() {
    const otp = this.otpDigits.join('').trim();

    if (otp.length !== 6) {
      this.showErrorPopup = true;
      return;
    }

    // Using AuthService ApplicantLogin_ValidateOtp
    this.authService.ApplicantLogin_ValidateOtp(this.inputValue, otp, 'APPLICANT')
      .subscribe({
        next: (x: any) => {
          console.log("Verify API Response:", x);

          if (x.status === SuccessStatus || x.status === 'SUCCESS') {
            
            // Cookie and Permissions setup from your popup component logic
            let userdetails = x.data;
            this.currentMemberId = userdetails.id || userdetails.memberId;
            let privillage = userdetails.privillage;
            let accessToken: string = userdetails.accessToken;
            let refreshToken = userdetails.refreshToken;
            
            userdetails.privillage = null;
            userdetails.accessToken = null;
            userdetails.refreshToken = null;
            
            if(accessToken) {
              accessToken = accessToken.replace('Bearer ', '');
            }

            this.cookieService.set('privillage', privillage, 1);
            this.cookieService.set('user', JSON.stringify(userdetails), 1);
            this.cookieService.set('token', accessToken, 1);
            this.cookieService.set('refreshToken', refreshToken, 1);
            this.cookieService.set('mobile', userdetails.mobile, 1);
            this.cookieService.set('name', userdetails.name, 1);
            this.cookieService.set('accesstype', 'APPLICANT', 1);
            
            this.permissionsService.loadPermissions(privillage);

            // Show success popup instead of directly navigating
            this.showErrorPopup = false;
            this.showSuccessPopup = true;

          } else {
            // Invalid OTP
            this.showSuccessPopup = false;
            this.showErrorPopup = true;
          }
        },
        error: () => {
          this.showSuccessPopup = false;
          this.showErrorPopup = true;
        }
      });
  }

  startOtpTimer() {
    this.otpTimer = 60;
    
    // Clear existing timer if any
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  validateInput() {
    // Allow only digits
    if (/[^0-9]/.test(this.inputValue)) {
      this.errorMessage = 'Only numbers are allowed';
      this.inputValue = this.inputValue.replace(/[^0-9]/g, '');
      return;
    }

    // Mobile validation
    if (this.inputValue.length > 0 && this.inputValue.length < 10) {
      this.errorMessage = 'Mobile number must be 10 digits';
    } else {
      this.errorMessage = '';
    }
  }

goNextPage() {
    this.showSuccessPopup = false;
    setTimeout(() => {
        this.showFamilyPromptPopup = true;
    }, 300);
}

onVerifyClick() {
    this.showFamilyPromptPopup = false; 
    this.fetchFamilyMembers();   
}

fetchFamilyMembers() {
    if (!this.currentMemberId) {
        this.navigateToTarget();
        return;
    }

    this.memberService.Member_Get_All(this.currentMemberId).subscribe({
        next: (x: any) => {
            if (x && x.data && x.data.familyMembers) {
                this.familyMembersList = x.data.familyMembers;
            }
            this.showFamilyTablePopup = true;
        },
        error: (err) => {
            console.error("Failed to fetch family members", err);
            this.navigateToTarget(); // Fallback action
        }
    });
}
finalVerifyAction() {
    // Hide the large table popup
    this.showFamilyTablePopup = false;
    
    // SHOW VERIFY SUCCESS POPUP
    this.actionSuccessMessage = 'Family member Verified<br>successfully';
    this.isVerifySuccess = true; // It IS a verify action
    this.showActionSuccessPopup = true;
}
  resetOtpScreen() {
    this.showOtpScreen = false;
    this.otpDigits = ['', '', '', '', '', ''];
    clearInterval(this.timerInterval);
  }

  moveToNext(event: any, index: number) {
    const input = event.target;
    if (input.value.length === 1 && index < 5) {
      const nextInput = input.parentElement.children[index + 1];
      nextInput.focus();
    }
  }

  resendOtp() {
    if (this.otpTimer > 0) return;
    this.sendMobileOtp();
    this.otpDigits = ['', '', '', '', '', ''];
  }

  trackByIndex(index: number): number {
    return index;
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.otpDigits[index] = value;

    // move next
    if (value && index < 5) {
      const next = event.target.parentElement.children[index + 1];
      next.focus();
    }
  }

  onOtpKeyDown(event: any, index: number) {
    // move back on backspace
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prev = event.target.parentElement.children[index - 1];
      prev.focus();
    }
  }
loadDocuments(id: string) {
  this.schemeConfigService.getRequiredDocumentsByGroupId(id).subscribe({
    next: (res: any) => {
      if ((res.status === 'SUCCESS' || res.status === 200) && res.data) {
        
        // 1. Filter out duplicates
        this.requiredDocuments = res.data.map((group: any) => {
          const uniqueDocs = group.requiredDocumentCategory.filter(
            (doc: any, index: number, self: any[]) => 
              index === self.findIndex((d) => d.categoryName === doc.categoryName)
          );
          return { ...group, requiredDocumentCategory: uniqueDocs };
        });

        // 2. Map reference images dynamically based on document names
        this.mapReferenceImages();
      }
    },
    error: (err) => {
      console.error("Failed to load documents", err);
    }
  });
}
loadSchemeName(id: string) {
  this.schemeConfigService.Config_Scheme_Group_Get(true)
    .subscribe((res: any) => {
      if (res?.data) {
        const group = res.data.find((g: any) => g.id === id);

        if (group) {
          this.schemeGroupNameDisplay =
            `${group.groupNameTamil} / ${group.groupName}`;
        }
      }
    });
}
// Add this new helper method to map the images
mapReferenceImages() {
  const imageMap: { [key: string]: string[] } = {
    'Student ID': ['assets/Document images/School-ID-Card-Vertical_Design-2_a.jpg'],
    'Hostel Certificate': ['assets/Document images/Hostel Certificate.png'],
    'Birth Certificate': ['assets/Document images/Birth Certificate.png'],
    'Death Certificate': ['assets/Document images/Death Certificate.png'],
    'Birth & Death Certificate': [
      'assets/Document images/Birth Certificate.png',
      'assets/Document images/Death Certificate.png'
    ],
    'Marriage Registration': ['assets/Document images/Marriage Registration Certificate.png'],
    'Marriage Invitation': [
      'assets/Document images/Marriage Invitation.png',
      'assets/Document images/Marriage Invitation back.png'
    ],
    'Legal Heir': ['assets/Document images/Legal Heir Certificate.png'],
    'FIR': ['assets/Document images/FIR Copy.png'],
    'Eye Specialist': ['assets/Document images/Eye Test Report.png'],
    'Medical Certificate': ['assets/Document images/Doctor certificate, in case of abortion claim.png'],
    'Ration Card': ['assets/Document images/Family Ration card.jpg']
  };

  this.displayImages = []; // Reset images

  // 1. Safely check if we are in the Maternity Scheme 
  // (We know it's Maternity if one of the documents has "Newborn" in the name)
  let isMaternityScheme = false;
  this.requiredDocuments.forEach(group => {
    group.requiredDocumentCategory.forEach((doc: any) => {
      if (doc.categoryName && doc.categoryName.includes('Newborn')) {
        isMaternityScheme = true;
      }
    });
  });

  // 2. Map the images
  this.requiredDocuments.forEach(group => {
    group.requiredDocumentCategory.forEach((doc: any) => {
      const name = doc.categoryName || '';
      
      Object.keys(imageMap).forEach(key => {
        if (name.includes(key)) {
          
          // 3. FIX: If it's a Medical Certificate, ONLY show the image if it is the Maternity scheme
          if (key === 'Medical Certificate' && !isMaternityScheme) {
            return; // Skip adding the miscarriage image for Natural Death
          }

          imageMap[key].forEach(imgPath => {
            if (!this.displayImages.includes(imgPath)) {
              this.displayImages.push(imgPath);
            }
          });
        }
      });
    });
  });
}
openImageModal() {
  if (this.displayImages.length > 0) {
    this.showImageModal = true;
  }
}
openMore(member: any, event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();


    this.popupPosition = {
      top: rect.bottom + 5,
      left: rect.left - 120
    };

    this.selectedMember = member;
    this.showMorePopup = true;
}
closeMore() {
    this.showMorePopup = false;
}
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsidePopover = this.elementRef.nativeElement
      .querySelector('.education-popover')
      ?.contains(target);
    const clickedMoreButton = target.closest('.more-btn');

    if (!clickedInsidePopover && !clickedMoreButton) {
      this.showMorePopup = false;
    }
}
// ⭐ DELETE CONFIRMATION LOGIC
deleteFamilyMember(mem: any, event: Event) {
    event.stopPropagation();
    this.memberToDelete = mem;
    this.showDeleteConfirmModal = true; // Opens Confirmation Modal
}

cancelDelete() {
    this.showDeleteConfirmModal = false;
    this.memberToDelete = null;
}

confirmDelete() {
    if (!this.memberToDelete) return;
    
    this.isDeleting = true;

    const payload = {
        id: this.memberToDelete.id,
        member_Id: this.currentMemberId, 
        isActive: false,
        isSaved: true
    } as any; 

    this.memberService.Family_SaveUpdate(payload).subscribe({
        next: (res: any) => {
            this.isDeleting = false;
            if (res && (res.status === 'SUCCESS' || res.status === 200)) {
                this.showDeleteConfirmModal = false;
                this.memberToDelete = null;
                this.fetchFamilyMembers(); // Refreshes the table
                
                // SHOW DELETE SUCCESS POPUP
                this.actionSuccessMessage = 'Family member deleted<br>successfully';
                this.isVerifySuccess = false; // It's a delete, not a verify
                this.showActionSuccessPopup = true;
            }
        },
        error: (err: any) => {
            this.isDeleting = false;
            console.error("Delete failed", err);
        }
    });
}



// NEW FUNCTION: Handles the "Continue" button click on the success popup
onActionSuccessContinue() {
    this.showActionSuccessPopup = false;
    
    // If it was the final verify step, go to the next page!
    // If it was just a delete, do nothing (they stay on the table)
    if (this.isVerifySuccess) {
        this.navigateToTarget();
    }
}
}