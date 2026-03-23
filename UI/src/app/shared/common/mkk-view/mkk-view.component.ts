// import { HttpClient } from '@angular/common/http';
// import { Component, Input, ViewEncapsulation } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { MessageService } from 'primeng/api';
// import {
//   ApplicationDetailViewModel,
//   ApplicationDropdownModel,
//   StatusFlowModel,
// } from 'src/app/_models/schemeModel';
// import { GeneralService } from 'src/app/services/general.service';
// import { SchemeService } from 'src/app/services/scheme.Service';
// import {
//   dateconvertionwithOnlyDate,
//   dateconvertion,
//   convertoWords,
//   monthDiff,
// } from '../../commonFunctions';
// import { environment } from 'src/environments/environment';
// import { ConfigurationSchemeCostFieldModel } from 'src/app/_models/schemeConfigModel';
// import { Guid } from 'guid-typescript';
// import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
// import { ApplicationApprovalFileModel } from 'src/app/_models/ConfigurationModel';
// import moment from 'moment';

// @Component({
//   selector: 'app-mkk-view',
//   templateUrl: './mkk-view.component.html',
//   styleUrls: ['./mkk-view.component.scss'],
//   encapsulation: ViewEncapsulation.None,
// })
// export class MkkViewComponent {
//   @Input() schemeDetails!: ApplicationDetailViewModel;
//   @Input() canshowform3: boolean = false;
//   visible: boolean = false;
//   documents: ApplicationApprovalFileModel[] = [];

//   costFieldModels: ConfigurationSchemeCostFieldModel[] = [];
//   url: any = '';
//   constructor(
//     private messageService: MessageService,
//     private schemeService: SchemeService,
//     private router: Router,
//     private route: ActivatedRoute,
//     private generalService: GeneralService,
//     private http: HttpClient
//   ) {}
//   getclass(item: StatusFlowModel) {
//     var isPassed = item.isPassed;
//     var isPreviousPassed = this.schemeDetails.statusFlow?.find(
//       (x) => x.number == item.number - 1
//     )?.isPassed;
//     if (isPassed) {
//       return 'ChevronDiv ChevronDiv_completed';
//     } else if (isPreviousPassed && !isPassed) {
//       return 'ChevronDiv ChevronDiv_Active';
//     }
//     return 'ChevronDiv';
//   }
//   getdoc() {
//     return this.schemeDetails.educationalQualification.filter(
//       (x) => x.courseDetails != ''
//     );
//   }
//   getStyle(item: StatusFlowModel) {
//     var isPassed = item.isPassed;
//     var isPreviousPassed = this.schemeDetails.statusFlow?.find(
//       (x) => x.number == item.number - 1
//     )?.isPassed;
//     if (isPassed) {
//       return (
//         'background-color:#28a745;' + 'z-index:' + (50 - item.number) + ';'
//       );
//     } else if (
//       (isPreviousPassed != undefined && isPreviousPassed) ||
//       isPreviousPassed == undefined
//     ) {
//       return (
//         'background-color:#06568e;' + 'z-index:' + (50 - item.number) + ';'
//       );
//     }
//     return 'z-index:' + (50 - item.number) + ';';
//   }
//   ngOnChanges() {
//     this.schemeService
//       .applicationFormGet(this.schemeDetails.applicationId)
//       .subscribe((x) => {
//         var det: ApplicationDropdownModel = x.data;
//         if (det) {
//           this.costFieldModels = det.costFieldModels ?? [];
//         }
//       });
//     this.url =
//       this.schemeDetails.thumbnailSavedFileName &&
//       this.schemeDetails.thumbnailSavedFileName != ''
//         ? `${environment.apiUrl.replace('/api/', '')}/images/${
//             this.schemeDetails.thumbnailSavedFileName
//           }`
//         : '';
//   }

//   canShowthisProjectField(fieldName: string) {
//     var filed = this.costFieldModels.filter((x) => x.fieldId == fieldName);
//     if (filed && filed.length > 0) {
//       return filed[0].isVisible;
//     }
//     return false;
//   }
//   bacdk() {
//     this.router.navigate(['tender']);
//   }
//   dc(val: any) {
//     return dateconvertionwithOnlyDate(val);
//   }
//   dcwt(val: any) {
//     return dateconvertion(val);
//   }
//   calculateAge(x: any) {
//     let crrdate = new Date();
//     var years = (monthDiff(moment(x).toDate(), crrdate) / 12).toFixed(0);
//     return years;
//   }
//   getDocuments(selectedstsId: string) {
//     this.schemeService
//       .Application_Approval_Document_Get(selectedstsId)
//       .subscribe((c) => {
//         if (c.data) {
//           var d: ApplicationApprovalFileModel[] = c.data;
//           if (d) {
//             this.visible = true;
//             this.documents = d;
//             // this.documentsFormArray.clear();
//             // this.generateDefaultRows(d);
//           }
//         }
//       });
//   }
//   back() {
//     const printContents = document.getElementById('demo')?.innerHTML;
//     const popupWin = window.open(
//       '',
//       '_blank',
//       'top=0,left=0,height=100%,width=auto'
//     );

//     popupWin?.document.open();
//     popupWin?.document.write(`
//       <html>
//         <head>
//           <title>Print</title>
//           <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/5.3.0/css/bootstrap.min.css">
//           <style>
//             @media print {
//               body {
//                 font-family: Arial, sans-serif;
//                 color: black !important;
//               }
//               .no-print {
//                 display: none !important;
//               }
//             }
//           </style>
//         </head>
//         <body onload="window.print();window.close()">
//           ${printContents}
//         </body>
//       </html>
//     `);
//     popupWin?.document.close();
//   }
//   convertoWordsd(cost: any) {
//     return convertoWords(cost ?? 0);
//   }
//   downloadFile(id: string, originalFileNAme: string) {
//     this.generalService.SchemeFiledownloads(id, originalFileNAme ?? 'File.png');
//   }
//   approvalFiledownloads(original: string, saved: string) {
//     this.generalService.approvalFiledownloads(saved, original ?? 'File.png');
//   }
//   approvalStatusFiledownloads(original: string, id: string) {
//     this.generalService.approvalStatusFiledownloads(original ?? 'File.png', id);
//   }
//   openimg(id: string, originalFileNAme: string) {
//     return `${environment.apiUrl.replace(
//       '/api/',
//       ''
//     )}/images/${originalFileNAme}`;
//   }
//   save(event: any) {
//     this.schemeService.Application_Form_3_SaveUpdate(event).subscribe((x) => {
//       if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Error',
//           life: 2000,
//           detail: x.message,
//         });
//       } else if (x) {
//         this.messageService.add({
//           severity: 'success',
//           summary: 'Success',
//           detail: x?.message,
//         });
//         this.schemeService
//           .Application_Form_3_Get('', this.schemeDetails.applicationId)
//           .subscribe((x) => {
//             if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
//             } else if (x) {
//               this.schemeDetails = { ...this.schemeDetails, form3: x.data };
//             }
//           });
//       }
//     });
//   }
//   saveUc(event: any) {
//     this.schemeService
//       .Application_Utilisation_Certificate_SaveUpdate(event)
//       .subscribe((x) => {
//         if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
//           this.messageService.add({
//             severity: 'error',
//             summary: 'Error',
//             life: 2000,
//             detail: x.message,
//           });
//         } else if (x) {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Success',
//             detail: x?.message,
//           });
//           this.schemeService
//             .Application_Utilisation_Certificate_Get(
//               '',
//               this.schemeDetails.applicationId
//             )
//             .subscribe((x) => {
//               if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
//               } else if (x) {
//                 this.schemeDetails = {
//                   ...this.schemeDetails,
//                   ucDocument: x.data,
//                 };
//               }
//             });
//         }
//       });
//   }
//   resetForm() {}
//   CheckNullorEmpty(value?: string | undefined | null) {
//     return value != null && value != undefined && value != '';
//   }
//   CheckZero(value?: number) {
//     return value != null && value != undefined && value != 0;
//   }
// }
// mkk-view.component.ts


import { Component, HostListener, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { dateconvertionwithOnlyDate } from '../../commonFunctions';
import { GeneralService } from 'src/app/services/general.service';
import { environment } from 'src/environments/environment';
import { MemberViewModelExisting } from 'src/app/_models/MemberViewModelExsisting';

@Component({
  selector: 'app-mkk-view',
  templateUrl: './mkk-view.component.html',
  styleUrls: ['./mkk-view.component.scss']
})
export class MkkViewComponent implements OnInit {
  // All data from config
  schemeDetails: any;
  personalDetail: any;
  permanentAddress: any;
  temporaryAddress: any;
  bankDetail: any;
  familyMemberList: any[] = [];
  orgDetail: any;
  documentsList: any[] = [];
  memberDocuments: any[] = [];
  memberNonMandatoryDocuments: any[] = [];
  declarationChecked: boolean = false;
  memberDetail!: MemberViewModelExisting;
  showMorePopup: boolean = false;
  selectedMember: any = null;
  popupPosition = { top: 0, left: 0 };
  
  // ADD THIS - for image URLs
  url: string = environment.apiUrl.replace('/api/', '') + '/images/';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    if (this.config.data) {
      this.schemeDetails = this.config.data.schemeDetails || null;
      this.personalDetail = this.config.data.personalDetail || null;
      this.permanentAddress = this.config.data.permanentAddress || null;
      this.temporaryAddress = this.config.data.temporaryAddress || null;
      this.bankDetail = this.config.data.bankDetail || null;
      this.familyMemberList = this.config.data.familyMemberList || [];
      this.orgDetail = this.config.data.orgDetail || null;
      this.documentsList = this.config.data.documentsList || [];
      this.memberDocuments = this.config.data.memberDocuments || [];
      this.memberNonMandatoryDocuments = this.config.data.memberNonMandatoryDocuments || [];
      this.declarationChecked = this.config.data.declarationChecked || false;
    }
  }

  // --- START OF ORGANIZATION CONDITIONAL LOGIC ---

  get isPrivateOrg(): boolean {
    const type = this.orgDetail?.organizationType || this.orgDetail?.organization_Type || '';
    return type.includes('Private') || type.includes('தனியார்');
  }

  get isCoreSanitaryWorker(): boolean {
    const type = this.orgDetail?.typeOfWork || this.orgDetail?.type_of_Work || '';
    return type.includes('Core Sanitary Workers');
  }

  get isHealthWorker(): boolean {
    const type = this.orgDetail?.typeOfWork || this.orgDetail?.type_of_Work || '';
    return type.includes('Health Workers');
  }

  get localBodyValue(): string {
    return (this.orgDetail?.localBody || this.orgDetail?.local_Body || '').toUpperCase();
  }

  get nameOfLocalBodyValue(): string {
    return (this.orgDetail?.nameoftheLocalBody || this.orgDetail?.name_of_Local_Body || '').toUpperCase();
  }

  get isUrban(): boolean { return this.localBodyValue === 'URBAN'; }
  get isRural(): boolean { return this.localBodyValue === 'RURAL'; }

  get isCorporation(): boolean { return this.nameOfLocalBodyValue === 'CORPORATION'; }
  get isMunicipality(): boolean { return this.nameOfLocalBodyValue === 'MUNICIPALITY'; }
  get isTownPanchayat(): boolean { return this.nameOfLocalBodyValue === 'TOWNPANCHAYAT'; }
  get isGccOrCmws(): boolean { return this.nameOfLocalBodyValue === 'GCC' || this.nameOfLocalBodyValue === 'CMWS'; }

  // --- END OF ORGANIZATION CONDITIONAL LOGIC ---

  openMore(member: any, event: MouseEvent) {
    event.stopPropagation(); // Prevent immediate closing
    this.selectedMember = member;
    this.showMorePopup = true;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Position the popup near the button (Fixed position relative to viewport)
    this.popupPosition = {
      top: rect.top + 25,
      left: rect.left - 250 // Shift left so it doesn't overflow screen
    };
  }

  closeMore() {
    this.showMorePopup = false;
    this.selectedMember = null;
  }

  // Close popup when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Don't close if they clicked inside the popover or on the 'more' button itself
    if (!target.closest('.education-popover') && !target.closest('.more-btn')) {
      this.closeMore();
    }
  }

  dc(date: any) {
    return dateconvertionwithOnlyDate(date);
  }

  downloadFile(id: string, fileName: string) {
    if (id && fileName) {
      this.generalService.MemberFiledownloads(id, fileName);
    }
  }

  CheckNullorEmpty(value?: string | null): boolean {
    return value != null && value !== undefined && value.toString().trim() !== '';
  }

  CheckZero(value?: number): boolean {
    return value != null && value !== 0;
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  close() {
    this.ref.close();
  }

  getDocumentIcon(fileName: string): string {
    if (!fileName) return 'pi pi-file';
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return 'pi pi-file-pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'pi pi-image';
      default: return 'pi pi-file';
    }
  }

  getFieldLabel(key: string): string {
    const labels: any = {
      'applicationId': 'ID',
      'scheme': 'Scheme',
      'subScheme': 'Sub Scheme',
      'applicantName': 'Applicant Name',
      'beneficiaryName': 'Beneficiary Name',
      'relationship': 'Relationship',
      'amount': 'Amount',
      'amountInWords': 'Amount in Words',
      'aadharNumber': 'Aadhaar Number',
      'mobileNumber': 'Mobile Number',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'fathersName': 'Father\'s Name',
      'gender': 'Gender',
      'community': 'Community',
      'caste': 'Caste',
      'maritalStatus': 'Marital Status',
      'education': 'Education',
      'dob': 'Date of Birth',
      'phoneNumber': 'Phone Number',
      'doorNo': 'Door No',
      'streetName': 'Street Name',
      'villageorCity': 'Village/City',
      'talukName': 'Taluk',
      'district': 'District',
      'pincode': 'Pincode',
      'accountHolderName': 'Account Holder Name',
      'accountNumber': 'Account Number',
      'ifsc': 'IFSC Code',
      'branchName': 'Branch Name',
      'bankName': 'Bank Name',
      'typeOfWork': 'Type of Work',
      'typeOfCoreSanitoryWorker': 'Type of Core Sanitary Worker',
      'organizationType': 'Organization Type',
      'natureOfJob': 'Nature of Job',
      'workOrganisationName': 'Organization Name',
      'distritName': 'District Name',
      'localBody': 'Local Body',
      'nameoftheLocalBody': 'Name of Local Body',
      'townPanchayat': 'Town Panchayat'
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  getFamilyTableColumns(): string[] {
    return [
      'S.No',
      'Name / பெயர்',
      'Relationship / உறவு',
      'Gender / பாலினம்',
      'DOB',
      'Age / வயது',
      'Mobile / கைப்பேசி',
      'Aadhaar / ஆதார்',
      'Education / கல்வி',
      'Differently Abled / மாற்றுத்திறனாளி'
    ];
  }

  // Helper method to get document image URL
  getDocumentImageUrl(doc: any): string {
    if (!doc) return '';
    
    // If it's a FormGroup with get method
    if (doc.get && typeof doc.get === 'function') {
      const fileName = doc.get('savedFileName')?.value;
      return fileName ? this.url + fileName : '';
    }
    
    // If it's a plain object
    if (doc.savedFileName) {
      return this.url + doc.savedFileName;
    }
    
    // If it has images array
    if (doc.images && doc.images.length > 0) {
      return doc.images[0];
    }
    
    return '';
  }

  // Helper method to get profile image URL
  getProfileImageUrl(): string {
    if (!this.personalDetail) return 'assets/default-profile.png';
    
    if (this.personalDetail.profilePicture) {
      // If it's already a full URL
      if (this.personalDetail.profilePicture.startsWith('http')) {
        return this.personalDetail.profilePicture;
      }
      // If it's just a filename
      return this.url + this.personalDetail.profilePicture;
    }
    
    return 'assets/default-profile.png';
  }
}