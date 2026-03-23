import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictWiseCountreportComponent } from './district-wise-countreport.component';

describe('DistrictWiseCountreportComponent', () => {
  let component: DistrictWiseCountreportComponent;
  let fixture: ComponentFixture<DistrictWiseCountreportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DistrictWiseCountreportComponent]
    });
    fixture = TestBed.createComponent(DistrictWiseCountreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
