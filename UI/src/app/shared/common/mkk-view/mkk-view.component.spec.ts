import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MkkViewComponent } from './mkk-view.component';

describe('MkkViewComponent', () => {
  let component: MkkViewComponent;
  let fixture: ComponentFixture<MkkViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MkkViewComponent]
    });
    fixture = TestBed.createComponent(MkkViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
