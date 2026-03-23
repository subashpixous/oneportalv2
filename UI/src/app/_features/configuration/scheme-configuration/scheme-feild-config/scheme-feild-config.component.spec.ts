import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeFeildConfigComponent } from './scheme-feild-config.component';

describe('SchemeFeildConfigComponent', () => {
  let component: SchemeFeildConfigComponent;
  let fixture: ComponentFixture<SchemeFeildConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeFeildConfigComponent]
    });
    fixture = TestBed.createComponent(SchemeFeildConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
