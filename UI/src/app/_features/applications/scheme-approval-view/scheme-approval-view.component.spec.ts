import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeApprovalViewComponent } from './scheme-approval-view.component';

describe('SchemeApprovalViewComponent', () => {
  let component: SchemeApprovalViewComponent;
  let fixture: ComponentFixture<SchemeApprovalViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeApprovalViewComponent]
    });
    fixture = TestBed.createComponent(SchemeApprovalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
