import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempAddressDetailEditComponent } from './temp-address-detail-edit.component';

describe('TempAddressDetailEditComponent', () => {
  let component: TempAddressDetailEditComponent;
  let fixture: ComponentFixture<TempAddressDetailEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TempAddressDetailEditComponent]
    });
    fixture = TestBed.createComponent(TempAddressDetailEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
