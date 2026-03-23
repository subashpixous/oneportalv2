import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberViewComponent } from './member-view.component';

describe('MemberViewComponent', () => {
  let component: MemberViewComponent;
  let fixture: ComponentFixture<MemberViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberViewComponent]
    });
    fixture = TestBed.createComponent(MemberViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
