import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFamilyPopupComponent } from './add-family-popup.component';

describe('AddFamilyPopupComponent', () => {
  let component: AddFamilyPopupComponent;
  let fixture: ComponentFixture<AddFamilyPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFamilyPopupComponent]
    });
    fixture = TestBed.createComponent(AddFamilyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
