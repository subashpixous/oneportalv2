import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemDetailViewPrintComponent } from './mem-detail-view-print.component';

describe('MemDetailViewPrintComponent', () => {
  let component: MemDetailViewPrintComponent;
  let fixture: ComponentFixture<MemDetailViewPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemDetailViewPrintComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemDetailViewPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
