import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemFamilyDetailViewComponent } from './mem-family-detail-view.component';

describe('MemFamilyDetailViewComponent', () => {
  let component: MemFamilyDetailViewComponent;
  let fixture: ComponentFixture<MemFamilyDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemFamilyDetailViewComponent]
    });
    fixture = TestBed.createComponent(MemFamilyDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
