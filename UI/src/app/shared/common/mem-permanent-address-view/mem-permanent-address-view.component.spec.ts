import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemPermanentAddressViewComponent } from './mem-permanent-address-view.component';

describe('MemPermanentAddressViewComponent', () => {
  let component: MemPermanentAddressViewComponent;
  let fixture: ComponentFixture<MemPermanentAddressViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemPermanentAddressViewComponent]
    });
    fixture = TestBed.createComponent(MemPermanentAddressViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
