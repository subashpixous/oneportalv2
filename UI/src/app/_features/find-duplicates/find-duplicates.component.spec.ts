import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindDuplicatesComponent } from './find-duplicates.component';

describe('FindDuplicatesComponent', () => {
  let component: FindDuplicatesComponent;
  let fixture: ComponentFixture<FindDuplicatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FindDuplicatesComponent]
    });
    fixture = TestBed.createComponent(FindDuplicatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
