import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsTabViewComponent } from './reports-tab-view.component';

describe('ReportsTabViewComponent', () => {
  let component: ReportsTabViewComponent;
  let fixture: ComponentFixture<ReportsTabViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportsTabViewComponent]
    });
    fixture = TestBed.createComponent(ReportsTabViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
