import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLetterCreateComponent } from './call-letter-create.component';

describe('CallLetterCreateComponent', () => {
  let component: CallLetterCreateComponent;
  let fixture: ComponentFixture<CallLetterCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CallLetterCreateComponent]
    });
    fixture = TestBed.createComponent(CallLetterCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
