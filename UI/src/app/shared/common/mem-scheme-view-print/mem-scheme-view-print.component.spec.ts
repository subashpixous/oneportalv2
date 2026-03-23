import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemSchemeViewPrintComponent } from './mem-scheme-view-print.component';

describe('MemSchemeViewPrintComponent', () => {
  let component: MemSchemeViewPrintComponent;
  let fixture: ComponentFixture<MemSchemeViewPrintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemSchemeViewPrintComponent]
    });
    fixture = TestBed.createComponent(MemSchemeViewPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
