import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeConfigurationComponent } from './scheme-configuration.component';

describe('SchemeConfigurationComponent', () => {
  let component: SchemeConfigurationComponent;
  let fixture: ComponentFixture<SchemeConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeConfigurationComponent]
    });
    fixture = TestBed.createComponent(SchemeConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
