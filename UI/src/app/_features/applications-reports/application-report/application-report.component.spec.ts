import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationReportComponent } from './application-report.component';

describe('ApplicationReportComponent', () => {
  let component: ApplicationReportComponent;
  let fixture: ComponentFixture<ApplicationReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationReportComponent]
    });
    fixture = TestBed.createComponent(ApplicationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
