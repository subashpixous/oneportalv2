import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedDeletionComponent } from './saved-deletion.component';

describe('SavedDeletionComponent', () => {
  let component: SavedDeletionComponent;
  let fixture: ComponentFixture<SavedDeletionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SavedDeletionComponent]
    });
    fixture = TestBed.createComponent(SavedDeletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
