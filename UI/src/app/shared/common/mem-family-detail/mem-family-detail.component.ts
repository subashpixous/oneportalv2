import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import {
  ConfirmationService,
  ConfirmEventType,
  MenuItem,
  MessageService,
} from 'primeng/api';
import {
  FamilyMemberFormModel,
  FamilyMemberModel,
} from 'src/app/_models/MemberDetailsModel';
import { TCModel } from 'src/app/_models/user/usermodel';
import { GeneralService } from 'src/app/services/general.service';
import { MemberService } from 'src/app/services/member.sevice';
import { triggerValueChangesForAll } from '../../commonFunctions';
import { ErrorStatus, FailedStatus } from 'src/app/_models/ResponseStatus';
import moment from 'moment';
import { FamilyMemberEducation } from 'src/app/_models/MemberViewModelExsisting';
import { MemDocumentDetailComponent } from '../mem-document-detail/mem-document-detail.component';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-mem-family-detail',
  templateUrl: './mem-family-detail.component.html',
  styleUrls: ['./mem-family-detail.component.scss'],
})
export class MemFamilyDetailComponent {
  @Input() member_Id: string = '';
  @Input() isTemp!: boolean;
  familyMembersForm!: FormGroup;
  maxDobDate!: Date;
  @Input() familyMemberList: FamilyMemberModel[] | undefined;
  @Input() formDetail?: FamilyMemberFormModel;
  @Input() isReadonly: boolean = true;
  @Input() showNextButton: boolean = true;
  @Input() isOfficerEdit: boolean = false;

  @Output() formSaved = new EventEmitter<Number>();
  @Output() formDataChange = new EventEmitter<any>();

  // @ViewChild('manDatoryDocuments')
  familyForm!: FormGroup;

  MemDocumentDetailComponent!: MemDocumentDetailComponent;
  canDelete: boolean = false;
  visible: boolean = false;
  visiblefd: boolean = false;
  name!: string;
  items!: MenuItem[];
  errorMessage: string = '';

  maxDate: Date = new Date();
  minDate: Date = moment(new Date(1930, 0, 1)).toDate();
  activeIndex: number = 0;
  emisLoading: { [key: number]: boolean } = {};
  currentYear = new Date().getFullYear();

comp_minDate = new Date(this.currentYear, 0, 1);   // Jan 1 current year
comp_maxDate = new Date(this.currentYear, 11, 31);

  toggleDetails(index: number) {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;

    const row = this.members.at(index) as FormGroup;

    Object.values(row.controls).forEach((control) => {
      control.markAsUntouched();
    });
  }
  onActiveIndexChange(event: number) {
    this.activeIndex = event;
  }
  bankForm!: FormGroup;
  expandedRows: boolean[] = [];
  expandedRowIndex: number | null = null;
  rationNumber: string = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private userservice: UserService,
    private fb: FormBuilder,
  ) {}
  ngOnInit() {
    const today = new Date();
    this.maxDobDate = new Date(today.setDate(today.getDate() - 1));
    console.log(this.formDetail);
    console.log(this.formDetail?.district_SelectList);
    console.log('ngOnInit family');

    this.items = [];
    this.familyForm = this.fb.group({
      members: this.fb.array([]),
    });

    // Fresh user
    // if (!this.familyMemberList || this.familyMemberList.length === 0) {
    //   this.addRow();
    // }
    this.familyForm.valueChanges.subscribe(() => {
      this.formDataChange.emit({
        value: this.familyForm.value,
        valid: this.familyForm.valid,
      });
    });
    this.initializeFamily();
    const saved = localStorage.getItem('rationNumber');
    if (saved) {
      this.rationNumber = saved;
    }

    const savedFamily = sessionStorage.getItem('familyData');

if (savedFamily) {
  const members = JSON.parse(savedFamily);

  this.members.clear();

  members.forEach((m: any) => {
    this.members.push(this.createMemberGroup(m));
  });
}
  }

  initializeFamily() {
    this.members.clear();

    if (this.familyMemberList && this.familyMemberList.length > 0) {
      this.familyMemberList.forEach((member) => {
        const group = this.createMemberGroup(member);

        this.members.push(group);

        this.setupDynamicValidation(group);
      });
    } else {
          const savedFamily = sessionStorage.getItem('familyData');

if (savedFamily) {
  const members = JSON.parse(savedFamily);

  this.members.clear();

  members.forEach((m: any) => {
    this.members.push(this.createMemberGroup(m));
  });
}
else{
      this.addRow();
    }
  }
  }
  truncate(text: string | undefined): string {
    if (!text) return '';
    return text.length > 14 ? text.substring(0, 14) + '...' : text;
  }
  saveRationNumber(value: string) {
    localStorage.setItem('rationNumber', value);
  }
  createMemberFromPDS(api: any): FormGroup {
  
    const group = this.fb.group({
      id: [Guid.raw().toString()],
      member_Id: [this.member_Id],

      name: [api?.name_in_english || '', [Validators.minLength(3),Validators.required]],
      relation: [
        this.mapRelationFromApi(api?.familyRelationship),
        Validators.required,
      ],

      sex: [this.mapGenderFromApi(api?.sex), Validators.required],

      date_of_birth: [api?.dob ? new Date(api.dob) : null, Validators.required],

      age: [api?.dob ? this.calculateAge(api.dob) : ''],

      phone_number: [
        api?.mobileNumber || '',
        [
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],

      education: [null, Validators.required],
      standard: [null],
      school_Status: [null],
      college_Status: [null],
      eMIS_No: [''],
      uMIS_No: [''],
      year_Of_Completion: [null],
      discontinuedYear: [null],
      // nameandAddressofSchool: [''],
      school_Name: [''],
      school_District: [''],
      school_Address: [''],
      college_Name: [''],
      college_District: [''],
      college_Address: [''],

      course: [null],
      degree_Name: [''],
      year: [null],
      aadharNumber: [
        null,
        [ 
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],

      occupation: [''],
      disability: [null, Validators.required],

      isActive: [true],
      pdsVerified: [true],
    });

    // this.setupDynamicValidation(group);

    group.get('date_of_birth')?.valueChanges.subscribe((date) => {
      if (date) {
        const age = this.calculateAge(date);
        group.patchValue({ age: age }, { emitEvent: false });
      }
    });

    return group;
  }

  loadPDSData(rationNo: string) {
    if (!rationNo) return;
    localStorage.setItem('rationNumber', rationNo);
    this.userservice.getPDSDetails(rationNo).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS' && res.data?.length > 0) {
          this.members.clear();

          res.data.forEach((item: any) => {
            const group = this.createMemberFromPDS(item);
            this.members.push(group);
            this.setupDynamicValidation(group);
          });

          this.cdr.detectChanges();
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No family members found',
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch PDS details',
        });
      },
    });
  }
  mapRelationFromApi(relation: string) {
    if (!relation) return null;

    if (!this.formDetail?.family_Member_SelectList?.length) {
      console.log('Relation list not loaded yet');
      return null;
    }

    const list = this.formDetail.family_Member_SelectList;

    const normalizedRelation = relation.trim().toLowerCase();

    const found = list.find((x) => {
      const mainText = x.text.split('/')[0].trim().toLowerCase();
      return mainText === normalizedRelation;
    });

    console.log('Matched relation:', found);

    return found ? found.value : null;
  }
  private mapGenderFromApi(apiGender: string): string | null {
    if (!this.formDetail?.gender_SelectList) return null;

    const genders = this.formDetail.gender_SelectList;

    if (apiGender === 'M') {
      return (
        genders.find((g) => g.text.toLowerCase().startsWith('male'))?.value ||
        null
      );
    }

    if (apiGender === 'F') {
      return (
        genders.find((g) => g.text.toLowerCase().startsWith('female'))?.value ||
        null
      );
    }

    if (apiGender === 'T') {
      return (
        genders.find((g) => g.text.toLowerCase().startsWith('trans'))?.value ||
        null
      );
    }

    return null;
  }
  getEducationValue(index: number): string | null {
    // alert(this.members.at(index).get('education')?.value);
    return this.members.at(index).get('education')?.value;
  }

  getStatusValue(index: number): string | null {
    return this.members.at(index).get('educationalStatus')?.value;
  }
  get members(): FormArray {
    return this.familyForm.get('members') as FormArray;
  }

  // addRow(data?: any): void {
  //   this.members.push(this.createMemberGroup(data));
  // }
  addRow(data?: any): void {
    const group = this.createMemberGroup(data);

    this.members.push(group);

    this.setupDynamicValidation(group);

    setTimeout(() => {
      group.updateValueAndValidity();
    });
  }
  // addRow(data?: any): void {

  //   const group = this.createMemberGroup(data);

  //   this.members.push(group);

  //   this.setupDynamicValidation(group);

  // }
  removeRow(index: number): void {
    this.members.removeAt(index);
    this.familyForm.updateValueAndValidity();
  }

  createMemberGroup(data?: any): FormGroup {
    const group = this.fb.group({
      id: [data?.id || Guid.raw().toString()],
      member_Id: [this.member_Id],

      name: [
        data?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(300),
          Validators.pattern(/^[a-zA-Z ]*$/),
        ],
      ],

      relation: [data?.relation || null, [Validators.required]],
      sex: [data?.sex || null, [Validators.required]],

      // date_of_birth: [data?.date_of_birth || null, [Validators.required]],
      date_of_birth: [
        data?.date_of_birth ? new Date(data.date_of_birth) : null,
        [Validators.required],
      ],

      age: [
        data?.age || '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.maxLength(3),
        ],
      ],

      aadharNumber: [
        data?.aadharNumber || '',
        [
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],

      phone_number: [
        data?.phone_number || '',
        [
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],

      education: [data?.education || null, [Validators.required]],

      standard: [data?.standard || null],
      school_Status: [data?.school_Status || null],
      college_Status: [data?.college_Status || null],
      eMIS_No: [data?.emiS_No||data?.eMIS_No || ''],
      uMIS_No: [data?.umiS_No||data?.uMIS_No || ''],
      year_Of_Completion: [ data?.year_Of_Completion ? new Date(data.year_Of_Completion) : null],
      discontinuedYear: [data?.discontinuedYear || null],
      school_Name: [data?.school_Name || ''],
      school_District: [data?.school_District || ''],
      school_Address: [data?.school_Address || ''],
      college_Name: [data?.college_Name || ''],
      college_District: [data?.college_District || ''],
      college_Address: [data?.college_Address || ''],
      course: [data?.course || ''],
      degree_Name: [data?.degree_Name || ''],
      year: [data?.year || null],
      
      occupation: [data?.occupation || '', []],

      disability: [data?.disability || null, [Validators.required]],

      isActive: [true],
      pdsVerified: [false],
    });

    // this.setupDynamicValidation(group);
    group.get('course')?.disable({ emitEvent: false });
    group.get('degree_Name')?.disable({ emitEvent: false });
    group.get('date_of_birth')?.valueChanges.subscribe((date) => {
      if (date) {
        const age = this.calculateAge(date);
        group.patchValue({ age: age }, { emitEvent: false });
      }
    });

    return group;
  }
  setupDynamicValidation(row: FormGroup) {
    if ((row as any)._validationAttached) return;
    (row as any)._validationAttached = true;

    const education = row.get('education');

    const standard = row.get('standard');
    const emis = row.get('eMIS_No');
    const schoolStatus = row.get('school_Status');

    const course = row.get('course');
    const degree = row.get('degree_Name');
    const collegeStatus = row.get('college_Status');
    const umis = row.get('uMIS_No');

    const year_Of_Completion = row.get('year_Of_Completion');
    const discontinuedYear = row.get('discontinuedYear');
    const year = row.get('year');
    const schoolName = row.get('school_Name');
    const schoolDistrict = row.get('school_District');
    const schoolAddress = row.get('school_Address');

    const collegeName = row.get('college_Name');
    const collegeDistrict = row.get('college_District');
    const collegeAddress = row.get('college_Address');

    function clearAll() {
      [
        standard,
        emis,
        umis,
        schoolStatus,
        course,
        degree,
        collegeStatus,
        year_Of_Completion,
        discontinuedYear,
        year,
      ].forEach((c) => {
        c?.clearValidators();
        c?.updateValueAndValidity({ emitEvent: false });
      });
    }

    // function applySchoolValidation() {
    //   clearAll();

    //   standard?.setValidators([Validators.required]);
    //   emis?.setValidators([Validators.required]);
    //   schoolStatus?.setValidators([Validators.required]);

    //   standard?.enable({ emitEvent: false });
    //   emis?.enable({ emitEvent: false });

    //   course?.disable({ emitEvent: false });
    //   degree?.disable({ emitEvent: false });
    // }

    // function applyCollegeValidation() {
    //   clearAll();

    //   course?.setValidators([Validators.required]);
    //   degree?.setValidators([Validators.required]);
    //   collegeStatus?.setValidators([Validators.required]);

    //   course?.enable({ emitEvent: false });
    //   degree?.enable({ emitEvent: false });

    //   standard?.disable({ emitEvent: false });
    //   emis?.disable({ emitEvent: false });
    // }
    function applySchoolValidation() {
      clearAll();

      // CLEAR COLLEGE DATA
      course?.reset(null, { emitEvent: false });
      degree?.reset(null, { emitEvent: false });
      umis?.reset(null, { emitEvent: false });
      collegeStatus?.reset(null, { emitEvent: false });
      year?.reset(null, { emitEvent: false });
      year_Of_Completion?.reset(null, { emitEvent: false });
      discontinuedYear?.reset(null, { emitEvent: false });

      collegeName?.reset(null, { emitEvent: false });
      collegeDistrict?.reset(null, { emitEvent: false });
      collegeAddress?.reset(null, { emitEvent: false });
      standard?.setValidators([Validators.required]);
      emis?.setValidators([Validators.required]);
      schoolStatus?.setValidators([Validators.required]);

      standard?.enable({ emitEvent: false });
      emis?.enable({ emitEvent: false });

      course?.disable({ emitEvent: false });
      degree?.disable({ emitEvent: false });
      umis?.disable({ emitEvent: false });
      collegeStatus?.disable({ emitEvent: false });
    }
    function applyCollegeValidation() {
      clearAll();

      // CLEAR SCHOOL DATA
      standard?.reset(null, { emitEvent: false });
      emis?.reset(null, { emitEvent: false });
      schoolStatus?.reset(null, { emitEvent: false });

      year_Of_Completion?.reset(null, { emitEvent: false });
      discontinuedYear?.reset(null, { emitEvent: false });

      schoolName?.reset(null, { emitEvent: false });
      schoolDistrict?.reset(null, { emitEvent: false });
      schoolAddress?.reset(null, { emitEvent: false });

      course?.setValidators([Validators.required]);
      umis?.setValidators([Validators.required]);
      degree?.setValidators([Validators.required]);
      collegeStatus?.setValidators([Validators.required]);

      course?.enable({ emitEvent: false });
      umis?.enable({ emitEvent: false });
      degree?.enable({ emitEvent: false });
      collegeStatus?.enable({ emitEvent: false });

      standard?.disable({ emitEvent: false });
      emis?.disable({ emitEvent: false });
    }
    function applyNAValidation() {
      clearAll();

      [
        standard,
        emis,
        umis,
        schoolStatus,
        course,
        degree,
        collegeStatus,
        year_Of_Completion,
        discontinuedYear,
        year,
        schoolName,
        schoolDistrict,
        schoolAddress,
        collegeName,
        collegeDistrict,
        collegeAddress,
      ].forEach((control) => {
        control?.reset(null, { emitEvent: false });
        control?.clearValidators();
        control?.disable({ emitEvent: false });
        control?.updateValueAndValidity({ emitEvent: false });
      });
    }

    education?.valueChanges.subscribe((value) => {
      if (value === 'SCHOOL') {
        this.expandedRowIndex;
        applySchoolValidation();
      } else if (value === 'COLLEGE') {
        this.expandedRowIndex;
        applyCollegeValidation();
      } else if (value === 'NA') {
        applyNAValidation();
      }

      row.updateValueAndValidity({ emitEvent: false });
    });

    /**
     * SCHOOL STATUS LOGIC
     */

    schoolStatus?.valueChanges.subscribe((status) => {
      standard?.clearValidators();
      year_Of_Completion?.clearValidators();
      discontinuedYear?.clearValidators();

      if (status === 'STUDYING') {
        standard?.setValidators([Validators.required]);
        year_Of_Completion?.setValidators([Validators.required]);
      }

      if (status === 'COMPLETED') {
        year_Of_Completion?.setValidators([Validators.required]);
      }

      if (status === 'DISCONTINUED') {
        discontinuedYear?.setValidators([Validators.required]);
      }

      standard?.updateValueAndValidity({ emitEvent: false });
      year_Of_Completion?.updateValueAndValidity({ emitEvent: false });
      discontinuedYear?.updateValueAndValidity({ emitEvent: false });
    });
    /**
     * COLLEGE STATUS LOGIC
     */

    collegeStatus?.valueChanges.subscribe((status) => {
      year?.clearValidators();
      year_Of_Completion?.clearValidators();
      discontinuedYear?.clearValidators();

      if (status === 'STUDYING') {
          year_Of_Completion?.setValidators([Validators.required]);
          year_Of_Completion?.markAsPristine();
          year_Of_Completion?.markAsUntouched();
          this.resetControl(year_Of_Completion);
          year?.setValidators([Validators.required]);
      
      }

      if (status === 'COMPLETED') {
        year_Of_Completion?.setValidators([Validators.required]);
        year_Of_Completion?.markAsPristine();
        year_Of_Completion?.markAsUntouched();
        this.resetControl(year_Of_Completion);
      }

      if (status === 'DISCONTINUED') {
        discontinuedYear?.setValidators([Validators.required]);
      }

      year?.updateValueAndValidity({ emitEvent: false });
      year_Of_Completion?.updateValueAndValidity({ emitEvent: false });
      discontinuedYear?.updateValueAndValidity({ emitEvent: false });
    });
  }

  generateFiveMembers() {
    const members = [
      {
        name: 'Ramesh',
        relation: '6a660d78-202d-ddb3-e26c-16067305d323',
        sex: 'a816116a-4004-0b34-ddb8-5e4b8b30e764',
        date_of_birth: new Date(1978, 4, 10),
        age: 46,
        aadharNumber: '123456789012',
        phone_number: '9876543210',
        education: 'NA',
        disability: '052ccff1-9f14-bfd3-93a6-4a9aeda910a1',
      },

      {
        name: 'Lakshmi',
        relation: '6a660d78-202d-ddb3-e26c-16067305d323',
        sex: 'a816116a-4004-0b34-ddb8-5e4b8b30e764',
        date_of_birth: new Date(1982, 7, 5),
        age: 42,
        aadharNumber: '123456789013',
        phone_number: '9876543211',
        education: 'NA',
        disability: '052ccff1-9f14-bfd3-93a6-4a9aeda910a1',
      },

      {
        name: 'Arun',
        relation: '6a660d78-202d-ddb3-e26c-16067305d323',
        sex: 'a816116a-4004-0b34-ddb8-5e4b8b30e764',
        date_of_birth: new Date(2008, 2, 10),
        age: 16,
        aadharNumber: '123456789014',
        phone_number: '9876543212',
        education: 'SCHOOL',
        school_Status: 'STUDYING',
        standard: '10',
        eMIS_No: 'EMIS1001',
        disability: '052ccff1-9f14-bfd3-93a6-4a9aeda910a1',
      },

      {
        name: 'Divya',
        relation: '6a660d78-202d-ddb3-e26c-16067305d323',
        sex: 'a816116a-4004-0b34-ddb8-5e4b8b30e764',
        date_of_birth: new Date(2004, 8, 20),
        age: 20,
        aadharNumber: '123456789015',
        phone_number: '9876543213',
        education: 'COLLEGE',
        course: 'bff9e8af-f937-850f-f2a2-975fe9152471',
        degree_Name: 'B.Sc',
        college_Status: 'STUDYING',
        year: '2',
        disability: '052ccff1-9f14-bfd3-93a6-4a9aeda910a1',
        umisId: 'UMIS2001',
      },

      {
        name: 'Mani',
        relation: '6a660d78-202d-ddb3-e26c-16067305d323',
        sex: 'a816116a-4004-0b34-ddb8-5e4b8b30e764',
        date_of_birth: new Date(1998, 11, 15),
        age: 26,
        aadharNumber: '123456789016',
        phone_number: '9876543214',
        education: 'NA',
        disability: '052ccff1-9f14-bfd3-93a6-4a9aeda910a1',
      },
    ];

    this.members.clear();

    members.forEach((data) => {
      const group = this.createMemberGroup(data);

      this.members.push(group);

      this.setupDynamicValidation(group);

      group.patchValue(data);
    });
    this.familyForm.markAllAsTouched();
  }
  markAllAsTouched() {
    this.familyForm.markAllAsTouched();

    const members = this.familyForm.get('members') as FormArray;
    members.controls.forEach((group) => group.markAllAsTouched());
  }

  // loadEMISData(emisNo: string, index: number) {
  //   if (!emisNo) return;

  //   const row = this.members.at(index) as FormGroup;

  //   this.userservice.getEMISDetails(emisNo).subscribe({
  //     next: (res) => {
  //       if (res.status === 'SUCCESS' && res.data) {
  //         const data = res.data;

  //         let patchData: any = {
  //           school_Name: data.school_name || '',
  //           school_District: this.mapDistrictFromApi(data.district_name),
  //           school_Address: `${data.school_name || ''}, ${data.district_name || ''}`,
  //         };

  //         if (data.class_studying_id) {
  //           patchData.school_Status =
  //             this.formDetail?.education_Status_SelectList?.find(
  //               (x) => x.value === 'STUDYING',
  //             )?.value || null;

  //           patchData.standard =
  //             this.formDetail?.education_Standard_SelectList?.find(
  //               (x) => x.value === data.class_studying_id,
  //             )?.value || null;
  //         }

  //         row.patchValue(patchData);
  //       } else {
  //         this.messageService.add({
  //           severity: 'warn',
  //           summary: 'No Data',
  //           detail: 'No EMIS details found',
  //         });
  //       }
  //     },

  //     error: () => {
  //       // this.messageService.add({
  //       //   severity: 'error',
  //       //   summary: 'Error',
  //       //   detail: 'Failed to fetch EMIS details',
  //       // });
  //     },
  //   });
  // }

  loadEMISData(emisNo: string, index: number) {
    if (!emisNo || this.emisLoading[index]) return;

    this.emisLoading[index] = true;

    const row = this.members.at(index) as FormGroup;

    this.userservice.getEMISDetails(emisNo).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS' && res.data) {
          const data = res.data;

          let patchData: any = {
            school_Name: data.school_name || '',
            school_District: this.mapDistrictFromApi(data.district_name),
            school_Address: `${data.school_name || ''}, ${data.district_name || ''}`,
          };

          if (data.class_studying_id) {
            patchData.school_Status =
              this.formDetail?.education_Status_SelectList?.find(
                (x) => x.value === 'STUDYING',
              )?.value || null;

            patchData.standard =
              this.formDetail?.education_Standard_SelectList?.find(
                (x) => x.value === data.class_studying_id,
              )?.value || null;
          }

          row.patchValue(patchData);
        } else {
          // this.showToastOnce('warn', 'No Data', 'No EMIS details found');
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No EMIS details found',
          });
        }

        this.emisLoading[index] = false;
      },

      error: () => {
        this.emisLoading[index] = false;
      },
    });
  }
  mapDistrictFromApi(districtName: string) {
    if (!this.formDetail?.district_SelectList?.length) {
      console.log('District list not loaded yet');
      return null;
    }

    const list = this.formDetail.district_SelectList;

    const found = list.find((x) =>
      x.text?.toLowerCase().includes(districtName?.toLowerCase()),
    );

    console.log('Matched district:', found);

    return found ? found.value : null;
  }
  loadUMISData(umisNo: string, index: number) {
    // alert(umisNo);

    if (!umisNo) return;

    const row = this.members.at(index) as FormGroup;

    this.userservice.getUMISDetails(umisNo).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS' && res.data) {
          const data = res.data;

          let patchData: any = {
            college_Name: data.instituteName || '',
            college_District: '',
            college_Address: data.instituteName,
          };

          // ⭐ COURSE (UG / PG)
          if (data.courseType) {
            patchData.course =
              this.formDetail?.education_SelectList?.find(
                (x) => x.text.split(' ')[0].toUpperCase() === data.courseType,
              )?.value || null;
          }

          // ⭐ EDUCATIONAL STATUS
          if (data.academicStatusType === 'Studying in this institute') {
            patchData.college_Status =
              this.formDetail?.education_Status_SelectList?.find(
                (x) => x.value === 'STUDYING',
              )?.value || null;
          } else {
            patchData.educationalStatus = null;
          }

          // ⭐ YEAR OF STUDY
          if (data.yearOfStudy) {
            patchData.year =
              this.formDetail?.education_Year_SelectList?.find(
                (x) => x.value === data.yearOfStudy,
              )?.value || null;
          }

          row.patchValue(patchData);
        } else if (res.status !== 'ERROR' && !res.data) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No UMIS details found',
          });
        }
      },

      error: () => {},
    });
  }

  checkValidationErrors() {
    this.members.controls.forEach((control, i) => {
      const group = control as FormGroup;

      Object.keys(group.controls).forEach((key) => {
        const field = group.get(key);

        if (field && field.invalid) {
          console.log('Row:', i + 1, 'Field:', key, 'Errors:', field.errors);
        }
      });
    });
  }

  onRationEnter(event: Event) {
    event.preventDefault(); // stop form submit

    if (this.rationNumber?.trim().length === 12) {
      this.loadPDSData(this.rationNumber);
    }
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

  fetchfamilymembers() {
    var istem = this.isOfficerEdit ? false : !this.showNextButton;
    if (this.member_Id != '0') {
      this.memberService
        .Family_Master_Get(this.member_Id, istem)
        .subscribe((x) => {
          if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              life: 2000,
              detail: x.message,
            });
          } else if (x) {
            this.familyMemberList = x.data;

            this.items = [];
            if (this.familyMemberList && this.familyMemberList.length > 0) {
              this.visiblefd = false;
            }
          }
        });
    }
  }
  // ngOnChanges() {
  //   // this.items = [];
  //   // this.fetchfamilymembers();
  // }
  addFamilyMember() {
    this.visible = true;
  }
  add() {
    this.memberService
      .Member_New_Family_Member_Save(this.member_Id, this.name)
      .subscribe((x) => {
        if (x) {
          this.fetchfamilymembers();
        }
        this.visible = false;
      });
  }
  setFamilymemDetails(id: string) {
    var det = this.familyMemberList?.find((x) => x.id == id);
    if (det) {
      this.canDelete = !det.activeApplicationExist;
      this.bankForm.get('id')?.patchValue(det?.id);
      this.bankForm.get('member_Id')?.patchValue(det?.member_Id);
      this.bankForm.get('name')?.patchValue(det?.name);
      this.bankForm.get('gender')?.patchValue(det?.sex);
      this.bankForm.get('relationShip')?.patchValue(det?.relation);
      this.bankForm.get('phone_number')?.patchValue(det?.phone_number);
      this.bankForm.get('aadharNumber')?.patchValue(det?.aadharNumber);
      this.bankForm.get('age')?.patchValue(det?.age);
      this.bankForm.get('education')?.patchValue(det?.education);
      this.bankForm.get('standard')?.patchValue(det?.standard);
      this.bankForm.get('educationalStatus')?.patchValue(det?.school_Status);
      this.bankForm.get('eMIS_No')?.patchValue(det?.emiS_No);

      this.bankForm
        .get('year_Of_Completion')
        ?.patchValue(
          det?.year_Of_Completion
            ? moment(det?.year_Of_Completion).toDate()
            : null,
        );
      this.bankForm
        .get('discontinuedYear')
        ?.patchValue(
          det?.discontinuedYear ? moment(det?.discontinuedYear).toDate() : null,
        ); //TODO
      this.bankForm
        .get('nameandAddressofSchool')
        ?.patchValue(det?.school_Address);
      this.bankForm.get('course')?.patchValue(det?.course);
      this.bankForm.get('degreName')?.patchValue(det?.degree_Name);
      this.bankForm.get('couyearrse')?.patchValue(det?.year);
      this.bankForm
        .get('nameandAddressofCollege')
        ?.patchValue(det?.college_Address);
      this.bankForm.get('occupation')?.patchValue(det?.occupation);
      this.bankForm.get('differentlyAbled')?.patchValue(det?.disability);
      const dob = det?.date_of_birth ? moment(det?.date_of_birth) : null;
      if (dob && dob.isValid()) {
        const today = moment();
        const age = today.diff(dob, 'years');

        this.bankForm.get('dob')?.patchValue(dob.toDate());
        this.bankForm.get('age')?.patchValue(age.toString());
      }

      if (!this.canDelete) {
        this.bankForm.get('dob')?.disable();
        this.bankForm.get('name')?.disable();
        this.bankForm.get('gender')?.disable();
        this.bankForm.get('relationShip')?.disable();
        this.bankForm.get('aadharNumber')?.disable();
      }
    }
  }
  resetControl(control: AbstractControl | null) {
    control?.markAsPristine();
    control?.markAsUntouched();
    control?.updateValueAndValidity({ emitEvent: false });
  }
  updateAge() {
    const dob = this.bankForm.get('dob')?.value
      ? moment(this.bankForm.get('dob')?.value)
      : null;
    if (dob && dob.isValid()) {
      const today = moment();
      const age = today.diff(dob, 'years');

      this.bankForm.get('age')?.patchValue(age.toString());
    }
  }
  close() {
    this.visible = false;
    this.name = '';
    this.canDelete = false;
  }
  move() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Action completed successfully',
    });
    this.formSaved.emit(4);
  }
  closefd() {
    this.visiblefd = false;
    this.canDelete = false;
    this.bankForm.reset();
  }
  openPopup(item: FamilyMemberModel) {
    this.setFamilymemDetails(item.id);
    this.visiblefd = true;
    this.errorMessage = '';
  }
  save(isActive: boolean) {
    if (!this.bankForm.valid && isActive) {
      triggerValueChangesForAll(this.bankForm);
      return;
    }
    if (isActive) {
      var docDetail = this.MemDocumentDetailComponent.overallsave();
      if (docDetail) {
        var ntDocsaved = docDetail.filter(
          (x) => !x.originalFileName || x.originalFileName == '',
        );
        if (ntDocsaved && ntDocsaved.length > 0) {
          this.errorMessage =
            'Please fill all mandatory fields in the document details section to submit the application / விண்ணப்பத்தை சமர்ப்பிக்க ஆவண விவரங்கள் பிரிவில் உள்ள அனைத்து கட்டாய புலங்களையும் நிரப்பவும். ';
          return;
        }

        // window.location.reload();
      }
    }
    this.errorMessage = '';
    var istem = this.isOfficerEdit ? false : !this.showNextButton;
    this.memberService
      .Family_SaveUpdate({
        id: this.bankForm.get('id')?.value,
        member_Id: this.bankForm.get('member_Id')?.value,
        f_id: '',
        name: this.bankForm.get('name')?.value,
        phone_number: this.bankForm.get('phone_number')?.value,
        aadharNumber: this.bankForm.get('aadharNumber')?.value,
        relation: this.bankForm.get('relationShip')?.value,
        sex: this.bankForm.get('gender')?.value,
        age: this.bankForm.get('age')?.value,
        education: this.bankForm.get('education')?.value,
        standard: this.bankForm.get('standard')?.value,
        school_Status: this.bankForm.get('educationalStatus')?.value,
        eMIS_No: this.bankForm.get('eMIS_No')?.value,
        school_Address: this.bankForm.get('nameandAddressofSchool')?.value,
        course: this.bankForm.get('course')?.value,
        degree_Name: this.bankForm.get('degreName')?.value,
        college_Status: this.bankForm.get('educationalStatus')?.value,
        year: this.bankForm.get('couyearrse')?.value,
        year_Of_Completion: this.bankForm.get('year_Of_Completion')?.value,
        college_Address: this.bankForm.get('nameandAddressofCollege')?.value,
        occupation: this.bankForm.get('occupation')?.value,
        disability: this.bankForm.get('differentlyAbled')?.value,
        status: '',
        isActive: isActive,
        isSaved: true,
        isTemp: istem,
        date_of_birth: this.bankForm.get('dob')?.value,
      })
      .subscribe((x) => {
        if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
          if (x.errorCode == 'APPLICATION_EXIST') {
            this.confirmationService.confirm({
              message: `நீக்குதல் அனுமதிக்கப்படவில்லை: இந்த உறுப்பினருக்கு ஏற்கனவே ஒரு திட்டம் பயன்படுத்தப்பட்டுள்ளது. / Deletion not allowed a scheme has already been applied to this member.`,
              header: 'Deletion not allowed',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {},
              reject: (type: ConfirmEventType) => {},
            });
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            life: 2000,
            detail: x.message,
          });
        } else if (x) {
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'Success',
          //   detail: x.message,
          // });

          // this.fetchfamilymembers();

          // this.fetchfamilymembers();
          if (!isActive) {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Deleted successfully',
            });

            // Refresh family members list after delete
            this.fetchfamilymembers();
          } else {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: x.message,
            });

            // Refresh after save too
            this.fetchfamilymembers();
          }
        }
      });
  }

  overallsave() {
    return this.familyMemberList;
  }
  MovetoNext() {
    this.formSaved.emit(2);
  }
  onEducationChange(index: number, event: any) {
    const value = event.value;
    const row = this.members.at(index) as FormGroup;

    if (value === 'SCHOOL' || value === 'COLLEGE') {
      this.expandedRowIndex = index;
    } else {
      this.expandedRowIndex = null;
    }

    row.get('education')?.updateValueAndValidity();

    row.updateValueAndValidity({ emitEvent: true });

    this.familyForm.updateValueAndValidity({ emitEvent: true });
  }
}
