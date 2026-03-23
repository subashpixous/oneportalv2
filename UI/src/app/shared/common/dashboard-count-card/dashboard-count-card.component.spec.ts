import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCountCardComponent } from './dashboard-count-card.component';

describe('DashboardCountCardComponent', () => {
  let component: DashboardCountCardComponent;
  let fixture: ComponentFixture<DashboardCountCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardCountCardComponent]
    });
    fixture = TestBed.createComponent(DashboardCountCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
