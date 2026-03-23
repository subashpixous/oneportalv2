import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemSchemeDetailViewComponent } from './mem-scheme-detail-view.component';

describe('MemSchemeDetailViewComponent', () => {
  let component: MemSchemeDetailViewComponent;
  let fixture: ComponentFixture<MemSchemeDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemSchemeDetailViewComponent]
    });
    fixture = TestBed.createComponent(MemSchemeDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
