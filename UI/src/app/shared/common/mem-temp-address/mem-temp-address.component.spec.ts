import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemTempAddressComponent } from './mem-temp-address.component';

describe('MemTempAddressComponent', () => {
  let component: MemTempAddressComponent;
  let fixture: ComponentFixture<MemTempAddressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemTempAddressComponent]
    });
    fixture = TestBed.createComponent(MemTempAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
