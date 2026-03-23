import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSchemeComponent } from './dynamic-scheme.component';

describe('DynamicSchemeComponent', () => {
  let component: DynamicSchemeComponent;
  let fixture: ComponentFixture<DynamicSchemeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicSchemeComponent]
    });
    fixture = TestBed.createComponent(DynamicSchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
