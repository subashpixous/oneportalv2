import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberCardPopupComponent } from './member-card-popup.component';

describe('MemberCardPopupComponent', () => {
  let component: MemberCardPopupComponent;
  let fixture: ComponentFixture<MemberCardPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberCardPopupComponent]
    });
    fixture = TestBed.createComponent(MemberCardPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
