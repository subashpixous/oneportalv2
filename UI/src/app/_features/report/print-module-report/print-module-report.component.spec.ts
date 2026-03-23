import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintModuleReportComponent } from './print-module-report.component';

describe('PrintModuleReportComponent', () => {
  let component: PrintModuleReportComponent;
  let fixture: ComponentFixture<PrintModuleReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrintModuleReportComponent]
    });
    fixture = TestBed.createComponent(PrintModuleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
