import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTablesComponent } from './report-tables.component';

describe('ReportTablesComponent', () => {
  let component: ReportTablesComponent;
  let fixture: ComponentFixture<ReportTablesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportTablesComponent]
    });
    fixture = TestBed.createComponent(ReportTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
