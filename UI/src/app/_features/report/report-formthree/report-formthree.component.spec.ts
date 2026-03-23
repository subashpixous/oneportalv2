import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFormthreeComponent } from './report-formthree.component';

describe('ReportFormthreeComponent', () => {
  let component: ReportFormthreeComponent;
  let fixture: ComponentFixture<ReportFormthreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportFormthreeComponent]
    });
    fixture = TestBed.createComponent(ReportFormthreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
