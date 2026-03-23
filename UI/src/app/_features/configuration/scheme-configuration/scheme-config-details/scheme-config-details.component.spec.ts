import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeConfigDetailsComponent } from './scheme-config-details.component';

describe('SchemeConfigDetailsComponent', () => {
  let component: SchemeConfigDetailsComponent;
  let fixture: ComponentFixture<SchemeConfigDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeConfigDetailsComponent]
    });
    fixture = TestBed.createComponent(SchemeConfigDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
