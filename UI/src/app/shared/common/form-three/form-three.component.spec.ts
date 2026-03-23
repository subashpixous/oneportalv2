import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormThreeComponent } from './form-three.component';

describe('FormThreeComponent', () => {
  let component: FormThreeComponent;
  let fixture: ComponentFixture<FormThreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormThreeComponent]
    });
    fixture = TestBed.createComponent(FormThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
