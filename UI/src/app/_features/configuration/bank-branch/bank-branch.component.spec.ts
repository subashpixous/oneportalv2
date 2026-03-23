import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankBranchComponent } from './bank-branch.component';

describe('BankBranchComponent', () => {
  let component: BankBranchComponent;
  let fixture: ComponentFixture<BankBranchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankBranchComponent]
    });
    fixture = TestBed.createComponent(BankBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
