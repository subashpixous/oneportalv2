import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeConfigComponent } from './scheme-config.component';

describe('SchemeConfigComponent', () => {
  let component: SchemeConfigComponent;
  let fixture: ComponentFixture<SchemeConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeConfigComponent]
    });
    fixture = TestBed.createComponent(SchemeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
