import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MkkMemberViewComponent } from './mkk-member-view.component';

describe('MkkMemberViewComponent', () => {
  let component: MkkMemberViewComponent;
  let fixture: ComponentFixture<MkkMemberViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MkkMemberViewComponent]
    });
    fixture = TestBed.createComponent(MkkMemberViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
