import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatewiseApprovalReportComponent } from './datewise-approval-report.component';

describe('DatewiseApprovalReportComponent', () => {
  let component: DatewiseApprovalReportComponent;
  let fixture: ComponentFixture<DatewiseApprovalReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatewiseApprovalReportComponent]
    });
    fixture = TestBed.createComponent(DatewiseApprovalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
