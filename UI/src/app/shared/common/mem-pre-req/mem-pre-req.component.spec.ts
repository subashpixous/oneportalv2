import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemPreReqComponent } from './mem-pre-req.component';

describe('MemPreReqComponent', () => {
  let component: MemPreReqComponent;
  let fixture: ComponentFixture<MemPreReqComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemPreReqComponent]
    });
    fixture = TestBed.createComponent(MemPreReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
