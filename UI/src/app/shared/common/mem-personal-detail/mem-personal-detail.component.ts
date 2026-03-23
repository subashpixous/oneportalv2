import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  FamilyMemberFormModel,
  MemberDetailsFormModel,
  MemberDetailsModel,
  OrganizationDetailModel,
} from 'src/app/_models/MemberDetailsModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { SchemeService } from 'src/app/services/scheme.Service';
import { triggerValueChangesForAll } from '../../commonFunctions';
import { Guid } from 'guid-typescript';
import { environment } from 'src/environments/environment';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface CropperPosition {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-mem-personal-detail',
  templateUrl: './mem-personal-detail.component.html',
  styleUrls: ['./mem-personal-detail.component.scss'],
})
export class MemPersonalDetailComponent {
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;
  public personalForm!: FormGroup;
  maxDate: Date = new Date();
  minDate: Date = moment(new Date(1930, 0, 1)).toDate();
  @Input() member_Id: string = '';
  @Input() formDetail?: MemberDetailsFormModel;
  @Input() memPersonalInfo?: MemberDetailsModel;
  @Input() orgInfo?: OrganizationDetailModel;
  @Input() isReadonly: boolean = true;
  @Input() showNextButton: boolean = true;
  @Input() hideAadhaar: boolean = false;
  @Input() isOfficerSave: boolean = false;
  isReadonlyy: boolean = true;
  @Input() aadharverifiedAPI: boolean = false;

  @Output() formSaved = new EventEmitter<Number>();

  @Output() formDataChange = new EventEmitter<any>();
  @ViewChild(MemPersonalDetailComponent)
  // Add this flag to prevent overlapping operations
  maxDobDate: Date = new Date();
  private isCropperBusy = false;
  originalFile: File | null = null;
  originalBase64: string | null = null;
  croppedImageBase64: string | null = null;
  imageBase64ForCropper: string | null = null;
  url: string | null = null;
  private manualCropMonitorInterval: any = null;
  // Dialog control
  showCropDialog: boolean = false;
  aadhaarVerified: boolean = false;
  genderDisplayText: string = '';
  // Face detection data
  serverBox: any = null;
  originalImageWidth: number = 0;
  originalImageHeight: number = 0;
  // Zoom properties
  zoomLevel = 100;
  minZoom = 10;
  maxZoom = 300;
  zoomStep = 10;
  phone_numberGet = '';
  // Preview info
  previewWidth = 0;
  previewHeight = 0;
  previewSize = '0 KB';
  isImageCropped: boolean = false;
  hasUserCropped: boolean = false;
  isAutoCropApplied: boolean = false;

  // Add these properties to your component
  previewImage: string | null = null;
  showPreview: boolean = false;
  downloadUrl: string | null = null;
  IsRagpicker: boolean = false;
  safeurl: SafeUrl | null = null;
  Issafeurl: boolean = false;
  isFatherNameFromAadhaar = false;
  isLastNameFromAadhaar = false;

  constructor(
    private messageService: MessageService,
    private generalService: GeneralService,
    private memberService: MemberService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}
  ngOnInit() {
    this.personalForm = new FormGroup({
      id: new FormControl(Guid.raw().toString()),
      member_Id: new FormControl(), // TODO
      first_Name: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
        Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/),
      ]),
      last_Name: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200),
        Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/),
      ]),
      father_Name: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200),
        Validators.pattern(/^(?!\s*$)[A-Za-z ]+$/),
      ]),
      date_Of_Birth: new FormControl(null, [Validators.required]),
      ration_Card_Number: new FormControl(null, [
        // Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
      ]),
      email: new FormControl(null, [
        Validators.email,
        Validators.maxLength(200),
        Validators.pattern(
          new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
        ),
      ]),
      gender: new FormControl(null, [Validators.required]),
      community: new FormControl(null, [Validators.required]),
      caste: new FormControl(null, [Validators.required]),
      marital_Status: new FormControl(null, [Validators.required]),
      aadhaar_Number: new FormControl(null, [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
        Validators.pattern(new RegExp('^(?!([0-9])\\1{11}$)[1-9][0-9]{11}$')),
      ]),
      phone_Number: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^(?!([6-9])\1{9}$)[6-9]\d{9}$/),
      ]),
      education: new FormControl(null, [Validators.required]),
      religion: new FormControl(null, [Validators.required]),
      profile_Picture: new FormControl(null, [Validators.required]),
      isActive: new FormControl(true),
      aadhaarVerified: new FormControl(false),
    });

    this.personalForm.get('religion')?.valueChanges.subscribe((x) => {
      if (x) {
        this.generalService
          .getConfigurationDetailsInSelectListbyId({
            parentConfigId: x,
            CategoryCode: 'COMMUNITY',
          })
          .subscribe((x) => {
            if (this.formDetail) {
              this.formDetail.community_SelectList = x.data;

              // this.personalForm.get('caste')?.patchValue(null);
            }
          });
      } else {
        if (this.formDetail) {
          this.formDetail.community_SelectList = [];
        }
      }
    });

    // this.personalForm.get('community')?.valueChanges.subscribe((x) => {
    //   if (x) {
    //     this.generalService
    //       .getConfigurationDetailsInSelectListbyId({
    //         parentConfigId: x,
    //         CategoryCode: 'CASTE',
    //       })
    //       .subscribe((x) => {
    //         if (this.formDetail) {
    //           // this.formDetail.community_SelectList = x.data;
    //           this.formDetail.caste_SelectList = x.data;
    //         }
    //         setTimeout(() => {
    //           const casteControl = this.personalForm.get('caste');

    //           if (this.memPersonalInfo?.caste && casteControl) {
    //             casteControl.patchValue(this.memPersonalInfo.caste, {
    //               emitEvent: false,
    //             });

    //             // ✅ FORCE Angular to update UI + validation
    //             casteControl.updateValueAndValidity();
    //             casteControl.markAsDirty();
    //             casteControl.markAsTouched();
    //           }
    //         });
    //       });
    //   } else {
    //     if (this.formDetail) {
    //       this.formDetail.caste_SelectList = [];
    //     }
    //   }
    // });

    this.personalForm
      .get('community')
      ?.valueChanges.subscribe((communityId) => {
        if (communityId) {
          this.generalService
            .getConfigurationDetailsInSelectListbyId({
              parentConfigId: communityId,
              CategoryCode: 'CASTE',
            })
            .subscribe((res) => {
              if (this.formDetail) {
                this.formDetail.caste_SelectList = res.data;
                this.personalForm
                  .get('caste')
                  ?.setValue(this.memPersonalInfo?.caste);
              }
            });
        } else {
          if (this.formDetail) {
            this.formDetail.caste_SelectList = [];
          }
        }
      });

    if (this.memPersonalInfo) {
      this.setPersonalDetail();
    }
    if (this.formDetail) {
      this.setReligion();
    }

    // 2️⃣ AFTER API patch → override using Aadhaar
    setTimeout(() => {
      this.patchAadhaarIfExists();
    }, 0);

    // 3️⃣ Emit form changes

    //     this.personalForm.valueChanges.subscribe(value => {
    //   this.formDataChange.emit(value);
    // });
    this.personalForm.get('first_Name')?.valueChanges.subscribe((val: any) => {
      if (val) {
        this.personalForm
          .get('first_Name')
          ?.setValue(val.trimStart(), { emitEvent: false });
      }
    });
    this.checkWorkTypeAndUpdateAadhaar();
    this.personalForm.valueChanges.subscribe(() => {
      this.formDataChange.emit({
        value: this.personalForm.value,
        valid: this.personalForm.valid,
      });
    });
  }
  applyAadhaarData(aadhaarData: any) {
  this.Issafeurl = true;
  this.aadhaarVerified = aadhaarData.aadhaarVerified === true;

  const nameParts = aadhaarData.name?.trim().split(/\s+/) || [];
  const firstName = nameParts[0] || '';
  // const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
const lastNameFromApi = this.memPersonalInfo?.last_Name;

const lastName =
  lastNameFromApi && lastNameFromApi.trim() !== ''
    ? lastNameFromApi
    : (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
  this.isLastNameFromAadhaar = !!lastName;

  const genderValue = this.mapGenderValue(aadhaarData.gender);

  let fatherName = '';
  this.isFatherNameFromAadhaar = false;

  if (aadhaarData.careOf) {
    const careOf = aadhaarData.careOf.trim();


if (/^(S\/O|D\/O)/i.test(careOf)) {

  fatherName = careOf
    .replace(/^(S\/O|D\/O)\s*:?\s*/i, '')
    .trim();

  this.isFatherNameFromAadhaar = true;
} else {

  fatherName = this.memPersonalInfo?.father_Name||'';
   this.isFatherNameFromAadhaar = false;
}
  }

  this.personalForm.patchValue({
    first_Name: firstName,
    last_Name: lastName,
    father_Name: fatherName,
    aadhaar_Number: aadhaarData.aadhaarNumber,
    gender: genderValue,
   
    date_Of_Birth: this.convertToDate(aadhaarData.dob),
    aadhaarVerified: true,
  });

  this.personalForm.patchValue({
    aadhaarVerified: true
  }, { emitEvent: false });
  this.phone_numberGet = aadhaarData.phone_Number || '';

  this.setGenderDisplayText(aadhaarData.gender);

  // if (!this.aadhaarVerified) {
  //   this.personalForm.get('phone_Number')?.disable();
  // }
}
  patchAadhaarIfExists() {
    const apiAadhaar = this.memPersonalInfo?.aadhaar_json;

    if (apiAadhaar) {
      try {
        const parsed = JSON.parse(apiAadhaar);

        const aadhaarData = {
          name: parsed.Name,
          aadhaarNumber: parsed.AadhaarNumber,
          gender: parsed.Gender,
          dob: parsed.DOB,
          careOf: parsed.CareOf,
          phoneNumber: parsed.Mobile || '',
          aadhaarVerified: this.memPersonalInfo?.aadhaarVerified,
        };

        this.applyAadhaarData(aadhaarData);
        return;
      } catch (e) {
        console.error('Invalid aadhaar_json', e);
      }
    }

    const storedData = localStorage.getItem('aadhaarData');

    if (storedData) {
      const aadhaarData = JSON.parse(storedData);
      this.applyAadhaarData(aadhaarData);
    }
  }
  checkFutureDate(selectedDate: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      this.personalForm.get('date_Of_Birth')?.setValue(null);
    }
  }

  // private checkWorkTypeAndUpdateAadhaar() {

  //   const saved = localStorage.getItem('selectedWorkType');
  // // Debug log
  //   if (!saved) return;

  //   const parsed = JSON.parse(saved);
  //   if (!parsed?.text) return;
  // alert('checkWorkTypeAndUpdateAadhaar called with work type: ' + parsed.text);
  //   const workTypeText = parsed.text.trim().toLowerCase();

  //   const ragPickerText =
  //     'rag pickers / கழிவு பொருள்கள் சேகரிப்பவர்கள்'.toLowerCase();

  //   const aadhaarControl = this.personalForm.get('aadhaar_Number');
  //   if (!aadhaarControl) return;

  //   if (workTypeText === ragPickerText) {

  //     // 🔥 Remove required (Aadhaar optional)
  //     aadhaarControl.setValidators([
  //       Validators.minLength(12),
  //       Validators.maxLength(12),
  //       Validators.pattern(new RegExp('^(?!([0-9])\\1{11}$)[1-9][0-9]{11}$'))
  //     ]);

  //   } else {

  //     // 🔥 Keep required
  //     aadhaarControl.setValidators([
  //       Validators.required,
  //       Validators.minLength(12),
  //       Validators.maxLength(12),
  //       Validators.pattern(new RegExp('^(?!([0-9])\\1{11}$)[1-9][0-9]{11}$'))
  //     ]);
  //   }

  //   aadhaarControl.updateValueAndValidity({ emitEvent: false });
  // }
  // private checkWorkTypeAndUpdateAadhaar() {

  //   const saved = localStorage.getItem('selectedWorkType');
  //   if (!saved) return;

  //   const parsed = JSON.parse(saved);
  //   if (!parsed?.text) return;

  //   const workTypeText = parsed.text.trim().toLowerCase();

  //   const aadhaarControl = this.personalForm.get('aadhaar_Number');
  //   if (!aadhaarControl) return;

  //   // ✅ Only check English part
  //   if (workTypeText.includes('rag pickers')) {

  //     // Aadhaar OPTIONAL
  //     aadhaarControl.setValidators([

  //     ]);

  //   } else {

  //     // Aadhaar REQUIRED
  //     aadhaarControl.setValidators([
  //       Validators.required,
  //       Validators.minLength(12),
  //       Validators.maxLength(12),
  //       Validators.pattern(/^(?!([0-9])\1{11}$)[1-9][0-9]{11}$/)
  //     ]);
  //   }

  //   aadhaarControl.updateValueAndValidity();
  // }
  private checkWorkTypeAndUpdateAadhaar() {
    const saved = localStorage.getItem('selectedWorkType');
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (!parsed?.text) return;

    const workTypeText = parsed.text.trim().toLowerCase();

    const aadhaarControl = this.personalForm.get('aadhaar_Number');
    if (!aadhaarControl) return;

    // 🔥 First clear everything
    aadhaarControl.clearValidators();

    if (workTypeText.includes('rag pickers')) {
      this.IsRagpicker = true;
      // Aadhaar optional
      aadhaarControl.setValue(null);
    } else {
      // Aadhaar required
      aadhaarControl.setValidators([
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
        Validators.pattern(/^(?!([0-9])\1{11}$)[1-9][0-9]{11}$/),
      ]);
    }

    aadhaarControl.updateValueAndValidity();
  }
  convertToDate(dateString: string): Date | null {
    if (!dateString) return null;

    const parts = dateString.split('-');
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }
  setGenderDisplayText(gender: string) {
    if (!gender) {
      this.genderDisplayText = '';
      return;
    }

    if (gender === 'M') {
      this.genderDisplayText = 'Male';
    } else if (gender === 'F') {
      this.genderDisplayText = 'Female';
    } else {
      this.genderDisplayText = gender;
    }
  }
  // mapGenderValue(gender: string) {

  //   if (!this.formDetail?.gender_SelectList?.length) {
  //     console.log('Gender list not loaded yet');
  //     return null;
  //   }

  //   const list = this.formDetail.gender_SelectList;

  //   const targetText = gender === 'M' ? 'male' : 'female';

  //   const found = list.find(x =>
  //     x.text?.trim().toLowerCase() === targetText
  //   );

  //   console.log('Matched gender object:', found);

  //   return found ? found.value : null;
  // }

  mapGenderValue(gender: string) {
    if (!this.formDetail?.gender_SelectList?.length) {
      console.log('Gender list not loaded yet');
      return null;
    }

    const list = this.formDetail.gender_SelectList;

    const targetText = gender?.toUpperCase() === 'M' ? 'male' : 'female';

    const found = list.find((x) =>
      x.text?.toLowerCase().startsWith(targetText),
    );

    console.log('Matched gender object:', found);

    return found ? found.value : null;
  }
  // isInvalid(controlName: string): boolean {
  //   if (this.IsRagpicker){
  //     return false
  //   }
  //   const control = this.personalForm.get(controlName);
  //   return !!(control && control.invalid && (control.dirty || control.touched));
  // }
  isInvalid(controlName: string): boolean {
    const control = this.personalForm.get(controlName);
    if (!control) return false;

    // If user is a Rag Picker, an empty Aadhaar is not an error
    if (controlName === 'aadhaar_Number' && this.IsRagpicker) {
      if (!control.value || control.value === '') return false;
    }

    return control.invalid && (control.dirty || control.touched);
  }
  ngOnChanges() {
    if (this.memPersonalInfo && this.personalForm) {
      //       if(this.aadharverifiedAPI){

      //   this.aadhaarVerified = this.memPersonalInfo?.aadhaarVerified ?? false;
      // }
          this.aadhaarVerified = this.memPersonalInfo?.aadhaarVerified ?? false;
      setTimeout(() => {
        if (this.isOfficerSave) {
          this.aadhaarVerified = this.memPersonalInfo?.aadhaarVerified ?? false;
        }
        this.personalForm.patchValue(
          {
            aadhaarVerified: this.memPersonalInfo?.aadhaarVerified,
          },
          { emitEvent: false },
        );
      });
      this.setPersonalDetail();
      if (this.aadhaarVerified) {
        this.patchAadhaarIfExists();
      }
    }
    if (this.orgInfo) {
      this.checkWorkTypeFromOrg();
    }
    if (this.formDetail && this.personalForm) {
      this.setReligion();
    }

    if (!this.personalForm) return;

    const aadhaarCtrl = this.personalForm.get('aadhaar_Number');
    const rationCtrl = this.personalForm.get('ration_Card_Number');

    if (this.hideAadhaar) {
      aadhaarCtrl?.clearValidators();
      aadhaarCtrl?.setValue(null);
      aadhaarCtrl?.disable();

      rationCtrl?.clearValidators();
      rationCtrl?.setValue(null);
      rationCtrl?.disable();
    } else {
      if (!this.IsRagpicker) {
        aadhaarCtrl?.setValidators([
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
        ]);

        rationCtrl?.setValidators([
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
        ]);
      }
    }

    aadhaarCtrl?.updateValueAndValidity({ emitEvent: false });
    aadhaarCtrl?.updateValueAndValidity();
  }
  private checkWorkTypeFromOrg() {
    // Use the string from the organizationDetail object provided by API
    const workType = this.orgInfo?.type_of_WorkString?.toLowerCase() || '';
    const aadhaarControl = this.personalForm.get('aadhaar_Number');

    if (!aadhaarControl) return;

    // Check if it's Rag Picker (English or Tamil)
    if (
      workType.includes('rag picker') ||
      workType.includes('கழிவு பொருள்கள்')
    ) {
      this.IsRagpicker = true;

      // Remove validators for Rag Picker
      aadhaarControl.clearValidators();

      // Optional: If they already entered a value, keep it, but it's no longer required
    } else {
      this.IsRagpicker = false;

      // Restore validators for everyone else
      aadhaarControl.setValidators([
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(12),
        Validators.pattern(/^(?!([0-9])\1{11}$)[1-9][0-9]{11}$/),
      ]);
    }

    aadhaarControl.updateValueAndValidity();
  }
  ngOnDestroy() {
    this.memPersonalInfo = undefined;
  }
  setReligion() {
    var c = this.formDetail?.religion_SelectList?.at(0);
    this.personalForm.get('religion')?.patchValue(c?.value);
  }
  markAllAsTouched() {
    this.personalForm.markAllAsTouched();
  }
  onSelectFile(event: any, uploader: any) {
  const file = event.files?.[0];
  if (!file) return;

  const maxSize = 2 * 1024 * 1024;

  
  if (file.size > maxSize) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'File size should not exceed 2 MB'
    });

    uploader.clear();
    return;
  }


  const reader = new FileReader();

  reader.onload = (e: any) => {
    const arr = new Uint8Array(e.target.result).subarray(0, 4);
    let header = '';

    for (let i = 0; i < arr.length; i++) {
      header += arr[i].toString(16);
    }

    console.log('File header:', header);

    const isValidImage =
      header.startsWith('ffd8') ||  
      header === '89504e47'

    if (!isValidImage) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Only PNG, JPG, JPEG files are allowed'
      });

      uploader.clear();
      return;
    }

    // ✅ VALID IMAGE → continue your existing flow
    this.processValidImage(file);
  };

  reader.readAsArrayBuffer(file);
}
processValidImage(file: File) {
  this.originalFile = file;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.originalBase64 = e.target.result;
    this.safeurl = this.originalBase64;
    this.resetCropFlags();
  };
  reader.readAsDataURL(file);

  this.validateImageForFaces(file);
}
  // onSelectFile(event: any, uploader: any) {
  //   if (event.files && event.files[0]) {
  //        const file = event.files?.[0];
  // const maxSize = 2 * 1024 * 1024;

  // if (!file) return;


  // if (file.size > maxSize) {

  //   // ✅ SHOW TOAST (guaranteed visible)
  //   this.messageService.add({
  //     severity: 'error',
  //     summary: 'Error',
  //     detail: 'File size should not exceed 2 MB'
  //   });

  
  //     uploader.clear();

  //   return;
  // }
  //     // const file: File = event.files[0];
  //     this.originalFile = file;

  //     // Read file as base64 for preview
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.originalBase64 = e.target.result;
  //       this.safeurl = this.originalBase64;
  //       this.resetCropFlags();
  //     };
  //     reader.readAsDataURL(file);

  //     // ✅ Send to backend for face detection
  //     this.validateImageForFaces(file);
  //   }
  // }

  // 2️⃣ Validate image for face detection
  private validateImageForFaces(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('memberId', this.member_Id);

    // this.http
    //   .post<any>(
    //     `${environment.apiUrl}/Member/Member_Profile_Validate`,  https://testtncwwb-qanew.pixoustech.app/api
    //     formData
    //   )

    this.http
      .post<any>(
        ` https://testtncwwb-qanew.pixoustech.app/api/Member/Member_Profile_Validate`,
        formData,
      )
      .subscribe({
        next: (res) => {
          if (res?.status === 'SUCCESS') {
            this.serverBox = res.data.boundingBox;
            this.originalImageWidth = res.data.imageWidth;
            this.originalImageHeight = res.data.imageHeight;

            console.log('✅ Face detected, opening crop dialog');
            this.openCropDialog(file);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Face Detection Failed',
              detail:
                res?.message ||
                'Please upload an image with exactly one clear face',
            });
            this.resetImage();
          }
        },
        error: (error) => {
          console.error('Face detection error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Face validation service unavailable',
          });
          this.resetImage();
        },
      });
  }
  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel += this.zoomStep;
      this.applyZoom();
    }
  }

  // Zoom out function
  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= this.zoomStep;
      this.applyZoom();
    }
  }

  // Reset zoom to 100%
  resetZoom() {
    this.zoomLevel = 100;
    this.applyZoom();
  }

  // Apply zoom to the cropper
  applyZoom() {
    if (this.imageCropper && this.imageCropper.cropper) {
      // For ngx-image-cropper, you can adjust the scale
      // This depends on your specific image cropper library
      console.log('Zoom level changed to:', this.zoomLevel);

      // If your cropper supports zoom, you might do something like:
      // this.imageCropper.scale = this.zoomLevel / 100;

      // Force a preview update after zoom
      setTimeout(() => {
        this.updatePreviewInRealTime();
      }, 100);
    }
  }

  openCropDialog(file: File) {
    this.resetCropFlags();
    this.zoomLevel = 100;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.originalBase64 = e.target.result;
      this.imageBase64ForCropper = this.originalBase64;
      this.croppedImageBase64 = null;
      this.previewImage = null;
      this.downloadUrl = null;

      console.log('✅ Image loaded for cropper');

      this.showCropDialog = true;

      // Start real-time monitoring after dialog is fully rendered
      setTimeout(() => {
        this.startManualCropMonitoring();

        if (this.serverBox) {
          this.autoCropFromServerBox();
        }
      }, 800);
    };
    reader.readAsDataURL(file);
  }

  // ENHANCED onDialogShow method
  onDialogShow() {
    console.log('✅ Crop dialog opened');

    // Start real-time monitoring with delay to avoid initial conflict
    setTimeout(() => {
      this.startManualCropMonitoring();
    }, 500); // Increased delay for better initialization
  }
  // ENHANCED onDialogHide method
  onDialogHide() {
    console.log('✅ Crop dialog closed');
    this.stopManualCropMonitoring();

    // Clean up
    if (this.downloadUrl) {
      URL.revokeObjectURL(this.downloadUrl);
    }
  }

  // ENHANCED cancelCrop method
  private resetCropFlags() {
    this.isImageCropped = false;
    this.hasUserCropped = false;
    this.isAutoCropApplied = false;
    this.previewImage = null;
    this.zoomLevel = 100; // Reset zoom level
    this.stopManualCropMonitoring();

    if (this.downloadUrl) {
      URL.revokeObjectURL(this.downloadUrl);
      this.downloadUrl = null;
    }
  }

  cancelCrop() {
    this.safeurl=null
    console.log('🔄 Cancelling crop...');
    this.stopManualCropMonitoring();
    this.isCropperBusy = false; // ⚠️ RESET THE BUSY FLAG
    this.showCropDialog = false;
    this.resetCropFlags();
    this.zoomLevel = 100;
  }

  private async generatePreviewFromCropper() {
    try {
      const croppedImage = await this.getCurrentCroppedImage();
      this.previewImage = croppedImage;
      this.generateDownloadLink();
    } catch (error) {
      console.error('Error generating preview:', error);
      this.previewImage = null;
      this.downloadUrl = null;
    }
  }

  // Generate download link
  private generateDownloadLink() {
    if (!this.previewImage) {
      this.downloadUrl = null;
      return;
    }

    try {
      // Validate previewImage before conversion
      if (typeof this.previewImage !== 'string') {
        throw new Error('Preview image is not a string');
      }

      if (this.previewImage.length === 0) {
        throw new Error('Preview image is empty');
      }

      console.log(
        'Generating download link for image length:',
        this.previewImage.length,
      );

      const blob = this.dataURItoBlob(this.previewImage);

      // Clean up previous URL if exists
      if (this.downloadUrl) {
        URL.revokeObjectURL(this.downloadUrl);
      }

      this.downloadUrl = URL.createObjectURL(blob);
      console.log('Download link generated successfully');
    } catch (error) {
      console.error('Error generating download link:', error);
      this.downloadUrl = null;

      // Fallback: Try to create a simple blob if data URI conversion fails
      try {
        if (this.previewImage && this.previewImage.length > 100) {
          const cleanBase64 = this.previewImage.replace(
            /^data:image\/[^;]+;base64,/,
            '',
          );
          const byteCharacters = atob(cleanBase64);
          const byteArrays = [];

          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }

          const blob = new Blob(byteArrays, { type: 'image/jpeg' });
          this.downloadUrl = URL.createObjectURL(blob);
          console.log('Fallback download link generated');
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  }

  handlePreviewError(event: any) {
    console.error('Preview image error:', event);

    // Try to regenerate the preview image
    if (this.croppedImageBase64) {
      console.log('Attempting to regenerate preview...');

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.previewImage = this.croppedImageBase64;
        this.generateDownloadLink();
        this.cdRef.detectChanges();
      }, 100);
    } else {
      this.previewImage = null;
      this.downloadUrl = null;
    }
  }

  onCropperImageLoaded() {
    console.log('✅ Cropper image loaded successfully');

    // Auto-apply crop if server box is available
    if (this.serverBox && !this.isAutoCropApplied) {
      console.log('🔄 Auto-applying crop on image load');
      setTimeout(() => {
        this.autoCropFromServerBox();
        this.forcePreviewUpdate();
      }, 500);
    }
  }
  // SIMPLIFIED: Auto crop without ratio constraints
  autoCropFromServerBox() {
    if (!this.serverBox) {
      console.warn('❌ No server box available for auto crop');
      return;
    }

    if (!this.imageCropper) {
      console.warn('❌ Image cropper not available');
      return;
    }

    // ⚠️ PREVENT OVERLAPPING OPERATIONS
    if (this.isCropperBusy) {
      console.log('⏳ Cropper is busy, skipping auto-crop');
      return;
    }

    this.isCropperBusy = true; // LOCK THE CROPPER

    try {
      console.log('🔄 Starting free-form auto crop');

      // Stop monitoring during auto-crop to prevent conflicts
      this.stopManualCropMonitoring();

      const cropBox = this.calculateFreeFormCrop(this.serverBox);
      console.log('📐 Free-form crop box:', cropBox);

      // Set the crop area
      this.setCropperArea(cropBox);
      this.isImageCropped = true;
      this.isAutoCropApplied = true;

      // Wait before restarting monitoring
      setTimeout(() => {
        this.isCropperBusy = false; // UNLOCK THE CROPPER
        this.startManualCropMonitoring(); // RESTART MONITORING

        // Instant preview after unlock
        setTimeout(() => {
          this.forcePreviewUpdate();
        }, 100);
      }, 800); // Wait for auto-crop to complete

      console.log('✅ Free-form auto crop completed');
    } catch (error) {
      console.error('❌ Auto crop error:', error);
      this.isCropperBusy = false; // UNLOCK ON ERROR
      this.startManualCropMonitoring(); // RESTART ON ERROR
    }
  }

  // New method for free-form cropping around face
  private calculateFreeFormCrop(faceBox: any) {
    const margin = 50;

    let x = Math.max(0, faceBox.x - margin);
    let y = Math.max(0, faceBox.y - margin);
    let width = faceBox.width + margin * 2;
    let height = faceBox.height + margin * 2;

    if (x + width > this.originalImageWidth) {
      width = this.originalImageWidth - x;
    }
    if (y + height > this.originalImageHeight) {
      height = this.originalImageHeight - y;
    }

    // Guard: avoid 0×0 crop
    width = Math.max(10, width);
    height = Math.max(10, height);

    return { x, y, width, height };
  }

  // NEW METHOD: Force preview update
  private async forcePreviewUpdate() {
    console.log('🔄 Forcing preview update...');

    if (this.imageCropper && this.imageBase64ForCropper) {
      try {
        // Get the current cropped image directly from the cropper
        const croppedImage = await this.getCurrentCroppedImage();
        this.croppedImageBase64 = croppedImage;
        this.previewImage = croppedImage;
        this.generateDownloadLink();

        console.log('✅ Preview updated successfully');
        console.log('Preview image length:', this.previewImage?.length);
      } catch (error) {
        console.error('❌ Error forcing preview update:', error);
      }
    }
  }

  // UPDATED setCropperArea method to ensure events fire
  // FIXED setCropperArea
  private setCropperArea(cropArea: any) {
    if (!this.imageCropper || !this.imageCropper.cropper) {
      console.warn('❌ Cropper not available');
      return;
    }

    console.log('🔄 Setting crop area:', cropArea);

    // ✅ Clamp inside image bounds
    const safeCropArea = {
      x1: Math.max(0, Math.min(this.originalImageWidth, cropArea.x)),
      y1: Math.max(0, Math.min(this.originalImageHeight, cropArea.y)),
      x2: Math.max(
        0,
        Math.min(this.originalImageWidth, cropArea.x + cropArea.width),
      ),
      y2: Math.max(
        0,
        Math.min(this.originalImageHeight, cropArea.y + cropArea.height),
      ),
    };

    // ✅ Ensure width/height are valid
    if (safeCropArea.x2 <= safeCropArea.x1)
      safeCropArea.x2 = safeCropArea.x1 + 1;
    if (safeCropArea.y2 <= safeCropArea.y1)
      safeCropArea.y2 = safeCropArea.y1 + 1;

    // Apply safely
    this.imageCropper.cropper.x1 = safeCropArea.x1;
    this.imageCropper.cropper.y1 = safeCropArea.y1;
    this.imageCropper.cropper.x2 = safeCropArea.x2;
    this.imageCropper.cropper.y2 = safeCropArea.y2;

    console.log('✅ Corrected crop area:', {
      x1: this.imageCropper.cropper.x1,
      y1: this.imageCropper.cropper.y1,
      x2: this.imageCropper.cropper.x2,
      y2: this.imageCropper.cropper.y2,
      width: safeCropArea.x2 - safeCropArea.x1,
      height: safeCropArea.y2 - safeCropArea.y1,
    });

    // Force update
    this.forceCropperUpdate();
  }

  // ENHANCED forceCropperUpdate method
  private forceCropperUpdate() {
    if (!this.imageCropper || !this.imageCropper.cropper) return;

    console.log('🔄 Forcing cropper update...');

    // Store original values
    const originalCropper = { ...this.imageCropper.cropper };

    // Create a small change to trigger the cropper
    this.imageCropper.cropper = {
      ...originalCropper,
      x1: originalCropper.x1 + 0.0001,
    };

    // Immediately revert and force update
    setTimeout(() => {
      this.imageCropper.cropper = originalCropper;

      // Manually trigger crop event after a short delay
      setTimeout(() => {
        if (this.imageCropper && this.imageCropper.crop) {
          this.imageCropper.crop();
        }
      }, 100);
    }, 50);
  }

  // UPDATED imageCropped event handler
  imageCropped(event: ImageCroppedEvent) {
    console.log('🔄 imageCropped event fired');

    if (event?.base64) {
      this.croppedImageBase64 = event.base64;
      this.previewImage = event.base64; // Direct assignment for immediate update
      this.isImageCropped = true;
      this.hasUserCropped = true;

      this.generateDownloadLink();

      console.log('✅ Crop event - preview updated immediately');

      // Force immediate UI update
      setTimeout(() => {
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  startManualCropMonitoring() {
    console.log('🔄 Starting real-time manual crop monitoring');

    // Clear any existing interval
    if (this.manualCropMonitorInterval) {
      clearInterval(this.manualCropMonitorInterval);
    }

    let lastCropSignature = '';

    this.manualCropMonitorInterval = setInterval(() => {
      // ⚠️ SKIP IF CROPPER IS BUSY (AUTO-CROP IN PROGRESS)
      if (
        this.isCropperBusy ||
        !this.imageCropper ||
        !this.imageCropper.cropper ||
        !this.showCropDialog
      ) {
        return;
      }

      const currentCrop = this.imageCropper.cropper;
      const currentSignature = `${currentCrop.x1}-${currentCrop.y1}-${currentCrop.x2}-${currentCrop.y2}`;

      // If crop area changed, update preview in real-time
      if (currentSignature !== lastCropSignature) {
        lastCropSignature = currentSignature;
        this.updatePreviewInRealTime();
      }
    }, 300); // Increased from 200ms to 300ms for smoother operation
  }
  // Stop monitoring when not needed
  stopManualCropMonitoring() {
    if (this.manualCropMonitorInterval) {
      clearInterval(this.manualCropMonitorInterval);
      this.manualCropMonitorInterval = null;
      console.log('🔄 Stopped manual crop monitoring');
    }
  }

  private async updatePreviewInRealTime() {
    // ⚠️ PREVENT OVERLAPPING UPDATES
    if (
      this.isCropperBusy ||
      !this.imageCropper ||
      !this.imageBase64ForCropper
    ) {
      console.log('⏳ Skipping real-time update - cropper busy');
      return;
    }

    // YOUR EXISTING CODE CONTINUES HERE...
    try {
      console.log('🔄 Real-time preview update triggered');

      const croppedImage = await this.getCurrentCroppedImage();

      // Validate the cropped image
      if (!croppedImage || !croppedImage.startsWith('data:image')) {
        throw new Error('Invalid cropped image generated');
      }

      this.croppedImageBase64 = croppedImage;
      this.previewImage = croppedImage;
      this.isImageCropped = true;
      this.hasUserCropped = true;

      this.generateDownloadLink();

      console.log('✅ Real-time preview updated successfully');
      console.log('Preview image length:', this.previewImage?.length);

      // Force UI update immediately
      this.cdRef.detectChanges();
    } catch (error) {
      console.error('❌ Error in real-time preview:', error);
      this.previewImage = null;
      this.downloadUrl = null;
      this.cdRef.detectChanges();
    }
  }
  // ENHANCED updatePreview method
  updatePreview() {
    console.log('🔄 Manual preview update requested');

    if (this.croppedImageBase64) {
      this.previewImage = this.croppedImageBase64;
      this.generateDownloadLink();
      console.log('✅ Preview updated from existing cropped image');
    } else if (this.imageCropper && this.imageBase64ForCropper) {
      console.log('🔄 Generating fresh preview from current crop');
      this.generatePreviewFromCropper();
    }

    this.cdRef.detectChanges();
  }

  // ENHANCED onCropperImageLoaded method

  async saveCroppedImage() {
    console.log('Save button clicked');

    // Add debug logging
    console.log('=== DEBUG BEFORE SAVE ===');
    console.log(
      'imageBase64ForCropper available:',
      !!this.imageBase64ForCropper,
    );
    console.log('imageCropper available:', !!this.imageCropper);
    console.log('croppedImageBase64 available:', !!this.croppedImageBase64);
    console.log('isAutoCropApplied:', this.isAutoCropApplied);

    try {
      let finalCroppedImage: string | null = null;

      // 1️⃣ Try to get the current crop directly from cropper
      if (this.imageCropper && this.imageBase64ForCropper) {
        try {
          finalCroppedImage = await this.getCurrentCroppedImage();
          console.log('✅ Using current crop from cropper');
        } catch (error) {
          console.warn('Could not get current crop:', error);
        }
      }

      if (!finalCroppedImage) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail:
            'No cropped image available to save. Please crop the image first.',
        });
        return;
      }

      // Show loading message
      this.messageService.add({
        severity: 'info',
        summary: 'Processing',
        detail: 'Saving image...',
        life: 3000,
      });

      // ✅ DIRECT SAVE - No pre-validation needed
      await this.performSave(finalCroppedImage);
      this.debugCropperState();
    } catch (error) {
      console.error('Save error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to process image for saving.',
      });
    }
  }

  private debugCropperState() {
    if (!this.imageCropper || !this.imageCropper.cropper) {
      console.log('❌ Cropper not available');
      return;
    }

    const cropper = this.imageCropper.cropper;
    console.log('=== CROPPER STATE ===');
    console.log('Cropper coordinates:', {
      x1: cropper.x1,
      y1: cropper.y1,
      x2: cropper.x2,
      y2: cropper.y2,
      width: cropper.x2 - cropper.x1,
      height: cropper.y2 - cropper.y1,
    });
    console.log('=====================');
  }

  private async getCurrentCroppedImage(): Promise<string> {
    if (!this.imageCropper) throw new Error('Image cropper not available');
    if (!this.imageBase64ForCropper)
      throw new Error('Image data not available');

    const cropperInstance = this.imageCropper;
    const imageData = this.imageBase64ForCropper;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const cropper = cropperInstance.cropper;
          if (!cropper) throw new Error('Cropper coordinates not available');

          // Apply zoom scaling
          const zoomScale = this.zoomLevel / 100;

          // Detect if normalized (0..1) or pixels
          const isNormalized =
            cropper.x1 <= 1 &&
            cropper.x2 <= 1 &&
            cropper.y1 <= 1 &&
            cropper.y2 <= 1;

          // Absolute pixel coords with zoom applied
          let absX1 = isNormalized ? cropper.x1 * img.width : cropper.x1;
          let absY1 = isNormalized ? cropper.y1 * img.height : cropper.y1;
          let absX2 = isNormalized ? cropper.x2 * img.width : cropper.x2;
          let absY2 = isNormalized ? cropper.y2 * img.height : cropper.y2;

          // Apply zoom transformation to the crop area
          const centerX = (absX1 + absX2) / 2;
          const centerY = (absY1 + absY2) / 2;
          const width = absX2 - absX1;
          const height = absY2 - absY1;

          // Scale the crop area based on zoom level
          absX1 = centerX - width / 2 / zoomScale;
          absY1 = centerY - height / 2 / zoomScale;
          absX2 = centerX + width / 2 / zoomScale;
          absY2 = centerY + height / 2 / zoomScale;

          // Clamp inside image bounds
          absX1 = Math.max(0, Math.min(img.width - 1, absX1));
          absY1 = Math.max(0, Math.min(img.height - 1, absY1));
          absX2 = Math.max(0, Math.min(img.width, absX2));
          absY2 = Math.max(0, Math.min(img.height, absY2));

          // Compute crop width/height
          let cropW = Math.max(1, Math.round(absX2 - absX1));
          let cropH = Math.max(1, Math.round(absY2 - absY1));

          // Clamp maximum size
          const MAX_SIDE = 4096;
          let scale = 1;
          if (cropW > MAX_SIDE || cropH > MAX_SIDE) {
            scale = Math.min(MAX_SIDE / cropW, MAX_SIDE / cropH);
            cropW = Math.round(cropW * scale);
            cropH = Math.round(cropH * scale);
          }

          // Setup canvas
          canvas.width = cropW;
          canvas.height = cropH;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, cropW, cropH);

          const srcW = Math.round(absX2 - absX1);
          const srcH = Math.round(absY2 - absY1);

          ctx.drawImage(
            img,
            Math.round(absX1),
            Math.round(absY1),
            srcW,
            srcH,
            0,
            0,
            cropW,
            cropH,
          );

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);

          if (!jpegDataUrl || !jpegDataUrl.startsWith('data:image/jpeg')) {
            throw new Error('Failed to generate valid JPEG data URL');
          }

          resolve(jpegDataUrl);
        } catch (err) {
          console.error('Error in getCurrentCroppedImage:', err);
          reject(err);
        }
      };

      img.onerror = (err) => {
        reject(new Error('Failed to load image for cropping'));
      };

      // Assign src
      img.src = imageData.startsWith('data:')
        ? imageData
        : 'data:image/jpeg;base64,' + imageData;
    });
  }

  handleImageError(event: any) {
    console.error('Image loading error:', event);

    // Check if it's a blob URL that might have been revoked
    if (this.url && this.url.startsWith('blob:')) {
      // Fallback to base64 data if available
      if (this.croppedImageBase64) {
        this.url = this.croppedImageBase64;
      } else if (this.originalBase64) {
        this.url = this.originalBase64;
      } else {
        // Fallback to default avatar
        this.url = 'https://www.w3schools.com/howto/img_avatar.png';
      }
    } else {
      // Fallback to default avatar
      this.url = 'https://www.w3schools.com/howto/img_avatar.png';
    }

    this.cdRef.detectChanges();
  }

  onImageLoad() {
    console.log('✅ Image loaded successfully in preview');
    console.log('Current URL length:', this.url?.length);
  }
  private async performSave(croppedImageBase64: string) {
    if (!croppedImageBase64) return;

    try {
      // Determine file extension based on original file type
      const fileExtension = this.originalFile?.name
        .toLowerCase()
        .endsWith('.png')
        ? 'png'
        : 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `profile.${fileExtension}`;

      const blob = this.dataURItoBlob(croppedImageBase64);
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('memberId', this.member_Id);

      this.http
        .post<any>(`${environment.apiUrl}/Member/Member_Profile_Save`, formData)
        .subscribe({
          next: (res) => {
            if (res?.status === 'SUCCESS') {
              // ✅ Use object URL for preview
              const objectUrl = URL.createObjectURL(blob);
              this.url = objectUrl;

              // ✅ Store base64 in form for submission
              this.personalForm
                .get('profile_Picture')
                ?.setValue(croppedImageBase64);

              this.showCropDialog = false;
              this.resetCropFlags();

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Profile image saved successfully',
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Save Failed',
                detail: res?.message || 'Failed to save image',
              });
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save image',
            });
          },
        });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to process image',
      });
    }
  }

  onPreviewImageLoad() {
    console.log('✅ Preview image loaded successfully');
  }

  private resetImage() {
    this.url = null;
    this.originalFile = null;
    this.originalBase64 = null;
    this.imageBase64ForCropper = null;
    this.croppedImageBase64 = null;
    this.resetCropFlags();
  }

  private dataURItoBlob(dataURI: string): Blob {
    if (!dataURI) {
      throw new Error('Data URI is empty or null');
    }

    try {
      // Check if it's a valid data URI format
      if (!dataURI.startsWith('data:')) {
        // If it's already a base64 string without data: prefix, add the prefix
        if (this.isBase64(dataURI)) {
          dataURI = 'data:image/jpeg;base64,' + dataURI;
        } else {
          throw new Error('Invalid data URI format - missing data: prefix');
        }
      }

      // Extract mime type and base64 data
      const matches = dataURI.match(/^data:(.*?);base64,/);
      if (!matches || matches.length < 2) {
        throw new Error('Invalid data URI format - cannot extract mime type');
      }

      const mimeString = matches[1];
      const base64Data = dataURI.substring(dataURI.indexOf(',') + 1);

      if (!base64Data) {
        throw new Error('No base64 data found in data URI');
      }

      // Validate base64 string
      if (!this.isValidBase64(base64Data)) {
        throw new Error('Invalid base64 data');
      }

      const byteString = atob(base64Data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type: mimeString });
    } catch (error) {
      console.error('Error converting data URI to Blob:', error);
      console.error(
        'Problematic data URI:',
        dataURI?.substring(0, 100) + '...',
      );
      throw new Error('Failed to convert image data: ' + error);
    }
  }

  // Helper method to check if string is base64
  private isBase64(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  // Helper method to validate base64
  private isValidBase64(str: string): boolean {
    if (!str) return false;
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str);
  }

  private calculatePassportCrop(faceBox: any) {
    const marginX = faceBox.width * 0.5; // 50% horizontal margin
    const marginY = faceBox.height * 0.7; // 70% vertical margin

    let x = Math.max(0, faceBox.x - marginX);
    let y = Math.max(0, faceBox.y - marginY);

    let width = faceBox.width + marginX * 2;
    let height = faceBox.height + marginY * 2;

    // Clamp width & height to image bounds
    if (x + width > this.originalImageWidth) {
      width = this.originalImageWidth - x;
    }
    if (y + height > this.originalImageHeight) {
      height = this.originalImageHeight - y;
    }

    return { x, y, width, height };
  }

  private debugImageState() {
    console.log('=== IMAGE STATE DEBUG ===');
    console.log(
      'URL:',
      this.url ? `Set (length: ${this.url.length})` : 'Not set',
    );
    console.log(
      'URL startsWith:',
      this.url ? this.url.substring(0, 50) + '...' : 'N/A',
    );
    console.log(
      'Original Base64:',
      this.originalBase64
        ? `Set (length: ${this.originalBase64.length})`
        : 'Not set',
    );
    console.log(
      'Cropped Base64:',
      this.croppedImageBase64
        ? `Set (length: ${this.croppedImageBase64?.length})`
        : 'Not set',
    );
    console.log(
      'Form Value:',
      this.personalForm.get('profile_Picture')?.value ? 'Set' : 'Not set',
    );
    console.log('Show Crop Dialog:', this.showCropDialog);
    console.log('========================');
  }

  removeImage() {
    this.memberService.Bank_Form_Get(this.member_Id).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.url = '';
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Removed Successfully',
        });
        this.safeurl = null;
      }
    });
  }
  setPersonalDetail() {
    if (this.memPersonalInfo && this.personalForm) {
      this.Issafeurl = true;
      this.personalForm.get('id')?.patchValue(this.memPersonalInfo.id);
      this.personalForm
        .get('member_Id')
        ?.patchValue(this.memPersonalInfo.member_ID);
      this.personalForm
        .get('first_Name')
        ?.patchValue(this.memPersonalInfo.first_Name);
      this.personalForm
        .get('last_Name')
        ?.patchValue(this.memPersonalInfo.last_Name);
      this.personalForm
        .get('father_Name')
        ?.patchValue(this.memPersonalInfo.father_Name);
      this.personalForm
        .get('date_Of_Birth')
        ?.patchValue(
          this.memPersonalInfo.date_Of_Birth
            ? moment(this.memPersonalInfo.date_Of_Birth).toDate()
            : null,
        );
      this.personalForm
        .get('ration_Card_Number')
        ?.patchValue(this.memPersonalInfo.ration_Card_Number); // TODO
      this.personalForm.get('email')?.patchValue(this.memPersonalInfo.email); // TODO
      this.personalForm.get('gender')?.patchValue(this.memPersonalInfo.gender);
      this.personalForm
        .get('community')
        ?.patchValue(this.memPersonalInfo.community, { onlySelf: false });
      this.personalForm.get('caste')?.patchValue(this.memPersonalInfo.caste);
      this.personalForm
        .get('marital_Status')
        ?.patchValue(this.memPersonalInfo.marital_Status);
      // this.personalForm
      //   .get('aadhaar_Number')
      //   ?.patchValue(this.memPersonalInfo.aadhaar_Number);
      if (!this.hideAadhaar) {
        this.personalForm
          .get('aadhaar_Number')
          ?.patchValue(this.memPersonalInfo.aadhaar_Number);
        this.personalForm
          .get('ration_Card_Number')
          ?.patchValue(this.memPersonalInfo.ration_Card_Number);
      }

      this.personalForm
        .get('phone_Number')
        ?.patchValue(this.memPersonalInfo.phone_Number);
      this.personalForm
        .get('education')
        ?.patchValue(this.memPersonalInfo.education);
      this.personalForm
        .get('religion')
        ?.patchValue(this.memPersonalInfo.religion, {
          onlySelf: false,
          emitEvent: false,
        });
      this.personalForm
        .get('profile_Picture')
        ?.patchValue(this.memPersonalInfo.profile_Picture);

      // this.url =
      //   this.memPersonalInfo.profile_Picture &&
      //   this.memPersonalInfo.profile_Picture != ''
      //     ? `${environment.apiUrl.replace('/api/', '')}/images/${
      //         this.memPersonalInfo.profile_Picture
      //       }`
      //     : '';
      const baseUrl = environment.apiUrl.replace('/api/', '');

      if (
        this.memPersonalInfo.profile_Picture &&
        this.memPersonalInfo.profile_Picture !== ''
      ) {
        const imgUrl = `${baseUrl}/images/${this.memPersonalInfo.profile_Picture}`;

        this.safeurl = this.sanitizer.bypassSecurityTrustUrl(imgUrl);
        this.Issafeurl = true;

        this.url = imgUrl;
      } else {
        this.url = '';
        this.safeurl = null;
        this.Issafeurl = false;
      }
    }
  }
  save(isSave: boolean) {
    if (
      isSave &&
      (!this.personalForm.get('phone_Number')?.valid ||
        !this.personalForm.get('email')?.valid)
    ) {
      this.personalForm.get('phone_Number')?.markAsTouched({ onlySelf: false });
      this.personalForm.get('phone_Number')?.markAsDirty({ onlySelf: false });
      this.personalForm
        .get('phone_Number')
        ?.setValue(this.personalForm.get('phone_Number')?.value);
      this.personalForm.get('email')?.markAsTouched({ onlySelf: false });
      this.personalForm.get('email')?.markAsDirty({ onlySelf: false });
      this.personalForm
        .get('email')
        ?.setValue(this.personalForm.get('email')?.value);
      return;
    }
    if (!this.personalForm.valid && !isSave) {
      triggerValueChangesForAll(this.personalForm);
      return;
    }
    if (!this.personalForm.valid && isSave) {
      triggerValueChangesForAll(this.personalForm);
      return;
    }
    this.memberService
      .Member_SaveUpdate({
        id: this.personalForm.get('id')?.value,
        member_ID: this.personalForm.get('member_ID')?.value,
        first_Name: this.personalForm.get('first_Name')?.value,
        last_Name: this.personalForm.get('last_Name')?.value,
        father_Name: this.personalForm.get('father_Name')?.value,
        email: this.personalForm.get('email')?.value,
        date_Of_Birth: this.personalForm.get('date_Of_Birth')?.value
          ? moment(this.personalForm.get('date_Of_Birth')?.value).format(
              'YYYY-MM-DD',
            )
          : undefined,
        gender: this.personalForm.get('gender')?.value,
        religion: this.personalForm.get('religion')?.value,
        community: this.personalForm.get('community')?.value,
        caste: this.personalForm.get('caste')?.value,
        marital_Status: this.personalForm.get('marital_Status')?.value,
        // aadhaar_Number: this.personalForm.get('aadhaar_Number')?.value,
        aadhaar_Number: this.hideAadhaar
          ? null
          : this.personalForm.get('aadhaar_Number')?.value,

        phone_Number: this.personalForm.get('phone_Number')?.value,
        education: this.personalForm.get('education')?.value,
        // ration_Card_Number: this.personalForm.get('ration_Card_Number')?.value,
        ration_Card_Number: this.hideAadhaar
          ? null
          : this.personalForm.get('ration_Card_Number')?.value,
        id_Card_Status: this.personalForm.get('id_Card_Status')?.value,
        isActive: true,
        isSubmit: !isSave,
        collectedByPhoneNumber: '',
        collectedByName: '',
        collectedOn: '',
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: x.message,
          });
          this.MovetoNext();
        }
      });
  }
  overallsave() {
    if (this.hideAadhaar) {
      this.personalForm.get('aadhaar_Number')?.disable();
      this.personalForm.get('aadhaar_Number')?.disable({ emitEvent: false });
      this.personalForm.get('ration_Card_Number')?.disable();
      this.personalForm
        .get('ration_Card_Number')
        ?.disable({ emitEvent: false });
    }

    if (!this.personalForm.valid) {
      triggerValueChangesForAll(this.personalForm);
      return null;
    }

    return {
      id: this.personalForm.get('id')?.value,
      member_ID: this.personalForm.get('member_ID')?.value,
      first_Name: this.personalForm.get('first_Name')?.value,
      last_Name: this.personalForm.get('last_Name')?.value,
      father_Name: this.personalForm.get('father_Name')?.value,
      email: this.personalForm.get('email')?.value,
      date_Of_Birth: this.personalForm.get('date_Of_Birth')?.value
        ? moment(this.personalForm.get('date_Of_Birth')?.value).format(
            'YYYY-MM-DD',
          )
        : undefined,
      gender: this.personalForm.get('gender')?.value,
      religion: this.personalForm.get('religion')?.value,
      community: this.personalForm.get('community')?.value,
      caste: this.personalForm.get('caste')?.value,
      marital_Status: this.personalForm.get('marital_Status')?.value,
      aadhaar_Number: this.personalForm.get('aadhaar_Number')?.value,
      phone_Number: this.personalForm.get('phone_Number')?.value,
      education: this.personalForm.get('education')?.value,
      ration_Card_Number: this.personalForm.get('ration_Card_Number')?.value,
      id_Card_Status: this.personalForm.get('id_Card_Status')?.value,
      isActive: true,
      isSubmit: true,
    };
  }
  MovetoNext() {
    this.formSaved.emit(2);
  }
}
