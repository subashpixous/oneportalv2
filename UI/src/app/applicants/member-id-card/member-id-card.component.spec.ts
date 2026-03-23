import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberIdCardComponent } from './member-id-card.component';

describe('MemberIdCardComponent', () => {
  let component: MemberIdCardComponent;
  let fixture: ComponentFixture<MemberIdCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberIdCardComponent]
    });
    fixture = TestBed.createComponent(MemberIdCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
