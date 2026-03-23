import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemPersonalDetailComponent } from './mem-personal-detail.component';

describe('MemPersonalDetailComponent', () => {
  let component: MemPersonalDetailComponent;
  let fixture: ComponentFixture<MemPersonalDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemPersonalDetailComponent]
    });
    fixture = TestBed.createComponent(MemPersonalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
