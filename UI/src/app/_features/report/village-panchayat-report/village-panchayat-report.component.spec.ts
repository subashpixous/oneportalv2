import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VillagePanchayatReportComponent } from './village-panchayat-report.component';

describe('VillagePanchayatReportComponent', () => {
  let component: VillagePanchayatReportComponent;
  let fixture: ComponentFixture<VillagePanchayatReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VillagePanchayatReportComponent]
    });
    fixture = TestBed.createComponent(VillagePanchayatReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
