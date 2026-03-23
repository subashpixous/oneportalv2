import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteOnSelectEvent } from 'primeng/autocomplete';
import {
  BankDetailSaveModel,
  MemberDocumentMaster,
  MemberDocumentSaveMaster,
} from 'src/app/_models/MemberDetailsModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { triggerValueChangesForAll } from '../../commonFunctions';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mem-document-detail',
  templateUrl: './mem-document-detail.component.html',
  styleUrls: ['./mem-document-detail.component.scss'],
})
export class MemDocumentDetailComponent {
  bankForm!: FormGroup;
  selectedDoc: any;
  showPreview: boolean = false;
previewVisible: boolean = false;
previewUrl: any = '';
isRequired:boolean=true
previewType: 'image' | 'pdf' | '' = '';
  @Input() member_Id: string = '';
  @Input() formDetail: any = {};
  @Input() memPersonalInfo?: MemberDocumentMaster[];
  suggestions: TCModel[] = [];
  @Input() showNextButton: boolean = true;
  @Input() isOfficerEdit: boolean = false;
  @Input() ismandatory: boolean = false;
  @Input() isFamilyMember: boolean = false;
  @Input() hideAadhaar: boolean = false;
  @Output() formDataChange = new EventEmitter<any>();
  imageBaseUrl: string = '';
  docBlob: Blob | null = null;
  docType: 'pdf' | 'image' = 'pdf';
  loadingPreview: boolean = false;
  showViewer = false;
docvalid:boolean=false
@Input() isHouseMaid: boolean = false;
uploadErrors: { [key: string]: string } = {};
  memDocumentsForm!: FormGroup;
  get memDocumentsFormArray() {
    return this.memDocumentsForm.controls['documents'] as FormArray;
  }
  get documentsList() {
    return this.memDocumentsFormArray.controls as FormGroup[];
  }
  get documentTypeErrorMsg() {
    var error: any;
    if (this.documentsList) {
      this.documentsList.map((x) => {
        if (x.controls['acceptedDocumentTypeId'].errors) {
          error = x.controls['acceptedDocumentTypeId'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
    }

    return null;
  }
  get fileUploadErrorMsg() {
    var error: any;
    if (this.documentsList) {
      this.documentsList.map((x) => {
        if (x.controls['savedFileName'].errors) {
          error = x.controls['savedFileName'].errors;
        }
      });
      if (error && error['required']) {
        return 'Required';
      }
    }

    return null;
  }
  constructor(
      private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
      private cdr: ChangeDetectorRef,
    private memberService: MemberService,
    private generalService: GeneralService,
    private schemeService: SchemeService,
    private router: Router,
  ) {}
  ngOnInit() {
      this.imageBaseUrl = environment.apiUrl.replace('/api/', '') + '/images/';

    this.memDocumentsForm = new FormGroup({
      documents: new FormArray([]),
    });
    // console.log('hideAadhaar:', this.hideAadhaar);
    // if (this.memPersonalInfo && this.member_Id) {
    //   var istem = this.isOfficerEdit ? false : !this.showNextButton;
    //   this.getDocuments(this.member_Id, istem);
    // }
    // this.memDocumentsForm.valueChanges.subscribe(() => {
    //   this.formDataChange.emit({
    //     value: this.memDocumentsForm.value,
    //     valid: this.memDocumentsForm.valid,
    //   });
    // });
//     this.memDocumentsForm.valueChanges.subscribe(() => {

//   const uploaded = this.documentsFormArray.controls.every(
//     (x: any) => x.get('originalFileName')?.value
//   );

//   this.formDataChange.emit({
//     value: this.memDocumentsForm.value,
//     valid: uploaded
//   });

// });
this.memDocumentsForm.valueChanges.subscribe(() => {

  const uploaded = this.documentsFormArray.controls.every(
    (x: any) => x.get('originalFileName')?.value
  );
if(this.isHouseMaid){
  this.isRequired=false
}
else{
  this.isRequired=true
}
  this.formDataChange.emit({
    value: this.memDocumentsForm.getRawValue(),
    valid: this.isHouseMaid ? true : uploaded
  });

});
  }
  getImageSafeUrl(fileName: string): SafeUrl {

  const url = this.imageBaseUrl + fileName;

  return this.sanitizer.bypassSecurityTrustUrl(url);
}

// openPreview(fileName: string, originalName: string) {
//   if (!fileName) return;

//   const url = this.imageBaseUrl + fileName;

//   this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

//   if (this.isImage(originalName)) {
//     this.previewType = 'image';
//   } else if (this.isPdf(originalName)) {
//     this.previewType = 'pdf';
//   }

//   this.previewVisible = true;
// }
openPreview(doc: any) {
  this.selectedDoc = doc;

  // ✅ IMAGE
  if (this.isImage(doc.originalFileName)) {
    this.previewType = 'image';

    const imgUrl = this.imageBaseUrl + doc.savedFileName;

    this.previewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(imgUrl);

    this.showPreview = true;
    return;
  }

  // ✅ PDF
  if (this.isPdf(doc.originalFileName)) {
    this.previewType = 'pdf';

    // 🔥 Open popup immediately
    this.showPreview = true;
    this.loadingPreview = true;

    const fileUrl =
      `${environment.apiUrl}/Member/Member_Document_Download_for_qr?fileId=${doc.id}`;

    fetch(fileUrl)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);

        this.previewUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

        this.loadingPreview = false;
      })
      .catch(() => {
        this.loadingPreview = false;
      });
  }
}
  markAllAsTouched() {
    this.memDocumentsForm.markAllAsTouched();
    const documents = this.memDocumentsForm.get('documents') as FormArray;
    documents.controls.forEach((group) => group.markAllAsTouched());
  }
  // isInvalid(controlName: string): boolean {
  //   const control = this.memDocumentsForm.get(controlName);
  //   return !!(control && control.invalid && (control.dirty || control.touched));
  // }
  isInvalid(index: number, controlName: string): boolean {
    const documentsArray = this.memDocumentsForm.get('documents') as FormArray;

    if (!documentsArray || !documentsArray.at(index)) return false;

    const control = documentsArray.at(index).get(controlName);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }
  isAadhaarDocument(item: FormGroup): boolean {
    const category = item.get('documentCategory')?.value;
    //  console.log('Document Category:', category);
    if (!category) return false;

    return (
      category.toLowerCase().includes('aadhar') || category.includes('ஆதார்')
    );
  }
  get visibleDocuments() {
    return this.documentsList.filter(
      (item) => !(this.hideAadhaar && this.isAadhaarDocument(item)),
    );
  }
  ngOnChanges() {
    console.log('hideAadhaar changed---:', this.hideAadhaar);
    if (this.memPersonalInfo && this.member_Id) {
      console.log(this.isFamilyMember + 'isFamilyMember');
      var istem = this.isOfficerEdit ? false : !this.showNextButton;
      this.getDocuments(this.member_Id, istem);
    }
  
     this.validateDocuments();
  }
  validateDocuments() {

  const uploaded = this.documentsFormArray.controls.every(
    (x: any) => x.get('originalFileName')?.value
  );
  if(this.isHouseMaid){
  this.isRequired=false
}
else{
  this.isRequired=true
}
  this.formDataChange.emit({
    value: this.memDocumentsForm.getRawValue(),
    valid: this.isHouseMaid ? true : uploaded
  });

}
  removeFile(id: string) {
    var istem = this.isOfficerEdit ? false : !this.showNextButton;
    this.memberService.Member_Document_Delete(id, istem).subscribe((v) => {
      this.getDocuments(this.member_Id, istem);
    });
  }
  downloadFile(id: string, originalFileNAme: string) {
    this.generalService.MemberFiledownloads(id, originalFileNAme ?? 'File.png');
  }
  onSelectDocumentFile(event: any, id: string, uploader: any) {

    if (event.files && event.files[0]) {
    const file = event.files?.[0];
  const maxSize = 2 * 1024 * 1024;

  if (!file) return;


  if (file.size > maxSize) {


    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'File size should not exceed 2 MB'
    });

  
      uploader.clear();

    return;
  }
      var istem = this.isOfficerEdit ? false : !this.showNextButton;
      var df = this.documentsList.find((x) => x.controls['id'].value == id);
      if (df) {
        var applicationId = df.controls['member_Id'].value;
        var acceptedDocumentTypeId =
          df.controls['acceptedDocumentTypeId'].value;
        var documentConfigId = df.controls['documentCategoryId'].value;

        const formData = new FormData();
        formData.append('Id', id);
        formData.append('Member_Id', applicationId);
        formData.append('DocumentCategoryId', documentConfigId);
        formData.append('AcceptedDocumentTypeId', acceptedDocumentTypeId);
        formData.append('OriginalFileName', '');
        formData.append('SavedFileName', '');
        formData.append(
          'IsTemp',
          (this.isOfficerEdit ? false : !this.showNextButton)
            ? 'true'
            : 'false',
        );
        formData.append('IsActive', 'true');
        formData.append('File', event.files[0]);
        this.http
          .post(
            `${environment.apiUrl}/Member/Member_Document_SaveUpdate`,
            formData,
          )
          .subscribe(
            (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Uploaded Successfully',
              });
              
              this.getDocuments(this.member_Id, istem);
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to Upload! Please try again',
              });
            },
          );
      }
    }
  }
  get documentsFormArray(): FormArray {
    return this.memDocumentsForm.get('documents') as FormArray;
  }
  getDocuments(appId: string, istem: boolean = false) {
    if (this.isFamilyMember == true) {
      if (this.ismandatory == true) {
        this.memberService
          .Family_Member_Document_Get(appId, istem)
          .subscribe((c) => {
            if (c.data) {
              this.memPersonalInfo = c.data;
              if (this.memPersonalInfo) {
                this.memDocumentsFormArray.clear();
                const storedData = localStorage.getItem('memPersonalInfo');
if (!this.memPersonalInfo && storedData) {
  this.memPersonalInfo = JSON.parse(storedData);
}

this.generateDefaultRows(this.memPersonalInfo ?? []);
                this.diableDropdown();
              }
            }
          });
      } else if (this.ismandatory == false) {
        this.memberService
          .Family_Member_NonMandatory_Document_Get(appId, istem)
          .subscribe((c) => {
            if (c.data) {
              this.memPersonalInfo = c.data;
              if (this.memPersonalInfo) {
                this.memDocumentsFormArray.clear();
                this.generateDefaultRows(this.memPersonalInfo);
                this.diableDropdown();
              }
            }
          });
      }
    } else if (this.isFamilyMember == false) {
      if (this.ismandatory == true) {

        this.memberService.Member_Document_Get(appId, istem).subscribe((c) => {
        
          if (c.data) {
            this.memPersonalInfo = c.data;
            if (this.memPersonalInfo) {
              this.memDocumentsFormArray.clear();
              this.generateDefaultRows(this.memPersonalInfo);
              this.diableDropdown();
            }
          }
        });
      } else if (this.ismandatory == false) {
        this.memberService
          .Member_NonMandatory_Document_Get(appId, istem)
          .subscribe((c) => {
            if (c.data) {
              this.memPersonalInfo = c.data;
              if (this.memPersonalInfo) {
                this.memDocumentsFormArray.clear();
                this.generateDefaultRows(this.memPersonalInfo);
                this.diableDropdown();
              }
            }
          });
      }
    }
  }
  diableDropdown() {
    if (this.documentsList) {
      this.documentsList.forEach((x) => {
        if (
          x.controls['originalFileName'].value &&
          x.controls['originalFileName'].value != ''
        ) {
          x?.controls['acceptedDocumentTypeId'].disable();
        } else {
          x?.controls['acceptedDocumentTypeId'].enable();
        }
      });
    }
  }
  isImage(fileName: string | null): boolean {
    if (!fileName) return false;
    const lower = fileName.toLowerCase();
    return (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png')
    );
  }

  isPdf(fileName: string | null): boolean {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith('.pdf');
  }
  getImageUrl(row: FormGroup): string {

  const fileName = row.get('savedFileName')?.value;

  if (!fileName) return '';

  return `${environment.apiUrl.replace('/api/', '')}/images/${fileName}`;
}
  // generateDefaultRows(docs: MemberDocumentMaster[]) {
  //   if (docs) {
  //     docs.forEach((x) => {
  //       if (
  //         (!x.acceptedDocumentTypeId || x.acceptedDocumentTypeId == '') &&
  //         x.acceptedDocumentTypeSelectList.length == 1
  //       ) {
  //         x.acceptedDocumentTypeId = x.acceptedDocumentTypeSelectList[0].value;
  //       }

  //       this.memDocumentsFormArray.push(
  //         this.formBuilder.group({
  //           id: [x.id],
  //           member_Id: [x.member_Id, [Validators.required]],
  //           documentCategory: [x.documentCategory],
  //           isRequired: [this.ismandatory],
  //           documentCategoryId: [x.documentCategoryId, [Validators.required]],
  //           savedFileName: [x.savedFileName],
  //           originalFileName: [x.originalFileName],
  //           acceptedDocumentList: [x.acceptedDocumentTypeSelectList],
  //           acceptedDocumentTypeId: [
  //             x.acceptedDocumentTypeId,
  //             [Validators.required],
  //           ],
  //         })
  //       );
  //     });
  //   }
  // }
  // generateDefaultRows(docs: MemberDocumentMaster[]) {
  //   if (!docs) return;

  //   console.log('Original Docs:', docs);
  // const hideAadhaar = this.isRagPicker();
  //   const filteredDocs = hideAadhaar
  //     ? docs.filter(
  //         (x) =>
  //           !x.documentCategory?.toLowerCase().includes('aadhar') &&
  //           !x.documentCategory?.includes('ஆதார்')
  //       )
  //     : docs;

  //   filteredDocs.forEach((x) => {
  //     if (
  //       (!x.acceptedDocumentTypeId || x.acceptedDocumentTypeId == '') &&
  //       x.acceptedDocumentTypeSelectList.length == 1
  //     ) {
  //       x.acceptedDocumentTypeId = x.acceptedDocumentTypeSelectList[0].value;
  //     }

  //     this.memDocumentsFormArray.push(
  //       this.formBuilder.group({
  //         id: [x.id],
  //         member_Id: [x.member_Id, [Validators.required]],
  //         documentCategory: [x.documentCategory],
  //         isRequired: [this.ismandatory],
  //         documentCategoryId: [x.documentCategoryId, [Validators.required]],
  //         savedFileName: [x.savedFileName],
  //         originalFileName: [x.originalFileName],
  //         acceptedDocumentList: [x.acceptedDocumentTypeSelectList],
  //         acceptedDocumentTypeId: [
  //           x.acceptedDocumentTypeId,
  //           [Validators.required],
  //         ],
  //       })
  //     );
  //   });
  // }
  generateDefaultRows(docs: MemberDocumentMaster[]) {
    if (!docs) return;

    // if (this.isRagPicker()) {
    //   this.hideAadhaar = true;
    // } else {
    //   this.hideAadhaar = false;
    // }

    const filteredDocs = this.hideAadhaar
      ? docs.filter((x) => !this.isAadhaarDoc(x))
      : docs;

    filteredDocs.forEach((x) => {
      if (
        (!x.acceptedDocumentTypeId || x.acceptedDocumentTypeId == '') &&
        x.acceptedDocumentTypeSelectList.length == 1
      ) {
        x.acceptedDocumentTypeId = x.acceptedDocumentTypeSelectList[0].value;
      }

      this.memDocumentsFormArray.push(
        this.formBuilder.group({
          id: [x.id],
          member_Id: [x.member_Id, [Validators.required]],
          documentCategory: [x.documentCategory],
          isRequired: [this.ismandatory],
          documentCategoryId: [x.documentCategoryId, [Validators.required]],
          savedFileName: [x.savedFileName],
          originalFileName: [x.originalFileName],
          acceptedDocumentList: [x.acceptedDocumentTypeSelectList],
          acceptedDocumentTypeId: [
            x.acceptedDocumentTypeId,
            [Validators.required],
          ],
        }),
      );
    });
  }
  isAadhaarDoc(doc: any): boolean {
    const cat = doc?.documentCategory?.toLowerCase?.() || '';
    return (
      cat.includes('aadhaar') || cat.includes('aadhar') || cat.includes('ஆதார்')
    );
  }
  private isRagPicker(): boolean {
    const parsed = JSON.parse(localStorage.getItem('selectedWorkType')!);
    return parsed.text.toLowerCase().includes('rag pickers');
  }

  overallsave() {
    if (!this.memPersonalInfo) return [];

    const filteredDocs = this.hideAadhaar
      ? this.memPersonalInfo.filter((doc) => !this.isAadhaarDoc(doc))
      : this.memPersonalInfo;

    return filteredDocs;
  }
  openViewer(blob: Blob, type: 'pdf' | 'image') {
    this.docBlob = blob;
    this.docType = type;
    this.showViewer = true;
  }
}
