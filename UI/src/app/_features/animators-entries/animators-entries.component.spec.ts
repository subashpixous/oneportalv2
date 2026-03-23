import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatorsEntriesComponent } from './animators-entries.component';

describe('AnimatorsEntriesComponent', () => {
  let component: AnimatorsEntriesComponent;
  let fixture: ComponentFixture<AnimatorsEntriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnimatorsEntriesComponent]
    });
    fixture = TestBed.createComponent(AnimatorsEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
