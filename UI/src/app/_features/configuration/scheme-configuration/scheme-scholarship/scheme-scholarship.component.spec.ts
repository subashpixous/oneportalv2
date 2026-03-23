import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeScholarshipComponent } from './scheme-scholarship.component';

describe('SchemeScholarshipComponent', () => {
  let component: SchemeScholarshipComponent;
  let fixture: ComponentFixture<SchemeScholarshipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeScholarshipComponent]
    });
    fixture = TestBed.createComponent(SchemeScholarshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
