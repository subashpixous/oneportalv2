import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeGccReportComponent } from './scheme-gcc-report.component';

describe('SchemeGccReportComponent', () => {
  let component: SchemeGccReportComponent;
  let fixture: ComponentFixture<SchemeGccReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeGccReportComponent]
    });
    fixture = TestBed.createComponent(SchemeGccReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
