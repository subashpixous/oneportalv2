import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLetterPrintComponent } from './call-letter-print.component';

describe('CallLetterPrintComponent', () => {
  let component: CallLetterPrintComponent;
  let fixture: ComponentFixture<CallLetterPrintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CallLetterPrintComponent]
    });
    fixture = TestBed.createComponent(CallLetterPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
