import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemFamilyDetailComponent } from './mem-family-detail.component';

describe('MemFamilyDetailComponent', () => {
  let component: MemFamilyDetailComponent;
  let fixture: ComponentFixture<MemFamilyDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemFamilyDetailComponent]
    });
    fixture = TestBed.createComponent(MemFamilyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
