import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemSchemeViewComponent } from './mem-scheme-view.component';

describe('MemSchemeViewComponent', () => {
  let component: MemSchemeViewComponent;
  let fixture: ComponentFixture<MemSchemeViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemSchemeViewComponent]
    });
    fixture = TestBed.createComponent(MemSchemeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
