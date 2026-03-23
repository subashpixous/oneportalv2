import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberUpdateApprovalComponent } from './member-update-approval.component';

describe('MemberUpdateApprovalComponent', () => {
  let component: MemberUpdateApprovalComponent;
  let fixture: ComponentFixture<MemberUpdateApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberUpdateApprovalComponent]
    });
    fixture = TestBed.createComponent(MemberUpdateApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
