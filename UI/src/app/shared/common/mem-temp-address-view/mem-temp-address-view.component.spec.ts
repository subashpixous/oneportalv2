import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemTempAddressViewComponent } from './mem-temp-address-view.component';

describe('MemTempAddressViewComponent', () => {
  let component: MemTempAddressViewComponent;
  let fixture: ComponentFixture<MemTempAddressViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemTempAddressViewComponent]
    });
    fixture = TestBed.createComponent(MemTempAddressViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
