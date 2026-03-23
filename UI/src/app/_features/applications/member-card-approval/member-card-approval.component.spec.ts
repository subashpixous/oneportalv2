import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCardApprovalComponent } from './member-card-approval.component';

describe('MemberCardApprovalComponent', () => {
  let component: MemberCardApprovalComponent;
  let fixture: ComponentFixture<MemberCardApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberCardApprovalComponent]
    });
    fixture = TestBed.createComponent(MemberCardApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
