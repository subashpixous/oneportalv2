import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UcUploadComponent } from './uc-upload.component';

describe('UcUploadComponent', () => {
  let component: UcUploadComponent;
  let fixture: ComponentFixture<UcUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UcUploadComponent]
    });
    fixture = TestBed.createComponent(UcUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
