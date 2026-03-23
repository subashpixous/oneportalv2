import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportStatusComponent } from './report-status.component';

describe('ReportStatusComponent', () => {
  let component: ReportStatusComponent;
  let fixture: ComponentFixture<ReportStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportStatusComponent]
    });
    fixture = TestBed.createComponent(ReportStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
