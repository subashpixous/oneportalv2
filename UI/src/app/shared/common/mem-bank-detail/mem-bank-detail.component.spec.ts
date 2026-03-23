import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemBankDetailComponent } from './mem-bank-detail.component';

describe('MemBankDetailComponent', () => {
  let component: MemBankDetailComponent;
  let fixture: ComponentFixture<MemBankDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemBankDetailComponent]
    });
    fixture = TestBed.createComponent(MemBankDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
