import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilymemberUploadComponent } from './familymember-upload.component';

describe('FamilymemberUploadComponent', () => {
  let component: FamilymemberUploadComponent;
  let fixture: ComponentFixture<FamilymemberUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FamilymemberUploadComponent]
    });
    fixture = TestBed.createComponent(FamilymemberUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
