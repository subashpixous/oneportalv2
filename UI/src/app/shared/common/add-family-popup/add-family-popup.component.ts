import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { MemberService } from 'src/app/services/member.sevice';
import { UserService } from 'src/app/services/user.service';
import { SchemeConfigService } from 'src/app/services/SchemeConfig.Service';

@Component({
  selector: 'app-add-family-popup',
  templateUrl: './add-family-popup.component.html',
  styleUrls: ['./add-family-popup.component.scss']
})
export class AddFamilyPopupComponent implements OnInit {
  @Input() memberId: string = '';
  @Input() schemeGroupId: string = ''; 
  @Input() formDetail: any; 
  @Input() editData: any;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<any>();

  studyYearList = [
    { text: '1st Year', value: '1' },
    { text: '2nd Year', value: '2' },
    { text: '3rd Year', value: '3' },
    { text: '4th Year', value: '4' },
    { text: '5th Year', value: '5' }
  ];
  popupForm!: FormGroup;
  isLoading: boolean = false;
  maxDate!: Date;

  showOtpDialog: boolean = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  maskedAadhaar: string = '';
  otpTimer: number = 60;
  timerInterval: any;
  aadhaarTxn: string = '';
  otpErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private userservice: UserService,
    private schemeConfigService: SchemeConfigService, 
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
    this.initForm();
    this.fetchDropdownData(); 
    
    // if (this.editData) {
    //   this.patchEditData();
    // }
  }

  patchEditData() {
    if (!this.editData) return;

    const eduValue = this.editData.education || null;

    // 1. Set Education first to trigger UI containers & validators
    this.popupForm.get('education')?.setValue(eduValue, { emitEvent: true });

    // 2. Format Date
    const dobDate = this.editData.date_of_birth ? new Date(this.editData.date_of_birth) : null;

    // 3. Resolve mismatched variable names from backend JSON safely
    const currentStatus = this.editData.school_Status || this.editData.college_Status || null;
    const currentEmisUmis = eduValue === 'SCHOOL' 
      ? (this.editData.emiS_No || this.editData.eMISNo || '') 
      : (this.editData.umiS_No || this.editData.UMIS_No || '');

    // Fallbacks to handle District/Name parsing if backend only returns a combined string in Address
    const schoolName = this.editData.school_Name || this.editData.School_Name || this.editData.school_Address || '';

    const schoolAddress = this.editData.school_Address || this.editData.School_Address || '';
    
    const collegeName = this.editData.college_Name || this.editData.College_Name || this.editData.college_Address || '';

    const collegeAddress = this.editData.college_Address || this.editData.College_Address || '';

const rawSchoolDistrict = this.editData.school_District || this.editData.School_District || '';
    const rawCollegeDistrict = this.editData.college_District || this.editData.College_District || '';
    
    const mappedSchoolDistrict = this.getMatchedDistrictId(rawSchoolDistrict);
    const mappedCollegeDistrict = this.getMatchedDistrictId(rawCollegeDistrict);
    // 4. Patch Values
    this.popupForm.patchValue({
      id: this.editData.id,
      member_Id: this.editData.member_Id || this.memberId,
      name: this.editData.name || '',
      aadharNumber: this.editData.aadharNumber || '',
      phone_number: this.editData.phone_number || '',
      relation: this.editData.relation || null,
      sex: this.editData.sex || null,
      date_of_birth: dobDate,
      
      educationalStatus: currentStatus, 
      disability: this.editData.disability || null,
      education: eduValue,

      eMISNo: currentEmisUmis,
      nameandAddressofSchool: eduValue === 'SCHOOL' ? schoolName : collegeName,
      School_District: eduValue === 'SCHOOL' ? mappedSchoolDistrict : mappedCollegeDistrict,
      School_Address: eduValue === 'SCHOOL' ? schoolAddress : collegeAddress,

      standard: this.editData.standard || this.editData.Standard || null,
      course: this.editData.course || this.editData.Course || '',
      degreName: this.editData.degree_Name || this.editData.degreName || '',

      isActive: true,
      isSaved: true
    }, { emitEvent: false });

    // 5. Force Age Calculation (Disabled controls don't patch dynamically very well)
    if (dobDate) {
      const calculatedAge = this.calculateAge(dobDate);
      this.popupForm.get('age')?.setValue(calculatedAge.toString(), { emitEvent: false });
    }
    this.cdr.detectChanges();
  }
  // Helper to smartly find the correct District ID from the dropdown list
// ⭐ API-ல் இருந்து வரும் பெயரையும் Dropdown-ல் உள்ள பெயரையும் மேட்ச் செய்யும் ஸ்மார்ட் ஃபங்ஷன்
  private getMatchedDistrictId(apiDistrictName: string): string {
    if (!apiDistrictName || !this.formDetail?.district_SelectList) {
      return apiDistrictName || '';
    }

    let searchStr = apiDistrictName.trim().toLowerCase();

    // ஏதேனும் எழுத்துப்பிழைகள் இருந்தால் சரி செய்ய
    if (searchStr === 'sivagangai') searchStr = 'sivaganga';
    if (searchStr === 'kancheepuram') searchStr = 'kanchipuram';
    if (searchStr === 'thiruvallur') searchStr = 'tiruvallur';

    // முதல் 6 எழுத்துக்களை வைத்து மேட்ச் செய்ய
    const shortStr = searchStr.length > 6 ? searchStr.substring(0, 6) : searchStr;

    const match = this.formDetail.district_SelectList.find((d: any) => {
      const dropdownText = (d.text || '').toLowerCase();
      const dropdownValue = (d.value || '').toLowerCase();
      
      // Text-லோ அல்லது Value-லோ மேட்ச் ஆகிறதா என பார்க்கிறது
      return dropdownText.includes(searchStr) || dropdownText.includes(shortStr) || dropdownValue === searchStr;
    });

    return match ? match.value : apiDistrictName;
  }

  // fetchDropdownData() {
  //   if (this.memberId) {
  //     this.memberService.Member_Get_All(this.memberId).subscribe((res: any) => {
  //       if (res && res.data && res.data.familyMemberForm) {
  //         this.formDetail = res.data.familyMemberForm;
  //       }
  //     });
  //   }
  // }
  fetchDropdownData() {
    if (this.memberId) {
      this.memberService.Member_Get_All(this.memberId).subscribe((res: any) => {
        if (res && res.data && res.data.familyMemberForm) {
          this.formDetail = res.data.familyMemberForm;
          
          // ⭐ முக்கியம்: Dropdown data வந்த பிறகுதான் Patch செய்ய வேண்டும்
          if (this.editData) {
            this.patchEditData();
          }
        }
      });
    }
  }

  initForm() {
    this.popupForm = this.fb.group({
      id: [Guid.raw().toString()],
      member_Id: [this.memberId],
      
      name: ['', [Validators.required, Validators.minLength(3)]],
      aadharNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      relation: [null, Validators.required],
      sex: [null, Validators.required],
      
      date_of_birth: [null, Validators.required],
      age: [{ value: '', disabled: true }, [Validators.required]], 
      
      education: [null, Validators.required],
      educationalStatus: [null, Validators.required],
      disability: [null, Validators.required],
      
      eMISNo: [''], 
      course: [null],
      degreName: [''],
      nameandAddressofSchool: [''], 
      School_District: [''], 
      School_Address: [''], 
      standard: [null],

      year: [null],
      year_Of_Completion: [''],

      isActive: [true],
      isSaved: [true]
    });

    this.setupDynamicValidation();

    this.popupForm.get('date_of_birth')?.valueChanges.subscribe((dob: Date) => {
      if (dob) {
        const calculatedAge = this.calculateAge(dob);
        this.popupForm.patchValue({ age: calculatedAge.toString() }, { emitEvent: false }); 
      }
    });
  }

  calculateAge(dob: Date): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // setupDynamicValidation() {
  //   this.popupForm.get('education')?.valueChanges.subscribe(value => {
  //     ['eMISNo', 'standard', 'nameandAddressofSchool', 'School_District', 'School_Address', 'course', 'degreName'].forEach(field => {
  //       const control = this.popupForm.get(field);
  //       control?.clearValidators();

  //       if (!this.editData) {
  //         control?.setValue(null);
  //       }

  //       control?.updateValueAndValidity({ emitEvent: false });
  //     });

  //     if (value === 'SCHOOL') {
  //       this.popupForm.get('eMISNo')?.setValidators([Validators.required]);
  //       this.popupForm.get('standard')?.setValidators([Validators.required]);
  //       this.popupForm.get('nameandAddressofSchool')?.setValidators([Validators.required]);
  //       this.popupForm.get('School_District')?.setValidators([Validators.required]);
  //       this.popupForm.get('School_Address')?.setValidators([Validators.required]);
  //     } else if (value === 'COLLEGE') {
  //       this.popupForm.get('eMISNo')?.setValidators([Validators.required]);
  //       this.popupForm.get('course')?.setValidators([Validators.required]);
  //       this.popupForm.get('degreName')?.setValidators([Validators.required]);
  //       this.popupForm.get('nameandAddressofSchool')?.setValidators([Validators.required]);
  //       this.popupForm.get('School_District')?.setValidators([Validators.required]);
  //       this.popupForm.get('School_Address')?.setValidators([Validators.required]);
  //     }
      
  //     this.popupForm.updateValueAndValidity();
  //   });
  // }
  setupDynamicValidation() {
    this.popupForm.get('education')?.valueChanges.subscribe(value => {
      const dynamicFields = ['educationalStatus', 'eMISNo', 'standard', 'nameandAddressofSchool', 'School_District', 'School_Address', 'course', 'degreName', 'year', 'year_Of_Completion'];
      
      dynamicFields.forEach(field => {
        const control = this.popupForm.get(field);
        control?.clearValidators();

        if (!this.editData) {
          control?.setValue(null, { emitEvent: false });
        }
      });

      if (value === 'SCHOOL') {
        this.popupForm.get('eMISNo')?.setValidators([Validators.required]);
        this.popupForm.get('standard')?.setValidators([Validators.required]);
        this.popupForm.get('nameandAddressofSchool')?.setValidators([Validators.required]);
        this.popupForm.get('School_District')?.setValidators([Validators.required]);
        this.popupForm.get('School_Address')?.setValidators([Validators.required]);
      } else if (value === 'COLLEGE') {
        this.popupForm.get('eMISNo')?.setValidators([Validators.required]);
        this.popupForm.get('course')?.setValidators([Validators.required]);
        this.popupForm.get('degreName')?.setValidators([Validators.required]);
        this.popupForm.get('nameandAddressofSchool')?.setValidators([Validators.required]);
        this.popupForm.get('School_District')?.setValidators([Validators.required]);
        this.popupForm.get('School_Address')?.setValidators([Validators.required]);
      }
      
     
    dynamicFields.forEach(field => {
         this.popupForm.get(field)?.updateValueAndValidity({ emitEvent: false });
      });
      
      this.popupForm.updateValueAndValidity();
      this.checkCollegeStatusLogic(); // Re-trigger the sub-logic
    });

    // 2. Educational Status (Studying/Completed) மாறும்போது
    this.popupForm.get('educationalStatus')?.valueChanges.subscribe(() => {
      this.checkCollegeStatusLogic();
    });

    // 3. Year (1, 2, 3.. 5) மாறும்போது
    this.popupForm.get('year')?.valueChanges.subscribe(() => {
      this.checkCollegeStatusLogic();
    });
  }

  checkCollegeStatusLogic() {
    const isCollege = this.popupForm.get('education')?.value === 'COLLEGE';
    const status = this.popupForm.get('educationalStatus')?.value;
    const studyYear = this.popupForm.get('year')?.value;

    const yearCtrl = this.popupForm.get('year');
    const completionYearCtrl = this.popupForm.get('year_Of_Completion');

    // முதலில் Validation-ஐ க்ளியர் செய்கிறோம்
    yearCtrl?.clearValidators();
    completionYearCtrl?.clearValidators();

    if (isCollege && status === 'STUDYING') {
      yearCtrl?.setValidators([Validators.required]);
      
      if (studyYear === '5') {
         // 5th Year என்றால் Completion Year தேவையில்லை
         completionYearCtrl?.setValue('', { emitEvent: false });
      } else {
         completionYearCtrl?.setValidators([Validators.required]);
      }
    } else {
       // Completed அல்லது Discontinued என்றால் இரண்டையும் மறைத்து Value-ஐ க்ளியர் செய்கிறோம்
       if (!this.editData) {
         yearCtrl?.setValue(null, { emitEvent: false });
         completionYearCtrl?.setValue('', { emitEvent: false });
       }
    }

    yearCtrl?.updateValueAndValidity({ emitEvent: false });
    completionYearCtrl?.updateValueAndValidity({ emitEvent: false });
  }


onAadhaarEnter() {
    const aadhar = this.popupForm.get('aadharNumber')?.value;
    if (aadhar && aadhar.length === 12) {
      this.sendAadhaarOtp(aadhar);
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a valid 12-digit Aadhaar number.' });
    }
  }

  // --- NEW: Send Aadhaar OTP Method ---
  sendAadhaarOtp(aadhar: string) {
    this.isLoading = true;
    
    // Model matched from your workerlogin component
    const model = {
      AUAKUAParameters: {
        LAT: '17.494568', LONG: '78.392056', DEVMACID: '11:22:33:44:55',
        DEVID: 'public', CONSENT: 'Y', SHRC: 'Y', VER: '2.5', SERTYPE: '10',
        ENV: '2', CH: '0', AADHAARID: aadhar, SLK: 'JSTUX-KODGB-TXXEF-VELPU',
        RRN: Date.now().toString(), REF: 'FROMSAMPLE'
      },
      PIDXML: ':', ENVIRONMENT: '0'
    };

    this.memberService.SendAadhaarOtp(model).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // Stop if member already exists (if this applies to family members too)
        if (res?.message?.toLowerCase().includes('aadhaar number exist')) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
          return;
        }

        if (res.status?.toUpperCase() === 'SUCCESS') {
          this.aadhaarTxn = res.data.txn;
          this.maskedAadhaar = 'XXXX-XXXX-' + aadhar.slice(-4);
          this.otpDigits = ['', '', '', '', '', ''];
          this.otpErrorMessage = '';
          this.showOtpDialog = true;
          this.startOtpTimer();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message || 'Failed to send OTP' });
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Aadhaar OTP Error:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send Aadhaar OTP' });
      }
    });
  }

  // --- NEW: Verify OTP Method ---
  verifyOtp() {
    const otp = this.otpDigits.join('').trim();
    if (otp.length !== 6) {
      this.otpErrorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    const aadhar = this.popupForm.get('aadharNumber')?.value;
    const model = {
      AUAKUAParameters: {
        LAT: '17.494568', LONG: '78.392056', DEVMACID: '11:22:33:44:55',
        DEVID: 'public', CONSENT: 'Y', SHRC: 'Y', VER: '2.5', SERTYPE: '05',
        ENV: '2', AADHAARID: aadhar, SLK: 'JSTUX-KODGB-TXXEF-VELPU',
        RRN: Date.now().toString(), REF: 'FROMSAMPLE', TXN: this.aadhaarTxn,
        OTP: otp, LANG: 'N', PFR: 'N'
      },
      PIDXML: '', ENVIRONMENT: '0'
    };

    this.memberService.ValidateAadhaarOtp(model).subscribe({
      next: (res: any) => {
        if (res.status?.toUpperCase() === 'SUCCESS') {
          this.closeOtpDialog();
          this.messageService.add({ severity: 'success', summary: 'Verified', detail: 'Aadhaar Verified Successfully' });
          
          // 1. Fetch PDS details now that we know the Aadhaar is legit
          this.userservice.getPDSDetails(aadhar).subscribe((pdsRes: any) => {
            if (pdsRes.status === 'SUCCESS' && pdsRes.data?.length > 0) {
              const apiData = pdsRes.data[0];
              this.popupForm.patchValue({
                name: apiData.name_in_english || this.popupForm.value.name,
                phone_number: apiData.mobileNumber || this.popupForm.value.phone_number
              });
            }
          });

          // 2. Map eKYC demographic data if returned directly from ValidateAadhaarOtp
          if (res.data) {
            const ekycData = res.data;
            let dobDate: Date | null = null;
            
            if (ekycData.dob) {
              const parts = ekycData.dob.split('-');
              if (parts.length === 3) {
                 // Format is assumed DD-MM-YYYY based on typical Aadhaar response
                 dobDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
              }
            }

            // Map Gender safely
            let mappedGender = null;
            if (ekycData.gender && this.formDetail?.gender_SelectList) {
              const targetText = ekycData.gender.toUpperCase() === 'M' ? 'male' : 'female';
              const found = this.formDetail.gender_SelectList.find((x: any) =>
                x.text?.toLowerCase().startsWith(targetText)
              );
              mappedGender = found ? found.value : null;
            }

            this.popupForm.patchValue({
              name: ekycData.name || this.popupForm.value.name,
              sex: mappedGender || this.popupForm.value.sex,
              date_of_birth: dobDate || this.popupForm.value.date_of_birth,
              phone_number: ekycData.phoneNumber || this.popupForm.value.phone_number
            });

            if (ekycData.name) this.popupForm.get('name')?.disable();
if (mappedGender) this.popupForm.get('sex')?.disable();
if (dobDate) this.popupForm.get('date_of_birth')?.disable();
if (ekycData.phoneNumber) this.popupForm.get('phone_number')?.disable();

            // Re-trigger age calculation
            if (dobDate) {
              const age = this.calculateAge(dobDate);
              this.popupForm.patchValue({ age: age.toString() });
            }
          }
          
        } else {
          this.otpErrorMessage = res.message || 'OTP verification failed';
        }
      },
      error: () => {
        this.otpErrorMessage = 'OTP verification failed. Please try again.';
      }
    });
  }

  // --- NEW: Timer and Modal Controls ---
  startOtpTimer() {
    this.otpTimer = 60;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        clearInterval(this.timerInterval);
        this.otpErrorMessage = 'OTP expired. Please resend OTP';
      }
    }, 1000);
  }

  resendOtp() {
    if (this.otpTimer > 0) return;
    const aadhar = this.popupForm.get('aadharNumber')?.value;
    if (aadhar) this.sendAadhaarOtp(aadhar);
  }

  closeOtpDialog() {
    this.showOtpDialog = false;
    this.otpDigits = ['', '', '', '', '', ''];
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // --- NEW: Input Handling ---
  trackByIndex(index: number): number { return index; }

  onOtpInput(event: any, index: number) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.otpDigits[index] = value;
    if (value && index < 5) {
      const next = event.target.parentElement.children[index + 1];
      if (next) next.focus();
    }
  }

  onOtpKeyDown(event: any, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prev = event.target.parentElement.children[index - 1];
      if (prev) prev.focus();
    }
  }
onEMISEnter() {
    const emis = this.popupForm.get('eMISNo')?.value;
    const isSchool = this.popupForm.get('education')?.value === 'SCHOOL';
    
    if (emis && isSchool) {
      this.userservice.getEMISDetails(emis).subscribe((res: any) => {
        if (res.status === 'SUCCESS' && res.data) {
          

const mappedDistrictId = this.getMatchedDistrictId(res.data.district_name);
          this.popupForm.patchValue({
            nameandAddressofSchool: res.data.school_name,
            School_District: mappedDistrictId,
            School_Address: `${res.data.school_name}, ${res.data.district_name}`
          });
          this.cdr.detectChanges()
        }
      });
      this.popupForm.get('nameandAddressofSchool')?.disable();
        this.popupForm.get('School_District')?.disable();
        this.popupForm.get('School_Address')?.disable();
    }
  }
onUMISEnter() {
    const umis = this.popupForm.get('eMISNo')?.value;
    const isCollege = this.popupForm.get('education')?.value === 'COLLEGE';
    
    if (umis && isCollege) {
      this.userservice.getUMISDetails(umis).subscribe({
        next: (res: any) => {
          if (res.status === 'SUCCESS' && res.data) {
            const data = res.data;
            
const mappedDistrictId = this.getMatchedDistrictId(data.districtName || '');
            let patchData: any = {
              nameandAddressofSchool: data.instituteName || '', 
              School_District: mappedDistrictId,
              School_Address: '' 
            };


            if (data.courseType) {
              patchData.course = this.formDetail?.education_SelectList
                ?.find((x: any) =>
                  x.text.split(' ')[0].toUpperCase() === data.courseType.toUpperCase()
                )?.value || null;
            }

            if (data.academicStatusType === 'Studying in this institute') {
              patchData.educationalStatus = this.formDetail?.education_Status_SelectList
                ?.find((x: any) => x.value === 'STUDYING')?.value || null;
            } else {
              patchData.educationalStatus = null;
            }

this.popupForm.patchValue(patchData);

// ADD THESE LINES TO LOCK THE FIELDS:
if (patchData.nameandAddressofSchool) this.popupForm.get('nameandAddressofSchool')?.disable();
if (patchData.School_District) this.popupForm.get('School_District')?.disable();
if (patchData.course) this.popupForm.get('course')?.disable();
if (patchData.educationalStatus) this.popupForm.get('educationalStatus')?.disable();

this.cdr.detectChanges();
          } else {
            this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'No UMIS details found' });
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch UMIS details' });
        }
      });
    }
  }

  submitPopup() {
    if (this.popupForm.invalid) {
      this.popupForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all mandatory fields.' });
      return;
    }
    
    this.isLoading = true; 
    let payload = this.popupForm.getRawValue(); // gets the disabled Age successfully

    if (payload.age !== null && payload.age !== undefined) {
      payload.age = payload.age.toString(); 
    }

    payload.f_id = this.editData?.f_id || "";

    if (payload.education === 'SCHOOL') {
        payload.EMIS_No = payload.eMISNo;
        payload.emiS_No = payload.eMISNo;
        
        payload.School_Name = payload.nameandAddressofSchool;
        payload.school_Name = payload.nameandAddressofSchool;
        
        payload.School_District = payload.School_District;
        payload.school_District = payload.School_District;
        
        payload.School_Address = payload.School_Address;
        payload.school_Address = payload.School_Address;
        
        payload.Standard = payload.standard;
        payload.school_Status = payload.educationalStatus;
        
        // Clear College fields
        payload.UMIS_No = "";
        payload.uMIS_No = "";
        payload.College_Name = "";
        payload.college_Name = "";
        payload.College_District = "";
        payload.college_District = "";
        payload.College_Address = "";
        payload.college_Address = "";
        payload.Course = "";
        payload.Degree_Name = "";
        payload.college_Status = ""; 
    } 
    else if (payload.education === 'COLLEGE') {
        payload.UMIS_No = payload.eMISNo;
        payload.uMIS_No = payload.eMISNo;
        
        payload.College_Name = payload.nameandAddressofSchool;
        payload.college_Name = payload.nameandAddressofSchool;
        
        payload.College_District = payload.School_District;
        payload.college_District = payload.School_District;
        
        payload.College_Address = payload.School_Address;
        payload.college_Address = payload.School_Address;
        
        payload.Course = payload.course;
        
        payload.Degree_Name = payload.degreName;
        payload.degree_Name = payload.degreName;
        
        payload.college_Status = payload.educationalStatus;
        
        // Clear School fields
        payload.EMIS_No = "";
        payload.emiS_No = "";
        payload.School_Name = "";
        payload.school_Name = "";
        payload.School_District = "";
        payload.school_District = "";
        payload.School_Address = "";
        payload.school_Address = "";
        payload.Standard = "";
        payload.school_Status = "";
    }

    // FIX: Only apply fields that don't overwrite the statuses we just set above
    if (this.editData) {
       payload.discontinuedYear = this.editData.discontinuedYear || "";
       payload.occupation = this.editData.occupation || "";
       payload.status = this.editData.status || "";
       payload.year = this.editData.year || "";
       payload.year_Of_Completion = this.editData.year_Of_Completion || "";
       
       // Note: I deliberately REMOVED payload.school_Status = this.editData.school_Status from here.
       // That is what was causing your status to revert/fail to save previously!
    }

    this.memberService.Family_SaveUpdate(payload).subscribe({
      next: (res: any) => {
        if (res && res.status === 'SUCCESS') {
          this.checkEligibility();
        } else {
          this.isLoading = false; 
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        }
      },
      error: (err: any) => {
        this.isLoading = false; 
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save family member.' });
      }
    });
  }
  checkEligibility() {
    this.schemeConfigService.Member_Eligibilty_Get_By_Scheme(this.schemeGroupId, this.memberId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.status === 'SUCCESS') {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Family member saved successfully!' });
          this.onSuccess.emit(res.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Eligibility Error', detail: 'Could not fetch eligibility.' });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Eligibility check failed.' });
      }
    });
  }
  allowOnlyNumbers(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  allowOnlyLetters(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || charCode === 32) {
      return true;
    }
    event.preventDefault();
    return false;
  }
  closePopup() {
    this.onCancel.emit();
  }
}