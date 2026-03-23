import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdCardStatusComponent } from './id-card-status.component';

describe('IdCardStatusComponent', () => {
  let component: IdCardStatusComponent;
  let fixture: ComponentFixture<IdCardStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IdCardStatusComponent]
    });
    fixture = TestBed.createComponent(IdCardStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

