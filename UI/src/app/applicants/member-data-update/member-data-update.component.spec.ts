import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDataUpdateComponent } from './member-data-update.component';

describe('MemberDataUpdateComponent', () => {
  let component: MemberDataUpdateComponent;
  let fixture: ComponentFixture<MemberDataUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberDataUpdateComponent]
    });
    fixture = TestBed.createComponent(MemberDataUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
