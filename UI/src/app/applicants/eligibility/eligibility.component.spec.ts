import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityComponent } from './eligibility.component';

describe('EligibilityComponent', () => {
  let component: EligibilityComponent;
  let fixture: ComponentFixture<EligibilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EligibilityComponent]
    });
    fixture = TestBed.createComponent(EligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
