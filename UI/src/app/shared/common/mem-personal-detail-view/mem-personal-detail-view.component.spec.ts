import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemPersonalDetailViewComponent } from './mem-personal-detail-view.component';

describe('MemPersonalDetailViewComponent', () => {
  let component: MemPersonalDetailViewComponent;
  let fixture: ComponentFixture<MemPersonalDetailViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemPersonalDetailViewComponent]
    });
    fixture = TestBed.createComponent(MemPersonalDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
