import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberApprovalHistoryComponent } from './member-approval-history.component';

describe('MemberApprovalHistoryComponent', () => {
  let component: MemberApprovalHistoryComponent;
  let fixture: ComponentFixture<MemberApprovalHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberApprovalHistoryComponent]
    });
    fixture = TestBed.createComponent(MemberApprovalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
