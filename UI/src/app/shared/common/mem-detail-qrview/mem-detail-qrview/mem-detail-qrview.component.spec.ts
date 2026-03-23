import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemDetailQrviewComponent } from './mem-detail-qrview.component';

describe('MemDetailQrviewComponent', () => {
  let component: MemDetailQrviewComponent;
  let fixture: ComponentFixture<MemDetailQrviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemDetailQrviewComponent]
    });
    fixture = TestBed.createComponent(MemDetailQrviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
