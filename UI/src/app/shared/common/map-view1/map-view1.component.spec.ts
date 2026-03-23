import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapView1Component } from './map-view1.component';

describe('MapView1Component', () => {
  let component: MapView1Component;
  let fixture: ComponentFixture<MapView1Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapView1Component]
    });
    fixture = TestBed.createComponent(MapView1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
