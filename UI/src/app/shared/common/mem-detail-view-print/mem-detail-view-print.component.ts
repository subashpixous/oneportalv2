import { Component, Input, OnInit, OnChanges,SimpleChanges } from '@angular/core';
import {
  MemberDocumentMasterModelExisting,
  MemberViewModelExisting,
} from 'src/app/_models/MemberViewModelExsisting';
import {
  dateconvertionwithOnlyDate,
  dateconvertion,
} from '../../commonFunctions';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mem-detail-view-print',
  templateUrl: './mem-detail-view-print.component.html',
  styleUrls: ['./mem-detail-view-print.component.scss'],
})
export class MemDetailViewPrintComponent implements OnInit, OnChanges {
  @Input() memberDetails!: MemberViewModelExisting;
 imageUrl!: SafeUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    console.log(
      'MemDetailViewPrintComponent initialized with data:',
      this.memberDetails
    );
  }

  
//   ngOnChanges(changes: SimpleChanges) {
//   if (changes['memberDetails'] && this.memberDetails?.memberDetail) {
//     const profilePic = this.memberDetails.memberDetail.profile_Picture;
 
//     if (profilePic && profilePic.trim() !== '') {
//       if (profilePic.startsWith('http') || profilePic.includes('application.tncwwb.com')) {
//         // Already a full URL
//         this.imageUrl = profilePic;
//       } else {
//         // Build from environment
//         this.imageUrl = `${environment.apiUrl.replace('/api/', '')}/images/${profilePic}`;
//       }
//     } else {
//       // Fallback default image
//       this.imageUrl = 'https://www.w3schools.com/howto/img_avatar.png';
//     }
 
//     console.log('Print View Image URL:', this.imageUrl);
//   }
// }

ngOnChanges(changes: SimpleChanges) {
  if (changes['memberDetails'] && this.memberDetails?.memberDetail) {
    const profilePic = this.memberDetails.memberDetail.profile_Picture;

    let finalUrl = '';

    if (profilePic && profilePic.trim() !== '') {
      if (
        profilePic.startsWith('http') ||
        profilePic.includes('application.tncwwb.com')
      ) {
        finalUrl = profilePic;
      } else {
        finalUrl = `${environment.apiUrl.replace('/api/', '')}/images/${profilePic}`;
      }
    } else {
      finalUrl = 'https://www.w3schools.com/howto/img_avatar.png';
    }

    // ✅ SANITIZE HERE
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(finalUrl);

    console.log('Sanitized Image URL:', this.imageUrl);
  }
}

  CheckNullorEmpty(value: any): boolean {
    const result = value !== null && value !== undefined && value !== '';
    return result;
  }

  getAge(dateString: string | undefined): number {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  }
  dc(val: any) {
    return dateconvertionwithOnlyDate(val);
  }
  dcwt(val: any) {
    return dateconvertion(val);
  }
  getCategories(mandoc: MemberDocumentMasterModelExisting[]) {
    return mandoc.filter((x) => x.savedFileName && x.savedFileName != '');
  }
}
