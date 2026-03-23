import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import {
  MemberDetailsModel,
  OrganizationDetailModel,
} from 'src/app/_models/MemberDetailsModel';
import { MemberDetailsViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
 
@Component({
  selector: 'app-mem-personal-detail-view',
  templateUrl: './mem-personal-detail-view.component.html',
  styleUrls: ['./mem-personal-detail-view.component.scss'],
})
export class MemPersonalDetailViewComponent implements OnInit {
  @Input() personalDetail?: MemberDetailsViewModelExisting;
  @Input() oldDetail?: MemberDetailsViewModelExisting;
@Input() tempDetail?: MemberDetailsViewModelExisting;
 url: SafeUrl = '';

 constructor(private sanitizer: DomSanitizer) {}
 
  ngOnInit() {
    this.setProfileUrl();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['personalDetail']) {
      this.setProfileUrl();
    }
  }
 //add by vijay 10-09-25
// setProfileUrl(): void {

//   console.log(this.personalDetail);
//   const pic = this.personalDetail?.profile_Picture;
 
//   if (pic && pic.trim() !== '') {
    
//     if (pic.startsWith('http') || pic.includes('application.tncwwb.com')) {
//       // Already a full URL (either absolute or hosted on application.tncwwb.com)
//       this.url = pic;
//     } else {
//       // Build from environment
//       this.url = `${environment.apiUrl.replace('/api/', '')}/images/${pic}`;
//     }
//   } else {
//     // Fallback default image
//     this.url = 'https://www.w3schools.com/howto/img_avatar.png';
//   }
// }


setProfileUrl(): void {

  console.log(this.personalDetail);
  const pic = this.personalDetail?.profile_Picture;

  let imageUrl = '';

  if (pic && pic.trim() !== '') {

    if (pic.startsWith('http') || pic.includes('application.tncwwb.com')) {
      imageUrl = pic;
    } else {
      imageUrl = `${environment.apiUrl.replace('/api/', '')}/images/${pic}`;
    }

  } else {
    imageUrl = 'https://www.w3schools.com/howto/img_avatar.png';
  }

  // ✅ FINAL FIX — sanitize here
  this.url = this.sanitizer.bypassSecurityTrustUrl(imageUrl);

  console.log('Final URL:', imageUrl);
}
 
  CheckNullorEmpty(value?: string | null): boolean {
    return value != null && value.trim() !== '';
  }
 
  CheckZero(value?: number): boolean {
    return value != null && value !== 0;
  }

isChanged(field: string): boolean {

  if (!this.oldDetail || !this.tempDetail) {
    return false;
  }

  const oldVal = (this.oldDetail as any)?.[field] ?? '';
  const newVal = (this.tempDetail as any)?.[field] ?? '';

  return String(oldVal).trim() !== String(newVal).trim();
}
getValue(field: string) {

  const tempVal = (this.tempDetail as any)?.[field];

  if (tempVal !== null && tempVal !== undefined && tempVal !== '') {
    return tempVal;
  }

  return (this.personalDetail as any)?.[field];
}
}
 
 