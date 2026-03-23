import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GccreportComponent } from './gccreport.component';

describe('GccreportComponent', () => {
  let component: GccreportComponent;
  let fixture: ComponentFixture<GccreportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GccreportComponent]
    });
    fixture = TestBed.createComponent(GccreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
