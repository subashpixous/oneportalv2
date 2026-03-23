import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeComponent } from './scheme.component';

describe('SchemeComponent', () => {
  let component: SchemeComponent;
  let fixture: ComponentFixture<SchemeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeComponent]
    });
    fixture = TestBed.createComponent(SchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
