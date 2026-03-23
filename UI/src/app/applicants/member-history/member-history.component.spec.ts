import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberHistoryComponent } from './member-history.component';

describe('MemberHistoryComponent', () => {
  let component: MemberHistoryComponent;
  let fixture: ComponentFixture<MemberHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberHistoryComponent]
    });
    fixture = TestBed.createComponent(MemberHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
