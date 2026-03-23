import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeGroupsComponent } from './scheme-groups.component';

describe('SchemeGroupsComponent', () => {
  let component: SchemeGroupsComponent;
  let fixture: ComponentFixture<SchemeGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeGroupsComponent]
    });
    fixture = TestBed.createComponent(SchemeGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
