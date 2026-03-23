import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUcComponent } from './report-uc.component';

describe('ReportUcComponent', () => {
  let component: ReportUcComponent;
  let fixture: ComponentFixture<ReportUcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportUcComponent]
    });
    fixture = TestBed.createComponent(ReportUcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
