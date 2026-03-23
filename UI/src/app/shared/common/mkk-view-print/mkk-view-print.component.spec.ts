import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MkkViewPrintComponent } from './mkk-view-print.component';

describe('MkkViewPrintComponent', () => {
  let component: MkkViewPrintComponent;
  let fixture: ComponentFixture<MkkViewPrintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MkkViewPrintComponent]
    });
    fixture = TestBed.createComponent(MkkViewPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
