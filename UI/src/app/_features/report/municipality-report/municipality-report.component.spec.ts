import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipalityReportComponent } from './municipality-report.component';

describe('MunicipalityReportComponent', () => {
  let component: MunicipalityReportComponent;
  let fixture: ComponentFixture<MunicipalityReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MunicipalityReportComponent]
    });
    fixture = TestBed.createComponent(MunicipalityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
