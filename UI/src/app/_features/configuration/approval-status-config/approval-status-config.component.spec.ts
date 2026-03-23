import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalStatusConfigComponent } from './approval-status-config.component';

describe('ApprovalStatusConfigComponent', () => {
  let component: ApprovalStatusConfigComponent;
  let fixture: ComponentFixture<ApprovalStatusConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovalStatusConfigComponent]
    });
    fixture = TestBed.createComponent(ApprovalStatusConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
