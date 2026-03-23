import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardApprovalHistoryComponent } from './card-approval-history.component';

describe('CardApprovalHistoryComponent', () => {
  let component: CardApprovalHistoryComponent;
  let fixture: ComponentFixture<CardApprovalHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardApprovalHistoryComponent]
    });
    fixture = TestBed.createComponent(CardApprovalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
