import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemWorkAddressViewComponent } from './mem-work-address-view.component';

describe('MemWorkAddressViewComponent', () => {
  let component: MemWorkAddressViewComponent;
  let fixture: ComponentFixture<MemWorkAddressViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemWorkAddressViewComponent]
    });
    fixture = TestBed.createComponent(MemWorkAddressViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
