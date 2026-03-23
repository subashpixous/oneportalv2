import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictConfigComponent } from './district-config.component';

describe('DistrictConfigComponent', () => {
  let component: DistrictConfigComponent;
  let fixture: ComponentFixture<DistrictConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DistrictConfigComponent]
    });
    fixture = TestBed.createComponent(DistrictConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
