import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemPermanentAddressComponent } from './mem-permanent-address.component';

describe('MemPermanentAddressComponent', () => {
  let component: MemPermanentAddressComponent;
  let fixture: ComponentFixture<MemPermanentAddressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemPermanentAddressComponent]
    });
    fixture = TestBed.createComponent(MemPermanentAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
