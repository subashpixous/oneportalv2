import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeCostConfigComponent } from './scheme-cost-config.component';

describe('SchemeCostConfigComponent', () => {
  let component: SchemeCostConfigComponent;
  let fixture: ComponentFixture<SchemeCostConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeCostConfigComponent]
    });
    fixture = TestBed.createComponent(SchemeCostConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
