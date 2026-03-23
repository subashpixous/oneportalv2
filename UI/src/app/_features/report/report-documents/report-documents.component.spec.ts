import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDocumentsComponent } from './report-documents.component';

describe('ReportDocumentsComponent', () => {
  let component: ReportDocumentsComponent;
  let fixture: ComponentFixture<ReportDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportDocumentsComponent]
    });
    fixture = TestBed.createComponent(ReportDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
