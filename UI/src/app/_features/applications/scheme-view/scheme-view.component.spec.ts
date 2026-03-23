import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeViewComponent } from './scheme-view.component';

describe('SchemeViewComponent', () => {
  let component: SchemeViewComponent;
  let fixture: ComponentFixture<SchemeViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeViewComponent]
    });
    fixture = TestBed.createComponent(SchemeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
