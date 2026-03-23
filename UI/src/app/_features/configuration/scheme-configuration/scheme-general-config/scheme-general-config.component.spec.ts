import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeGeneralConfigComponent } from './scheme-general-config.component';

describe('SchemeGeneralConfigComponent', () => {
  let component: SchemeGeneralConfigComponent;
  let fixture: ComponentFixture<SchemeGeneralConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeGeneralConfigComponent]
    });
    fixture = TestBed.createComponent(SchemeGeneralConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
