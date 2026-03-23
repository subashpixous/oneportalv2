import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrMsgCompComponent } from './err-msg-comp.component';

describe('ErrMsgCompComponent', () => {
  let component: ErrMsgCompComponent;
  let fixture: ComponentFixture<ErrMsgCompComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrMsgCompComponent]
    });
    fixture = TestBed.createComponent(ErrMsgCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
