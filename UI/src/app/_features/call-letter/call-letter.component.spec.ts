import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLetterComponent } from './call-letter.component';

describe('CallLetterComponent', () => {
  let component: CallLetterComponent;
  let fixture: ComponentFixture<CallLetterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CallLetterComponent]
    });
    fixture = TestBed.createComponent(CallLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
