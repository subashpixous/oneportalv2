import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsidyConfigurationComponent } from './subsidy-configuration.component';

describe('SubsidyConfigurationComponent', () => {
  let component: SubsidyConfigurationComponent;
  let fixture: ComponentFixture<SubsidyConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubsidyConfigurationComponent]
    });
    fixture = TestBed.createComponent(SubsidyConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
