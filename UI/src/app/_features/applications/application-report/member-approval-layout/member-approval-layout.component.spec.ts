import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberApprovalLayoutComponent } from './member-approval-layout.component';

describe('MemberApprovalLayoutComponent', () => {
  let component: MemberApprovalLayoutComponent;
  let fixture: ComponentFixture<MemberApprovalLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberApprovalLayoutComponent]
    });
    fixture = TestBed.createComponent(MemberApprovalLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
