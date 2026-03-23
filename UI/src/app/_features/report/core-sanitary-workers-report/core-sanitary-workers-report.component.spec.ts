import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreSanitaryWorkersReportComponent } from './core-sanitary-workers-report.component';

describe('CoreSanitaryWorkersReportComponent', () => {
  let component: CoreSanitaryWorkersReportComponent;
  let fixture: ComponentFixture<CoreSanitaryWorkersReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreSanitaryWorkersReportComponent]
    });
    fixture = TestBed.createComponent(CoreSanitaryWorkersReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
