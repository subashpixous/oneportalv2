import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCardApprovalEditComponent } from './member-card-approval-edit.component';

describe('MemberCardApprovalEditComponent', () => {
  let component: MemberCardApprovalEditComponent;
  let fixture: ComponentFixture<MemberCardApprovalEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberCardApprovalEditComponent]
    });
    fixture = TestBed.createComponent(MemberCardApprovalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
