import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberApplySchemeCountComponent } from './member-apply-scheme-count.component';

describe('MemberApplySchemeCountComponent', () => {
  let component: MemberApplySchemeCountComponent;
  let fixture: ComponentFixture<MemberApplySchemeCountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberApplySchemeCountComponent]
    });
    fixture = TestBed.createComponent(MemberApplySchemeCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
