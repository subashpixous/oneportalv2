import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDetailDashboardComponent } from './member-detail-dashboard.component';

describe('MemberDetailDashboardComponent', () => {
  let component: MemberDetailDashboardComponent;
  let fixture: ComponentFixture<MemberDetailDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberDetailDashboardComponent]
    });
    fixture = TestBed.createComponent(MemberDetailDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
