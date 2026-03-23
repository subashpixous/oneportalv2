import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemCardApproveViewComponent } from './mem-card-approve-view.component';

describe('MemCardApproveViewComponent', () => {
  let component: MemCardApproveViewComponent;
  let fixture: ComponentFixture<MemCardApproveViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemCardApproveViewComponent]
    });
    fixture = TestBed.createComponent(MemCardApproveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
