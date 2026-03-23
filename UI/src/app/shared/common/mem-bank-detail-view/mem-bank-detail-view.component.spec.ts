import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemBankDetailViewComponent } from './mem-bank-detail-view.component';

describe('MemBankDetailViewComponent', () => {
  let component: MemBankDetailViewComponent;
  let fixture: ComponentFixture<MemBankDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemBankDetailViewComponent]
    });
    fixture = TestBed.createComponent(MemBankDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
