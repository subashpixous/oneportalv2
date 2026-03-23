import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeCostReportComponent } from './scheme-cost-report.component';

describe('SchemeCostReportComponent', () => {
  let component: SchemeCostReportComponent;
  let fixture: ComponentFixture<SchemeCostReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeCostReportComponent]
    });
    fixture = TestBed.createComponent(SchemeCostReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
