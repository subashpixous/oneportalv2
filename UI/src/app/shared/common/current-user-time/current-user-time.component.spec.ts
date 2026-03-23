import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserTimeComponent } from './current-user-time.component';

describe('CurrentUserTimeComponent', () => {
  let component: CurrentUserTimeComponent;
  let fixture: ComponentFixture<CurrentUserTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentUserTimeComponent]
    });
    fixture = TestBed.createComponent(CurrentUserTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
