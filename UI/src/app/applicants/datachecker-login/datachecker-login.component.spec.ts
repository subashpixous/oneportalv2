import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatacheckerLoginComponent } from './datachecker-login.component';

describe('DatacheckerLoginComponent', () => {
  let component: DatacheckerLoginComponent;
  let fixture: ComponentFixture<DatacheckerLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatacheckerLoginComponent]
    });
    fixture = TestBed.createComponent(DatacheckerLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
