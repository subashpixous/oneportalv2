import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeGroupComponent } from './scheme-group.component';

describe('SchemeGroupComponent', () => {
  let component: SchemeGroupComponent;
  let fixture: ComponentFixture<SchemeGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeGroupComponent]
    });
    fixture = TestBed.createComponent(SchemeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
