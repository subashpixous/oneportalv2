import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MessageService } from 'primeng/api';
import { FeedbackModel } from 'src/app/_models/ConfigurationModel';
import { FailedStatus, ErrorStatus } from 'src/app/_models/ResponseStatus';
import { GeneralService } from 'src/app/services/general.service';
import { RoleService } from 'src/app/services/role.service';
import { triggerValueChangesForAll } from '../../commonFunctions';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-homefooter',
  templateUrl: './homefooter.component.html',
  styleUrls: ['./homefooter.component.scss'],
})
export class HomefooterComponent {
  sdd!: FeedbackModel;
  @Input() language: string = 'en';

  texts: any = {};

  roleForm!: FormGroup;

  isLoggedin: boolean = false;
  showThankYou: boolean = false;
  showFeedbackSection: boolean = false;
  feedbackModel: string = '';

  get canshow() {
    return true;
  }
  constructor(
    private messageService: MessageService,
    private cookieService: CookieService,
    private router: Router,
    private generalService: GeneralService,
    private location: Location,
    private route: ActivatedRoute,
  ) {}
  ngOnInit() {
    this.roleForm = new FormGroup({
      id: new FormControl(Guid.raw()),
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z\s]+$/),
      ]),
      mobileNumber: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(2),
        Validators.pattern(/^[0-9]{10}$/),
      ]),
      feedback: new FormControl('', [
        Validators.required,
        Validators.maxLength(2000),
        Validators.minLength(3),
      ]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setLanguageTexts();
  }

  setLanguageTexts() {
    if (this.language === 'ta') {
      this.texts = {
        feedback: 'கருத்து',
        name: 'பெயர்',
        mobile: 'கைபேசி எண்',
        feedbackNotes: 'கருத்து குறிப்புகள்',
        submit: 'சமர்ப்பிக்கவும்',
        addressTitle: 'முகவரி',
        contactTitle: 'தொடர்பு',
        help: 'உதவி',
        query: 'படிவ பதிவு தொடர்பான விசாரணை',
        developedBy: 'உருவாக்கியது',
        rights:
          '© பதிப்புரிமை © 2026, அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை கூட்டுறவு சங்கங்களின் பதிவாளர்.',
        thankYouHeader: 'நன்றி',
        thankYouMsg: 'உங்கள் கருத்து வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
        address1: 'எல்.எல்.ஏ கட்டிடம், ரங்கூன் வீதி, சென்னை',
        address2: 'தவுசண்ட் லைட்ஸ், சென்னை – 600006, தமிழ்நாடு',
        developed: 'வடிவமைக்கப்பட்டு உருவாக்கப்பட்டது',
      };
    } else {
      this.texts = {
        feedback: 'Feedback',
        name: 'Name',
        mobile: 'Mobile Number',
        feedbackNotes: 'Feedback Notes',
        submit: 'Submit',
        addressTitle: 'Address',
        contactTitle: 'Contact',
        help: 'Help',
        query: 'Form Registrations Query',
        developedBy: 'Developed by',
        rights:
          '© TAMILNADU CLEANLINESS WORKERS WELFARE BOARD. All Rights Reserved.',
        thankYouHeader: 'Thank You',
        thankYouMsg: 'Your feedback has been submitted successfully.',
        address1: ' LLA Building, Rangoon St, Anna Salai',
        address2: 'Thousand Lights, Chennai, Tamil Nadu 600006.',
        developed: 'Developed by',
      };
    }
  }

  resetForm() {}
  submit() {
    this.saverole({
      id: this.roleForm.get('id')?.value,
      name: this.roleForm.get('name')?.value,
      mobileNumber: this.roleForm.get('mobileNumber')?.value,
      feedback: this.roleForm.get('feedback')?.value,
      isActive: true,
    });
  }
  saverole(obj: any) {
    if (!this.roleForm.valid) {
      triggerValueChangesForAll(this.roleForm);
      return;
    }
    this.generalService.Feedback_SaveUpdate(obj).subscribe((x) => {
      if (x && (x.status == FailedStatus || x.status == ErrorStatus)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 2000,
          detail: x.message,
        });
      } else if (x) {
        this.roleForm.get('id')?.patchValue(Guid.raw());
        this.roleForm.get('name')?.reset();
        this.roleForm.get('mobileNumber')?.reset();
        this.roleForm.get('feedback')?.reset();
        this.showThankYou = true;
      }
    });
  }
  documentpage() {
    if (this.cookieService.get('accesstype') == 'APPLICANT') {
      this.router.navigate(['help/Member']);
    } else {
      this.router.navigate(['help/General']);
    }
  }
  bckClick() {
    this.location.back();
  }
  closeDialog(): void {
    this.showThankYou = false;
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const charCode = event.key;
    if (!/^[a-zA-Z\s]$/.test(charCode)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key;
    if (!/^[0-9]$/.test(charCode)) {
      event.preventDefault();
    }
  }

  openFeedback() {
    this.showFeedbackSection = !this.showFeedbackSection;

    if (this.showFeedbackSection) {
      this.feedbackModel = this.roleForm.get('feedback')?.value;
    }
  }
}
