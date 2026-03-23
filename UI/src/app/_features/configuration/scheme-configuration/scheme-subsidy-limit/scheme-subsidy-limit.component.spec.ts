import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeSubsidyLimitComponent } from './scheme-subsidy-limit.component';

describe('SchemeSubsidyLimitComponent', () => {
  let component: SchemeSubsidyLimitComponent;
  let fixture: ComponentFixture<SchemeSubsidyLimitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeSubsidyLimitComponent]
    });
    fixture = TestBed.createComponent(SchemeSubsidyLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
