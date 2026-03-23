import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemDetailViewComponent } from './mem-detail-view.component';

describe('MemDetailViewComponent', () => {
  let component: MemDetailViewComponent;
  let fixture: ComponentFixture<MemDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemDetailViewComponent]
    });
    fixture = TestBed.createComponent(MemDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
