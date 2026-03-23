import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporationReportComponent } from './corporation-report.component';

describe('CorporationReportComponent', () => {
  let component: CorporationReportComponent;
  let fixture: ComponentFixture<CorporationReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CorporationReportComponent]
    });
    fixture = TestBed.createComponent(CorporationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
