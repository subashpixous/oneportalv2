import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInprogressComponent } from './print-inprogress.component';

describe('PrintInprogressComponent', () => {
  let component: PrintInprogressComponent;
  let fixture: ComponentFixture<PrintInprogressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrintInprogressComponent]
    });
    fixture = TestBed.createComponent(PrintInprogressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
